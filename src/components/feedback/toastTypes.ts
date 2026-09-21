export type ToastTone = 'neutral' | 'success' | 'warning' | 'error';

export type ToastOptions = {
  message: string;
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss. Pass 0 to require manual dismissal. */
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
};

export type Toast = ToastOptions & { id: string };

export type ToastContextValue = {
  show: (options: ToastOptions) => void;
  dismiss: () => void;
};
