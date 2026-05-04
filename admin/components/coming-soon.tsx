type ComingSoonProps = {
  title: string;
  phase: string;
  description?: string;
};

export function ComingSoon({ title, phase, description }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      <div className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/90 px-5 py-4 dark:border-amber-900/50 dark:bg-amber-950/40">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
          Coming soon
          <span className="ml-2 rounded-md bg-amber-200/80 px-2 py-0.5 text-xs font-normal text-amber-950 dark:bg-amber-900/60 dark:text-amber-100">
            Phase {phase}
          </span>
        </p>
        <p className="mt-2 text-sm text-amber-950/80 dark:text-amber-100/80">
          {description ??
            'This area will be wired to the backend API in a later implementation phase.'}
        </p>
      </div>
    </div>
  );
}
