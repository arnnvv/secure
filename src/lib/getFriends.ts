import { and, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "./db";
import type { Device, FriendRequest, Message, User } from "./db/schema";
import { users } from "./db/schema";

export type UserWithDevices = User & {
  devices: Pick<Device, "id" | "publicKey">[];
};

export const getFriends = async (id: number): Promise<UserWithDevices[]> => {
  const friendships: FriendRequest[] = await db.query.friendRequests.findMany({
    where: (requests) =>
      and(
        or(eq(requests.requesterId, id), eq(requests.recipientId, id)),
        eq(requests.status, "accepted"),
      ),
  });

  const friendIds: number[] = friendships.map((friendship: FriendRequest) =>
    friendship.requesterId === id
      ? friendship.recipientId
      : friendship.requesterId,
  );

  if (friendIds.length === 0) {
    return [];
  }

  const friends: UserWithDevices[] = await db.query.users.findMany({
    where: inArray(users.id, friendIds),
    with: {
      devices: {
        columns: {
          id: true,
          publicKey: true,
        },
      },
    },
  });

  return friends;
};

export interface FriendWithLastMsg extends UserWithDevices {
  lastMessage: Message;
}

export const getFriendsWithLastMessage = async (
  userId: number,
): Promise<FriendWithLastMsg[]> => {
  const friendsWithMessages = await db.execute(sql`
    SELECT
      f.friend_id,
      u.username,
      u.picture,
      u.wallet_address AS "walletAddress",
      last_msg.id AS "lastMessageId",
      last_msg.sender_id AS "lastMessageSenderId",
      last_msg.recipient_id AS "lastMessageRecipientId",
      last_msg.content AS "lastMessageContent",
      last_msg.created_at AS "lastMessageCreatedAt",
      (
        SELECT JSON_AGG(
          JSON_BUILD_OBJECT('id', d.id, 'publicKey', d.public_key)
        )
        FROM chat_devices d
        WHERE d.user_id = f.friend_id
      ) as devices
    FROM (
      SELECT
        CASE
          WHEN requester_id = ${userId} THEN recipient_id
          ELSE requester_id
        END AS friend_id
      FROM chat_friend_requests
      WHERE (requester_id = ${userId} OR recipient_id = ${userId}) AND status = 'accepted'
    ) AS f
    JOIN chat_users u ON f.friend_id = u.id
    LEFT JOIN LATERAL (
      SELECT *
      FROM chat_messages m
      WHERE (m.sender_id = ${userId} AND m.recipient_id = f.friend_id)
        OR (m.sender_id = f.friend_id AND m.recipient_id = ${userId})
      ORDER BY m.created_at DESC
      LIMIT 1
    ) AS last_msg ON true
  `);

  if (!friendsWithMessages.rows.length) return [];

  const result: FriendWithLastMsg[] = friendsWithMessages.rows.map(
    (row: any) => ({
      id: row.friend_id,
      username: row.username,
      picture: row.picture,
      walletAddress: row.walletAddress,
      devices: row.devices || [],
      lastMessage: row.lastMessageId
        ? {
            id: row.lastMessageId,
            senderId: row.lastMessageSenderId,
            recipientId: row.lastMessageRecipientId,
            content: row.lastMessageContent,
            createdAt: new Date(row.lastMessageCreatedAt),
          }
        : {
            id: -1,
            senderId: -1,
            recipientId: -1,
            content: " ",
            createdAt: new Date(0),
          },
    }),
  );

  return result;
};
