import { StateView, type StateViewProps } from './StateView';

export type EmptyStateProps = Omit<StateViewProps, 'tone' | 'title'> & {
  title?: string;
};

/** Nothing to show yet, which is a normal state rather than a failure. */
export const EmptyState = ({
  title = 'Nothing here yet',
  ...rest
}: EmptyStateProps) => <StateView title={title} tone="neutral" {...rest} />;
