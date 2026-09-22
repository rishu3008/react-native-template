import {
  dispatchWhenReady,
  isNavigationReady,
  navigationRef,
} from '@navigation';

describe('navigationRef', () => {
  it('reports not ready before a container is mounted', () => {
    expect(isNavigationReady()).toBe(false);
  });

  it('refuses to dispatch before the container is ready', () => {
    const action = { type: 'NAVIGATE', payload: { name: 'App' } };

    // A notification tapped from cold start fires before the tree exists.
    // Returning false lets the caller queue and replay, instead of silently
    // dropping the intent.
    expect(dispatchWhenReady(action)).toBe(false);
  });

  it('dispatches once ready', () => {
    const dispatch = jest.fn();
    jest.spyOn(navigationRef, 'isReady').mockReturnValue(true);
    jest.spyOn(navigationRef, 'dispatch').mockImplementation(dispatch);

    const action = { type: 'NAVIGATE', payload: { name: 'App' } };

    expect(dispatchWhenReady(action)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(action);

    jest.restoreAllMocks();
  });
});
