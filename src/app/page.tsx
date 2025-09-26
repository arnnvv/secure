import { redirect } from "next/navigation";
import type { JSX } from "react";
import { getCurrentSession } from "@/actions";

export default async function Home(): Promise<JSX.Element> {
  const { user, session } = await getCurrentSession();

  if (session === null) {
    return redirect("/login");
  }

  if (!user.username) {
    return redirect("/get-username");
  }

  return redirect("/dashboard");
}
