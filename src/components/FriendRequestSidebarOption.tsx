"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type JSX, useEffect, useState } from "react";
import { toast } from "sonner";
import { pusherClient } from "@/lib/pusher-client";
import { toPusherKey } from "@/lib/utils";
import { CustomToast } from "./CustomToast";

interface FriendRequestPayload {
  senderId: number;
  senderName: string;
  senderImage: string | null;
}

export const FriendRequestSidebarOption = ({
  sessionId,
  initialUnseenFriendRequests,
}: {
  sessionId: number;
  initialUnseenFriendRequests: number;
}): JSX.Element => {
  const [unseenReqCount, setUnseenReqCount] = useState<number>(
    initialUnseenFriendRequests,
  );
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/dashboard/requests") {
      setUnseenReqCount(0);
    }
  }, [pathname]);

  useEffect(() => {
    const channelName = toPusherKey(`private-user:${sessionId}`);
    pusherClient.subscribe(channelName);

    const friendReqHandler = (payload: FriendRequestPayload): void => {
      if (pathname !== "/dashboard/requests") {
        toast.custom((toastId) => (
          <CustomToast
            toastId={toastId}
            href="/dashboard/requests"
            senderName={payload.senderName}
            senderMessage="Sent you a friend request"
            image={payload.senderImage}
          />
        ));
      }
      setUnseenReqCount((prev) => prev + 1);
    };

    pusherClient.bind("incoming_friend_request", friendReqHandler);

    return () => {
      pusherClient.unsubscribe(channelName);
      pusherClient.unbind("incoming_friend_request", friendReqHandler);
    };
  }, [sessionId, pathname]);

  return (
    <Link
      href="/dashboard/requests"
      className="text-gray-700 hover:text-cyan-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
    >
      <div className="text-gray-400 border-gray-200 group-hover:border-cyan-600 group-hover:text-cyan-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
        <User className="w-4 h-4" />
      </div>
      <p className="truncate">Friend requests</p>

      {unseenReqCount > 0 ? (
        <div className="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600">
          {unseenReqCount}
        </div>
      ) : null}
    </Link>
  );
};
