import { useState } from 'react';

import {
  AppButton,
  AppErrorBoundary,
  AppText,
  Badge,
  Card,
  FullScreenLoader,
  Row,
  Stack,
  SuccessState,
  useToast,
} from '@components';
import { analytics, apiClient, crashReporter, toAppError } from '@services';

/** Throws on demand, so the boundary has something real to catch. */
const Exploder = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Deliberate render error from the playground');
  }

  return <AppText variant="body">This subtree is healthy.</AppText>;
};

/**
 * The parts that only show themselves when something goes wrong, plus the
 * adapters that have no UI at all (brief section 39).
 */
export const DiagnosticsSection = () => {
  const toast = useToast();
  const [shouldThrow, setShouldThrow] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const upload = async () => {
    setProgress(0);

    try {
      // A real request. The body is small, so progress may jump straight to
      // 1 -- the point is that the callback is wired, which React Native's
      // fetch cannot do at all.
      await apiClient.post(
        '/posts',
        { title: 'template', body: 'x'.repeat(2048), userId: 1 },
        {
          onUploadProgress: ({ ratio }) => {
            if (ratio != null) setProgress(ratio);
          },
        },
      );

      toast.show({ message: 'Upload complete', tone: 'success' });
    } catch (error) {
      toast.show({ message: toAppError(error).message, tone: 'error' });
    } finally {
      setProgress(null);
    }
  };

  if (showLoader) {
    return (
      <Stack gap="md" style={{ height: 220 }}>
        <FullScreenLoader label="Blocking loader" />
        <AppButton
          onPress={() => setShowLoader(false)}
          title="Dismiss"
          variant="outline"
        />
      </Stack>
    );
  }

  if (showSuccess) {
    return (
      <Card padding="none" shadow="none">
        <SuccessState
          actionLabel="Back"
          description="Ends a flow rather than reporting a failure."
          onAction={() => setShowSuccess(false)}
        />
      </Card>
    );
  }

  return (
    <Stack gap="lg">
      <AppText variant="heading3">Diagnostics</AppText>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          Error boundary
        </AppText>
        <AppText color="secondary" variant="caption">
          Catches render errors so one broken subtree does not blank the app.
          Event handlers and async code never reach it.
        </AppText>
        <Card bordered shadow="none">
          <AppErrorBoundary resetKey={String(shouldThrow)}>
            <Exploder shouldThrow={shouldThrow} />
          </AppErrorBoundary>
        </Card>
        <Row gap="sm" wrap>
          <AppButton
            onPress={() => setShouldThrow(true)}
            size="small"
            testID="break-subtree"
            title="Break it"
            variant="danger"
          />
          <AppButton
            onPress={() => setShouldThrow(false)}
            size="small"
            title="Reset"
            variant="outline"
          />
        </Row>
      </Stack>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          Upload progress
        </AppText>
        <AppText color="secondary" variant="caption">
          The reason this template uses axios: React Native&apos;s fetch cannot
          report upload progress at all.
        </AppText>
        <Row gap="sm">
          <AppButton
            loading={progress != null}
            onPress={() => {
              upload().catch(() => undefined);
            }}
            size="small"
            testID="upload"
            title="Upload"
            variant="outline"
          />
          {progress != null && (
            <Badge label={`${Math.round(progress * 100)}%`} tone="primary" />
          )}
        </Row>
      </Stack>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          Vendor adapters
        </AppText>
        <AppText color="secondary" variant="caption">
          No SDK is registered, so both route to the logger. That is deliberate:
          event wiring stays verifiable before a vendor exists.
        </AppText>
        <Row gap="sm" wrap>
          <AppButton
            onPress={() => {
              analytics.track({
                name: 'playground_event',
                properties: { source: 'diagnostics' },
              });
              toast.show({ message: 'analytics.track sent to the logger' });
            }}
            size="small"
            title="Track event"
            variant="outline"
          />
          <AppButton
            onPress={() => {
              crashReporter.recordError(new Error('Playground test error'), {
                screen: 'Diagnostics',
              });
              toast.show({ message: 'crashReporter.recordError logged' });
            }}
            size="small"
            title="Record error"
            variant="outline"
          />
        </Row>
      </Stack>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          Blocking states
        </AppText>
        <Row gap="sm" wrap>
          <AppButton
            onPress={() => setShowLoader(true)}
            size="small"
            title="Full screen loader"
            variant="outline"
          />
          <AppButton
            onPress={() => setShowSuccess(true)}
            size="small"
            title="Success state"
            variant="outline"
          />
        </Row>
      </Stack>
    </Stack>
  );
};
