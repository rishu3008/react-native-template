import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton, AppScreen, AppText, Stack } from '@components';
import type { AppStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'Details'>;

/** Structural placeholder for a detail route reached with an id. */
export const DetailsScreen = ({ navigation, route }: Props) => (
  <AppScreen testID="details-screen">
    <Stack gap="lg">
      <AppText variant="heading2">Details</AppText>
      <AppText color="secondary" variant="body">
        {`Opened with id: ${route.params.id}`}
      </AppText>
      <AppButton
        onPress={() => navigation.goBack()}
        title="Back"
        variant="outline"
      />
    </Stack>
  </AppScreen>
);
