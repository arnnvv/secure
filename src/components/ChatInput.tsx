"use client";
import {
  type ChangeEvent,
  type JSX,
  type KeyboardEvent,
  type Ref,
  type RefObject,
  useRef,
  useState,
} from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import { sendMessageAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { encryptMessage } from "@/lib/crypto";
import type { User } from "@/lib/db/schema";

export const ChatInput = ({
  sender,
  receiver,
  sharedKey,
}: {
  sender: Omit<User, "password">;
  receiver: User;
  sharedKey: CryptoKey;
}): JSX.Element => {
  const textareaRef: RefObject<HTMLTextAreaElement | null> =
    useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sendMessage = async () => {
    if (!input.trim()) {
      toast.error("Cannot send an empty message.");
      return;
    }
    setIsLoading(true);
    try {
      console.log("Encrypting message:", input);
      const encryptedContent = await encryptMessage(sharedKey, input);
      console.log(
        "Encrypted content:",
        encryptedContent.substring(0, 50) + "...",
      );
      const res = await sendMessageAction({
        content: encryptedContent,
        sender,
        receiver,
      });
      if (res?.error) {
        throw new Error(res.error);
      }
      setInput("");
      textareaRef.current?.focus();
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred.";
      toast.error(`Failed to send message: ${errorMessage}`, {
        id: "message-error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 px-2 sm:px-4 pt-3 sm:pt-4 pb-3 sm:pb-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-cyan-400 bg-white">
          <ReactTextareaAutosize
            ref={textareaRef as Ref<HTMLTextAreaElement>}
            onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={1}
            maxRows={4}
            value={input}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
            placeholder={`Message ${receiver.username}`}
            className="block w-full resize-none border-0 bg-white text-gray-900 placeholder:text-gray-500 focus:ring-0 py-3 px-3 text-sm leading-6 min-h-[42px]"
            style={{
              color: "#ffffff",
              backgroundColor: "#111827",
            }}
          />
        </div>
        <Button
          isLoading={isLoading}
          onClick={sendMessage}
          type="submit"
          size="sm"
          className="text-xs sm:text-sm shrink-0 h-[42px] px-4"
          disabled={!input.trim() || isLoading}
        >
          Send
        </Button>
      </div>
    </div>
  );
};
