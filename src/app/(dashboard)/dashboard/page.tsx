import { getCurrentSession } from "@/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/lib/db";
import { type Message, messages, users } from "@/lib/db/schema";
import { getFriends, type UserWithDevices } from "@/lib/getFriends";
import { chatHrefConstructor } from "@/lib/utils";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { JSX } from "react";
import { RecentChatPreview } from "@/components/RecentChatPreview";

interface FriendWithLastMsg extends UserWithDevices {
  lastMessage: Message | null;
}

export default async function Pager(): Promise<JSX.Element> {
  const { user, session } = await getCurrentSession();
  if (session === null) return redirect("/login");

  const friends: UserWithDevices[] = await getFriends(user.id);

  const sessionUserWithDevices = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      devices: {
        columns: {
          id: true,
          publicKey: true,
        },
      },
    },
  });

  if (!sessionUserWithDevices) return redirect("/login");

  let friendsWithLastMsg: FriendWithLastMsg[] = friends.map((friend) => ({
    ...friend,
    lastMessage: null,
  }));

  if (friends.length > 0) {
    const friendIds = friends.map((f) => f.id);

    // --- N+1 Query Solved ---
    // Instead of querying for each friend's last message in a loop, we use a
    // single query with a window function (ROW_NUMBER) to get the latest
    // message for every conversation the user is a part of.

    const lastMessageSubquery = db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        recipientId: messages.recipientId,
        content: messages.content,
        createdAt: messages.createdAt,
        // Partition by a constructed 'chat_id' to group messages by conversation
        // Then, order by date and assign a row number. The latest message will be 1.
        rowNum: sql<number>`ROW_NUMBER() OVER (PARTITION BY
          CASE WHEN ${messages.senderId} < ${messages.recipientId}
            THEN CONCAT(${messages.senderId}, '--', ${messages.recipientId})
            ELSE CONCAT(${messages.recipientId}, '--', ${messages.senderId})
          END
          ORDER BY ${messages.createdAt} DESC)`.mapWith(Number),
      })
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, user.id),
            inArray(messages.recipientId, friendIds),
          ),
          and(
            inArray(messages.senderId, friendIds),
            eq(messages.recipientId, user.id),
          ),
        ),
      )
      .as("last_messages_sq");

    const lastMessages = await db
      .select()
      .from(lastMessageSubquery)
      .where(eq(lastMessageSubquery.rowNum, 1));

    friendsWithLastMsg = friends.map((friend) => {
      const lastMessage = lastMessages.find(
        (msg) =>
          (msg.senderId === user.id && msg.recipientId === friend.id) ||
          (msg.senderId === friend.id && msg.recipientId === user.id),
      );
      return {
        ...friend,
        lastMessage: lastMessage || null,
      };
    });
  }

  return (
    <div className="container py-12">
      <h1 className="font-bold text-5xl mb-8">Recent chats</h1>
      {friendsWithLastMsg.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendsWithLastMsg
          .sort((a, b) => {
            const dateA = a.lastMessage?.createdAt ?? new Date(0);
            const dateB = b.lastMessage?.createdAt ?? new Date(0);
            return dateB.getTime() - dateA.getTime();
          })
          .map(
            (friend: FriendWithLastMsg): JSX.Element => (
              <div
                key={friend.id}
                className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md mb-2"
              >
                <div className="absolute right-4 inset-y-0 flex items-center">
                  <ChevronRight className="h-7 w-7 text-zinc-400" />
                </div>

                <Link
                  href={`/dashboard/chat/${chatHrefConstructor(
                    user.id,
                    friend.id,
                  )}`}
                  className="relative sm:flex"
                >
                  <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                    <div className="relative h-6 w-6">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={friend?.picture || "/default-avatar.png"}
                        />
                        <AvatarFallback>
                          {friend.username
                            ? friend.username[0]
                            : friend.email[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  {friend.lastMessage ? (
                    <RecentChatPreview
                      lastMessage={friend.lastMessage}
                      sessionUser={sessionUserWithDevices}
                      friend={friend}
                    />
                  ) : (
                    <div>
                      <h4 className="text-lg font-semibold">
                        {friend.username}
                      </h4>
                      <p className="mt-1 max-w-md text-zinc-400">
                        No messages yet.
                      </p>
                    </div>
                  )}
                </Link>
              </div>
            ),
          )
      )}
    </div>
  );
}
