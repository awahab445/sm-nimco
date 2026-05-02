-- CreateTable
CREATE TABLE "account_creation_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_creation_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_creation_tokens_token_key" ON "account_creation_tokens"("token");

-- CreateIndex
CREATE INDEX "account_creation_tokens_email_idx" ON "account_creation_tokens"("email");

-- CreateIndex
CREATE INDEX "account_creation_tokens_token_idx" ON "account_creation_tokens"("token");

-- CreateIndex
CREATE INDEX "account_creation_tokens_expires_at_idx" ON "account_creation_tokens"("expires_at");
