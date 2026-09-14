-- AlterTable
ALTER TABLE "session_logs" ADD COLUMN IF NOT EXISTS "fcm_token" VARCHAR(512);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "session_logs_fcm_token_idx" ON "session_logs"("fcm_token");
