import { type JSX, Suspense } from "react";
import {
  RecentChats,
  RecentChatsSkeleton,
} from "@/components/dashboard/RecentChats";

export default function Page(): JSX.Element {
  return (
    <div className="h-full flex flex-col bg-[#1A1A2E]">
      {/* Mobile Content Header */}
      <div className="lg:hidden px-4 py-4">
        <div>
          <h1 className="text-white font-bold text-xl">Chats</h1>
          <p className="text-gray-300 text-sm mt-1">Recent conversations</p>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block pt-8">
        <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl mb-6 sm:mb-8 text-white">
          Recent chats
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<RecentChatsSkeleton />}>
          <RecentChats />
        </Suspense>
      </div>
    </div>
  );
}
