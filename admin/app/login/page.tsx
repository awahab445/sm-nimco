import { Suspense } from 'react';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-background px-4 py-12 text-foreground dark:bg-zinc-950">
      <Suspense
        fallback={
          <div className="w-full max-w-md animate-pulse space-y-4 rounded-md border border-border bg-card p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-10 rounded bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-10 rounded bg-zinc-100 dark:bg-zinc-900" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
