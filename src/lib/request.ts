import { headers } from "next/headers";
import { RefillingTokenBucket } from "./rate-limit";

const getLimiter = (() => {
  let instance: RefillingTokenBucket<string>;
  return () => {
    if (!instance) {
      const RATE_LIMIT_MAX_REQUESTS = 100;
      const RATE_LIMIT_WINDOW_SECONDS = 60;
      const refillInterval =
        RATE_LIMIT_WINDOW_SECONDS / RATE_LIMIT_MAX_REQUESTS;
      instance = new RefillingTokenBucket<string>(
        RATE_LIMIT_MAX_REQUESTS,
        refillInterval,
      );
    }
    return instance;
  };
})();

const RATE_LIMIT_POST_COST = 5;

async function consume(cost: number): Promise<boolean> {
  const limiter = getLimiter();
  const clientIP = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  return limiter.consume(clientIP, cost);
}

export function globalGETRateLimit() {
  return consume(1);
}

export function globalPOSTRateLimit() {
  return consume(RATE_LIMIT_POST_COST);
}
