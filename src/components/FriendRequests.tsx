"use client";

import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type JSX, useEffect, useState } from "react";
import { toast } from "sonner";
import { acceptFriendRequest, rejectFriendRequest } from "@/actions";
import { useFriends } from "@/components/FriendsProvider";
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
  const { addFriend } = useFriends();
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
      addFriend(res.newFriend);
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
    <div className="h-full overflow-y-auto">
      {friendReqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-16 h-16 bg-[#20203A] rounded-full flex items-center justify-center mb-4">
            <UserPlus className="text-gray-400 w-8 h-8" />
          </div>
          <p className="text-gray-300 text-sm">No friend requests</p>
        </div>
      ) : (
        <div className="space-y-0">
          {friendReqs.map((friendReq) => (
            <div key={friendReq.id} className="mobile-friend-request-card">
              <div className="flex items-center space-x-3 mb-3">
                <div className="mobile-friend-request-avatar">
                  {friendReq.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="mobile-friend-request-name">
                    {friendReq.username}
                  </h3>
                  <p className="mobile-friend-request-username">
                    @{friendReq.username.toLowerCase()}
                  </p>
                  <p className="mobile-friend-request-mutual">Friend request</p>
                </div>
              </div>

              <div className="mobile-friend-request-actions">
                <button
                  type="button"
                  onClick={() => handleAccept(friendReq.id)}
                  aria-label="accept friend"
                  className="mobile-accept-btn"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(friendReq.id)}
                  aria-label="deny friend"
                  className="mobile-decline-btn"
                >
                  <X className="w-4 h-4" />
                  <span>Decline</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
