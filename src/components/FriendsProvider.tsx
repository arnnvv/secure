"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import type { User } from "@/lib/db/schema";

type FriendsContextType = {
  friends: User[];
  addFriend: (newFriend: User) => void;
};

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export function FriendsProvider({
  children,
  initialFriends,
}: {
  children: ReactNode;
  initialFriends: User[];
}) {
  const [friends, setFriends] = useState<User[]>(initialFriends);

  const addFriend = (newFriend: User) => {
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
