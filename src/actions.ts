"use server";

import { and, desc, eq, inArray, lt, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { cache } from "react";
import type { UploadFileResult } from "uploadthing/types";
import {
  createSession,
  generateSessionToken,
  invalidateSession,
  type SessionValidationResult,
  validateSessionToken,
} from "./lib/auth";
import { db } from "./lib/db";
import {
  devices,
  deviceVerifications,
  type FriendRequest,
  friendReqStatusEnum,
  friendRequests,
  type Message,
  messages,
  type NewMessage,
  type User,
  users,
} from "./lib/db/schema";
import type { ActionResult } from "./lib/formComtrol";
import { pusherServer } from "./lib/pusher-server";
import { globalGETRateLimit, globalPOSTRateLimit } from "./lib/request";
import { deleteSessionTokenCookie, setSessionTokenCookie } from "./lib/session";
import { utapi } from "./lib/upload";
import { chatHrefConstructor, toPusherKey } from "./lib/utils";

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const token = (await cookies()).get("session")?.value ?? null;
    if (token === null) {
      return {
        session: null,
        user: null,
      };
    }
    const result = await validateSessionToken(token);
    return result;
  },
);

export const signOutAction = async (): Promise<ActionResult> => {
  if (!globalGETRateLimit()) {
    return {
      success: false,
      message: "Too many requests",
    };
  }

  const { session } = await getCurrentSession();
  if (session === null)
    return {
      success: false,
      message: "Not authenticated",
    };

  try {
    await invalidateSession(session.id);
    await deleteSessionTokenCookie();
    return {
      success: true,
      message: "Logging Out",
    };
  } catch (e) {
    return {
      success: false,
      message: `Error Logging Out: ${e}`,
    };
  }
};

export const changeUsernameAction = async (
  _: any,
  formData: FormData,
): Promise<ActionResult> => {
  if (!globalPOSTRateLimit()) {
    return {
      success: false,
      message: "Too many requests",
    };
  }

  const username = formData.get("username") as string;
  if (!username || typeof username !== "string")
    return {
      success: false,
      message: "Username is required",
    };

  if (username.length < 3) {
    return {
      success: false,
      message: "Username must be at least 3 characters long.",
    };
  }

  try {
    const { user } = await getCurrentSession();
    if (!user)
      return {
        success: false,
        message: "Not Logged in",
      };

    await db
      .update(users)
      .set({ username: username })
      .where(eq(users.id, user.id));

    revalidatePath("/");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Username set",
    };
  } catch (e) {
    if (e instanceof Error && e.message.includes("unique constraint")) {
      return {
        success: false,
        message: "Username already taken",
      };
    }
    return {
      success: false,
      message: "An unexpected error occurred while setting the username.",
    };
  }
};

