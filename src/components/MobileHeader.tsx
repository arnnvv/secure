"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { JSX } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileUserProfileDropdown, MobileUserProfileDropdownSkeleton } from "@/components/UserProfileDropdown";

interface MobileHeaderProps {
  user?: {
    username: string | null;
    picture?: string | null;
  } | null;
}

export function MobileHeader({ user }: MobileHeaderProps): JSX.Element {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="mobile-header">
      <div className="flex items-center space-x-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 focus:outline-none"
          >
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
            </div>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#20203A] border border-[#2A2A3E] rounded-lg shadow-lg z-50">
              {user ? (
                <MobileUserProfileDropdown user={user} onClose={() => setIsDropdownOpen(false)} />
              ) : (
                <MobileUserProfileDropdownSkeleton />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
