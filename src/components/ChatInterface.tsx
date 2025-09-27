"use client";

import type { JSX } from "react";
import { ChatInput } from "@/components/ChatInput";
import { MessagesComp } from "@/components/MessagesComp";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message, User } from "@/lib/db/schema";

interface ChatInterfaceProps {
  chatId: string;
  chatPartner: User;
  sessionUser: User;
  initialMessages: Message[];
}

export default function ChatInterface({
  chatId,
  chatPartner,
  sessionUser,
  initialMessages,
}: ChatInterfaceProps): JSX.Element {
  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200 px-2 sm:px-4">
        <div className="relative flex items-center space-x-2 sm:space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Avatar>
                <AvatarImage src={chatPartner.picture || ""} />
                <AvatarFallback>
                  {chatPartner.username
                    ? chatPartner.username[0].toUpperCase()
                    : "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <div className="text-lg sm:text-xl flex items-center">
              <span className="text-gray-700 mr-2 sm:mr-3 font-semibold truncate">
                {chatPartner.username}
              </span>
            </div>
          </div>
        </div>
      </div>

      <MessagesComp
        chatId={chatId}
        chatPartner={chatPartner}
        sessionImg={sessionUser.picture}
        sessionId={sessionUser.id}
        initialMessages={initialMessages}
      />
      <ChatInput sender={sessionUser} receiver={chatPartner} />
    </div>
  );
}
