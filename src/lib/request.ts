import { headers } from "next/headers";
import { db } from "./db";
import { rateLimits } from "./db/schema";
import { eq, sql } from "drizzle-orm";

const _RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 100;
const RATE_LIMIT_POST_COST = 5;

// For serverless environments where in-memory solutions fail.
const consume = async (cost: number): Promise<boolean> => {
  const clientIP = (await headers()).get("X-Forwarded-For") ?? "127.0.0.1";

  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`
      DELETE FROM ${rateLimits}
      WHERE "timestamp" < NOW() - INTERVAL '1 MINUTE'
    `);

    await tx.insert(rateLimits).values({
      ip: clientIP,
      timestamp: new Date(),
    });

    const [requestCount] = await tx
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(rateLimits)
      .where(eq(rateLimits.ip, clientIP));

    return requestCount;
  });

  return result.count <= RATE_LIMIT_MAX_REQUESTS / cost;
};

export async function globalGETRateLimit(): Promise<boolean> {
  return consume(1);
}

export async function globalPOSTRateLimit(): Promise<boolean> {
  return consume(RATE_LIMIT_POST_COST);
}
