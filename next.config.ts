import type { NextConfig } from "next";

// unsafe-eval is included for Pusher's fallback mechanism. In a production system with no such dependency, you would aim to remove it.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.pusher.com;
  child-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: lh3.googleusercontent.com avatars.githubusercontent.com utfs.io;
  font-src 'self';
  object-src 'none';
  base-uri 'none';
  form-action 'self';
  frame-ancestors 'none';
  connect-src 'self' wss://*.pusher.com https://sockjs.pusher.com;
  block-all-mixed-content;
  upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  serverExternalPackages: ["@node-rs/argon2"],
  experimental: {
    reactCompiler: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
};

export default nextConfig;
