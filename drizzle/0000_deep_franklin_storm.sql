CREATE TYPE "public"."friend_req_status" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TABLE "chat_devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"public_key" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_email_verification_request" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_friend_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"requester_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"status" "friend_req_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_one_time_pre_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"key_id" integer NOT NULL,
	"public_key" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_rate_limits" (
	"ip" varchar(64) PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_signed_pre_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"key_id" integer NOT NULL,
	"public_key" text NOT NULL,
	"signature" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"picture" text,
	CONSTRAINT "chat_users_username_unique" UNIQUE("username"),
	CONSTRAINT "chat_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "chat_devices" ADD CONSTRAINT "chat_devices_user_id_chat_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_email_verification_request" ADD CONSTRAINT "chat_email_verification_request_user_id_chat_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_friend_requests" ADD CONSTRAINT "chat_friend_requests_requester_id_chat_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_friend_requests" ADD CONSTRAINT "chat_friend_requests_recipient_id_chat_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_chat_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_recipient_id_chat_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_one_time_pre_keys" ADD CONSTRAINT "chat_one_time_pre_keys_user_id_chat_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_chat_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_signed_pre_keys" ADD CONSTRAINT "chat_signed_pre_keys_user_id_chat_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_id_pub_key_idx" ON "chat_devices" USING btree ("user_id","public_key");