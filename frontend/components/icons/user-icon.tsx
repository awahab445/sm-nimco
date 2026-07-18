import type { SVGProps } from 'react';

function mergeClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

type UserIconProps = SVGProps<SVGSVGElement> & {
  strokeWidth?: number | string;
};

/**
 * Kalles-style account icon (Feather user) — head circle + shoulder arc.
 * Matches demo `#icon-h-account` stroke weight and proportions.
 */
export function UserIcon({ className, strokeWidth = 1.2, ...rest }: UserIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={mergeClassNames('user-icon', className)}
      aria-hidden
      {...rest}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
