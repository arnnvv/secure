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

  return friendsWithLastMsg.map((friend) => (
    <div
      key={friend.id}
      className="relative bg-zinc-50 border border-zinc-200 p-2 sm:p-3 rounded-md mb-2"
    >
      <div className="absolute right-2 sm:right-4 inset-y-0 flex items-center">
        <ChevronRight className="h-5 w-5 sm:h-7 sm:w-7 text-zinc-400" />
      </div>
      <Link
        href={`/dashboard/chat/${chatHrefConstructor(user.id, friend.id)}`}
        className="relative flex"
      >
        <div className="mb-2 sm:mb-4 flex-shrink-0 sm:mr-4">
          <div className="relative h-6 w-6">
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
              <AvatarImage src={friend?.picture || "/default-avatar.png"} />
              <AvatarFallback>
                {friend.username ? friend.username[0].toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <RecentChatPreview
          lastMessage={friend.lastMessage}
          sessionUser={sessionUser}
          friend={friend}
        />
      </Link>
    </div>
  ));
}

export function RecentChatsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton height={75} count={3} />
    </div>
  );
}
