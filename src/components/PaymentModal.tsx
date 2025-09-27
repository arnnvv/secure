"use client";

import { MiniKit, Tokens } from "@worldcoin/minikit-js";
import { type JSX, useState } from "react";
import { toast } from "sonner";
import { recordPaymentAction } from "@/actions";
import type { User } from "@/lib/db/schema";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const toSmallestUnit = (amount: string, decimals = 18): string => {
  const [integer, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0");
  return BigInt(integer + paddedFraction).toString();
};

export const PaymentModal = ({
  isOpen,
  onCloseAction,
  recipient,
  sender,
}: {
  isOpen: boolean;
  onCloseAction: () => void;
  recipient: User;
  sender: User;
}): JSX.Element | null => {
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<Tokens>(Tokens.WLD);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (
      !amount ||
      Number.isNaN(parseFloat(amount)) ||
      parseFloat(amount) <= 0
    ) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!recipient.walletAddress) {
      toast.error("Recipient does not have a wallet address linked.");
      return;
    }

    setIsLoading(true);

    try {
      const reference = crypto.randomUUID();
      const amountInSmallestUnit = toSmallestUnit(amount, 18);

      const result = await MiniKit.commandsAsync.pay({
        reference,
        to: recipient.walletAddress,
        tokens: [{ symbol: token, token_amount: amountInSmallestUnit }],
        description: `Payment from ${sender.username} to ${recipient.username}`,
      });

      if (result.finalPayload.status === "success") {
        toast.success(
          `Successfully sent ${amount} ${token} to ${recipient.username}!`,
        );

        await recordPaymentAction({
          senderId: sender.id,
          recipientId: recipient.id,
          content: `PAYMENT::Sent ${amount} ${token}`,
        });

        onCloseAction();
      } else {
        throw new Error(
          result.commandPayload?.description ||
            "Payment failed or was cancelled.",
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Payment failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onCloseAction}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Pay {recipient.username}</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.01"
            />
          </div>
          <div>
            <Label>Token</Label>
            <div className="flex gap-2 mt-2">
              {/* 3. Compare and set state using enum members */}
              <Button
                variant={token === Tokens.WLD ? "default" : "outline"}
                onClick={() => setToken(Tokens.WLD)}
              >
                WLD
              </Button>
              <Button
                variant={token === Tokens.USDC ? "default" : "outline"}
                onClick={() => setToken(Tokens.USDC)}
                disabled
              >
                USDC
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={onCloseAction}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handlePayment} isLoading={isLoading}>
              {`Pay ${amount || 0} ${token}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
