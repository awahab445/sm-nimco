type ShoppingBagIconProps = {
  className?: string;
  'aria-hidden'?: boolean;
};

export function ShoppingBagIcon({ className = 'h-4 w-4', ...rest }: ShoppingBagIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <path d="M6 7h12l-1 13H7L6 7Z" />
      <path d="M9 7a3 3 0 1 1 6 0" />
    </svg>
  );
}
