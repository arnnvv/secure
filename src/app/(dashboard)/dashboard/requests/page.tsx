import { redirect } from "next/navigation";
import type { JSX } from "react";
import { getCurrentSession } from "@/actions";
import { FriendRequests } from "@/components/FriendRequests";
import type { FriendRequest, User } from "@/lib/db/schema";
import { getFriendRequests } from "@/lib/getFriendRequests";
import { resolveIdstoUsers } from "@/lib/resolveIdsToUsers";

export default async function page(): Promise<JSX.Element> {
  const { user: sessionUser } = await getCurrentSession();
  if (!sessionUser) return redirect("/login");

  const incoming_friend_requests: FriendRequest[] = await getFriendRequests(
    sessionUser.id,
  );

  const ids: number[] = incoming_friend_requests.map(
    (req): number => req.requesterId,
  );

  const users: User[] = await resolveIdstoUsers(ids);

  const incommingFriendReqUsers = users
    .filter((user) => !!user.username)
    .map((user) => {
      return {
        id: user.id,
        username: user.username!,
      };
    });

  return (
    <div className="h-full flex flex-col bg-[#1A1A2E]">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[#20203A] px-4 py-4 border-b border-[#2A2A3E]">
        <h1 className="text-white font-bold text-xl">Friend Requests</h1>
        <p className="text-gray-300 text-sm mt-1">{incommingFriendReqUsers.length} pending requests</p>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden lg:block pt-8">
        <h1 className="font-bold text-5xl mb-8 text-white">Friend requests</h1>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="lg:flex lg:flex-col lg:gap-4">
          <FriendRequests
            incommingFriendReqs={incommingFriendReqUsers}
            sessionId={sessionUser.id}
          />
        </div>
      </div>
    </div>
  );
}
