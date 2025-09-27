"use client";

import { DollarSign } from "lucide-react";
import { type JSX, useEffect, useState } from "react";
import { toast } from "sonner";
import { getPublicKeyAction } from "@/actions";
import { ChatInput } from "@/components/ChatInput";
import { MessagesComp } from "@/components/MessagesComp";
import { PaymentModal } from "@/components/PaymentModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { deriveSharedSecret } from "@/lib/crypto";
import type { Message, User } from "@/lib/db/schema";
import { useE2EE } from "./E2EEProvider";

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
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const { keyPair, isReady } = useE2EE();
  const [sharedKey, setSharedKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    if (!isReady || !keyPair) return;

    const deriveKey = async () => {
      try {
        const { publicKey, error } = await getPublicKeyAction(chatPartner.id);
        if (error || !publicKey) {
          toast.error(
            `Could not get public key for ${chatPartner.username}. Messages may not be secure.`,
          );
          console.error(error);
          return;
        }

        const derived = await deriveSharedSecret(keyPair.privateKey, publicKey);
        setSharedKey(derived);
      } catch (err) {
        console.error("Failed to derive shared key:", err);
        toast.error("Failed to establish secure connection.");
      }
    };

    deriveKey();
  }, [isReady, keyPair, chatPartner.id, chatPartner.username]);

  if (!isReady) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Initializing encryption...
      </div>
    );
  }

  return (
    <>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onCloseAction={() => setPaymentModalOpen(false)}
        recipient={chatPartner}
        sender={sessionUser}
      />

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
          <Button
            variant="outline"
            onClick={() => setPaymentModalOpen(true)}
            aria-label={`Pay ${chatPartner.username}`}
          >
            <DollarSign className="h-4 w-4 mr-0 sm:mr-2" />
            <span className="hidden sm:inline">Pay</span>
          </Button>
        </div>

        {sharedKey ? (
          <>
            <MessagesComp
              chatId={chatId}
              chatPartner={chatPartner}
              sessionImg={sessionUser.picture}
              sessionId={sessionUser.id}
              initialMessages={initialMessages}
              sharedKey={sharedKey}
            />
            <ChatInput
              sender={sessionUser}
              receiver={chatPartner}
              sharedKey={sharedKey}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-zinc-500">Establishing secure channel...</p>
          </div>
        )}
      </div>
    </>
  );
}
