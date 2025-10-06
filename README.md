# GhostLink 🔗

**A decentralized, end-to-end encrypted chat application built as a Mini App, enabling anonymous conversations and direct crypto payments.**

GhostLink is a privacy-focused messaging application that leverages blockchain identity and client-side end-to-end encryption (E2EE) to ensure that your conversations are secure and private. Built on the Worldcoin stack, it uses wallet addresses for identity, eliminating the need for traditional PII like emails or phone numbers.

-----

## \#\# Core Concepts & Security Model

For anyone interested in privacy and security, understanding *how* GhostLink works is crucial. Our philosophy is **zero server knowledge** of your message content.

### 🔐 End-to-End Encryption (E2EE)

Your privacy is mathematically guaranteed through a robust E2EE implementation. Here’s a high-level overview:

1.  **Key Generation**: The first time you use GhostLink, a unique cryptographic key pair (public and private) is generated directly in your browser using the Web Crypto API. Your private key **never leaves your device** and is stored securely in your browser's `localStorage`.
2. **Public Key Sharing**: Your public key is uploaded to the server, associated only with your device ID. This allows other users to find your public key to initiate a secure conversation.
3.  **Secure Session Establishment**: When you start a chat with someone, your client fetches their public key. It then uses an **Elliptic-curve Diffie–Hellman (ECDH)** key exchange algorithm to derive a shared secret key. This process is magical: you and your chat partner can calculate the *same* secret key using your private key and their public key, without ever transmitting the secret key over the network.
4. **Message Encryption**: All messages are encrypted and decrypted on your device using the **AES-GCM** symmetric cipher with the derived shared key. The server only ever sees meaningless encrypted text blobs.

**Analogy**: Think of it like you and a friend creating a secret handshake that only you two know. You can communicate using this handshake in a crowded room (the internet), and while people see you interacting (metadata), no one can understand what you're saying (the content).

### 🆔 Wallet-Based Identity

GhostLink uses the **Worldcoin MiniKit** for authentication. Your identity is your wallet address.

  * **Sign-In with Ethereum (SIWE)**: We use a cryptographic signature to prove you own your wallet, without ever needing a password.
  * **Anonymity**: Your on-chain identity is pseudonymous. The server only stores your wallet address and the username you choose.

### 💸 Decentralized Payments

Payments are handled directly wallet-to-wallet via the World App MiniKit `pay` command.

  * The server facilitates the payment request but **does not process the transaction**.
  *It only records a non-financial message in the chat history (e.g., "PAYMENT::Sent 1 WLD") to keep the conversation log consistent. All financial details remain between the sender, the recipient, and the blockchain.

-----

## \#\# Key Features

  * **Wallet Authentication**: Secure, passwordless sign-in using World App.
  ***End-to-End Encryption**: All messages are encrypted client-side using robust cryptographic standards.
  * **Real-time Messaging**: Instant message delivery powered by Pusher for a seamless chat experience.
  * **Friend System**: Add friends via their username, manage requests, and see your connections.
  * **In-Chat Crypto Payments**: Send cryptocurrency directly to your friends' wallets from within the chat interface.
  * **Infinite Scroll History**: Chat messages are paginated and loaded on-demand as you scroll up.

-----

## \#\# Technology Stack

This project is built with a modern, type-safe, and performant stack.

  * **Framework**: **Next.js 15** (App Router)
  * **Language**: **TypeScript** 
  * **Database ORM**: **Drizzle ORM** for type-safe database queries 
  ***Database**: **PostgreSQL** (compatible with NeonDB serverless driver) 
  * **Authentication**: **Worldcoin MiniKit** (SIWE) 
  ***Real-time**: **Pusher**.
  * **UI**: **Tailwind CSS** & **Shadcn/UI**.
  * **Linting & Formatting**: **Biome**.
  ***File Uploads**: **UploadThing** for profile pictures.
