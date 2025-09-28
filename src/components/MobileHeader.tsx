"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import {
  MobileUserProfileDropdown,
  MobileUserProfileDropdownSkeleton,
} from "@/components/UserProfileDropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MobileHeaderProps {
  user?: {
    username: string | null;
    picture?: string | null;
  } | null;
}

export function MobileHeader({ user }: MobileHeaderProps): JSX.Element {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  const handleBackClick = () => {
    router.back();
  };

  return (
    <header className="mobile-header">
      <div className="flex items-center justify-between w-full">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#2A2A3E] transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        {/* Avatar and Username */}
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
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#20203A] border border-[#2A2A3E] rounded-lg shadow-lg z-50">
              {user ? (
                <MobileUserProfileDropdown
                  user={user}
                  onClose={() => setIsDropdownOpen(false)}
                />
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
