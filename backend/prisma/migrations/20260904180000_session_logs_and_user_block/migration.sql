-- AlterTable
ALTER TABLE "admin_users" ADD COLUMN "is_blocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "admin_users" ADD COLUMN "last_ip" VARCHAR(64);

-- CreateIndex
CREATE INDEX "admin_users_is_blocked_idx" ON "admin_users"("is_blocked");

-- CreateTable
CREATE TABLE "session_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "ip_address" VARCHAR(64),
    "device_info" VARCHAR(512),
    "last_active_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_logs_user_id_key" ON "session_logs"("user_id");

-- CreateIndex
CREATE INDEX "session_logs_last_active_at_idx" ON "session_logs"("last_active_at" DESC);

-- CreateIndex
CREATE INDEX "session_logs_is_blocked_idx" ON "session_logs"("is_blocked");

-- AddForeignKey
ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
