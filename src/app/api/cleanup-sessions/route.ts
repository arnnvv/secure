import { NextResponse } from "next/server";
import { cleanupExpiredSessions } from "@/lib/auth";

export async function POST() {
  try {
    await cleanupExpiredSessions();
    return NextResponse.json({
      success: true,
      message: "Expired sessions cleaned up",
    });
  } catch (error) {
    console.error("Failed to cleanup expired sessions:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cleanup sessions" },
      { status: 500 },
    );
  }
}