export async function uploadFile(fd: FormData): Promise<ActionResult> {
  console.log(
    "SERVER CHECK - Secret Key Loaded:",
    !!process.env.UPLOADTHING_SECRET,
  );
  console.log(
    "SERVER CHECK - App ID Loaded:",
    !!process.env.UPLOADTHING_APP_ID,
  );

  console.log("\x1b[36m[START] uploadFile called\x1b[0m");

  console.log("\x1b[36m[START] uploadFile called\x1b[0m");
  console.log("\x1b[34m[INPUT] FormData keys:\x1b[0m", Array.from(fd.keys()));

  console.log("\x1b[36m[SESSION] Fetching current session...\x1b[0m");
  const { session, user } = await getCurrentSession();
  console.log("\x1b[34m[SESSION RESULT]\x1b[0m", { session, user });

  if (session === null || !user) {
    console.log("\x1b[31m[AUTH FAILED] No valid session or user\x1b[0m");
    return {
      success: false,
      message: "Not Logged in",
    };
  }
  console.log("\x1b[32m[AUTH PASSED] Valid session and user detected\x1b[0m");

  console.log("\x1b[36m[FILE] Extracting file from FormData...\x1b[0m");
  const file = fd.get("file") as File;
  if (!file) {
    console.log("\x1b[31m[FILE ERROR] No file field in FormData\x1b[0m");
    return {
      success: false,
      message: "No file provided",
    };
  }
  console.log("\x1b[34m[FILE RECEIVED]\x1b[0m", {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  console.log("\x1b[36m[UPLOAD] Sending file to utapi.uploadFiles...\x1b[0m");
  const uploadedFile: UploadFileResult = await utapi.uploadFiles(file);
  console.log("\x1b[34m[UPLOAD RESULT]\x1b[0m", uploadedFile);

  if (uploadedFile.error) {
    console.log(
      "\x1b[31m[UPLOAD FAILED] Error from utapi:\x1b[0m",
      uploadedFile.error,
    );
    return {
      success: false,
      message: uploadedFile.error.message,
    };
  }
  console.log("\x1b[32m[UPLOAD SUCCESS] File uploaded to UFS\x1b[0m");
  console.log("\x1b[34m[UFS URL]\x1b[0m", uploadedFile.data.ufsUrl);

  try {
    console.log("\x1b[36m[DB UPDATE] Updating user picture in DB...\x1b[0m");
    await db
      .update(users)
      .set({ picture: uploadedFile.data.ufsUrl })
      .where(eq(users.id, user.id));
    console.log(
      "\x1b[32m[DB SUCCESS] Picture updated for user:\x1b[0m",
      user.id,
    );
  } catch (e) {
    console.log("\x1b[31m[DB ERROR] Failed to update user picture\x1b[0m", e);
    return {
      success: false,
      message: `Error updating image ${e}`,
    };
  }

  console.log("\x1b[32m[SUCCESS] File uploaded and DB updated\x1b[0m");
  console.log("\x1b[36m[END] uploadFile finished\x1b[0m");
  return {
    success: true,
    message: uploadedFile.data.ufsUrl,
  };
}

export const addFriendAction = async (
  _: any,
  formData: FormData,
): Promise<ActionResult> => {
  const { user } = await getCurrentSession();
  if (!user) {
    return {
      success: false,
      message: "Not logged in",
    };
  }
  const receiverUsername = formData.get("friend-username") as string;
  if (!receiverUsername || typeof receiverUsername !== "string") {
    return {
      success: false,
      message: "Invalid username",
    };
  }
  try {
    const friend: User | undefined = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, receiverUsername),
    });

    if (!friend) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (friend.id === user.id) {
      return {
        success: false,
        message: "You can't add yourself as a friend",
      };
    }

    const existingRequest: FriendRequest | undefined =
      await db.query.friendRequests.findFirst({
        where: (requests, { and, or }) =>
          and(
            or(
              and(
                eq(requests.requesterId, user.id),
                eq(requests.recipientId, friend.id),
              ),
              and(
                eq(requests.requesterId, friend.id),
                eq(requests.recipientId, user.id),
              ),
            ),
            or(eq(requests.status, "pending"), eq(requests.status, "accepted")),
          ),
      });

    if (existingRequest) {
      return {
        success: false,
        message:
          existingRequest.status === "pending"
            ? "Friend request already sent"
            : "You are already friends with this user",
      };
    }

    await pusherServer.trigger(
      toPusherKey(`private-user:${friend.id}`),
      "incoming_friend_request",
      {
        senderId: user.id,
        senderName: user.username,
        senderImage: user.picture,
      },
    );

    await db.insert(friendRequests).values({
      requesterId: user.id,
      recipientId: friend.id,
      status: friendReqStatusEnum.enumValues[0],
    });

    return { success: true, message: "Friend request sent" };
  } catch (_e) {
    return { success: false, message: "Unexpected error. Check server logs." };
  }
};

export const acceptFriendRequest = async (
  friendRequestId: number,
  sessionId: number,
): Promise<
  | { error: string; message?: undefined }
  | { message: string; error?: undefined }
