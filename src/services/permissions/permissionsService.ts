import { Platform } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  check,
  openSettings,
  request,
  requestNotifications,
  checkNotifications,
  type Permission,
} from 'react-native-permissions';

import { logger } from '@services/logging';

import type {
  PermissionName,
  PermissionStatus,
  PermissionsService,
} from './types';

/**
 * Maps a capability to the platform permission constant.
 *
 * Returns undefined where a platform has no equivalent -- Android has no
 * separate microphone-for-photos concept, and notifications are handled by a
 * different API entirely.
 */
const resolve = (name: PermissionName): Permission | undefined => {
  if (Platform.OS === 'ios') {
    switch (name) {
      case 'camera':
        return PERMISSIONS.IOS.CAMERA;
      case 'microphone':
        return PERMISSIONS.IOS.MICROPHONE;
      case 'photoLibrary':
        return PERMISSIONS.IOS.PHOTO_LIBRARY;
      case 'locationWhenInUse':
        return PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      case 'notifications':
        return undefined;
    }
  }

  switch (name) {
    case 'camera':
      return PERMISSIONS.ANDROID.CAMERA;
    case 'microphone':
      return PERMISSIONS.ANDROID.RECORD_AUDIO;
    case 'photoLibrary':
      // Android 13 split media access by type; older versions use the single
      // storage permission.
      return Number(Platform.Version) >= 33
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    case 'locationWhenInUse':
      return PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    case 'notifications':
      return undefined;
  }
};

const toStatus = (result: string): PermissionStatus => {
  switch (result) {
    case RESULTS.GRANTED:
      return 'granted';
    case RESULTS.DENIED:
      return 'denied';
    case RESULTS.BLOCKED:
      return 'blocked';
    case RESULTS.LIMITED:
      return 'limited';
    default:
      return 'unavailable';
  }
};

export const permissionsService: PermissionsService = {
  async check(name) {
    try {
      if (name === 'notifications') {
        const { status } = await checkNotifications();
        return toStatus(status);
      }

      const permission = resolve(name);

      if (permission == null) {
        return 'unavailable';
      }

      return toStatus(await check(permission));
    } catch (error) {
      // A permission check that throws must not take a screen down with it.
      // Unavailable is the safe answer: the feature stays hidden.
      logger.warn('Permission check failed', { name, error });
      return 'unavailable';
    }
  },

  async request(name) {
    try {
      if (name === 'notifications') {
        const { status } = await requestNotifications([
          'alert',
          'sound',
          'badge',
        ]);
        return toStatus(status);
      }

      const permission = resolve(name);

      if (permission == null) {
        return 'unavailable';
      }

      return toStatus(await request(permission));
    } catch (error) {
      logger.warn('Permission request failed', { name, error });
      return 'unavailable';
    }
  },

  async openSettings() {
    try {
      await openSettings();
    } catch (error) {
      logger.warn('Could not open settings', { error });
    }
  },
};
