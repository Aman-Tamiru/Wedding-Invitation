
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/appwrite-server";

export const runtime = "nodejs";

export async function GET() {
  const currentAdmin = await getCurrentAdmin();

  if (!currentAdmin || !currentAdmin.isOwner) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    admin: {
      full_name: currentAdmin.staff.full_name,
      role: currentAdmin.staff.role,
      isOwner: true,
    },
  });
}
