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
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Friend requests</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests
          incommingFriendReqs={incommingFriendReqUsers}
          sessionId={sessionUser.id}
        />
      </div>
    </main>
  );
}
