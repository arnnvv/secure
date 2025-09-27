import {
  type MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from "@worldcoin/minikit-js";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { completeWalletAuthAction } from "@/actions";

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
}

export const POST = async (req: NextRequest) => {
  const { payload } = (await req.json()) as IRequestPayload;
  const nonce = (await cookies()).get("siwe-nonce")?.value;

  if (!nonce) {
    return NextResponse.json(
      { success: false, message: "Nonce not found." },
      { status: 422 },
    );
  }

  try {
    const { isValid } = await verifySiweMessage(payload, nonce);
    if (!isValid) {
      throw new Error("SIWE message verification failed.");
    }

    const actionResult = await completeWalletAuthAction(payload.address);

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
