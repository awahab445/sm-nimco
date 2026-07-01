import { fetchApi } from '@/lib/api-client';

export const MAILBOX_PURPOSES = [
  'ORDERS',
  'WELCOME',
  'AUTH',
  'MARKETING',
  'SUPPORT',
  'GENERAL',
] as const;

export type MailMailboxPurpose = (typeof MAILBOX_PURPOSES)[number];

export type MailMailbox = {
  id: string;
  code: string;
  name: string;
  purpose: MailMailboxPurpose;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  fromName: string;
  fromAddress: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MailMailboxInput = {
  code: string;
  name: string;
  purpose: MailMailboxPurpose;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass?: string;
  fromName: string;
  fromAddress: string;
  isActive: boolean;
  isDefault: boolean;
};

export type TestMailConnectionInput = {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  fromName?: string;
  fromAddress?: string;
  testRecipient?: string;
};

export async function fetchMailMailboxes(includeInactive = true): Promise<MailMailbox[]> {
  const qs = includeInactive ? '?includeInactive=true' : '';
  const res = await fetchApi<{ data: MailMailbox[] }>(`/admin/mail/mailboxes${qs}`);
  return res.data;
}

export async function fetchMailMailbox(id: string): Promise<MailMailbox> {
  const res = await fetchApi<{ data: MailMailbox }>(`/admin/mail/mailboxes/${id}`);
  return res.data;
}

export async function createMailMailbox(body: MailMailboxInput): Promise<MailMailbox> {
  const res = await fetchApi<{ data: MailMailbox }>('/admin/mail/mailboxes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function updateMailMailbox(
  id: string,
  body: Partial<MailMailboxInput>,
): Promise<MailMailbox> {
  const res = await fetchApi<{ data: MailMailbox }>(`/admin/mail/mailboxes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function deleteMailMailbox(id: string): Promise<void> {
  await fetchApi<void>(`/admin/mail/mailboxes/${id}`, { method: 'DELETE' });
}

export async function testMailConnection(
  body: TestMailConnectionInput,
): Promise<{ ok: true; message: string }> {
  return fetchApi<{ ok: true; message: string }>('/admin/mail/mailboxes/test-connection', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function testExistingMailMailbox(
  id: string,
  testRecipient?: string,
): Promise<{ ok: true; message: string }> {
  return fetchApi<{ ok: true; message: string }>(
    `/admin/mail/mailboxes/${id}/test-connection`,
    {
      method: 'POST',
      body: JSON.stringify(testRecipient ? { testRecipient } : {}),
    },
  );
}
