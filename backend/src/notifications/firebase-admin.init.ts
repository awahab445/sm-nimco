import { Logger } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { basename, isAbsolute, resolve } from 'path';
import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from 'firebase-admin/app';

const logger = new Logger('FirebaseAdmin');

type ResolvedCredential = {
  credential: ReturnType<typeof cert>;
  projectId?: string;
  source: string;
};

let warnedMissing = false;

function parseServiceAccountJson(raw: string): ServiceAccount & {
  project_id?: string;
} {
  return JSON.parse(raw) as ServiceAccount & { project_id?: string };
}

function resolveCredentialFile(rawPath: string): string | null {
  const trimmed = rawPath.trim();
  if (!trimmed) {
    return null;
  }

  const candidates = [
    trimmed,
    isAbsolute(trimmed) ? trimmed : resolve(process.cwd(), trimmed),
    resolve('/app/secrets', basename(trimmed)),
  ];

  for (const candidate of new Set(candidates)) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function resolveFirebaseCredential(): ResolvedCredential | null {
  const jsonInline =
    process.env.FIREBASE_CREDENTIALS_JSON?.trim() ||
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  const jsonPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY?.trim();

  if (jsonInline) {
    const parsed = parseServiceAccountJson(jsonInline);
    return {
      credential: cert(parsed),
      projectId: projectId || parsed.projectId || parsed.project_id,
      source: 'FIREBASE_CREDENTIALS_JSON',
    };
  }

  if (jsonPath) {
    const absolutePath = resolveCredentialFile(jsonPath);
    if (!absolutePath) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT_PATH is set but the file was not found in the container (${jsonPath}). Mount the JSON into the API container or use FIREBASE_CREDENTIALS_JSON.`,
      );
    }
    const parsed = parseServiceAccountJson(readFileSync(absolutePath, 'utf8'));
    return {
      credential: cert(parsed),
      projectId: projectId || parsed.projectId || parsed.project_id,
      source: absolutePath,
    };
  }

  if (projectId && clientEmail && privateKeyRaw) {
    return {
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKeyRaw.replace(/\\n/g, '\n'),
      }),
      projectId,
      source: 'FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY',
    };
  }

  return null;
}

/** Idempotent Firebase Admin bootstrap for FCM. Safe to call from multiple modules. */
export function ensureFirebaseAdmin(): boolean {
  if (getApps().length > 0) {
    return true;
  }

  const enabled = process.env.FCM_ENABLED?.trim().toLowerCase();
  if (enabled === 'false' || enabled === '0') {
    logger.log('FCM disabled via FCM_ENABLED=false');
    return false;
  }

  try {
    const resolved = resolveFirebaseCredential();
    if (!resolved) {
      if (!warnedMissing) {
        warnedMissing = true;
        logger.warn(
          'Firebase Admin not configured. Set FIREBASE_CREDENTIALS_JSON or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY on the API container (deploy/smnimco/.env.smnimco). Push notifications disabled.',
        );
      }
      return false;
    }

    initializeApp({
      credential: resolved.credential,
      ...(resolved.projectId ? { projectId: resolved.projectId } : {}),
    });
    logger.log(`Firebase Admin initialized (${resolved.source})`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Firebase Admin init failed: ${message}`);
    return false;
  }
}
