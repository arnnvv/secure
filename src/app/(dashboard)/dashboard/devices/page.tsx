import { getCurrentSession } from "@/actions";
import { DevicesClient } from "@/components/DevicesClient";
import { db } from "@/lib/db";
import { devices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { JSX } from "react";

export default async function DevicesPage(): Promise<JSX.Element> {
  const { user } = await getCurrentSession();
  if (!user) {
    redirect("/login");
  }

  const userDevices = await db.query.devices.findMany({
    where: eq(devices.userId, user.id),
    orderBy: (devices, { desc }) => [desc(devices.createdAt)],
  });

  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Manage Your Devices</h1>
      <p className="text-muted-foreground mb-6">
        Each device listed here has its own unique key for end-to-end
        encryption. Revoke access for any device you no longer use or have lost.
      </p>
      <DevicesClient initialDevices={userDevices} />
    </main>
  );
}
