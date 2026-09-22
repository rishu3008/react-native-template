import { AppScreen, Divider, Stack } from '@components';

import {
  ButtonsSection,
  ColorsSection,
  DataSection,
  HeaderSection,
  InputsSection,
  ListSection,
  MediaSection,
  OverlaysSection,
  SelectionSection,
  StatesSection,
  SurfacesSection,
  ThemeSection,
  TypographySection,
} from '../sections';

/**
 * Visual test surface for the design system (brief section 39).
 *
 * Composition only. Each section owns its own demo state, so the screen stays
 * a table of contents rather than a growing pile of unrelated useState calls
 * (rules 13, 43).
 *
 * This is the template's own playground, not an example feature. Consumers
 * delete it.
 */
export const PlaygroundScreen = () => (
  <AppScreen scrollable testID="playground-screen">
    <Stack gap="xl">
      <HeaderSection />
      <ThemeSection />
      <Divider />
      <TypographySection />
      <Divider />
      <ButtonsSection />
      <Divider />
      <InputsSection />
      <Divider />
      <SelectionSection />
      <Divider />
      <OverlaysSection />
      <Divider />
      <StatesSection />
      <Divider />
      <DataSection />
      <Divider />
      <MediaSection />
      <Divider />
      <SurfacesSection />
      <Divider />
      <ListSection />
      <Divider />
      <ColorsSection />
    </Stack>
  </AppScreen>
);
