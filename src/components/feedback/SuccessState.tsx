import { StateView, type StateViewProps } from './StateView';

export type SuccessStateProps = Omit<StateViewProps, 'tone' | 'title'> & {
  title?: string;
};

/** A completed operation, typically ending a flow. */
export const SuccessState = ({
  title = 'All done',
  ...rest
}: SuccessStateProps) => <StateView title={title} tone="success" {...rest} />;
