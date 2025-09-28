import { eq } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import { getCurrentSession } from "@/actions";
import { RecentChatPreview } from "@/components/RecentChatPreview";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  type FriendWithLastMsg,
  getFriendsWithLastMessage,
} from "@/lib/getFriends";
import { chatHrefConstructor } from "@/lib/utils";

export async function RecentChats() {
  const { user } = await getCurrentSession();
  if (!user) return redirect("/login");

  const friendsWithLastMsg: FriendWithLastMsg[] =
    await getFriendsWithLastMessage(user.id);

  const sessionUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!sessionUser) return redirect("/login");

  if (friendsWithLastMsg.length === 0) {
    return <p className="text-sm text-zinc-500">Nothing to show here...</p>;
  }

  return (
    <div className="h-full overflow-y-auto">
      {friendsWithLastMsg.map((friend) => (
        <div key={friend.id} className="mobile-chat-item">
          <Link
            href={`/dashboard/chat/${chatHrefConstructor(user.id, friend.id)}`}
            className="relative flex items-center space-x-3 w-full"
          >
            <div className="flex-shrink-0">
              <div className="mobile-chat-avatar">
                {friend.username ? friend.username[0].toUpperCase() : "?"}
              </div>
            </div>
            <div className="mobile-chat-content">
              <div className="flex items-center justify-between">
                <h3 className="mobile-chat-name">{friend.username}</h3>
                <span className="mobile-chat-time">
                  {friend.lastMessage?.createdAt
                    ? new Date(friend.lastMessage.createdAt).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : ""}
                </span>
              </div>
              <p className="mobile-chat-preview">
                {friend.lastMessage
                  ? friend.lastMessage.senderId === user.id
                    ? `You: ${friend.lastMessage.content.includes(".") && friend.lastMessage.content.length > 20 ? "sent a message" : friend.lastMessage.content}`
                    : friend.lastMessage.content.includes(".") &&
                        friend.lastMessage.content.length > 20
                      ? `${friend.username} sent a message`
                      : friend.lastMessage.content
                  : "No messages yet"}
              </p>
            </div>
            {/* Unread message badge - you can add logic to show this based on unread count */}
            {Math.random() > 0.7 && (
              <div className="mobile-chat-badge">
                {Math.floor(Math.random() * 5) + 1}
              </div>
            )}
          </Link>
        </div>
      ))}
    </div>
  );
}

export function RecentChatsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton height={75} count={3} />
    </div>
  );
}