> => {
  try {
    const friendRequest: FriendRequest | undefined =
      await db.query.friendRequests.findFirst({
        where: (requests, { and, eq }) =>
          and(
            eq(requests.requesterId, friendRequestId),
            eq(requests.recipientId, sessionId),
            eq(requests.status, "pending"),
          ),
      });
    if (!friendRequest) return { error: "Friend Request not found" };

    const [friendRequester, user] = await Promise.all([
      db.query.users.findFirst({
        where: eq(users.id, friendRequestId),
        with: { devices: { columns: { id: true, publicKey: true } } },
      }),
      db.query.users.findFirst({
        where: eq(users.id, sessionId),
        with: { devices: { columns: { id: true, publicKey: true } } },
      }),
    ]);

    if (!friendRequester || !user) {
      return { error: "Could not find users to complete the request." };
    }

    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`private-user:${friendRequestId}`),
        "new_friend",
        user,
      ),
      pusherServer.trigger(
        toPusherKey(`private-user:${sessionId}`),
        "new_friend",
        friendRequester,
      ),
      db
        .update(friendRequests)
        .set({ status: "accepted" })
        .where(
          and(
            eq(friendRequests.requesterId, friendRequestId),
            eq(friendRequests.recipientId, sessionId),
            eq(friendRequests.status, "pending"),
          ),
        ),
    ]);

    return { message: "Friend request accepted" };
  } catch (e) {
    return { error: `Failed to accept friend request: ${e}` };
  }
};

export const rejectFriendRequest = async (
  friendRequestId: number,
  sessionId: number,
): Promise<
  | { error: string; message?: undefined }
  | { message: string; error?: undefined }
> => {
  try {
    const friendRequest: FriendRequest | undefined =
      await db.query.friendRequests.findFirst({
        where: (requests, { and, eq }) =>
          and(
            eq(requests.requesterId, friendRequestId),
            eq(requests.recipientId, sessionId),
            eq(requests.status, "pending"),
          ),
      });
    if (!friendRequest) return { error: "Friend Request not found" };
    await db
      .update(friendRequests)
      .set({ status: "declined" })
      .where(
        and(
          eq(friendRequests.requesterId, friendRequestId),
          eq(friendRequests.recipientId, sessionId),
        ),
      );

    return { message: "Friend request rejected" };
  } catch (e) {
    return { error: `failed to reject friend request: ${e}` };
  }
};

export const sendMessageAction = async ({
  senderDeviceId,
  encryptedContent,
  sender,
  receiver,
}: {
  senderDeviceId: number;
  encryptedContent: Record<number, string>;
  sender: Omit<User, "password_hash">;
  receiver: User;
}): Promise<
  | {
      message: string;
      error?: undefined;
    }
  | {
      error: string;
      message?: undefined;
    }
  | undefined
> => {
  try {
    const contentPayload = JSON.stringify({
      senderDeviceId,
      recipients: encryptedContent,
    });

    const messageData: NewMessage = {
      senderId: sender.id,
      recipientId: receiver.id,
      content: contentPayload,
      createdAt: new Date(),
    };

    const [insertedMessage] = await db
      .insert(messages)
      .values(messageData)
      .returning();

    const chatPusherPayload = {
      ...insertedMessage,
      senderName: sender.username,
      senderImage: sender.picture,
    };

    const notificationPusherPayload = {
      senderId: sender.id,
      senderName: sender.username,
      senderImage: sender.picture,
      chatId: chatHrefConstructor(sender.id, receiver.id),
      senderDeviceId,
      encryptedPreviews: encryptedContent,
    };

    await Promise.all([
      pusherServer.trigger(
        toPusherKey(
          `private-chat:${chatHrefConstructor(sender.id, receiver.id)}`,
        ),
        "incoming-message",
        chatPusherPayload,
      ),
      pusherServer.trigger(
        toPusherKey(`private-user:${receiver.id}`),
        "new_message_notification",
        notificationPusherPayload,
      ),
    ]);

    return { message: "Message sent" };
  } catch (e) {
    console.error("Error sending message:", e);
    return { error: `Failed to send message: ${e}` };
  }
};

export async function registerDeviceAction(
  publicKey: string,
  deviceName: string,
): Promise<ActionResult> {
  if (!globalPOSTRateLimit()) {
    return { success: false, message: "Too many requests" };
  }

  const { user } = await getCurrentSession();
  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  if (!publicKey || typeof publicKey !== "string" || publicKey.length < 1) {
    return { success: false, message: "Invalid public key" };
  }
  if (!deviceName || typeof deviceName !== "string" || deviceName.length < 1) {
    return { success: false, message: "Invalid device name" };
  }

  try {
    const [newDevice] = await db
      .insert(devices)
      .values({
        userId: user.id,
        publicKey,
        name: deviceName,
      })
      .returning();

    return {
      success: true,
      message: "Device registered successfully!",
      data: { deviceId: newDevice.id },
    };
  } catch (error) {
    console.error("Failed to register device:", error);
    if (error instanceof Error && error.message.includes("unique constraint")) {
      return {
        success: false,
        message: "This public key is already registered for this user.",
      };
    }
    return {
      success: false,
      message: "Failed to register device. Please try again.",
    };
  }
}

