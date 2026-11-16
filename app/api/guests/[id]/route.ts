
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, getCurrentAdmin } from "@/lib/appwrite-server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const current = await getCurrentAdmin();

    if (!current || !current.isOwner) {
      return NextResponse.json(
        { error: "Owner access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Guest ID is required." },
        { status: 400 }
      );
    }

    const action = body.action;

    if (action !== "revoke" && action !== "restore") {
      return NextResponse.json(
        { error: "Invalid invitation action." },
        { status: 400 }
      );
    }

    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const tableId = process.env.APPWRITE_INVITATIONS_TABLE_ID;

    if (!databaseId || !tableId) {
      throw new Error("Invitation database configuration is missing.");
    }

    const { tables } = createAdminClient();

    const existing = await tables.getRow({
      databaseId,
      tableId,
      rowId: id,
    });

    if (action === "restore" && existing.checked_in === true) {
      return NextResponse.json(
        { error: "This guest has already checked in and cannot be restored automatically." },
        { status: 409 }
      );
    }

    await tables.updateRow({
      databaseId,
      tableId,
      rowId: id,
      data: {
        status: action === "revoke" ? "revoked" : "responded",
      },
    });

    return NextResponse.json({
      success: true,
      status: action === "revoke" ? "revoked" : "responded",
    });
  } catch (error) {
    console.error("Invitation status update failed:", error);

    return NextResponse.json(
      { error: "Unable to update invitation status." },
      { status: 500 }
    );
  }
}
