import {
  AppButton,
  AppText,
  Card,
  EmptyState,
  ErrorState,
  ListItem,
  Row,
  Skeleton,
  Stack,
} from '@components';
import { usePosts } from '@features/home';
import { toAppError } from '@services';

/**
 * The data layer end to end (brief section 24, AGENTS.md 21).
 *
 * Screen -> hook -> repository -> ApiClient. This screen never sees an HTTP
 * response or a vendor error, and renders every state the chain can produce
 * rather than only the successful one.
 */
export const DataSection = () => {
  const { data, isPending, isFetching, isError, error, refetch } = usePosts();

  const renderBody = () => {
    if (isPending) {
      return (
        <Stack gap="sm">
          <Skeleton height={18} width="70%" />
          <Skeleton height={14} />
          <Skeleton height={14} width="85%" />
        </Stack>
      );
    }

    if (isError) {
      // The hook surfaces an AppError whose message is already user-safe.
      return (
        <Card padding="none" shadow="none">
          <ErrorState
            description={toAppError(error).message}
            onRetry={() => {
              refetch().catch(() => undefined);
            }}
          />
        </Card>
      );
    }

    if (data.length === 0) {
      return (
        <Card padding="none" shadow="none">
          <EmptyState description="The request succeeded but returned nothing." />
        </Card>
      );
    }

    return (
      <Stack gap="none">
        {data.slice(0, 3).map(post => (
          <ListItem key={post.id} subtitle={post.body} title={post.title} />
        ))}
      </Stack>
    );
  };

  return (
    <Stack gap="md">
      <Row justify="space-between">
        <AppText variant="heading3">Data layer</AppText>
        {isFetching && !isPending && (
          <AppText color="secondary" variant="caption">
            refreshing
          </AppText>
        )}
      </Row>

      <AppText color="secondary" variant="bodySmall">
        Screen to hook to repository to ApiClient, with the response validated
        before it reaches the UI.
      </AppText>

      {renderBody()}

      <AppButton
        onPress={() => {
          refetch().catch(() => undefined);
        }}
        testID="data-refetch"
        title="Refetch"
        variant="outline"
      />
    </Stack>
  );
};
