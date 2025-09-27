import {
  type MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from "@worldcoin/minikit-js";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { createSession, generateSessionToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { devices, users } from "@/lib/db/schema";
import { setSessionTokenCookie } from "@/lib/session";

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  publicKey: string;
}

export const POST = async (req: NextRequest) => {
  const { payload, publicKey } = (await req.json()) as IRequestPayload;
  const nonce = (await cookies()).get("siwe-nonce")?.value;

  if (!nonce) {
    return NextResponse.json(
      { success: false, message: "Nonce not found." },
      { status: 422 },
    );
  }
  if (!publicKey) {
    return NextResponse.json(
      { success: false, message: "Public key is required." },
      { status: 422 },
    );
  }

  try {
    const { isValid } = await verifySiweMessage(payload, nonce);
    if (!isValid) {
      throw new Error("SIWE message verification failed.");
    }

    const walletAddress = payload.address.toLowerCase();
    let user = await db.query.users.findFirst({
      where: eq(users.walletAddress, walletAddress),
    });

    if (!user) {
      [user] = await db
        .insert(users)
        .values({ walletAddress: walletAddress })
        .returning();
    }

    if (!user) {
      throw new Error("Failed to create or find user in the database.");
    }

    const [device] = await db
      .insert(devices)
      .values({
        userId: user.id,
        publicKey: publicKey,
        name: "Primary Wallet Device",
      })
      .returning({ id: devices.id });

    if (!device) {
      throw new Error("Failed to register the new device.");
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);
    await setSessionTokenCookie(sessionToken, session.expiresAt);

    return NextResponse.json({
      success: true,
      message: "Session created successfully.",
      data: { deviceId: device.id },
    });
  } catch (error: any) {
    console.error("SIWE completion error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An unexpected error occurred.",
      },
      { status: 500 },
    );
  }
};
