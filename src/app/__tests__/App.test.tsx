import { render, screen } from '@testing-library/react-native';

import App from '@app/App';

describe('App', () => {
  it('renders the application shell', async () => {
    render(<App />);

    expect(
      await screen.findByText(/welcome to react native/i),
    ).toBeOnTheScreen();
  });
});
