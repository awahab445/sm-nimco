'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createMailMailbox,
  fetchMailMailbox,
  MAILBOX_PURPOSES,
  testExistingMailMailbox,
  testMailConnection,
  updateMailMailbox,
  type MailMailboxPurpose,
} from '@/lib/api/mail-mailboxes';
import { formatApiError } from '@/lib/api/error-message';

const MASKED_PASSWORD = '********';

type Props = {
  mailboxId?: string;
};

export function MailMailboxForm({ mailboxId }: Props) {
  const router = useRouter();
  const isEdit = Boolean(mailboxId);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState<MailMailboxPurpose>('ORDERS');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [fromName, setFromName] = useState('M. Essa Chemicals');
  const [fromAddress, setFromAddress] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!mailboxId) return;
    setLoading(true);
    void fetchMailMailbox(mailboxId)
      .then((row) => {
        setCode(row.code);
        setName(row.name);
        setPurpose(row.purpose);
        setSmtpHost(row.smtpHost);
        setSmtpPort(String(row.smtpPort));
        setSmtpSecure(row.smtpSecure);
        setSmtpUser(row.smtpUser);
        setSmtpPass(row.smtpPass === MASKED_PASSWORD ? '' : row.smtpPass);
        setFromName(row.fromName);
        setFromAddress(row.fromAddress);
        setIsActive(row.isActive);
        setIsDefault(row.isDefault);
      })
      .catch((e) => setError(formatApiError(e)))
      .finally(() => setLoading(false));
  }, [mailboxId]);

  function buildTestPayload() {
    const port = Number(smtpPort);
    if (!smtpHost.trim() || !smtpUser.trim()) {
      throw new Error('SMTP host and user are required to test.');
    }
    if (!smtpPass.trim() && !isEdit) {
      throw new Error('SMTP password is required to test a new mailbox.');
    }
    if (!smtpPass.trim() && isEdit) {
      throw new Error('Enter the SMTP password to test (stored passwords cannot be read back).');
    }
    return {
      smtpHost: smtpHost.trim(),
      smtpPort: Number.isFinite(port) ? port : 587,
      smtpSecure,
      smtpUser: smtpUser.trim(),
      smtpPass,
      fromName: fromName.trim() || undefined,
      fromAddress: fromAddress.trim() || undefined,
      testRecipient: testRecipient.trim() || undefined,
    };
  }

  async function handleTest() {
    setError(null);
    setTestMessage(null);
    setTesting(true);
    try {
      if (isEdit && mailboxId && !smtpPass.trim()) {
        const res = await testExistingMailMailbox(
          mailboxId,
          testRecipient.trim() || undefined,
        );
        setTestMessage(res.message);
        return;
      }
      const payload = buildTestPayload();
      const res = await testMailConnection(payload);
      setTestMessage(res.message);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setTesting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTestMessage(null);

    if (!code.trim() || !name.trim()) {
      setError('Code and name are required.');
      return;
    }
    const port = Number(smtpPort);
    if (!Number.isFinite(port) || port < 1) {
      setError('SMTP port must be a valid number.');
      return;
    }
    if (!isEdit && !smtpPass.trim()) {
      setError('SMTP password is required for new mailboxes.');
      return;
    }

    const body = {
      code: code.trim().toLowerCase(),
      name: name.trim(),
      purpose,
      smtpHost: smtpHost.trim(),
      smtpPort: port,
      smtpSecure,
      smtpUser: smtpUser.trim(),
      fromName: fromName.trim(),
      fromAddress: fromAddress.trim(),
      isActive,
      isDefault,
      ...(smtpPass.trim() ? { smtpPass } : {}),
    };

    setSaving(true);
    try {
      if (isEdit && mailboxId) {
        await updateMailMailbox(mailboxId, body);
        router.push('/mail');
      } else {
        await createMailMailbox({ ...body, smtpPass: smtpPass.trim() });
        router.push('/mail');
      }
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-zinc-500">Loading mailbox…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/mail" className="text-sm text-zinc-600 underline dark:text-zinc-400">
          ← Mail servers
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {isEdit ? 'Edit mailbox' : 'New mailbox'}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          SMTP passwords are encrypted with AES-256-GCM before storage. Use Test connection before
          saving.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}
      {testMessage ? (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          {testMessage}
        </p>
      ) : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Identity</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">Code</span>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="orders-primary"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">Name</span>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Orders mailbox"
                required
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Purpose</span>
            <select
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as MailMailboxPurpose)}
            >
              {MAILBOX_PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              Default for this purpose
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">SMTP server</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="text-zinc-700 dark:text-zinc-300">Host</span>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="mail.messa-chemicals.com"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">Port</span>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                inputMode="numeric"
                required
              />
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={smtpSecure}
                onChange={(e) => setSmtpSecure(e.target.checked)}
              />
              Use TLS (secure / port 465)
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-zinc-700 dark:text-zinc-300">Username</span>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-zinc-700 dark:text-zinc-300">
                Password {isEdit ? '(leave blank to keep current)' : ''}
              </span>
              <input
                type="password"
                autoComplete="new-password"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                placeholder={isEdit ? '••••••••' : ''}
                required={!isEdit}
              />
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Sender</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">From name</span>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">From address</span>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                placeholder="orders@messa-chemicals.com"
                required
              />
            </label>
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-900/30">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Test connection</h2>
          <label className="block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">
              Test recipient (optional — sends a real test email)
            </span>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="you@company.com"
            />
          </label>
          <button
            type="button"
            disabled={testing}
            onClick={() => void handleTest()}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-zinc-600"
          >
            {testing ? 'Testing…' : 'Test connection'}
          </button>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create mailbox'}
          </button>
          <Link
            href="/mail"
            className="rounded-lg border border-zinc-300 px-5 py-2 text-sm font-medium dark:border-zinc-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
