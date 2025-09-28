"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { JSX } from "react";

interface NavItem {
  href: string;
  icon: JSX.Element;
  label: string;
  badge?: number;
}

interface MobileBottomNavigationProps {
  unreadChats?: number;
  pendingRequests?: number;
}

export function MobileBottomNavigation({ 
  unreadChats = 0, 
  pendingRequests = 0 
}: MobileBottomNavigationProps): JSX.Element {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      label: "Chats",
      badge: unreadChats > 0 ? unreadChats : undefined,
    },
    {
      href: "/dashboard/add",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      label: "Add Friend",
    },
    {
      href: "/dashboard/requests",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: "Requests",
      badge: pendingRequests > 0 ? pendingRequests : undefined,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/chat");
    }
    return pathname === href;
  };

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`mobile-bottom-nav-item ${
            isActive(item.href) ? "active" : "inactive"
          }`}
        >
          <div className="relative">
            {item.icon}
            {item.badge && item.badge > 0 && (
              <span className="notification-badge">
                {item.badge}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
