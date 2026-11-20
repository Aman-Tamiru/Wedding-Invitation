
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/appwrite-server";

export const runtime = "nodejs";

export async function GET() {
  const current = await getCurrentAdmin();

  if (
    !current ||
    current.isOwner ||
    (current.staff.role !== "staff" &&
      current.staff.role !== "supervisor")
  ) {
    return NextResponse.json(
      { error: "Staff authentication required." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    staff: {
      full_name: current.staff.full_name,
      role: current.staff.role,
      email: current.staff.email,
    },
    guests: [],
  });
}
