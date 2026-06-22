-- Customer email verification fields
ALTER TABLE "customers" ADD COLUMN "is_email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "customers" ADD COLUMN "email_verification_token" VARCHAR(255);

CREATE UNIQUE INDEX "customers_email_verification_token_key" ON "customers"("email_verification_token");
CREATE INDEX "customers_email_verification_token_idx" ON "customers"("email_verification_token");

-- Existing registered accounts are treated as already verified
UPDATE "customers"
SET "is_email_verified" = true
WHERE "password_hash" IS NOT NULL AND "is_guest" = false;
