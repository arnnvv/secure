"use client";

import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type JSX, useEffect, useState } from "react";
import { toast } from "sonner";
import { acceptFriendRequest, rejectFriendRequest } from "@/actions";
import { pusherClient } from "@/lib/pusher-client";
import { toPusherKey } from "@/lib/utils";

interface IncomingFriendRequest {
  id: number;
  username: string;
}

interface PusherPayload {
  senderId: number;
  senderName: string;
}

export const FriendRequests = ({
  incommingFriendReqs,
  sessionId,
}: {
  incommingFriendReqs: IncomingFriendRequest[];
  sessionId: number;
}): JSX.Element => {
  const router = useRouter();
  const [friendReqs, setFriendReqs] =
    useState<IncomingFriendRequest[]>(incommingFriendReqs);

  useEffect(() => {
    const channelName = toPusherKey(`private-user:${sessionId}`);
    pusherClient.subscribe(channelName);

    const friendReqHandler = (payload: PusherPayload): void => {
      const { senderId, senderName } = payload;
      setFriendReqs((prevReqs) => [
        ...prevReqs,
        {
          id: senderId,
          username: senderName,
        },
      ]);
    };

    const eventName = "incoming_friend_request";
    pusherClient.bind(eventName, friendReqHandler);

    return () => {
      pusherClient.unsubscribe(channelName);
      pusherClient.unbind(eventName, friendReqHandler);
    };
  }, [sessionId]);

  const handleAccept = async (senderId: number) => {
    const previousRequests = [...friendReqs];
    setFriendReqs((prev) => prev.filter((req) => req.id !== senderId));

    const res = await acceptFriendRequest(senderId, sessionId);

    if ("error" in res) {
      toast.error(res.error);
      setFriendReqs(previousRequests);
    } else {
      toast.success(res.message);
      router.refresh();
    }
  };

  const handleReject = async (senderId: number) => {
    const previousRequests = [...friendReqs];
    setFriendReqs((prev) => prev.filter((req) => req.id !== senderId));

    const res = await rejectFriendRequest(senderId, sessionId);

    if ("error" in res) {
      toast.error(res.error);
      setFriendReqs(previousRequests);
    } else {
      toast.success(res.message);
    }
  };

  return (
    <>
      {friendReqs.length === 0 ? (
        <p className="text-sm italic text-zinc-500">No friend requests..</p>
      ) : (
        friendReqs.map((friendReq) => (
          <div key={friendReq.id} className="flex gap-4 items-center">
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{friendReq.username}</p>
            <button
              type="button"
              onClick={() => handleAccept(friendReq.id)}
              aria-label="accept friend"
              className="w-8 h-8 bg-cyan-500 hover:bg-cyan-600 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>
            <button
              type="button"
              onClick={() => handleReject(friendReq.id)}
              aria-label="deny friend"
              className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
};
