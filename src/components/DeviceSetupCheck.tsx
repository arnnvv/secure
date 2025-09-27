"use client";

import { useRouter } from "next/navigation";
import { type JSX, type ReactNode, useEffect, useState } from "react";
import { cryptoStore } from "@/lib/crypto-store";
import { Spinner } from "./ui/spinner";

export function DeviceSetupCheck({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkDeviceSetup = async () => {
      if (typeof window !== "undefined") {
        console.log("[DeviceCheck] Running device setup check...");
        const privateKey = await cryptoStore.getKey("privateKey");
        const deviceId = await cryptoStore.getDeviceId();

        console.log(
          `[DeviceCheck] Retrieved privateKey: ${privateKey ? "Exists" : "NULL"}`,
        );
        console.log(`[DeviceCheck] Retrieved deviceId: ${deviceId}`);

        if (!privateKey || !deviceId) {
          console.log("[DeviceCheck] FAILED. Redirecting to /setup-device.");
          router.push("/setup-device");
        } else {
          console.log("[DeviceCheck] PASSED. Rendering children.");
          setIsChecking(false);
        }
      }
    };

    checkDeviceSetup();
  }, [router]);

  if (isChecking) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
