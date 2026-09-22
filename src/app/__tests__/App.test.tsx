import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen } from '@testing-library/react-native';

import App from '@app/App';
import { storageKeys } from '@constants';

describe('App', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('shows the signed-out tree when there is no session', async () => {
    render(<App />);

    // Also asserts both gates open: the theme preference and the session
    // must both resolve before anything renders.
    expect(await screen.findByTestId('sign-in-screen')).toBeOnTheScreen();
  });

  it('shows the signed-in tree when a session was restored', async () => {
    await AsyncStorage.setItem(storageKeys.session, 'active');

    render(<App />);

    expect(await screen.findByTestId('playground-screen')).toBeOnTheScreen();
    expect(screen.queryByTestId('sign-in-screen')).not.toBeOnTheScreen();
  });
});
