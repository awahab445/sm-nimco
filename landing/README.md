# SM NIMCO Coming Soon — static export

Standalone Next.js static site for the Coming Soon landing page.

## Build

```bash
cd landing
npm install
npm run build
```

Output is written to `landing/out/`.

Optional WhatsApp CTA at build time:

```bash
# Windows PowerShell
$env:NEXT_PUBLIC_WHATSAPP_URL="https://wa.me/923001234567"
$env:NEXT_PUBLIC_SHEET_API_URL="https://sheetdb.io/api/v1/YOUR_SHEET_API_ID"
npm run build
```

### Notify Me → Google Sheets

1. Create a Google Sheet with headers `Email` and `SubmittedAt`.
2. Connect it via [SheetDB](https://sheetdb.io) (or a Google Apps Script `doPost` web app).
3. Set `NEXT_PUBLIC_SHEET_API_URL` in `.env.local` (see `.env.example`).
4. Rebuild — the form POSTs `{ Email, SubmittedAt }` from the browser (static-export safe).

## Deploy

Upload the contents of `out/` (or the root `smnimco-landing-build.zip`) to any static host / Nginx / Apache document root.
