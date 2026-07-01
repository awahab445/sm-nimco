/** Mailbox routing purpose — maps to rows in `mail_mailboxes`. */
export enum MailMailboxPurpose {
  ORDERS = 'ORDERS',
  WELCOME = 'WELCOME',
  AUTH = 'AUTH',
  MARKETING = 'MARKETING',
  SUPPORT = 'SUPPORT',
  GENERAL = 'GENERAL',
}

export const MAILBOX_PURPOSES = Object.values(MailMailboxPurpose);

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromAddress: string;
};
