'use client';

import { adminUi } from '@/lib/admin-ui';
import type { GenerateLoadsheetResult } from '@/lib/api/shipping';

const COPY_LABELS = [
  'Courier Copy',
  'Operation Copy',
  'Customer Copy',
] as const;

function formatPickupDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function formatPrintedOn(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatCod(amount: number): string {
  return amount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatWeight(grams: number): string {
  return grams.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function LoadsheetPrintModal({
  manifest,
  onClose,
}: {
  manifest: GenerateLoadsheetResult;
  onClose: () => void;
}) {
  const officialUrl =
    manifest.officialUrl || manifest.printUrl || manifest.pdfUrl || null;
  const pickupDate = formatPickupDate(manifest.generatedAt);
  const printedOn = formatPrintedOn(manifest.generatedAt);
  const companyName = manifest.companyName || 'SM Nimco & Sweets';
  const accountNumber = manifest.accountNumber || '000000';

  function handlePrintLocal() {
    window.print();
  }

  function handleOpenOfficial() {
    if (!officialUrl) return;
    window.open(officialUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 print:static print:block print:overflow-visible print:bg-white print:p-0">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body * { visibility: hidden !important; }
          #leopards-bps-report, #leopards-bps-report * { visibility: visible !important; }
          #leopards-bps-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }
          .bps-toolbar { display: none !important; }
          .bps-copy {
            page-break-after: always;
            break-after: page;
          }
          .bps-copy:last-child {
            page-break-after: auto;
            break-after: auto;
          }
        }
      `}</style>

      <div className="my-6 w-full max-w-5xl rounded-xl bg-white shadow-xl dark:bg-zinc-950 print:my-0 print:max-w-none print:rounded-none print:shadow-none">
        <div className="bps-toolbar flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Booked Packets Summary Report
            </h2>
            <p className="text-xs text-zinc-500">
              Challan# {manifest.loadSheetId} · Acc# {accountNumber}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {officialUrl ? (
              <button
                type="button"
                onClick={handleOpenOfficial}
                className={adminUi.btnPrimarySm}
              >
                Print Official Leopards PDF
              </button>
            ) : null}
            <button
              type="button"
              onClick={handlePrintLocal}
              className={adminUi.btnSecondary}
            >
              Print Summary Report
            </button>
            <button
              type="button"
              onClick={onClose}
              className={adminUi.btnSecondary}
            >
              Close
            </button>
          </div>
        </div>

        <div id="leopards-bps-report" className="bg-white text-black">
          {COPY_LABELS.map((copyLabel) => (
            <section
              key={copyLabel}
              className="bps-copy border-b border-dashed border-zinc-300 px-4 py-5 last:border-b-0 print:border-0 print:px-0 print:py-0"
            >
              <ReportCopy
                copyLabel={copyLabel}
                challanNo={manifest.loadSheetId}
                accountNumber={accountNumber}
                companyName={companyName}
                pickupDate={pickupDate}
                printedOn={printedOn}
                packets={manifest.packets}
                totalPieces={
                  manifest.totals.totalPieces ??
                  manifest.packets.reduce((n, p) => n + (p.pieces ?? 1), 0)
                }
                totalPackets={manifest.totals.packetCount}
                totalCod={manifest.totals.totalCod}
              />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportCopy({
  copyLabel,
  challanNo,
  accountNumber,
  companyName,
  pickupDate,
  printedOn,
  packets,
  totalPieces,
  totalPackets,
  totalCod,
}: {
  copyLabel: string;
  challanNo: string;
  accountNumber: string;
  companyName: string;
  pickupDate: string;
  printedOn: string;
  packets: GenerateLoadsheetResult['packets'];
  totalPieces: number;
  totalPackets: number;
  totalCod: number;
}) {
  return (
    <div className="font-sans text-[11px] leading-tight text-black">
      <div className="flex items-start justify-between gap-3 border-b-2 border-black pb-2">
        <div className="flex items-start gap-3">
          <div
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#e11d2e] text-[10px] font-black uppercase tracking-tight text-[#e11d2e]"
          >
            LCS
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#e11d2e]">
              Leopards Courier Services
            </p>
            <p className="text-[10px] text-zinc-600">UAN: 111 300 786</p>
            <p className="mt-1 text-xs font-semibold uppercase text-black">
              {copyLabel}
            </p>
          </div>
        </div>
        <div className="text-right">
          <h3 className="text-base font-bold uppercase tracking-wide">
            Booked Packets Summary Report
          </h3>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 border-b border-black pb-2 sm:grid-cols-3">
        <p>
          <span className="font-semibold">Pickup Date</span> {pickupDate}
        </p>
        <p>
          <span className="font-semibold">Printed On</span> {printedOn}
        </p>
        <p>
          <span className="font-semibold">Challan#</span>{' '}
          <span className="font-mono font-bold">{challanNo}</span>
        </p>
        <p>
          <span className="font-semibold">Acc #</span>{' '}
          <span className="font-mono font-bold">{accountNumber}</span>
        </p>
        <p className="sm:col-span-2">
          <span className="font-semibold">Client Company Name:</span>{' '}
          {companyName}
        </p>
      </div>

      <table className="mt-2 w-full border-collapse text-[10px]">
        <thead>
          <tr className="border-b-2 border-black bg-zinc-100">
            <th className="border border-black px-1 py-1 text-left font-bold">
              Sr.
            </th>
            <th className="border border-black px-1 py-1 text-left font-bold">
              CN #
            </th>
            <th className="border border-black px-1 py-1 text-left font-bold">
              Destination
            </th>
            <th className="border border-black px-1 py-1 text-left font-bold">
              Shipper Name
            </th>
            <th className="border border-black px-1 py-1 text-center font-bold">
              No. of pieces
            </th>
            <th className="border border-black px-1 py-1 text-left font-bold">
              Consignee Name
            </th>
            <th className="border border-black px-1 py-1 text-left font-bold">
              Order Id
            </th>
            <th className="border border-black px-1 py-1 text-right font-bold">
              Weight (g)
            </th>
            <th className="border border-black px-1 py-1 text-right font-bold">
              COD Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {packets.map((p, idx) => (
            <tr key={`${copyLabel}-${p.id}`}>
              <td className="border border-black px-1 py-1">{idx + 1}</td>
              <td className="border border-black px-1 py-1 font-mono font-semibold">
                {p.cnNumber}
              </td>
              <td className="border border-black px-1 py-1">
                {p.destinationCity}
              </td>
              <td className="border border-black px-1 py-1">
                {p.shipperName || companyName}
              </td>
              <td className="border border-black px-1 py-1 text-center">
                {p.pieces ?? 1}
              </td>
              <td className="border border-black px-1 py-1">
                {p.customerName}
              </td>
              <td className="border border-black px-1 py-1 font-mono">
                {p.orderNumber}
              </td>
              <td className="border border-black px-1 py-1 text-right tabular-nums">
                {formatWeight(p.weightGrams ?? 1)}
              </td>
              <td className="border border-black px-1 py-1 text-right tabular-nums">
                {formatCod(p.codAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 space-y-1 border border-black bg-zinc-50 px-2 py-2 text-[11px] font-semibold">
        <p>Total No. Of Pieces: {totalPieces}</p>
        <p>Total No. Of Packets: {totalPackets}</p>
        <p>Total COD Amount: {formatCod(totalCod)}</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-10">
        <div>
          <p className="mb-10 text-[10px] font-semibold uppercase tracking-wide">
            Client Signature
          </p>
          <div className="border-b border-black" />
          <p className="mt-1 text-[9px] text-zinc-600">Name / Stamp / Date</p>
        </div>
        <div>
          <p className="mb-10 text-[10px] font-semibold uppercase tracking-wide">
            Booking Staff Signature
          </p>
          <div className="border-b border-black" />
          <p className="mt-1 text-[9px] text-zinc-600">Name / Stamp / Date</p>
        </div>
      </div>
    </div>
  );
}
