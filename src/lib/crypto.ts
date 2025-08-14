/*
 * Do not modify this file without a deep understanding of cryptographic principles
 * and protocol design.
 */

import type { UserWithDevices } from "./getFriends";
import type { Message } from "./db/schema";
import { cryptoStore } from "./crypto-store";
import { sha256 } from "./sha";

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

const keyGenAlgorithm = {
  name: "X25519",
};

export const generateX25519KeyPair = async (): Promise<CryptoKeyPair> => {
  return (await window.crypto.subtle.generateKey(keyGenAlgorithm, false, [
    "deriveKey",
  ])) as CryptoKeyPair;
};

export const exportPublicKey = async (key: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported);
};

export const exportPrivateKey = async (key: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey("pkcs8", key);
  return arrayBufferToBase64(exported);
};

export const importPublicKey = async (keyData: string): Promise<CryptoKey> => {
  const buffer = base64ToArrayBuffer(keyData);
  return await window.crypto.subtle.importKey(
    "raw",
    buffer,
    keyGenAlgorithm,
    true,
    [],
  );
};

export const importPrivateKey = async (keyData: string): Promise<CryptoKey> => {
  const buffer = base64ToArrayBuffer(keyData);
  return await window.crypto.subtle.importKey(
    "pkcs8",
    buffer,
    keyGenAlgorithm,
    false,
    ["deriveKey"],
  );
};

export const deriveSharedSecret = async (
  privateKey: CryptoKey,
  publicKey: CryptoKey,
): Promise<CryptoKey> => {
  return await window.crypto.subtle.deriveKey(
    {
      name: "X25519",
      public: publicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  );
};

export const encryptMessage = async (
  key: CryptoKey,
  plaintext: string,
): Promise<string> => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedPlaintext = new TextEncoder().encode(plaintext);

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encodedPlaintext,
  );

  const ivB64 = arrayBufferToBase64(iv.buffer);
  const ciphertextB64 = arrayBufferToBase64(ciphertext);

  return `${ivB64}:${ciphertextB64}`;
};

export const decryptMessage = async (
  key: CryptoKey,
  encryptedData: string,
): Promise<string> => {
  try {
    const [ivB64, ciphertextB64] = encryptedData.split(":");

    if (!ivB64 || !ciphertextB64) {
      return encryptedData;
    }

    const iv = base64ToArrayBuffer(ivB64);
    const ciphertext = base64ToArrayBuffer(ciphertextB64);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      ciphertext,
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (e) {
    console.error("Decryption failed:", e);
    return "[Could not decrypt message]";
  }
};

export const decryptE2EEMessage = async (
  message: Message,
  sessionId: number,
  chatPartner: UserWithDevices,
): Promise<string> => {
  try {
    const payload = JSON.parse(message.content);
    if (!payload.senderDeviceId || !payload.recipients) {
      return message.content;
    }

    const myDeviceId = await cryptoStore.getDeviceId();
    const myPrivateKey = await cryptoStore.getKey("privateKey");

    if (!myPrivateKey || !myDeviceId) {
      throw new Error("Local device keys not found.");
    }

    const senderIsSelf = message.senderId === sessionId;
    const recipientDeviceId = senderIsSelf
      ? Object.keys(payload.recipients)[0]
      : myDeviceId;

    const ciphertext = payload.recipients[recipientDeviceId];
    if (!ciphertext) {
      return "[Message not for this device]";
    }

    const partnerDevice = chatPartner.devices.find((d) =>
      senderIsSelf
        ? d.id === parseInt(recipientDeviceId, 10)
        : d.id === payload.senderDeviceId,
    );

    if (!partnerDevice) {
      throw new Error("Could not find partner's device key.");
    }

    const partnerPublicKey = await importPublicKey(partnerDevice.publicKey);
    const sharedKey = await deriveSharedSecret(myPrivateKey, partnerPublicKey);
    return await decryptMessage(sharedKey, ciphertext);
  } catch (error) {
    console.error(`Failed to decrypt message ${message.id}:`, error);
    if (error instanceof SyntaxError) {
      return message.content;
    }
    return "[Decryption Error]";
  }
};

export const generateSafetyNumber = async (
  user1Keys: string[],
  user2Keys: string[],
): Promise<string> => {
  const allKeys = [...user1Keys, ...user2Keys].sort();
  const concatenatedKeys = allKeys.join("");
  const buffer = new TextEncoder().encode(concatenatedKeys);
  const hashBuffer = sha256(buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  const chunks: string[] = [];
  for (let i = 0; i < 6; i++) {
    const chunkValue =
      (hashArray[i * 5] << 24) |
      (hashArray[i * 5 + 1] << 16) |
      (hashArray[i * 5 + 2] << 8) |
      hashArray[i * 5 + 3];
    chunks.push((chunkValue >>> 0).toString().slice(0, 5).padStart(5, "0"));
  }
  return chunks.join(" ");
};
