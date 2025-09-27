"use client";

import type { JSX } from "react";
import type { Message, User } from "@/lib/db/schema";

export const RecentChatPreview = ({
  lastMessage,
  sessionUser,
  friend,
}: {
  lastMessage: Message;
  sessionUser: User;
  friend: User;
}): JSX.Element => {
  const previewText =
    lastMessage.id === -1 ? "No messages yet." : lastMessage.content;

  const isFromSelf =
    lastMessage.id !== -1 && lastMessage.senderId === sessionUser.id;

  return (
    <div>
      <h4 className="text-lg font-semibold">{friend.username}</h4>
      <p className="mt-1 max-w-md truncate">
        <span className="text-zinc-400">{isFromSelf ? "You: " : ""}</span>
        {previewText}
      </p>
    </div>
  );
};
