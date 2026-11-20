
import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, ID, Query } from "@/lib/appwrite-server";

export const runtime = "nodejs";

const rsvpSchema = z.object({
  full_name: z.string().trim().min(2).max(200),
  phone: z.string().trim().max(40).optional().default(""),
  email: z.string().trim().email().or(z.literal("")).optional().default(""),
  attending: z.boolean(),
  num_guests: z.number().int().min(0).max(10),
  accompanying_names: z.string().max(2000).optional().default(""),
  dietary_requirements: z.string().max(2000).optional().default(""),
  message: z.string().max(5000).optional().default(""),
});

const updateSchema = rsvpSchema;
type RSVPInput = z.infer<typeof updateSchema>;

function getDatabaseConfig() {
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const rsvpTableId = process.env.APPWRITE_RSVP_TABLE_ID;
  const invitationsTableId = process.env.APPWRITE_INVITATIONS_TABLE_ID;

  if (!databaseId || !rsvpTableId || !invitationsTableId) {
    throw new Error("RSVP database configuration is incomplete.");
  }

  return { databaseId, rsvpTableId, invitationsTableId };
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function validToken(token: unknown): token is string {
  return typeof token === "string" && /^[a-f0-9]{64}$/i.test(token);
}

function makeInternalInvitationCode() {
  return randomBytes(8).toString("hex").toUpperCase();
}

function getCompanionNames(value: string) {
  return value
    .split(/[\r\n;]+/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function publicRsvp(row: Record<string, any>) {
  return {
    full_name: row.full_name,
    phone: row.phone || "",
    email: row.email || "",
    attending: row.attending,
    num_guests: row.num_guests || 0,
    accompanying_names: row.accompanying_names || "",
    dietary_requirements: row.dietary_requirements || "",
    message: row.message || "",
  };
}

async function findRsvpByToken(
  tables: any,
  databaseId: string,
  rsvpTableId: string,
  token: string
) {
  const result = await tables.listRows({
    databaseId,
    tableId: rsvpTableId,
    queries: [Query.equal("edit_token", token), Query.limit(1)],
  });

  return result.rows?.[0] || null;
}

async function findExistingInvitation(
  tables: any,
  databaseId: string,
  invitationsTableId: string,
  fullName: string,
  phone: string
) {
  const result = await tables.listRows({
    databaseId,
    tableId: invitationsTableId,
    queries: [Query.equal("full_name", fullName), Query.limit(20)],
  });

  const matching = (result.rows || []).filter((row: any) => {
    if (normalizeName(row.full_name || "") !== normalizeName(fullName)) {
      return false;
    }

    if (phone && normalizePhone(row.phone || "") !== normalizePhone(phone)) {
      return false;
    }

    return true;
  });

  const pending = matching.filter(
    (row: any) => row.status === "invited" && !row.rsvp_id
  );

  // Reuse an existing admin-created invitation only when the match is clear.
  if (pending.length === 1) return pending[0];

  // Do not accidentally claim one of several same-name invitations.
  if (!phone && pending.length > 1) return null;

  const alreadyResponded = matching.some(
    (row: any) => row.status === "responded" && row.rsvp_id
  );

  if (alreadyResponded) {
    throw new Error("RSVP_ALREADY_SUBMITTED");
  }

  return null;
}

async function rollbackTransaction(tables: any, transactionId: string) {
  try {
    await tables.updateTransaction({
      transactionId,
      rollback: true,
    });
  } catch {
    // The transaction may already have expired or rolled back.
  }
}

function errorResponse(error: unknown) {
  if (error instanceof Error && error.message === "RSVP_ALREADY_SUBMITTED") {
    return NextResponse.json(
      {
        error:
          "An RSVP already exists for these guest details. Please contact the couple if you need help.",
      },
      { status: 409 }
    );
  }

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? Number((error as { code: unknown }).code)
      : 0;

  console.error("RSVP API error:", error);

  if (code === 409) {
    return NextResponse.json(
      {
        error:
          "This RSVP was just updated. Please refresh and try again.",
      },
      { status: 409 }
    );
  }

  return NextResponse.json(
    { error: "Something went wrong. Please try again later." },
    { status: 500 }
  );
}

/**
 * GET: Retrieve an existing RSVP using its private edit token.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!validToken(token)) {
      return NextResponse.json(
        { error: "A valid response code is required." },
        { status: 400 }
      );
    }

    const { databaseId, rsvpTableId } = getDatabaseConfig();
    const { tables } = createAdminClient();

    const row = await findRsvpByToken(
      tables,
      databaseId,
      rsvpTableId,
      token
    );

    if (!row) {
      return NextResponse.json(
        { error: "No response was found with that code." },
        { status: 404 }
      );
    }

    return NextResponse.json({ rsvp: publicRsvp(row) });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST: Open registration through the public wedding website.
 * Guests do not need an invitation code or an existing invitation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = rsvpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please check your RSVP details and try again.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const companionNames = input.attending
      ? getCompanionNames(input.accompanying_names)
      : [];

    if (companionNames.length > 10) {
      return NextResponse.json(
        { error: "You can register up to 10 accompanying guests." },
        { status: 400 }
      );
    }

    if (input.attending && input.num_guests !== companionNames.length) {
      return NextResponse.json(
        {
          error:
            "Please enter the full name of every accompanying guest. Use one name per line.",
        },
        { status: 400 }
      );
    }

    const { databaseId, rsvpTableId, invitationsTableId } =
      getDatabaseConfig();

    const { tables } = createAdminClient();

    const existingInvitation = await findExistingInvitation(
      tables,
      databaseId,
      invitationsTableId,
      input.full_name,
      input.phone
    );

    const editToken = randomBytes(32).toString("hex");
    const primaryQrToken = input.attending
      ? randomBytes(32).toString("hex")
      : "";
    const rsvpId = ID.unique();

    const primaryInvitationId = existingInvitation?.$id || ID.unique();
    const primaryInvitationCode =
      existingInvitation?.invitation_code || makeInternalInvitationCode();

    const rsvpData = {
      full_name: input.full_name,
      phone: input.phone || "",
      email: input.email || "",
      attending: input.attending,
      num_guests: input.attending ? companionNames.length : 0,
      accompanying_names: input.attending
        ? companionNames.join("\n")
        : "",
      dietary_requirements: input.dietary_requirements || "",
      message: input.message || "",
      edit_token: editToken,
    };

    const primaryInvitationData = {
      full_name: input.full_name,
      phone: input.phone || "",
      email: input.email || "",
      invitation_code: primaryInvitationCode,
      qr_token: primaryQrToken || null,
      status: "responded",
      attending: input.attending,
      num_guests: input.attending ? companionNames.length : 0,
      accompanying_names: input.attending
        ? companionNames.join("\n")
        : "",
      dietary_requirements: input.dietary_requirements || "",
      message: input.message || "",
      checked_in: false,
      checked_in_at: null,
      checked_in_by: null,
      created_by: existingInvitation?.created_by || "public-rsvp",
      rsvp_id: rsvpId,
    };

    const guestPasses: {
      full_name: string;
      guest_type: string;
      qr_token: string;
      invitation_url: string;
    }[] = [];

    if (input.attending) {
      guestPasses.push({
        full_name: input.full_name,
        guest_type: "primary",
        qr_token: primaryQrToken,
        invitation_url: `/invitation/${primaryQrToken}`,
      });

      for (const companionName of companionNames) {
        const companionToken = randomBytes(32).toString("hex");

        guestPasses.push({
          full_name: companionName,
          guest_type: "companion",
          qr_token: companionToken,
          invitation_url: `/invitation/${companionToken}`,
        });
      }
    }

    const transaction = await tables.createTransaction();

    try {
      await tables.createRow({
        databaseId,
        tableId: rsvpTableId,
        rowId: rsvpId,
        data: rsvpData,
        transactionId: transaction.$id,
      });

      if (existingInvitation) {
        await tables.updateRow({
          databaseId,
          tableId: invitationsTableId,
          rowId: primaryInvitationId,
          data: primaryInvitationData,
          transactionId: transaction.$id,
        });
      } else {
        await tables.createRow({
          databaseId,
          tableId: invitationsTableId,
          rowId: primaryInvitationId,
          data: primaryInvitationData,
          transactionId: transaction.$id,
        });
      }

      // Every accompanying guest gets a separate invitation row and QR token.
      for (const pass of guestPasses.slice(1)) {
        await tables.createRow({
          databaseId,
          tableId: invitationsTableId,
          rowId: ID.unique(),
          data: {
            full_name: pass.full_name,
            phone: "",
            email: "",
            invitation_code: makeInternalInvitationCode(),
            qr_token: pass.qr_token,
            status: "responded",
            attending: true,
            num_guests: 0,
            accompanying_names: "",
            dietary_requirements: "",
            message: "",
            checked_in: false,
            checked_in_at: null,
            checked_in_by: null,
            created_by: "public-rsvp",
            rsvp_id: rsvpId,
          },
          transactionId: transaction.$id,
        });
      }

      await tables.updateTransaction({
        transactionId: transaction.$id,
        commit: true,
      });
    } catch (error) {
      await rollbackTransaction(tables, transaction.$id);
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        edit_token: editToken,
        qr_token: primaryQrToken || null,
        guest_passes: guestPasses,
        rsvp: publicRsvp(rsvpData),
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH: Edit an existing RSVP using its private edit token.
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400 }
      );
    }

    const token = (body as Record<string, unknown>).edit_token;

    if (!validToken(token)) {
      return NextResponse.json(
        { error: "A valid response code is required." },
        { status: 400 }
      );
    }

    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please check your RSVP details and try again.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input: RSVPInput = parsed.data;
    const companionNames = input.attending
      ? getCompanionNames(input.accompanying_names)
      : [];

    if (
      companionNames.length > 10 ||
      (input.attending && input.num_guests !== companionNames.length)
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter the full name of every accompanying guest, one name per line.",
        },
        { status: 400 }
      );
    }

    const { databaseId, rsvpTableId, invitationsTableId } =
      getDatabaseConfig();

    const { tables } = createAdminClient();

    const existing = await findRsvpByToken(
      tables,
      databaseId,
      rsvpTableId,
      token
    );

    if (!existing) {
      return NextResponse.json(
        { error: "No response was found with that code." },
        { status: 404 }
      );
    }

    const updateData = {
      full_name: input.full_name,
      phone: input.phone || "",
      email: input.email || "",
      attending: input.attending,
      num_guests: input.attending ? companionNames.length : 0,
      accompanying_names: input.attending
        ? companionNames.join("\n")
        : "",
      dietary_requirements: input.dietary_requirements || "",
      message: input.message || "",
    };

    const invitationResult = await tables.listRows({
      databaseId,
      tableId: invitationsTableId,
      queries: [
        Query.equal("rsvp_id", existing.$id),
        Query.limit(20),
      ],
    });

    const invitation = (invitationResult.rows || []).find(
      (row: any) => row.full_name === existing.full_name
    );

    const transaction = await tables.createTransaction();

    try {
      await tables.updateRow({
        databaseId,
        tableId: rsvpTableId,
        rowId: existing.$id,
        data: updateData,
        transactionId: transaction.$id,
      });

      if (invitation) {
        await tables.updateRow({
          databaseId,
          tableId: invitationsTableId,
          rowId: invitation.$id,
          data: {
            ...updateData,
            qr_token: input.attending ? invitation.qr_token : null,
            status: "responded",
          },
          transactionId: transaction.$id,
        });
      }

      await tables.updateTransaction({
        transactionId: transaction.$id,
        commit: true,
      });
    } catch (error) {
      await rollbackTransaction(tables, transaction.$id);
      throw error;
    }

    return NextResponse.json({
      success: true,
      edit_token: token,
      rsvp: publicRsvp(updateData),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
