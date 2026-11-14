import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  getCurrentAdmin,
  ID,
  Query,
} from "@/lib/appwrite-server";

export const runtime = "nodejs";

const databaseId = process.env.APPWRITE_DATABASE_ID!;
const rsvpTableId = process.env.APPWRITE_RSVP_TABLE_ID!;
const adminTableId = process.env.APPWRITE_ADMIN_TABLE_ID!;

async function getRows(tableId: string) {
  const { tables } = createAdminClient();
  const allRows: Record<string, unknown>[] = [];
  let offset = 0;

  while (true) {
    const result = await tables.listRows({
      databaseId,
      tableId,
      queries: [Query.limit(100), Query.offset(offset)],
    });

    allRows.push(...(result.rows as Record<string, unknown>[]));

    if (result.rows.length < 100) break;
    offset += result.rows.length;
  }

  return allRows;
}

function mapGuest(row: Record<string, unknown>) {
  return {
    id: row.$id,
    full_name: row.full_name,
    phone: row.phone,
    email: row.email ?? null,
    attending: row.attending,
    num_guests: row.num_guests,
    accompanying_names: row.accompanying_names ?? null,
    dietary_requirements: row.dietary_requirements ?? null,
    message: row.message ?? null,
    edit_token: row.edit_token,
    created_at: row.$createdAt,
    updated_at: row.$updatedAt,
  };
}

function mapStaff(row: Record<string, unknown>) {
  return {
    id: row.$id,
    user_id: row.user_id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
  };
}

export async function GET() {
  try {
    const current = await getCurrentAdmin();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guests = await getRows(rsvpTableId);
    let staff: Record<string, unknown>[] = [];

    if (current.isOwner) {
      staff = await getRows(adminTableId);
    }

    return NextResponse.json({
      guests: guests.map(mapGuest),
      staff: staff.map(mapStaff),
    });
  } catch (error) {
    console.error("Dashboard loading failed:", error);
    return NextResponse.json(
      { error: "Unable to load dashboard data." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const current = await getCurrentAdmin();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const guestId = typeof body.id === "string" ? body.id : "";

    if (!guestId) {
      return NextResponse.json({ error: "Guest ID is required." }, { status: 400 });
    }

    const data = {
      full_name: String(body.full_name ?? "").trim(),
      phone: String(body.phone ?? "").trim(),
      email: String(body.email ?? "").trim() || null,
      attending: Boolean(body.attending),
      num_guests: Math.max(0, Math.min(10, Number(body.num_guests) || 0)),
      accompanying_names: String(body.accompanying_names ?? ""),
      dietary_requirements: String(body.dietary_requirements ?? ""),
      message: String(body.message ?? ""),
    };

    if (!data.full_name || !data.phone) {
      return NextResponse.json(
        { error: "Guest name and phone are required." },
        { status: 400 }
      );
    }

    const { tables } = createAdminClient();

    await tables.updateRow({
      databaseId,
      tableId: rsvpTableId,
      rowId: guestId,
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Guest update failed:", error);
    return NextResponse.json(
      { error: "Failed to update guest response." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const current = await getCurrentAdmin();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action;
    const { tables, users } = createAdminClient();

    if (action === "delete_guest") {
      const id = typeof body.id === "string" ? body.id : "";
      if (!id) {
        return NextResponse.json({ error: "Guest ID is required." }, { status: 400 });
      }

      await tables.deleteRow({
        databaseId,
        tableId: rsvpTableId,
        rowId: id,
      });

      return NextResponse.json({ success: true });
    }

    if (action === "add_staff") {
      if (!current.isOwner) {
        return NextResponse.json({ error: "Owner access required." }, { status: 403 });
      }

      const email = String(body.email ?? "").trim().toLowerCase();
      const fullName = String(body.full_name ?? "").trim();
      const password = String(body.password ?? "");

      if (!email || !fullName || password.length < 8) {
        return NextResponse.json(
          { error: "Enter a name, email, and password of at least 8 characters." },
          { status: 400 }
        );
      }

      const user = await users.create({
        userId: ID.unique(),
        email,
        password,
        name: fullName,
      });

      try {
        await tables.createRow({
          databaseId,
          tableId: adminTableId,
          rowId: ID.unique(),
          data: {
            user_id: user.$id,
            email,
            full_name: fullName,
            role: "staff",
          },
        });
      } catch (error) {
        await users.delete({ userId: user.$id });
        throw error;
      }

      return NextResponse.json({ success: true });
    }

    if (action === "remove_staff") {
      if (!current.isOwner) {
        return NextResponse.json({ error: "Owner access required." }, { status: 403 });
      }

      const rowId = String(body.id ?? "");
      const userId = String(body.user_id ?? "");

      if (!rowId || !userId || userId === current.user.$id) {
        return NextResponse.json(
          { error: "Invalid staff account." },
          { status: 400 }
        );
      }

      const staffResult = await tables.listRows({
        databaseId,
        tableId: adminTableId,
        queries: [Query.equal("user_id", userId), Query.limit(1)],
      });

      const staff = staffResult.rows[0];

      if (!staff || staff.role === "owner") {
        return NextResponse.json(
          { error: "The owner account cannot be removed." },
          { status: 403 }
        );
      }

      await users.deleteSessions({ userId });
      await tables.deleteRow({
        databaseId,
        tableId: adminTableId,
        rowId,
      });
      await users.delete({ userId });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    console.error("Dashboard action failed:", error);
    return NextResponse.json(
      { error: "The requested action failed. Check the server logs." },
      { status: 500 }
    );
  }
}