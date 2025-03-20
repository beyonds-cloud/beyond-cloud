ALTER TABLE "beyond-cloud_user" RENAME COLUMN "is_pro" TO "user_type";--> statement-breakpoint
ALTER TABLE "beyond-cloud_user" ALTER COLUMN "user_type" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "beyond-cloud_user" ALTER COLUMN "user_type" SET DEFAULT 'basic';