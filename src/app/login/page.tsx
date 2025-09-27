"use client";

import type { ISuccessResult } from "@worldcoin/idkit";
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { verifyAndLoginAction } from "@/actions";

export default function LoginPage() {
  const router = useRouter();

  const handleVerify = async (proof: ISuccessResult) => {
    try {
      const result = await verifyAndLoginAction(proof);
      if (!result.success) {
        throw new Error(result.message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred.";
      toast.error(message);
      throw new Error(message);
    }
  };

  const onSuccess = () => {
    toast.success("Successfully verified. Redirecting...");
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Secure Chat</h1>
        <p className="text-gray-600 mb-8">
          Verify your identity with World ID to continue.
        </p>
        <IDKitWidget
          app_id={process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`}
          action={process.env.NEXT_PUBLIC_WLD_ACTION_NAME!}
          onSuccess={onSuccess}
          signal="login"
          handleVerify={handleVerify}
          verification_level={VerificationLevel.Orb}
        >
          {({ open }) => (
            <button
              onClick={open}
              type="button"
              className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Verify with World ID
            </button>
          )}
        </IDKitWidget>
      </div>
    </div>
  );
}
