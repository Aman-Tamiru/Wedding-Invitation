
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, ID, Query } from "@/lib/appwrite-server";

export const runtime = "nodejs";

const rsvpSchema = z.object({
  full_name: z.string().trim().min(2).max(200),
  phone: z.string().trim().min(7).max(40),
  email: z.union([z.string().trim().email().max(320), z.literal("")]).optional(),
  attending: z.boolean(),
  num_guests: z.coerce.number().int().min(0).max(10),
  accompanying_names: z.string().max(2000).optional().default(""),
  dietary_requirements: z.string().max(2000).optional().default(""),
  message: z.string().max(5000).optional().default(""),
});

type RsvpRow = Record<string, unknown>;

function getDatabaseConfig() {
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const tableId = process.env.APPWRITE_RSVP_TABLE_ID;

  if (!databaseId || !tableId) {
    throw new Error("RSVP database configuration is missing.");
  }

  return { databaseId, tableId };
}

function publicRsvp(row: RsvpRow) {
  return {
    id: row.$id,
    created_at: row.$createdAt,
    updated_at: row.$updatedAt,
    full_name: row.full_name,
    phone: row.phone,
    email: row.email,
    attending: row.attending,
    num_guests: row.num_guests,
    accompanying_names: row.accompanying_names,
    dietary_requirements: row.dietary_requirements,
    message: row.message,
  };
}

function validToken(token: string | null) {
  return !!token && /^[a-f0-9]{64}$/i.test(token);
}

async function findRsvpByToken(token: string) {
  const { databaseId, tableId } = getDatabaseConfig();
  const { tables } = createAdminClient();

  const result = await tables.listRows({
    databaseId,
    tableId,
    queries: [
      Query.equal("edit_token", token),
      Query.limit(1),
    ],
  });

  return result.rows[0] as RsvpRow | undefined;
}

// Retrieve one RSVP using its private edit token.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token || !validToken(token)) {
    return NextResponse.json(
      { error: "A valid edit token is required." },
      { status: 400 }
    );
  }

  try {
    const row = await findRsvpByToken(token);

    if (!row) {
      return NextResponse.json(
        { error: "No RSVP was found for this edit token." },
        { status: 404 }
      );
    }

    return NextResponse.json({ rsvp: publicRsvp(row) });
  } catch (error) {
    console.error("RSVP lookup failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve your RSVP. Please try again." },
      { status: 500 }
    );
  }
}

// Create a new RSVP.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = rsvpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please check your RSVP details.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { databaseId, tableId } = getDatabaseConfig();
    const { tables } = createAdminClient();

    const editToken = randomBytes(32).toString("hex");
    const data = {
      ...parsed.data,
      email: parsed.data.email ?? "",
      edit_token: editToken,
    };

    const row = await tables.createRow({
      databaseId,
      tableId,
      rowId: ID.unique(),
      data,
    });

    return NextResponse.json(
      {
        success: true,
        edit_token: editToken,
        rsvp: publicRsvp(row as unknown as RsvpRow),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("RSVP submission failed:", error);

    return NextResponse.json(
      { error: "Unable to submit your RSVP. Please try again." },
      { status: 500 }
    );
  }
}

// Update only the RSVP associated with the supplied private token.
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body.edit_token === "string"
      ? body.edit_token.trim()
      : "";

    if (!validToken(token)) {
      return NextResponse.json(
        { error: "A valid edit token is required." },
        { status: 400 }
      );
    }

    const parsed = rsvpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please check your RSVP details.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existing = await findRsvpByToken(token);

    if (!existing || typeof existing.$id !== "string") {
      return NextResponse.json(
        { error: "No RSVP was found for this edit token." },
        { status: 404 }
      );
    }

    const { databaseId, tableId } = getDatabaseConfig();
    const { tables } = createAdminClient();

    const updated = await tables.updateRow({
      databaseId,
      tableId,
      rowId: existing.$id,
      data: {
        ...parsed.data,
        email: parsed.data.email ?? "",
      },
    });

    return NextResponse.json({
      success: true,
      rsvp: publicRsvp(updated as unknown as RsvpRow),
    });
  } catch (error) {
    console.error("RSVP update failed:", error);

    return NextResponse.json(
      { error: "Unable to update your RSVP. Please try again." },
      { status: 500 }
    );
  }
}
