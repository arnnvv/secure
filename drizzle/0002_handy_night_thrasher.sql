CREATE TABLE "chat_rate_limits" (
	"ip" varchar(64) PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_sessions" DROP CONSTRAINT "chat_sessions_user_id_chat_users_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_email_verification_request" DROP CONSTRAINT "chat_email_verification_request_user_id_chat_users_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_friend_requests" DROP CONSTRAINT "chat_friend_requests_requester_id_chat_users_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_friend_requests" DROP CONSTRAINT "chat_friend_requests_recipient_id_chat_users_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_sender_id_chat_users_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_recipient_id_chat_users_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_chat_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_email_verification_request" ADD CONSTRAINT "chat_email_verification_request_user_id_chat_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_friend_requests" ADD CONSTRAINT "chat_friend_requests_requester_id_chat_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_friend_requests" ADD CONSTRAINT "chat_friend_requests_recipient_id_chat_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_chat_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_recipient_id_chat_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;
