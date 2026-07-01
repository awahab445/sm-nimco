-- Dynamic SMTP mailboxes for outbound email (passwords stored encrypted in smtp_pass_enc).

CREATE TABLE "mail_mailboxes" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "purpose" VARCHAR(50) NOT NULL,
    "smtp_host" VARCHAR(255) NOT NULL,
    "smtp_port" INTEGER NOT NULL DEFAULT 587,
    "smtp_secure" BOOLEAN NOT NULL DEFAULT false,
    "smtp_user" VARCHAR(255) NOT NULL,
    "smtp_pass_enc" TEXT NOT NULL,
    "from_name" VARCHAR(255) NOT NULL,
    "from_address" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_mailboxes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "mail_mailboxes_code_key" ON "mail_mailboxes"("code");

CREATE INDEX "mail_mailboxes_purpose_is_active_idx" ON "mail_mailboxes"("purpose", "is_active");

CREATE INDEX "mail_mailboxes_purpose_is_default_idx" ON "mail_mailboxes"("purpose", "is_default");
