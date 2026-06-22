'use client';

type ToastType = 'error' | 'success';
type ToastListener = (message: string, type: ToastType) => void;

const listeners = new Set<ToastListener>();

export function showStorefrontToast(message: string, type: ToastType = 'error') {
  listeners.forEach((listener) => listener(message, type));
}

export function subscribeStorefrontToast(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
