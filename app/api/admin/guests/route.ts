
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import {
  createAdminClient,
  getCurrentAdmin,
  Query,
  ID,
} from "@/lib/appwrite-server";

export const runtime = "nodejs";

function getDatabaseConfig() {
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const invitationsTableId = process.env.APPWRITE_INVITATIONS_TABLE_ID;
  const rsvpTableId = process.env.APPWRITE_RSVP_TABLE_ID;

  if (!databaseId || !invitationsTableId || !rsvpTableId) {
    throw new Error("Guest database configuration is incomplete.");
  }

  return { databaseId, invitationsTableId, rsvpTableId };
}

function canManageGuests(admin: {
  staff: Record<string, unknown>;
  isOwner: boolean;
}) {
  const role = String(admin.staff["role"] || "").toLowerCase();
  return admin.isOwner || role === "admin" || role === "owner";
}

function makeInvitationCode() {
  return randomBytes(8).toString("hex").toUpperCase();
}

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { databaseId, invitationsTableId, rsvpTableId } =
      getDatabaseConfig();

    const { tables } = createAdminClient();

    const [invitationResult, rsvpResult] = await Promise.all([
      tables.listRows({
        databaseId,
        tableId: invitationsTableId,
        queries: [Query.limit(500)],
      }),
      tables.listRows({
        databaseId,
        tableId: rsvpTableId,
        queries: [Query.limit(500)],
      }),
    ]);

    return NextResponse.json({
      success: true,
      invitations: invitationResult.rows,
      responses: rsvpResult.rows,
    });
  } catch (error) {
    console.error("Guest list error:", error);

    return NextResponse.json(
      { error: "Unable to load guest records." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!canManageGuests(admin)) {
      return NextResponse.json(
        { error: "You do not have permission to add guests." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const fullName = cleanString(body.full_name, 150);
    const phone = cleanString(body.phone, 40);
    const email = cleanString(body.email, 254).toLowerCase();

    if (!fullName) {
      return NextResponse.json(
        { error: "Guest full name is required." },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { databaseId, invitationsTableId } = getDatabaseConfig();
    const { tables } = createAdminClient();

    const invitationCode = makeInvitationCode();

    const result = await tables.createRow({
      databaseId,
      tableId: invitationsTableId,
      rowId: ID.unique(),
      data: {
        full_name: fullName,
        phone: phone || null,
        email: email || null,
        invitation_code: invitationCode,
        qr_token: null,
        status: "invited",
        attending: "pending",
        num_guests: 0,
        accompanying_names: "",
        dietary_requirements: "",
        message: "",
        checked_in: false,
        checked_in_at: null,
        checked_in_by: null,
        created_by: admin.user.$id,
        rsvp_id: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Guest invitation created.",
      invitation: result,
    });
  } catch (error) {
    console.error("Create guest error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to create invitation. Check the Appwrite guest table configuration.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!canManageGuests(admin)) {
      return NextResponse.json(
        { error: "You do not have permission to manage guests." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const guestId = cleanString(body.guest_id, 100);
    const action = cleanString(body.action, 30);

    if (!guestId) {
      return NextResponse.json(
        { error: "Guest record ID is required." },
        { status: 400 }
      );
    }

    const { databaseId, invitationsTableId, rsvpTableId } =
      getDatabaseConfig();

    const { tables } = createAdminClient();

    const invitation = await tables.getRow({
      databaseId,
      tableId: invitationsTableId,
      rowId: guestId,
    });

    if (action === "revoke") {
      if (invitation.status === "revoked") {
        return NextResponse.json({
          success: true,
          message: "This invitation is already revoked.",
        });
      }

      await tables.updateRow({
        databaseId,
        tableId: invitationsTableId,
        rowId: guestId,
        data: {
          status: "revoked",
          qr_token: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Invitation revoked. Its QR access is no longer valid.",
      });
    }

    if (action === "edit") {
      const fullName = cleanString(body.full_name, 150);
      const phone = cleanString(body.phone, 40);
      const email = cleanString(body.email, 254).toLowerCase();

      if (!fullName) {
        return NextResponse.json(
          { error: "Guest full name is required." },
          { status: 400 }
        );
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: "Please enter a valid email address." },
          { status: 400 }
        );
      }

      await tables.updateRow({
        databaseId,
        tableId: invitationsTableId,
        rowId: guestId,
        data: {
          full_name: fullName,
          phone: phone || null,
          email: email || null,
        },
      });

      const rsvpId =
        typeof invitation.rsvp_id === "string" ? invitation.rsvp_id : "";

      if (rsvpId) {
        await tables.updateRow({
          databaseId,
          tableId: rsvpTableId,
          rowId: rsvpId,
          data: {
            full_name: fullName,
            phone: phone || null,
            email: email || null,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Guest details updated.",
      });
    }

    return NextResponse.json(
      { error: "Unsupported guest action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Update guest error:", error);

    return NextResponse.json(
      { error: "Unable to update this guest record." },
      { status: 500 }
    );
  }
}
