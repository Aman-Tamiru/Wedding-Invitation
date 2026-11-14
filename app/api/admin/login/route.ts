
import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  createLoginClient,
  getSessionCookieName,
  Query,
} from "@/lib/appwrite-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const { account } = createLoginClient();

    const session = await account.createEmailPasswordSession({
      email,
      password,
    });

    const { tables } = createAdminClient();

    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const tableId = process.env.APPWRITE_ADMIN_TABLE_ID;

    if (!databaseId || !tableId) {
      await account.deleteSession({ sessionId: session.$id });
      throw new Error("Admin database configuration is missing.");
    }

    const result = await tables.listRows({
      databaseId,
      tableId,
      queries: [
        Query.equal("user_id", session.userId),
        Query.limit(1),
      ],
    });

    const admin = result.rows[0];

    if (!admin) {
      await account.deleteSession({ sessionId: session.$id });

      return NextResponse.json(
        {
          error: "You do not have admin access. Please contact the owner.",
        },
        { status: 403 }
      );
    }

    const sessionSecret = (
      session as typeof session & { secret?: string }
    ).secret;

    if (!sessionSecret) {
      

      throw new Error("Appwrite did not return a session secret.");
    }

    const response = NextResponse.json({
      success: true,
      admin: {
        full_name: admin.full_name,
        role: admin.role,
      },
    });

    response.cookies.set({
      name: getSessionCookieName(),
      value: sessionSecret,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(session.expire),
    });

    return response;
  } catch (error) {
    console.error("Admin login failed:", error);

    return NextResponse.json(
      { error: "Invalid email or password. Please try again." },
      { status: 401 }
    );
  }
}
