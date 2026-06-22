type ProductStockAlertProps = {
  message: string;
};

export function ProductStockAlert({ message }: ProductStockAlertProps) {
  return (
    <p
      className="text-right text-xs font-medium text-red-600 sm:text-sm"
      role="alert"
      aria-live="assertive"
    >
      {message}
    </p>
  );
}
