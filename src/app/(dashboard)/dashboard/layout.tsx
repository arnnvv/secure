import "react-loading-skeleton/dist/skeleton.css";
import type { Metadata } from "next";
import Link from "next/link";
import { type JSX, type ReactNode, Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import { getCurrentSession } from "@/actions";
import { DynamicFriendRequestOption } from "@/components/dashboard/DynamicFriendRequestOption";
import {
  ChatListSkeleton,
  DynamicSidebarChatList,
} from "@/components/dashboard/DynamicSidebarChatList";
import {
  UserProfileSection,
  UserProfileSkeleton,
} from "@/components/dashboard/UserProfileSection";
import { E2EEProvider } from "@/components/E2EEProvider";
import { FriendsProvider } from "@/components/FriendsProvider";
import { type Icon, Icons } from "@/components/Icons";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";
import type { User } from "@/lib/db/schema";
import { getFriends } from "@/lib/getFriends";
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your dashboard",
};

const sidebarNav: { id: number; name: string; href: string; Icon: Icon }[] = [
  { id: 1, name: "Add friend", href: "/dashboard/add", Icon: "UserPlus" },
];

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}): Promise<JSX.Element> {
  const { user } = await getCurrentSession();
  const friends: User[] = user ? await getFriends(user.id) : [];

  return (
    <E2EEProvider>
      <FriendsProvider initialFriends={friends}>
        <div className="w-full h-screen bg-[#1A1A2E] flex flex-col">
          {/* Mobile Header - Main Navbar */}
          <div className="lg:hidden">
            <MobileHeader user={user} />
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:flex w-full h-full">
            <div className="flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-[#2A2A3E] bg-[#20203A] px-6">
              <Link
                href="/dashboard"
                className="flex h-16 shrink-10 items-center"
              >
                <Icons.Logo className="h-8 w-auto text-cyan-400" />
              </Link>

              <nav className="flex flex-1 flex-col">
                <ul className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <Suspense fallback={<ChatListSkeleton />}>
                      <DynamicSidebarChatList />
                    </Suspense>
                  </li>
                  <li>
                    <div className="text-xs font-semibold leading-6 text-gray-400">
                      Overview
                    </div>
                    <ul className="-mx-2 mt-2 space-y-1">
                      {sidebarNav.map((opn) => {
                        const Icon = Icons[opn.Icon];
                        return (
                          <li key={opn.id}>
                            <Link
                              href={opn.href}
                              className="text-gray-300 hover:text-cyan-400 hover:bg-[#2A2A3E] group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold"
                            >
                              <span className="text-gray-400 border-[#2A2A3E] group-hover:border-b group-hover:text-cyan-400 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-[#1A1A2E]">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="truncate">{opn.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                      <li>
                        <Suspense
                          fallback={
                            <Skeleton
                              height={36}
                              width={200}
                              containerClassName="flex-1"
                            />
                          }
                        >
                          <DynamicFriendRequestOption />
                        </Suspense>
                      </li>
                    </ul>
                  </li>
                  <li className="-mx-6 mt-auto flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white">
                    <Suspense fallback={<UserProfileSkeleton />}>
                      <UserProfileSection />
                    </Suspense>
                  </li>
                </ul>
              </nav>
            </div>
            <aside className="max-h-screen container py-16 md:py-12 w-full bg-[#1A1A2E]">
              {children}
            </aside>
          </div>

          {/* Mobile Content */}
          <div className="lg:hidden flex-1 overflow-hidden">
            {children}
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden">
            <MobileBottomNavigation 
              unreadChats={0} // TODO: Calculate real unread chat count
              pendingRequests={incommingFriendReqUsers.length}
            />
          </div>
        </div>
      </FriendsProvider>
    </E2EEProvider>
  );
}
