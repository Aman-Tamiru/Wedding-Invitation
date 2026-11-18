
import { NextResponse } from "next/server";
import {
  createAdminClient,
  getCurrentAdmin,
  Query,
} from "@/lib/appwrite-server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const currentAdmin = await getCurrentAdmin();

    if (!currentAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const invitationsTableId = process.env.APPWRITE_INVITATIONS_TABLE_ID;
    const rsvpTableId = process.env.APPWRITE_RSVP_TABLE_ID;

    if (!databaseId || !invitationsTableId || !rsvpTableId) {
      return NextResponse.json(
        { error: "Guest database configuration is incomplete." },
        { status: 500 }
      );
    }

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
    console.error("Admin guest list error:", error);

    return NextResponse.json(
      { error: "Unable to load guest records." },
      { status: 500 }
    );
  }
}
