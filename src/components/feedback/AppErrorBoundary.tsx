import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorState } from './ErrorState';

type Props = {
  children: ReactNode;
  /** Replaces the default fallback. Receives a reset callback. */
  fallback?: (reset: () => void) => ReactNode;
  /** Changing this value remounts the subtree, e.g. on route change. */
  resetKey?: string | number;
  /**
   * Reporting is injected rather than imported.
   *
   * Rule 6 keeps components out of services, and rule 63 forbids a reusable
   * component quietly calling a crash reporter. The app layer supplies this,
   * which also makes the boundary testable without stubbing a logger.
   */
  onError?: (error: Error, componentStack: string | null | undefined) => void;
};

type State = { error: Error | null };

/**
 * Catches render errors so one broken subtree does not blank the app
 * (AGENTS.md 20, 21).
 *
 * A class component because React provides no hook equivalent of
 * componentDidCatch. This is the one place in the template that needs one.
 *
 * It catches render, lifecycle and constructor errors only -- not errors in
 * event handlers or async code, which never reach React's boundary machinery
 * and must be handled where they occur.
 */
export class AppErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info.componentStack);
  }

  override componentDidUpdate(previous: Props): void {
    // Without this, a boundary that has caught stays broken forever: the
    // fallback renders, the user navigates away, and the subtree never
    // recovers because nothing clears the error.
    if (this.state.error != null && previous.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error == null) {
      return children;
    }

    if (fallback != null) {
      return fallback(this.reset);
    }

    return (
      <ErrorState
        description="The screen ran into a problem."
        onRetry={this.reset}
        retryLabel="Try again"
        title="Something went wrong"
      />
    );
  }
}
