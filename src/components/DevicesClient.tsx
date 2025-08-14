"use client";

import { revokeDeviceAction } from "@/actions";
import type { Device } from "@/lib/db/schema";
import { useState, useTransition, type JSX } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cryptoStore } from "@/lib/crypto-store";

export function DevicesClient({
  initialDevices,
}: {
  initialDevices: Device[];
}): JSX.Element {
  const [devices, setDevices] = useState(initialDevices);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRevoke = (deviceId: number) => {
    startTransition(async () => {
      const result = await revokeDeviceAction(deviceId);
      if (result.success) {
        toast.success(result.message);
        setDevices((prev) => prev.filter((d) => d.id !== deviceId));

        const currentDeviceId = await cryptoStore.getDeviceId();
        if (currentDeviceId && parseInt(currentDeviceId, 10) === deviceId) {
          await cryptoStore.clearAll();
          router.push("/login?device_revoked=true");
        }
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-4">
      {devices.map((device) => (
        <Card key={device.id}>
          <CardHeader>
            <CardTitle>{device.name}</CardTitle>
            <CardDescription>
              Added on: {format(new Date(device.createdAt), "PPP")}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="destructive"
              onClick={() => handleRevoke(device.id)}
              isLoading={isPending}
            >
              Revoke
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
