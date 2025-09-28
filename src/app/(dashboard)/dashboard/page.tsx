import { type JSX, Suspense } from "react";
import {
  RecentChats,
  RecentChatsSkeleton,
} from "@/components/dashboard/RecentChats";

export default function Page(): JSX.Element {
  return (
    <div className="h-full flex flex-col bg-[#1A1A2E]">
      {/* Mobile Header */}
      <div className="lg:hidden px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl">Chats</h1>
            <p className="text-gray-300 text-sm mt-1">Recent conversations</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-300 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 text-gray-300 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
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
