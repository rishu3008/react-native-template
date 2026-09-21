import { useState } from 'react';

import {
  AppBottomSheet,
  AppButton,
  AppModal,
  AppSwitch,
  AppText,
  Card,
  EmptyState,
  ErrorState,
  Loader,
  OfflineBanner,
  Row,
  Skeleton,
  Stack,
  useToast,
} from '@components';

export const OverlaysSection = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const toast = useToast();

  return (
    <Stack gap="sm">
      <AppText variant="heading3">Overlays</AppText>

      <AppButton
        onPress={() => setIsModalVisible(true)}
        testID="open-modal"
        title="Open modal"
        variant="outline"
      />
      <AppButton
        onPress={() => setIsSheetVisible(true)}
        testID="open-sheet"
        title="Open bottom sheet"
        variant="outline"
      />

      <Row gap="sm" wrap>
        <AppButton
          onPress={() => toast.show({ message: 'Saved', tone: 'success' })}
          size="small"
          title="Success toast"
        />
        <AppButton
          onPress={() =>
            toast.show({
              message: 'Could not save',
              tone: 'error',
              actionLabel: 'Retry',
              onAction: () => toast.show({ message: 'Retrying' }),
            })
          }
          size="small"
          title="Error toast"
          variant="danger"
        />
      </Row>

      <AppSwitch
        label="Simulate offline"
        onValueChange={setIsOffline}
        value={isOffline}
      />
      <OfflineBanner visible={isOffline} />

      <AppModal
        onClose={() => setIsModalVisible(false)}
        testID="playground-modal"
        title="Modal title"
        visible={isModalVisible}>
        <Stack gap="md">
          <AppText color="secondary" variant="body">
            Tapping the scrim or the close button dismisses this.
          </AppText>
          <AppButton onPress={() => setIsModalVisible(false)} title="Done" />
        </Stack>
      </AppModal>

      <AppBottomSheet
        onClose={() => setIsSheetVisible(false)}
        snapPoints={['40%']}
        testID="playground-sheet"
        title="Bottom sheet"
        visible={isSheetVisible}>
        <Stack gap="md">
          <AppText color="secondary" variant="body">
            Swipe down or tap the scrim to dismiss.
          </AppText>
          <AppButton
            onPress={() => setIsSheetVisible(false)}
            title="Close"
            variant="outline"
          />
        </Stack>
      </AppBottomSheet>
    </Stack>
  );
};

export const StatesSection = () => {
  const toast = useToast();

  return (
    <Stack gap="md">
      <AppText variant="heading3">Loading and states</AppText>

      <Loader label="Loading" />

      <Stack gap="sm">
        <Skeleton height={20} width="60%" />
        <Skeleton height={14} />
        <Skeleton height={14} width="80%" />
      </Stack>

      <Card padding="none" shadow="none">
        <EmptyState
          actionLabel="Add one"
          description="Items you create will appear here."
          onAction={() => toast.show({ message: 'Create tapped' })}
        />
      </Card>

      <Card padding="none" shadow="none">
        <ErrorState onRetry={() => toast.show({ message: 'Retrying' })} />
      </Card>
    </Stack>
  );
};
