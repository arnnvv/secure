"use client";

import Link from "next/link";
import type { JSX } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MobileHeaderProps {
  user?: {
    username: string | null;
    picture?: string | null;
  } | null;
}

export function MobileHeader({ user }: MobileHeaderProps): JSX.Element {
  return (
    <header className="mobile-header">
      <div className="flex items-center space-x-3">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.picture || ""} />
            <AvatarFallback className="avatar-purple">
              {user?.username?.[0]?.toUpperCase() || "S"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-white text-lg">
              {user?.username || "Secure"}
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-300">Online</span>
            </div>
          </div>
        </Link>
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
    </header>
  );
}
