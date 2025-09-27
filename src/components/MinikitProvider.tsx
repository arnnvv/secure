"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { type JSX, type ReactNode, useEffect } from "react";

export function MinikitProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  useEffect(() => {
    MiniKit.install();
  }, []);
  return <>{children}</>;
}
