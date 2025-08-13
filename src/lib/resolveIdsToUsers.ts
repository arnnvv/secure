import { inArray } from "drizzle-orm";
import { db } from "./db";
import type { User } from "./db/schema";
import { users as usersSchema } from "./db/schema";

export const resolveIdstoUsers = async (ids: number[]): Promise<User[]> => {
  if (ids.length === 0) {
    return [];
  }

  const users = await db
    .select()
    .from(usersSchema)
    .where(inArray(usersSchema.id, ids));

  return users;
};
