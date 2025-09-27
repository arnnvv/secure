"use client";

import { usePathname } from "next/navigation";
import { type JSX, useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/db/schema";
import { pusherClient } from "@/lib/pusher-client";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { CustomToast } from "./CustomToast";

interface NotificationPayload {
  senderId: number;
  senderName: string;
  senderImage: string | null;
  chatId: string;
  message: string;
}

export const SidebarChatList = ({
  sessionId,
  friends,
}: {
  sessionId: number;
  friends: User[];
}): JSX.Element => {
  const [unseenMessagesCount, setUnseenMessagesCount] = useState<
    Record<number, number>
  >({});
  const [activeChats, setActiveChats] = useState<User[]>(friends);
  const pathname: string | null = usePathname();

  useEffect(() => {
    const channelName = toPusherKey(`private-user:${sessionId}`);
    pusherClient.subscribe(channelName);

    const newMessageHandler = (payload: NotificationPayload) => {
      const shouldNotify: boolean =
        pathname !== `/dashboard/chat/${payload.chatId}`;

      if (!shouldNotify) return;

      toast.custom(
        (toastId: string | number): JSX.Element => (
          <CustomToast
            toastId={toastId}
            href={`/dashboard/chat/${chatHrefConstructor(
              sessionId,
              payload.senderId,
            )}`}
            senderMessage={payload.message}
            senderName={payload.senderName}
            image={payload.senderImage}
          />
        ),
      );

      setUnseenMessagesCount((prev) => ({
        ...prev,
        [payload.senderId]: (prev[payload.senderId] || 0) + 1,
      }));
    };

    const newFriendHandler = (newFriend: User) => {
      setActiveChats((prev) => [...prev, newFriend]);
      toast.info(`${newFriend.username} has accepted your friend request!`);
    };

    pusherClient.bind("new_message_notification", newMessageHandler);
    pusherClient.bind("new_friend", newFriendHandler);

    return () => {
      pusherClient.unsubscribe(channelName);
      pusherClient.unbind("new_message_notification", newMessageHandler);
      pusherClient.unbind("new_friend", newFriendHandler);
    };
  }, [sessionId, pathname]);

  useEffect(() => {
    if (pathname?.includes("chat")) {
      const chatPartnerId = Number(
        pathname.split("--").find((id) => Number(id) !== sessionId),
      );
      if (chatPartnerId && unseenMessagesCount[chatPartnerId]) {
        setUnseenMessagesCount((prev) => {
          const newCounts = { ...prev };
          delete newCounts[chatPartnerId];
          return newCounts;
        });
      }
    }
  }, [pathname, sessionId, unseenMessagesCount]);

  return (
    <ul className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {activeChats
        .sort((a, b) => (a.username || "").localeCompare(b.username || ""))
        .map((friend) => {
          const unseenMsgCount = unseenMessagesCount[friend.id] || 0;
          return (
            <li key={friend.id}>
              <a
                href={`/dashboard/chat/${chatHrefConstructor(
                  sessionId,
                  friend.id,
                )}`}
                className="text-gray-700 hover:text-cyan-400 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
              >
                <Avatar>
                  <AvatarImage src={friend.picture || ""} />
                  <AvatarFallback>
                    {friend.username ? friend.username[0].toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                {friend.username}
                {unseenMsgCount > 0 && (
                  <div className="border-r-cyan-400 font-medium text-xs w-5 h-5 rounded-full flex justify-center items-center bg-cyan-400 text-white">
                    {unseenMsgCount}
                  </div>
                )}
              </a>
            </li>
          );
        })}
    </ul>
  );
};