const MESSAGES_PER_PAGE = 50;

export async function getPaginatedMessages(
  chatId: string,
  cursor: string | null,
): Promise<{ messages: Message[]; nextCursor: string | null }> {
  const { user } = await getCurrentSession();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const [userId1, userId2] = chatId.split("--").map(Number);
  const chatPartnerId = user.id === userId1 ? userId2 : userId1;

  const query = db
    .select()
    .from(messages)
    .where(
      and(
        or(
          and(
            eq(messages.senderId, user.id),
            eq(messages.recipientId, chatPartnerId),
          ),
          and(
            eq(messages.senderId, chatPartnerId),
            eq(messages.recipientId, user.id),
          ),
        ),
        cursor ? lt(messages.createdAt, new Date(cursor)) : undefined,
      ),
    )
    .orderBy(desc(messages.createdAt))
    .limit(MESSAGES_PER_PAGE);

  const fetchedMessages = await query;

  let nextCursor: string | null = null;
  if (fetchedMessages.length === MESSAGES_PER_PAGE) {
    nextCursor = fetchedMessages[MESSAGES_PER_PAGE - 1].createdAt.toISOString();
  }

  return { messages: fetchedMessages, nextCursor };
}

export async function getVerifiedDeviceIdsForContact(
  contactUserId: number,
): Promise<number[]> {
  const { user } = await getCurrentSession();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const contactDevices = await db.query.devices.findMany({
    where: eq(devices.userId, contactUserId),
    columns: { id: true },
  });

  if (contactDevices.length === 0) {
    return [];
  }

  const contactDeviceIds = contactDevices.map((d) => d.id);

  const verifications = await db
    .select({ verifiedDeviceId: deviceVerifications.verifiedDeviceId })
    .from(deviceVerifications)
    .where(
      and(
        eq(deviceVerifications.verifierUserId, user.id),
        inArray(deviceVerifications.verifiedDeviceId, contactDeviceIds),
      ),
    );

  return verifications.map((v) => v.verifiedDeviceId);
}

export async function verifyDevicesAction(
  deviceIdsToVerify: number[],
): Promise<ActionResult> {
  const { user } = await getCurrentSession();
  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  if (!Array.isArray(deviceIdsToVerify) || deviceIdsToVerify.length === 0) {
    return { success: false, message: "No device IDs provided" };
  }

  try {
    const valuesToInsert = deviceIdsToVerify.map((deviceId) => ({
      verifierUserId: user.id,
      verifiedDeviceId: deviceId,
    }));

    await db
      .insert(deviceVerifications)
      .values(valuesToInsert)
      .onConflictDoNothing();

    return { success: true, message: "Devices verified successfully." };
  } catch (error) {
    console.error("Failed to verify devices:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export const completeWalletAuthAction = async (
  walletAddress: string,
  publicKey: string,
): Promise<ActionResult> => {
  try {
    let user = await db.query.users.findFirst({
      where: eq(users.walletAddress, walletAddress),
    });

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          walletAddress: walletAddress.toLowerCase(),
        })
        .returning();
      user = newUser;
    }

    if (!user) {
      throw new Error("Failed to create or find user in the database.");
    }

    const existingDevice = await db.query.devices.findFirst({
      where: and(eq(devices.userId, user.id), eq(devices.publicKey, publicKey)),
    });

    let deviceId;

    if (existingDevice) {
      deviceId = existingDevice.id;
    } else {
      const [newDevice] = await db
        .insert(devices)
        .values({
          userId: user.id,
          publicKey: publicKey,
          name: "Primary Device",
        })
        .returning({ id: devices.id });
      deviceId = newDevice.id;
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);
    await setSessionTokenCookie(sessionToken, session.expiresAt);

    return {
      success: true,
      message: "Session created successfully.",
      data: { deviceId },
    };
  } catch (e) {
    console.error(`Wallet auth completion failed: ${e}`);
    return {
      success: false,
      message: "An unexpected error occurred while creating your user session.",
    };
  }
};
