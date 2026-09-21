import { StateView, type StateViewProps } from './StateView';

export type ErrorStateProps = Omit<StateViewProps, 'tone' | 'title'> & {
  title?: string;
  /** Convenience for the common retry action. */
  onRetry?: () => void;
  retryLabel?: string;
};

/**
 * Something failed and the user can try again (AGENTS.md 20, 21).
 *
 * Takes presentational copy only. Never hand it a raw exception message --
 * normalise to an AppError first, because vendor error strings are not user
 * facing (rule 20).
 */
export const ErrorState = ({
  title = 'Something went wrong',
  description = 'Please check your connection and try again.',
  onRetry,
  retryLabel = 'Try again',
  ...rest
}: ErrorStateProps) => (
  <StateView
    description={description}
    title={title}
    tone="error"
    {...(onRetry != null && { actionLabel: retryLabel, onAction: onRetry })}
    {...rest}
  />
);
