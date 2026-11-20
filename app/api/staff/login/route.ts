
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

    const identifier =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const { users, tables } = createAdminClient();

    const searchResult = await users.list({
      queries: [
        Query.equal(
          identifier.includes("@") ? "email" : "name",
          identifier
        ),
        Query.limit(2),
      ],
    });

    const matchingUsers = searchResult.users;

    if (matchingUsers.length !== 1) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const user = matchingUsers[0];

    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const tableId = process.env.APPWRITE_ADMIN_TABLE_ID;

    if (!databaseId || !tableId) {
      throw new Error("Staff database configuration is missing.");
    }

    const staffResult = await tables.listRows({
      databaseId,
      tableId,
      queries: [
        Query.equal("user_id", user.$id),
        Query.limit(1),
      ],
    });

    const staff = staffResult.rows[0];

    if (
      !staff ||
      (staff.role !== "staff" && staff.role !== "supervisor")
    ) {
      return NextResponse.json(
        { error: "This account does not have staff access." },
        { status: 403 }
      );
    }

    const { account } = createLoginClient();

    const session = await account.createEmailPasswordSession({
      email: user.email,
      password,
    });

    const secret = (
      session as typeof session & { secret?: string }
    ).secret;

    if (!secret) {
      throw new Error("Appwrite session secret is missing.");
    }

    const response = NextResponse.json({
      success: true,
      staff: {
        full_name: staff.full_name,
        role: staff.role,
      },
    });

    response.cookies.set({
      name: getSessionCookieName(),
      value: secret,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(session.expire),
    });

    return response;
  } catch (error) {
    console.error("Staff login failed:", error);

    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 }
    );
  }
}
