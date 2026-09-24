import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { AppText } from '@components/common/AppText';
import { useTheme } from '@theme';

export type AppBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Heights the sheet snaps to, as percentage strings or numbers. */
  snapPoints?: readonly (string | number)[];
  scrollable?: boolean;
  /** Allow swiping down to dismiss. Turn off for required decisions. */
  enablePanDownToClose?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Adapter over @gorhom/bottom-sheet (rules 12, 48).
 *
 * Uses BottomSheetModal rather than the inline BottomSheet: the modal variant
 * renders through a portal, so the sheet cannot be clipped by whatever
 * container happens to hold the component. It requires
 * BottomSheetModalProvider in the tree, which lives in the app providers.
 *
 * Application code passes `visible`, matching AppModal. The library's
 * imperative present/dismiss API stays inside this file, so swapping the
 * library later is a change to one component rather than every call site.
 */
export const AppBottomSheet = ({
  visible,
  onClose,
  title,
  children,
  snapPoints,
  scrollable = false,
  enablePanDownToClose = true,
  style,
  testID,
}: AppBottomSheetProps) => {
  const { theme } = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);

  // What we last told the sheet to do.
  //
  // The sheet can also close itself -- a swipe down, a backdrop tap -- and
  // when it does, the parent's `visible` must return to false or the next
  // `setVisible(true)` is a no-op and the effect below never fires again.
  // That is the "opens once, then never again" failure. Tracking the last
  // command lets onDismiss resync without depending on the parent to do it.
  // Starts false because a freshly mounted sheet is already closed --
  // commanding it shut on mount is a redundant call into the library.
  const lastCommand = useRef(false);

  const points = useMemo(
    () => (snapPoints != null ? [...snapPoints] : undefined),
    [snapPoints],
  );

  // Bridges the declarative `visible` prop onto the imperative API, which is
  // the reason this adapter exists.
  useEffect(() => {
    if (lastCommand.current === visible) {
      return;
    }

    lastCommand.current = visible;

    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={enablePanDownToClose ? 'close' : 'none'}
      />
    ),
    [enablePanDownToClose],
  );

  const contentStyle = [{ padding: theme.spacing.lg }, style];

  const header =
    title != null ? (
      <AppText
        accessibilityRole="header"
        style={{ marginBottom: theme.spacing.md }}
        variant="heading3">
        {title}
      </AppText>
    ) : null;

  return (
    <BottomSheetModal
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.surfaceElevated }}
      // v5 defaults this to true, which appends a content-height snap point.
      // Combined with explicit snapPoints the sheet can resolve to zero
      // height and look like it never opened, so dynamic sizing is used only
      // when the caller has not specified heights of their own.
      enableDynamicSizing={points === undefined}
      enablePanDownToClose={enablePanDownToClose}
      handleIndicatorStyle={{ backgroundColor: theme.colors.borderStrong }}
      // Fires when the sheet closes itself by gesture or backdrop. Resyncing
      // here is what allows it to be reopened afterwards.
      onDismiss={() => {
        lastCommand.current = false;
        onClose();
      }}
      ref={sheetRef}
      snapPoints={points}>
      {/* Padding goes on contentContainerStyle for the scrolling variant;
          putting it on `style` there pads the scroll viewport instead of its
          content, which collapses the measured height. */}
      {scrollable ? (
        <BottomSheetScrollView
          contentContainerStyle={contentStyle}
          testID={testID}>
          {header}
          {children}
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView style={contentStyle} testID={testID}>
          {header}
          {children}
        </BottomSheetView>
      )}
    </BottomSheetModal>
  );
};
