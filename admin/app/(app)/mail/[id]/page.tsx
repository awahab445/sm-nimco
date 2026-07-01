import { MailMailboxForm } from '@/components/mail/mail-mailbox-form';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditMailMailboxPage({ params }: Props) {
  const { id } = await params;
  return <MailMailboxForm mailboxId={id} />;
}
