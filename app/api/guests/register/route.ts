
import { randomBytes, createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, ID } from "@/lib/appwrite-server";

export const runtime = "nodejs";

const schema = z.object({
  full_name: z.string().trim().min(2).max(200),
  phone: z.string().trim().max(40).optional().default(""),
  email: z.union([z.string().trim().email().max(320), z.literal("")]).optional().default(""),
  companion_name: z.string().trim().max(200).optional().default(""),
});

const attempts = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < 60 * 60 * 1000);
  if (recent.length >= 8) {
    attempts.set(ip, recent);
    return true;
  }
  recent.push(now);
  attempts.set(ip, recent);
  return false;
}

function makeCode() {
  return randomBytes(8).toString("hex").toUpperCase();
}

function makeToken() {
  return randomBytes(32).toString("hex");
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function fingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";

    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = schema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your name, phone number, and email address." },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const names = [input.full_name, input.companion_name]
      .filter(Boolean)
      .map((name) => name.trim().replace(/\s+/g, " "));

    if (
      names.length === 2 &&
      normalizeName(names[0]) === normalizeName(names[1])
    ) {
      return NextResponse.json(
        { error: "The guest and companion must have different names." },
        { status: 400 }
      );
    }

    const { tables } = createAdminClient();
    const databaseId = process.env.APPWRITE_DATABASE_ID!;
    const tableId = process.env.APPWRITE_INVITATIONS_TABLE_ID!;

    if (!databaseId || !tableId) {
      throw new Error("Invitation database configuration is missing.");
    }

    const created: string[] = [];
    const guests: { full_name: string; invitation_url: string }[] = [];

    try {
      for (const [index, fullName] of names.entries()) {
        const token = makeToken();

        const record = {
          full_name: fullName,
          phone: index === 0 ? input.phone : "",
          email: index === 0 ? input.email : "",
          invitation_code: makeCode(),
          qr_token: token,
          status: "responded",
          attending: true,
          num_guests: 0,
          checked_in: false,
          created_by: "public-registration",
          message: `registration_fingerprint:${fingerprint(normalizeName(fullName))}`,
        };

        const row = await tables.createRow({
          databaseId,
          tableId,
          rowId: ID.unique(),
          data: record,
        });

        created.push(row.$id);
        guests.push({
          full_name: fullName,
          invitation_url: `/invitation/${token}`,
        });
      }
    } catch (error) {
      for (const rowId of created) {
        try {
          await tables.deleteRow({ databaseId, tableId, rowId });
        } catch {
          // Best-effort rollback.
        }
      }
      throw error;
    }

    return NextResponse.json({ success: true, guests }, { status: 201 });
  } catch (error) {
    console.error("Guest registration failed:", error);
    return NextResponse.json(
      { error: "Registration could not be completed. Please try again." },
      { status: 500 }
    );
  }
}
