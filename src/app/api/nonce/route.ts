import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const nonce = crypto.randomUUID().replace(/-/g, "");

  (await cookies()).set("siwe-nonce", nonce, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
  });

  return NextResponse.json({ nonce });
}
