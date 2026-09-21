import { render, screen } from '@testing-library/react-native';

import App from '@app/App';

describe('App', () => {
  it('renders content once the stored theme preference has been read', async () => {
    render(<App />);

    // Nothing renders before hydration, so this also asserts the gate opens.
    expect(await screen.findByTestId('playground-screen')).toBeOnTheScreen();
  });
});
