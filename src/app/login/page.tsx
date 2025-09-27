"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportPublicKey, generateX25519KeyPair } from "@/lib/crypto";
import { cryptoStore } from "@/lib/crypto-store";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithWallet = async () => {
    if (!MiniKit.isInstalled()) {
      toast.error("This feature is only available within the World App.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/nonce`);
      if (!res.ok) throw new Error("Failed to fetch nonce from server.");
      const { nonce } = await res.json();

      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        statement: "Sign in to Secure Chat to prove ownership of your wallet.",
      });

      if (finalPayload.status === "success") {
        toast.info("Wallet verified. Securing your device...");

        const keyPair = await generateX25519KeyPair();
        const publicKeyB64 = await exportPublicKey(keyPair.publicKey);

        const response = await fetch("/api/complete-siwe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload: finalPayload,
            publicKey: publicKeyB64,
          }),
        });

        const result = await response.json();
        if (!response.ok || !result.success || !result.data?.deviceId) {
          throw new Error(
            result.message ||
              "Failed to complete sign-in and device setup on the server.",
          );
        }

        await cryptoStore.saveKey("privateKey", keyPair.privateKey);
        await cryptoStore.saveDeviceId(String(result.data.deviceId));

        toast.success(
          "Successfully signed in and device secured. Redirecting...",
        );
        window.location.href = "/";
      } else {
        throw new Error(finalPayload.details || "Sign-in was cancelled.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Secure Chat</h1>
        <p className="text-gray-600 mb-8">
          Sign in with your World App wallet to continue.
        </p>
        <Button
          onClick={signInWithWallet}
          type="button"
          isLoading={isLoading}
          className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Sign In with World App
        </Button>
      </div>
    </div>
  );
}
