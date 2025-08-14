import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTableCreator,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator(
  (name: string): string => `chat_${name}`,
);

export const friendReqStatusEnum = pgEnum("friend_req_status", [
  "pending",
  "accepted",
  "declined",
]);

export const users = createTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username").unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password_hash: varchar("password_hash").notNull(),
  verified: boolean("verified").notNull().default(false),
  picture: text("picture"),
});

export const usersRelations = relations(users, ({ many }) => ({
  devices: many(devices),
}));

export const devices = createTable(
  "devices",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    publicKey: text("public_key").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_id_pub_key_idx").on(table.userId, table.publicKey),
  ],
);

export const devicesRelations = relations(devices, ({ one }) => ({
  user: one(users, {
    fields: [devices.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Device = typeof devices.$inferSelect;

export const sessions = createTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export type Session = typeof sessions.$inferSelect;

export const emailVerificationRequests = createTable(
  "email_verification_request",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    code: text("code").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
);

export type EmailVerificationRequest =
  typeof emailVerificationRequests.$inferSelect;

export const friendRequests = createTable("friend_requests", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: friendReqStatusEnum("status").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
});

export type FriendRequest = typeof friendRequests.$inferSelect;
export type NewFriendRequest = typeof friendRequests.$inferInsert;

export const messages = createTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export const rateLimits = createTable("rate_limits", {
  ip: varchar("ip", { length: 64 }).primaryKey(),
  timestamp: timestamp("timestamp", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const signedPreKeys = createTable("signed_pre_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  keyId: integer("key_id").notNull(),
  publicKey: text("public_key").notNull(),
  signature: text("signature").notNull(),
});

export const oneTimePreKeys = createTable("one_time_pre_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  keyId: integer("key_id").notNull(),
  publicKey: text("public_key").notNull(),
});
