
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createSessionClient,
  getSessionCookieName,
} from "@/lib/appwrite-server";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  const cookieName = getSessionCookieName();
  const secret = cookieStore.get(cookieName)?.value;

  if (secret) {
    try {
      const { account } = createSessionClient(secret);

      await account.deleteSession({
        sessionId: "current",
      });
    } catch (error) {
      console.error("Staff logout failed:", error);
    }
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: cookieName,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
