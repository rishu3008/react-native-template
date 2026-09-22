/**
 * Permission names the template abstracts (AGENTS.md 27).
 *
 * Feature code names a capability; the mapping to
 * NSCameraUsageDescription / android.permission.CAMERA and the difference
 * between iOS and Android naming stays inside this service.
 */
export type PermissionName =
  | 'camera'
  | 'microphone'
  | 'photoLibrary'
  | 'locationWhenInUse'
  | 'notifications';

/**
 * Normalised outcome.
 *
 * `blocked` is deliberately distinct from `denied`: denied can be asked
 * again, blocked cannot and must send the user to Settings. Collapsing them
 * produces a button that appears to do nothing.
 */
export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'limited'
  | 'unavailable';

export type PermissionsService = {
  check: (name: PermissionName) => Promise<PermissionStatus>;
  request: (name: PermissionName) => Promise<PermissionStatus>;
  openSettings: () => Promise<void>;
};
