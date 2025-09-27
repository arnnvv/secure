import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import type { JSX } from "react";
import { getCurrentSession, getPaginatedMessages } from "@/actions";
import ChatInterface from "@/components/ChatInterface";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export default async function Page({
  params,
}: {
  params: Promise<{
    chatId: string;
  }>;
}): Promise<JSX.Element> {
  const { chatId } = await params;
  const { user: session } = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }
  const [userId1, userId2] = chatId.split("--").map(Number);
  if (session.id !== userId1 && session.id !== userId2) {
    notFound();
  }
  const chatPartnerId = session.id === userId1 ? userId2 : userId1;

  const [partnerData, sessionData, { messages: initialBatch }] =
    await Promise.all([
      db.query.users.findFirst({
        where: eq(users.id, chatPartnerId),
      }),
      db.query.users.findFirst({
        where: eq(users.id, session.id),
      }),
      getPaginatedMessages(chatId, null),
    ]);

  if (!partnerData || !sessionData) {
    notFound();
  }

  const initialMessages = initialBatch.reverse();
  return (
    <ChatInterface
      chatId={chatId}
      chatPartner={partnerData}
      sessionUser={sessionData}
      initialMessages={initialMessages}
    />
  );
}
