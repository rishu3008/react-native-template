import { RESULTS, check, request } from 'react-native-permissions';

import { permissionsService } from '@services';

jest.mock('react-native-permissions', () => {
  const actual = jest.requireActual('react-native-permissions/mock');
  return { ...actual, check: jest.fn(), request: jest.fn() };
});

describe('permissionsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    [RESULTS.GRANTED, 'granted'],
    [RESULTS.DENIED, 'denied'],
    [RESULTS.BLOCKED, 'blocked'],
    [RESULTS.LIMITED, 'limited'],
    [RESULTS.UNAVAILABLE, 'unavailable'],
  ])('normalises %s to %s', async (result, expected) => {
    jest.mocked(check).mockResolvedValue(result);

    await expect(permissionsService.check('camera')).resolves.toBe(expected);
  });

  it('keeps blocked distinct from denied', async () => {
    // Denied can be asked again; blocked cannot and must send the user to
    // Settings. Collapsing them produces a button that appears to do nothing.
    jest.mocked(request).mockResolvedValue(RESULTS.BLOCKED);

    await expect(permissionsService.request('camera')).resolves.toBe('blocked');
  });

  it('reports unavailable rather than throwing when the platform errors', async () => {
    jest.mocked(check).mockRejectedValue(new Error('native module missing'));

    // A permission check that throws must not take the screen down with it.
    await expect(permissionsService.check('camera')).resolves.toBe(
      'unavailable',
    );
  });

  it('routes notifications through the notifications API', async () => {
    // Notifications are not a regular permission on either platform.
    await expect(permissionsService.check('notifications')).resolves.toEqual(
      expect.any(String),
    );
    expect(check).not.toHaveBeenCalled();
  });
});
