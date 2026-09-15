-- Store-operator FCM device tokens for new-order push notifications
ALTER TABLE "admin_users" ADD COLUMN "fcm_token" VARCHAR(512);
ALTER TABLE "admin_users" ADD COLUMN "fcm_token_updated_at" TIMESTAMPTZ(6);
CREATE INDEX "admin_users_fcm_token_idx" ON "admin_users"("fcm_token");
