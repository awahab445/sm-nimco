import { UserCircle } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

function mergeClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Account / user nav icon — matches cart bag sizing and `currentColor` theming. */
export function UserIcon({ className, strokeWidth = 2, ...rest }: LucideProps) {
  return (
    <UserCircle
      strokeWidth={strokeWidth}
      stroke="currentColor"
      className={mergeClassNames('user-icon', className)}
      {...rest}
    />
  );
}
