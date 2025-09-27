const KEY_PAIR_STORAGE_KEY = "e2ee-keypair";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey"],
  );
}

export async function getOrGenerateKeyPair(): Promise<CryptoKeyPair> {
  const storedKeyPair = localStorage.getItem(KEY_PAIR_STORAGE_KEY);
  if (storedKeyPair) {
    const { publicKey, privateKey } = JSON.parse(storedKeyPair);
    const importedPublicKey = await window.crypto.subtle.importKey(
      "jwk",
      publicKey,
      { name: "ECDH", namedCurve: "P-256" },
      true,
      [],
    );
    const importedPrivateKey = await window.crypto.subtle.importKey(
      "jwk",
      privateKey,
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveKey"],
    );
    return { publicKey: importedPublicKey, privateKey: importedPrivateKey };
  }
  const newKeyPair = await generateKeyPair();
  const publicKeyJwk = await window.crypto.subtle.exportKey(
    "jwk",
    newKeyPair.publicKey,
  );
  const privateKeyJwk = await window.crypto.subtle.exportKey(
    "jwk",
    newKeyPair.privateKey,
  );
  localStorage.setItem(
    KEY_PAIR_STORAGE_KEY,
    JSON.stringify({ publicKey: publicKeyJwk, privateKey: privateKeyJwk }),
  );
  return newKeyPair;
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const jwk = await window.crypto.subtle.exportKey("jwk", key);
  return JSON.stringify(jwk);
}

async function importPublicKey(publicKeyStr: string): Promise<CryptoKey> {
  const jwk = JSON.parse(publicKeyStr);
  return await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    [],
  );
}

export async function deriveSharedSecret(
  privateKey: CryptoKey,
  publicKeyStr: string,
): Promise<CryptoKey> {
  const publicKey = await importPublicKey(publicKeyStr);
  return await window.crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: publicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function encryptMessage(
  key: CryptoKey,
  plaintext: string,
): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedPlaintext = new TextEncoder().encode(plaintext);
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedPlaintext,
  );
  return `${arrayBufferToBase64(iv.buffer)}.${arrayBufferToBase64(ciphertext)}`;
}

export async function decryptMessage(
  key: CryptoKey,
  encryptedMessage: string,
): Promise<string> {
  try {
    const [ivBase64, ciphertextBase64] = encryptedMessage.split(".");
    if (!ivBase64 || !ciphertextBase64) {
      throw new Error("Invalid encrypted message format");
    }
    const iv = base64ToArrayBuffer(ivBase64);
    const ciphertext = base64ToArrayBuffer(ciphertextBase64);
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      ciphertext,
    );
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    return "Failed to decrypt message.";
  }
}
