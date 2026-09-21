import { render, screen, userEvent } from '@testing-library/react-native';

import { Checkbox } from '@components';

describe('Checkbox', () => {
  it('reports its checked state to assistive technology', () => {
    render(<Checkbox checked label="I agree" onChange={jest.fn()} />);

    const checkbox = screen.getByRole('checkbox', { name: 'I agree' });
    expect(checkbox).toBeOnTheScreen();
    expect(checkbox).toBeChecked();
  });

  it('toggles from unchecked to checked', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<Checkbox checked={false} label="I agree" onChange={onChange} />);

    await user.press(screen.getByRole('checkbox', { name: 'I agree' }));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles back off', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<Checkbox checked label="I agree" onChange={onChange} />);

    await user.press(screen.getByRole('checkbox', { name: 'I agree' }));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('does not fire when disabled', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <Checkbox checked={false} disabled label="I agree" onChange={onChange} />,
    );

    await user.press(screen.getByRole('checkbox', { name: 'I agree' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
