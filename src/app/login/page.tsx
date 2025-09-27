"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();

  const signInWithWallet = async () => {
    if (!MiniKit.isInstalled()) {
      toast.error("This feature is only available within the World App.", {
        description: "Please open this app inside World App to log in.",
      });
      return;
    }

    try {
      const res = await fetch(`/api/nonce`);
      if (!res.ok) throw new Error("Failed to fetch nonce.");
      const { nonce } = await res.json();

      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        statement: "Sign in to Secure Chat to prove ownership of your wallet.",
      });

      if (finalPayload.status === "success") {
        const response = await fetch("/api/complete-siwe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload: finalPayload }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to complete sign-in.");
        }

        toast.success("Successfully signed in. Redirecting...");
        router.push("/");
      } else {
        throw new Error(finalPayload.details || "Sign-in was cancelled.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Secure Chat</h1>
        <p className="text-gray-600 mb-8">
          Sign in with your World App wallet to continue.
        </p>
        <button
          onClick={signInWithWallet}
          type="button"
          className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Sign In with World App
        </button>
      </div>
    </div>
  );
}
