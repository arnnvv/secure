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
  const isFromSelf =
    lastMessage.id !== -1 && lastMessage.senderId === sessionUser.id;

  // Check if the message content looks like encrypted content (contains dots and base64-like characters)
  const isEncrypted =
    lastMessage.id !== -1 &&
    lastMessage.content.includes(".") &&
    lastMessage.content.length > 20;

  let previewText: string;
  if (lastMessage.id === -1) {
    previewText = "No messages yet.";
  } else if (isEncrypted) {
    previewText = isFromSelf
      ? "You sent a message"
      : `${friend.username} sent a message`;
  } else {
    previewText = lastMessage.content;
  }

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
