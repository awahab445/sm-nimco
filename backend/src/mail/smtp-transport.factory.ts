import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export type SmtpTransportInput = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
};

/**
 * Build a nodemailer transport tuned for common providers (Hostinger, etc.).
 * - Port 465 → implicit TLS (secure: true)
 * - Port 587 → STARTTLS (secure: false, requireTLS: true)
 */
export function createSmtpTransporter(config: SmtpTransportInput): Transporter {
  const port = Number(config.port) || 587;
  const secure =
    port === 465 ? true : port === 587 ? false : Boolean(config.secure);

  const options: SMTPTransport.Options = {
    host: config.host.trim(),
    port,
    secure,
    auth: {
      user: config.user.trim(),
      pass: config.pass,
    },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 30_000,
    tls: {
      // Hostinger / shared SMTP certs can fail strict verification from Docker.
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
  };

  if (port === 587 || (!secure && port !== 465)) {
    options.requireTLS = true;
  }

  return nodemailer.createTransport(options);
}

export function isTransientSmtpError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = String((error as { code?: string }).code ?? '').toUpperCase();
  return (
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'ESOCKET' ||
    code === 'ECONNECTION' ||
    code === 'ECONNREFUSED' ||
    code === 'EENVELOPE'
  );
}
