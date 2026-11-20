
import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  getCurrentAdmin,
  ID,
  Query,
} from "@/lib/appwrite-server";

export const runtime = "nodejs";

function getConfig() {
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const tableId = process.env.APPWRITE_ADMIN_TABLE_ID;

  if (!databaseId || !tableId) {
    throw new Error("Staff database configuration is missing.");
  }

  return { databaseId, tableId };
}

export async function GET() {
  try {
    const current = await getCurrentAdmin();

    if (!current || !current.isOwner) {
      return NextResponse.json(
        { error: "Owner access required." },
        { status: 403 }
      );
    }

    const { databaseId, tableId } = getConfig();
    const { tables, users } = createAdminClient();

    const result = await tables.listRows({
      databaseId,
      tableId,
      queries: [Query.limit(100)],
    });

    const items = await Promise.all(
      result.rows
        .filter((row) => row.role === "staff" || row.role === "supervisor")
        .map(async (row) => {
          let username = "";

          try {
            const user = await users.get({
              userId: String(row.user_id),
            });
            username = user.name || "";
          } catch {
            username = "";
          }

          return {
            $id: row.$id,
            user_id: row.user_id,
            full_name: row.full_name,
            email: row.email,
            username,
            role: row.role,
          };
        })
    );

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Staff list error:", error);

    return NextResponse.json(
      { error: "Unable to load staff accounts." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let createdUserId = "";

  try {
    const current = await getCurrentAdmin();

    if (!current || !current.isOwner) {
      return NextResponse.json(
        { error: "Only the owner can create staff accounts." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const fullName =
      typeof body.full_name === "string" ? body.full_name.trim() : "";

    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    const role =
      body.role === "staff" || body.role === "supervisor"
        ? body.role
        : "";

    if (!fullName || !username || !email || !password || !role) {
      return NextResponse.json(
        { error: "Complete all required staff account fields." },
        { status: 400 }
      );
    }

    if (fullName.length > 150) {
      return NextResponse.json(
        { error: "Staff name is too long." },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3–32 characters and use lowercase letters, numbers, dots, underscores or hyphens.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 256) {
      return NextResponse.json(
        { error: "Password must contain at least 8 characters." },
        { status: 400 }
      );
    }

    const { databaseId, tableId } = getConfig();
    const { tables, users } = createAdminClient();

    const existing = await users.list({
      queries: [
        Query.equal("name", username),
        Query.limit(1),
      ],
    });

    if (existing.users.length > 0) {
      return NextResponse.json(
        { error: "That username is already in use." },
        { status: 409 }
      );
    }

    const user = await users.create({
      userId: ID.unique(),
      email,
      password,
      name: username,
    });

    createdUserId = user.$id;

    await tables.createRow({
      databaseId,
      tableId,
      rowId: ID.unique(),
      data: {
        user_id: user.$id,
        email,
        full_name: fullName,
        role,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Staff account created successfully.",
      item: {
        user_id: user.$id,
        full_name: fullName,
        username,
        email,
        role,
      },
    });
  } catch (error) {
    console.error("Staff account creation failed:", error);

    if (createdUserId) {
      try {
        const { users } = createAdminClient();
        await users.delete({ userId: createdUserId });
      } catch (cleanupError) {
        console.error("Staff account rollback failed:", cleanupError);
      }
    }

    return NextResponse.json(
      {
        error:
          "Unable to create the staff account. Check the email, Appwrite configuration and database permissions.",
      },
      { status: 500 }
    );
  }
}
