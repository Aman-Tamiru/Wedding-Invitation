
import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  getCurrentAdmin,
  ID,
  Query,
} from "@/lib/appwrite-server";

export const runtime = "nodejs";

type DbRow = Record<string, any> & { $id: string };

type SeatingTable = {
  key: string;
  name: string;
  section: string;
  row: number;
  seatCount: number;
  sortOrder: number;
};

const databaseId = process.env.APPWRITE_DATABASE_ID!;
const seatingTableId = process.env.APPWRITE_SEATING_TABLE_ID;
const invitationsTableId = process.env.APPWRITE_INVITATIONS_TABLE_ID;

async function getAllRows(tableId: string): Promise<DbRow[]> {
  const { tables } = createAdminClient();
  const rows: DbRow[] = [];
  let offset = 0;

  while (true) {
    const result = await tables.listRows({
      databaseId,
      tableId,
      queries: [Query.limit(100), Query.offset(offset)],
    });

    rows.push(...(result.rows as DbRow[]));

    if (result.rows.length < 100) break;
    offset += result.rows.length;
  }

  return rows;
}

function configurationError() {
  return !databaseId || !seatingTableId || !invitationsTableId;
}

export async function GET() {
  try {
    const current = await getCurrentAdmin();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (configurationError()) {
      return NextResponse.json(
        { error: "Seating Appwrite configuration is incomplete." },
        { status: 503 }
      );
    }

    const [records, invitationRows] = await Promise.all([
      getAllRows(seatingTableId!),
      getAllRows(invitationsTableId!),
    ]);

    const tables = records
      .filter((row) => row.record_type === "table")
      .map((row) => ({
        key: row.table_key,
        name: row.table_name,
        section: row.section,
        row: row.row_number,
        seatCount: row.seat_count,
        sortOrder: row.sort_order ?? 0,
      }));

    const assignments = records
      .filter((row) => row.record_type === "seat")
      .map((row) => ({
        seatKey: row.seat_key,
        tableKey: row.table_key,
        seatNumber: row.seat_number,
        guestId: row.guest_id ?? null,
        guestName: row.guest_name,
        guestType: row.guest_type,
      }));

    const guests = invitationRows
      .filter(
        (row) =>
          row.status !== "revoked" &&
          typeof row.full_name === "string" &&
          row.full_name.trim()
      )
      .map((row) => ({
        id: row.$id,
        full_name: row.full_name,
        status: row.status ?? "",
      }));

    return NextResponse.json({ tables, assignments, guests });
  } catch (error) {
    console.error("Seating load failed:", error);
    return NextResponse.json(
      { error: "Unable to load seating information." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const current = await getCurrentAdmin();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (configurationError()) {
      return NextResponse.json(
        { error: "Seating Appwrite configuration is incomplete." },
        { status: 503 }
      );
    }

    const body = await request.json();

    if (
      !Array.isArray(body.tables) ||
      !Array.isArray(body.assignments) ||
      body.tables.length > 500 ||
      body.assignments.length > 3000
    ) {
      return NextResponse.json(
        { error: "Invalid seating information or capacity limit exceeded." },
        { status: 400 }
      );
    }

    const allowedSections = [
      "couple",
      "bride",
      "bridesmaids",
      "groom",
      "groomsmen",
    ];

    const normalizedTables: SeatingTable[] = body.tables.map((item: any) => {
      const key = String(item.key ?? "").trim();
      const name = String(item.name ?? "").trim();
      const section = String(item.section ?? "");
      const row = Number(item.row);
      const seatCount = Number(item.seatCount);
      const sortOrder = Number(item.sortOrder) || 0;

      if (
        !key ||
        key.length > 64 ||
        !name ||
        name.length > 100 ||
        !allowedSections.includes(section) ||
        !Number.isInteger(row) ||
        row < 0 ||
        row > 1000 ||
        !Number.isInteger(seatCount) ||
        seatCount < 1 ||
        seatCount > 30
      ) {
        throw new Error("One or more table settings are invalid.");
      }

      return { key, name, section, row, seatCount, sortOrder };
    });

    const tableMap = new Map<string, SeatingTable>(
      normalizedTables.map((table) => [table.key, table])
    );

    if (tableMap.size !== normalizedTables.length) {
      return NextResponse.json(
        { error: "Duplicate table identifiers were found." },
        { status: 400 }
      );
    }

    const invitationRows = await getAllRows(invitationsTableId!);

    const validGuests = new Map<string, string>(
      invitationRows
        .filter((row) => row.status !== "revoked")
        .map((row) => [row.$id, String(row.full_name ?? "")])
    );

    const usedSeats = new Set<string>();
    const usedGuests = new Set<string>();

    const normalizedAssignments = body.assignments.map((item: any) => {
      const tableKey = String(item.tableKey ?? "");
      const seatNumber = Number(item.seatNumber);
      const table = tableMap.get(tableKey);

      if (
        !table ||
        !Number.isInteger(seatNumber) ||
        seatNumber < 1 ||
        seatNumber > table.seatCount
      ) {
        throw new Error("An assigned seat does not exist.");
      }

      const seatKey = `${tableKey}:${seatNumber}`;

      if (usedSeats.has(seatKey)) {
        throw new Error("A seat has more than one assignment.");
      }

      usedSeats.add(seatKey);

      const guestType = String(item.guestType ?? "");
      let guestId: string | null = null;
      let guestName = "";

      if (guestType === "registered") {
        guestId = String(item.guestId ?? "");
        guestName = validGuests.get(guestId) ?? "";

        if (!guestId || !guestName) {
          throw new Error(
            "A registered guest is invalid or their invitation was revoked."
          );
        }

        if (usedGuests.has(guestId)) {
          throw new Error("A guest cannot be assigned to multiple seats.");
        }

        usedGuests.add(guestId);
      } else if (guestType === "manual") {
        guestName = String(item.guestName ?? "").trim();

        if (!guestName || guestName.length > 150) {
          throw new Error("Enter a valid manual guest name.");
        }
      } else {
        throw new Error("Unknown guest assignment type.");
      }

      return {
        seatKey,
        tableKey,
        seatNumber,
        guestId,
        guestName,
        guestType,
      };
    });

    const desiredRecords: Record<string, any>[] = [
      ...normalizedTables.map((table) => ({
        record_type: "table",
        table_key: table.key,
        table_name: table.name,
        section: table.section,
        row_number: table.row,
        seat_count: table.seatCount,
        sort_order: table.sortOrder,
      })),
      ...normalizedAssignments.map((seat: { seatKey: string; tableKey: string; seatNumber: number; guestId: string | null; guestName: string; guestType: string }) => ({
        record_type: "seat",
        table_key: seat.tableKey,
        seat_key: seat.seatKey,
        seat_number: seat.seatNumber,
        guest_id: seat.guestId ?? undefined,
        guest_name: seat.guestName,
        guest_type: seat.guestType,
      })),
    ];

    const existingRows = await getAllRows(seatingTableId!);
    const { tables } = createAdminClient();

    const recordKey = (row: DbRow) =>
      row.record_type === "table"
        ? `table:${row.table_key}`
        : `seat:${row.seat_key}`;

    const existingMap = new Map(
      existingRows.map((row) => [recordKey(row), row])
    );

    const retainedKeys = new Set<string>();

    for (const record of desiredRecords) {
      const key =
        record.record_type === "table"
          ? `table:${record.table_key}`
          : `seat:${record.seat_key}`;

      retainedKeys.add(key);

      const existing = existingMap.get(key);

      if (existing) {
        await tables.updateRow({
          databaseId,
          tableId: seatingTableId!,
          rowId: existing.$id,
          data: record,
        });
      } else {
        await tables.createRow({
          databaseId,
          tableId: seatingTableId!,
          rowId: ID.unique(),
          data: record,
        });
      }
    }

    for (const existing of existingRows) {
      if (!retainedKeys.has(recordKey(existing))) {
        await tables.deleteRow({
          databaseId,
          tableId: seatingTableId!,
          rowId: existing.$id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      tables: normalizedTables.length,
      assignments: normalizedAssignments.length,
    });
  } catch (error) {
    console.error("Seating save failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save the seating plan.",
      },
      { status: 500 }
    );
  }
}
