import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AppBottomSheet } from '@components';

const { __sheetSpies } = require('@gorhom/bottom-sheet') as {
  __sheetSpies: { present: jest.Mock; dismiss: jest.Mock };
};

const renderSheet = (visible: boolean, onClose = jest.fn()) =>
  render(
    <AppBottomSheet onClose={onClose} snapPoints={['40%']} visible={visible}>
      <Text>sheet body</Text>
    </AppBottomSheet>,
  );

describe('AppBottomSheet', () => {
  beforeEach(() => {
    __sheetSpies.present.mockClear();
    __sheetSpies.dismiss.mockClear();
  });

  it('does not present while closed', () => {
    renderSheet(false);

    expect(__sheetSpies.present).not.toHaveBeenCalled();
  });

  it('presents when it becomes visible', () => {
    const { rerender } = renderSheet(false);

    rerender(
      <AppBottomSheet onClose={jest.fn()} snapPoints={['40%']} visible>
        <Text>sheet body</Text>
      </AppBottomSheet>,
    );

    expect(__sheetSpies.present).toHaveBeenCalledTimes(1);
  });

  it('presents again after being closed', () => {
    const onClose = jest.fn();
    const sheet = (visible: boolean) => (
      <AppBottomSheet onClose={onClose} snapPoints={['40%']} visible={visible}>
        <Text>sheet body</Text>
      </AppBottomSheet>
    );

    const { rerender } = render(sheet(false));

    rerender(sheet(true));
    rerender(sheet(false));
    rerender(sheet(true));

    // The regression this guards: the sheet opened once and then never
    // again, because the adapter's view of open/closed drifted from the
    // library's after a self-dismissal.
    expect(__sheetSpies.present).toHaveBeenCalledTimes(2);
    expect(__sheetSpies.dismiss).toHaveBeenCalledTimes(1);
  });

  it('does not re-issue a command when visible is unchanged', () => {
    const sheet = (
      <AppBottomSheet onClose={jest.fn()} snapPoints={['40%']} visible>
        <Text>sheet body</Text>
      </AppBottomSheet>
    );

    const { rerender } = render(sheet);
    rerender(sheet);
    rerender(sheet);

    expect(__sheetSpies.present).toHaveBeenCalledTimes(1);
  });

  it('renders its title and content', () => {
    render(
      <AppBottomSheet onClose={jest.fn()} title="Options" visible>
        <Text>sheet body</Text>
      </AppBottomSheet>,
    );

    expect(screen.getByText('Options')).toBeOnTheScreen();
    expect(screen.getByText('sheet body')).toBeOnTheScreen();
  });
});
