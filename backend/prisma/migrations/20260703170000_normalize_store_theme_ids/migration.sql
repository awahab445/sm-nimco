-- Normalize legacy theme ids to the real application theme keys.
UPDATE "store_settings"
SET "current_theme" = 'tailwind', "updated_at" = NOW()
WHERE "current_theme" IN ('default', 'modern', 'vibrant');

UPDATE "store_settings"
SET "current_theme" = 'mehfil-e-shireen', "updated_at" = NOW()
WHERE "current_theme" = 'mehfil_shereen';
