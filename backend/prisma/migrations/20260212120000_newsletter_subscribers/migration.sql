-- Replace paid subscription billing tables with newsletter subscribers.

DROP TABLE IF EXISTS "subscription_payments";
DROP TABLE IF EXISTS "subscriptions";
DROP TABLE IF EXISTS "subscription_plans";

CREATE TABLE "subscribers" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "source" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");
CREATE INDEX "subscribers_created_at_idx" ON "subscribers"("created_at" DESC);
