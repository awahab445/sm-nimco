'use client';

import { adminUi } from '@/lib/admin-ui';
import { useRef, useState } from 'react';
import { uploadStorefrontNavBannerImage, type StorefrontNavRow } from '@/lib/api/storefront-navigation';
import { formatApiError } from '@/lib/api/error-message';

export type BannerFormState = {
  bannerImageUrl: string;
  bannerHref: string;
  bannerAlt: string;
};

function resolveAdminImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${base}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

type MegaMenuBannerSectionProps = {
  targets: StorefrontNavRow[];
  selectedId: string | null;
  onSelectTarget: (id: string) => void;
  bannerForm: BannerFormState;
  onBannerChange: (next: Partial<BannerFormState>) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  error: string | null;
  saved: boolean;
};

export function MegaMenuBannerSection({
  targets,
  selectedId,
  onSelectTarget,
  bannerForm,
  onBannerChange,
  onSubmit,
  saving,
  error,
  saved,
}: MegaMenuBannerSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadErr(null);
    setUploadBusy(true);
    try {
      const { url } = await uploadStorefrontNavBannerImage(file);
      onBannerChange({ bannerImageUrl: url });
    } catch (err) {
      setUploadErr(formatApiError(err));
    } finally {
      setUploadBusy(false);
    }
  };

  const previewSrc = resolveAdminImageUrl(bannerForm.bannerImageUrl);
  const selectedTarget = targets.find((t) => t.id === selectedId) ?? targets[0] ?? null;

  if (targets.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Mega menu banner</h2>
        <div className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          Enable &quot;Opens mega menu panel&quot; on a header link first, then configure its promotional image
          here.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Mega menu banner</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Promotional image in the right column of the layered navigation dropdown on the storefront.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        {targets.length > 1 ? (
          <label className="block text-xs font-medium text-muted-foreground">
            Header link
            <select
              value={selectedId ?? selectedTarget?.id ?? ''}
              onChange={(e) => onSelectTarget(e.target.value)}
              className="mt-1 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                  {t.secondaryLabel ? ` / ${t.secondaryLabel}` : ''}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="text-sm text-foreground">
            Linked to header item: <span className="font-medium">{selectedTarget?.label}</span>
          </p>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png,.webp,.gif,.avif"
          className="hidden"
          onChange={(e) => void onFileSelected(e)}
        />

        <div className="flex flex-wrap items-start gap-3">
          {previewSrc ? (
            <div className="shrink-0 overflow-hidden rounded-md border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt={bannerForm.bannerAlt.trim() || 'Mega menu banner preview'}
                className="h-20 w-36 object-contain object-center"
              />
            </div>
          ) : (
            <div className="flex h-20 w-36 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted/50 text-[10px] text-muted-foreground">
              No image
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={uploadBusy}
                onClick={() => fileRef.current?.click()}
                className={adminUi.btnSecondary}
              >
                {uploadBusy ? 'Uploading…' : 'Upload image'}
              </button>
              {bannerForm.bannerImageUrl.trim() ? (
                <button
                  type="button"
                  onClick={() => onBannerChange({ bannerImageUrl: '', bannerHref: '', bannerAlt: '' })}
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground"
                >
                  Remove
                </button>
              ) : null}
              <span className="text-xs text-muted-foreground">JPEG, PNG, WebP, GIF, AVIF · max 8MB</span>
            </div>
            {uploadErr ? <p className="text-xs text-destructive">{uploadErr}</p> : null}
            <label className="block text-xs font-medium text-muted-foreground">
              Image URL
              <input
                value={bannerForm.bannerImageUrl}
                onChange={(e) => onBannerChange({ bannerImageUrl: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                placeholder="https://… or /uploads/…"
              />
            </label>
          </div>
        </div>

        <label className="block text-xs font-medium text-muted-foreground">
          Banner link (optional)
          <input
            value={bannerForm.bannerHref}
            onChange={(e) => onBannerChange({ bannerHref: e.target.value })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
            placeholder="/products"
          />
        </label>

        <label className="block text-xs font-medium text-muted-foreground">
          Image alt text (optional)
          <input
            value={bannerForm.bannerAlt}
            onChange={(e) => onBannerChange({ bannerAlt: e.target.value })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {saved ? <p className="text-sm text-emerald-700 dark:text-emerald-400">Banner saved.</p> : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={adminUi.btnPrimary}
          >
            {saving ? 'Saving…' : 'Save banner'}
          </button>
        </div>
      </form>
    </section>
  );
}
