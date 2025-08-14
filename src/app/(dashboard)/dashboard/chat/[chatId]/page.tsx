import { getCurrentSession } from "@/actions";
import { ChatInput } from "@/components/ChatInput";
import { MessagesComp } from "@/components/MessagesComp";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/lib/db";
import { type Message, messages, type User, users } from "@/lib/db/schema";
import { validateMessages } from "@/lib/validate";
import { and, eq, or } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import type { JSX } from "react";
import { ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateSafetyNumber } from "@/lib/crypto";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{
    chatId: string;
  }>;
}): Promise<Metadata> => {
  const { user } = await getCurrentSession();
  if (!user) return redirect("/login");
  const chatId = (await params).chatId;
  const [userIdd1, userIdd2] = chatId.split("--");
  const userId1 = Number(userIdd1);
  const userId2 = Number(userIdd2);
  const chatPartnerId = user.id === userId1 ? userId2 : userId1;
  const chatPartner: User | undefined = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, chatPartnerId),
  });

  return {
    title: "Chat Page",
    description: `Chat with ${chatPartner?.username || chatPartner?.email}`,
  };
};

export default async function l({
  params,
}: {
  params: Promise<{
    chatId: string;
  }>;
}): Promise<JSX.Element> {
  let initialMessages: Message[] = [];
  const { chatId } = await params;
  const { user } = await getCurrentSession();
  if (!user) return redirect("/login");
  const [userIdd1, userIdd2] = chatId.split("--");
  const userId1 = Number(userIdd1);
  const userId2 = Number(userIdd2);
  if (user.id !== userId1 && user.id !== userId2) notFound();
  const chatPartnerId: number = user.id === userId1 ? userId2 : userId1;

  const [chatPartner, sessionUserWithDevices] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, chatPartnerId),
      with: {
        devices: {
          columns: {
            id: true,
            publicKey: true,
          },
        },
      },
    }),
    db.query.users.findFirst({
      where: eq(users.id, user.id),
      with: {
        devices: {
          columns: {
            id: true,
            publicKey: true,
          },
        },
      },
    }),
  ]);

  if (!chatPartner || !sessionUserWithDevices)
    throw new Error("Chat participants not found");

  const myKeys = sessionUserWithDevices.devices.map((d) => d.publicKey);
  const partnerKeys = chatPartner.devices.map((d) => d.publicKey);
  const safetyNumber = await generateSafetyNumber(myKeys, partnerKeys);

  try {
    if (!user.id || !chatPartner.id) throw new Error("Invalid chat id");
    const chatMessages: Message[] | undefined =
      (await db.query.messages.findMany({
        where: or(
          and(
            eq(messages.recipientId, chatPartner.id),
            eq(messages.senderId, user.id),
          ),
          and(
            eq(messages.recipientId, user.id),
            eq(messages.senderId, chatPartner.id),
          ),
        ),
        orderBy: (messages, { asc }) => [asc(messages.createdAt)],
      })) as Message[] | undefined;
    if (!chatMessages) throw new Error("Chat messages not found");
    const reversedChatMessages: Message[] = chatMessages.reverse();
    if (!validateMessages(reversedChatMessages))
      throw new Error("Invalid messages");
    initialMessages = reversedChatMessages;
  } catch (e) {
    throw new Error(`Failed to fetch chat messages ${e}`);
  }

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Avatar>
                <AvatarImage src={chatPartner.picture || ""} />
                <AvatarFallback>
                  {chatPartner.username
                    ? chatPartner.username[0]
                    : chatPartner.email[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.username}
              </span>
            </div>

            <span className="text-sm text-gray-600">{chatPartner.email}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Conversation options"
            >
              <ShieldCheck className="w-6 h-6 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Conversation Security</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              <p className="mb-2">
                Verify this safety number with {chatPartner.username} through
                another channel (e.g., in person) to ensure your connection is
                secure.
              </p>
              <div className="p-3 bg-slate-100 rounded-md text-center font-mono tracking-widest text-lg text-black">
                {safetyNumber}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <MessagesComp
        chatId={chatId}
        chatPartner={chatPartner}
        sessionImg={user.picture}
        sessionId={user.id}
        initialMessages={initialMessages}
      />
      <ChatInput sender={user} receiver={chatPartner} />
    </div>
  );
}
