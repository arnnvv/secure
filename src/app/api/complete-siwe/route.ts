import {
  type MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from "@worldcoin/minikit-js";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { completeWalletAuthAction } from "@/actions";

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

    const actionResult = await completeWalletAuthAction(
      payload.address,
      publicKey,
    );

    if (!actionResult.success) {
      throw new Error(actionResult.message);
    }

    return NextResponse.json({ ...actionResult });
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
