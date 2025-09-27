"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import type { UserWithDevices } from "@/lib/getFriends";

type FriendsContextType = {
  friends: UserWithDevices[];
  addFriend: (newFriend: UserWithDevices) => void;
};

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export function FriendsProvider({
  children,
  initialFriends,
}: {
  children: ReactNode;
  initialFriends: UserWithDevices[];
}) {
  const [friends, setFriends] = useState<UserWithDevices[]>(initialFriends);

  const addFriend = (newFriend: UserWithDevices) => {
    setFriends((prev) => {
      if (prev.some((f) => f.id === newFriend.id)) {
        return prev;
      }
      return [...prev, newFriend];
    });
  };

  return (
    <FriendsContext.Provider value={{ friends, addFriend }}>
      {children}
    </FriendsContext.Provider>
  );
}

export const useFriends = (): FriendsContextType => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error("useFriends must be used within a FriendsProvider");
  }
  return context;
};
