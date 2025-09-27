"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { storePublicKeyAction } from "@/actions";
import { exportPublicKey, getOrGenerateKeyPair } from "@/lib/crypto";

type E2EEContextType = {
  keyPair: CryptoKeyPair | null;
  isReady: boolean;
};

const E2EEContext = createContext<E2EEContextType | undefined>(undefined);

export function E2EEProvider({ children }: { children: ReactNode }) {
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function setupKeys() {
      try {
        const kp = await getOrGenerateKeyPair();
        setKeyPair(kp);

        const deviceIdStr = localStorage.getItem("deviceId");
        if (!deviceIdStr) {
          console.error("Device ID not found. Cannot upload public key.");
          setIsReady(true);
          return;
        }

        const isPublicKeyUploaded = localStorage.getItem(
          `publicKeyUploaded_${deviceIdStr}`,
        );
        if (!isPublicKeyUploaded) {
          const publicKeyStr = await exportPublicKey(kp.publicKey);
          const deviceId = parseInt(deviceIdStr, 10);
          const result = await storePublicKeyAction(publicKeyStr, deviceId);
          if (result.success) {
            localStorage.setItem(`publicKeyUploaded_${deviceIdStr}`, "true");
          } else {
            toast.error("Failed to store public key on server.");
          }
        }
      } catch (error) {
        console.error("Failed to setup E2EE keys:", error);
        toast.error("Could not set up encryption. Please refresh.");
      } finally {
        setIsReady(true);
      }
    }
    setupKeys();
  }, []);

  return (
    <E2EEContext.Provider value={{ keyPair, isReady }}>
      {isReady ? (
        children
      ) : (
        <div className="flex h-screen w-screen items-center justify-center">
          Setting up secure session...
        </div>
      )}
    </E2EEContext.Provider>
  );
}

export const useE2EE = (): E2EEContextType => {
  const context = useContext(E2EEContext);
  if (!context) {
    throw new Error("useE2EE must be used within an E2EEProvider");
  }
  return context;
};
