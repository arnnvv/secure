"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { type JSX, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getPaginatedMessages } from "@/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message, User } from "@/lib/db/schema";
import { pusherClient } from "@/lib/pusher-client";
import { cn, toPusherKey } from "@/lib/utils";

function ChatMessage({
  message,
  isCurrentUser,
  hasNxtMessage,
  chatPartner,
  sessionImg,
  measureElement,
}: {
  message: Message;
  isCurrentUser: boolean;
  hasNxtMessage: boolean;
  chatPartner: User;
  sessionImg: string | null | undefined;
  measureElement: (element: HTMLElement | null) => void;
}) {
  return (
    <div ref={measureElement} className="chat-message">
      <div
        className={cn(
          "flex items-end space-x-2",
          isCurrentUser && "justify-end space-x-reverse",
        )}
      >
        <div
          className={cn("flex-shrink-0", {
            "order-2": isCurrentUser,
            "order-1": !isCurrentUser,
            invisible: hasNxtMessage,
          })}
        >
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={
                !isCurrentUser ? chatPartner.picture || "" : sessionImg || ""
              }
            />
            <AvatarFallback>
              {chatPartner.username ? chatPartner.username[0] : "?"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div
          className={cn(
            "flex flex-col space-y-2 text-base max-w-md",
            isCurrentUser ? "order-1" : "order-2",
          )}
        >
          <span
            className={cn(
              "px-4 py-2 rounded-lg inline-block break-words",
              isCurrentUser
                ? "bg-cyan-500 text-white"
                : "bg-gray-200 text-gray-900",
              isCurrentUser && !hasNxtMessage && "rounded-br-none",
              !isCurrentUser && !hasNxtMessage && "rounded-bl-none",
            )}
          >
            {message.content}{" "}
            <span className="ml-2 text-xs text-gray-400">
              {format(new Date(message.createdAt), "HH:mm")}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

export const MessagesComp = ({
  chatId,
  chatPartner,
  sessionImg,
  sessionId,
  initialMessages,
}: {
  chatId: string;
  chatPartner: User;
  sessionId: number;
  sessionImg: string | null | undefined;
  initialMessages: Message[];
}): JSX.Element => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialMessages.length >= 50);
  const cursorRef = useRef<string | null>(
    initialMessages.length > 0
      ? initialMessages[0].createdAt.toISOString()
      : null,
  );

  const fetchPrevious = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const { messages: newMessages, nextCursor } = await getPaginatedMessages(
        chatId,
        cursorRef.current,
      );
      cursorRef.current = nextCursor;
      setHasMore(nextCursor !== null);
      setMessages((prev) => [...newMessages.reverse(), ...prev]);
    } catch (_error) {
      toast.error("Failed to load older messages.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatId, hasMore, isLoadingMore]);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 75,
    overscan: 10,
    getItemKey: (index) => messages[index]?.id,
    onChange: (instance) => {
      if (
        instance.getVirtualItems().length > 0 &&
        instance.getVirtualItems()[0]?.index === 0 &&
        hasMore &&
        !isLoadingMore
      ) {
        fetchPrevious();
      }
    },
  });

  useEffect(() => {
    if (virtualizer.getVirtualItems().length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, {
        align: "end",
      });
    }
  }, [virtualizer, messages.length]);

  useEffect(() => {
    const pusherMessageHandler = (message: Message) => {
      const parentEl = parentRef.current;
      const isAtBottom =
        parentEl &&
        parentEl.scrollHeight - parentEl.scrollTop - parentEl.clientHeight < 1;

      setMessages((prev) => [...prev, message]);

      if (isAtBottom) {
        virtualizer.scrollToIndex(messages.length, { align: "end" });
      }
    };

    pusherClient.subscribe(toPusherKey(`private-chat:${chatId}`));
    pusherClient.bind("incoming-message", pusherMessageHandler);
    return () => {
      pusherClient.unsubscribe(toPusherKey(`private-chat:${chatId}`));
      pusherClient.unbind("incoming-message", pusherMessageHandler);
    };
  }, [chatId, messages.length, virtualizer]);

  return (
    <div
      ref={parentRef}
      id="messages"
      className="flex h-full flex-1 flex-col gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {isLoadingMore && hasMore && (
          <div className="flex justify-center my-4">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const message = messages[virtualRow.index];
          const isCurrentUser = message.senderId === sessionId;
          const hasNxtMessage =
            messages[virtualRow.index - 1]?.senderId === message.senderId;

          return (
            <div
              key={message.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <ChatMessage
                measureElement={virtualizer.measureElement}
                message={message}
                isCurrentUser={isCurrentUser}
                hasNxtMessage={hasNxtMessage}
                chatPartner={chatPartner}
                sessionImg={sessionImg}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
