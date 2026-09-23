import { useState } from 'react';

import {
  AppButton,
  AppText,
  Badge,
  Card,
  Chip,
  ListItem,
  Row,
  Stack,
  useToast,
} from '@components';
import { appConfig } from '@constants';
import { useNetworkStatus } from '@hooks';
import {
  changeLocale,
  logger,
  permissionsService,
  type PermissionName,
  type PermissionStatus,
  type SupportedLocale,
} from '@services';
import { formatDateTime, formatRelativeTime } from '@utils';

const PERMISSIONS: readonly PermissionName[] = [
  'camera',
  'microphone',
  'photoLibrary',
  'locationWhenInUse',
  'notifications',
];

const LOCALES: readonly SupportedLocale[] = ['en', 'ar'];

const toneFor = (status: PermissionStatus) => {
  switch (status) {
    case 'granted':
      return 'success' as const;
    case 'blocked':
      return 'error' as const;
    case 'denied':
      return 'warning' as const;
    default:
      return 'neutral' as const;
  }
};

/**
 * The cross-cutting services, made visible (brief section 39).
 *
 * Environment, connectivity, permissions, localisation, logging and date
 * formatting all have no UI of their own, so without a surface like this the
 * only way to know they work is to read the code.
 */
export const PlatformSection = () => {
  const toast = useToast();
  const { isConnected, isInternetReachable, isOffline } = useNetworkStatus();
  const [statuses, setStatuses] = useState<
    Partial<Record<PermissionName, PermissionStatus>>
  >({});

  const checkAll = async () => {
    const entries = await Promise.all(
      PERMISSIONS.map(
        async name => [name, await permissionsService.check(name)] as const,
      ),
    );

    setStatuses(Object.fromEntries(entries));
  };

  const now = Date.now();

  return (
    <Stack gap="lg">
      <AppText variant="heading3">Platform services</AppText>

      <Card>
        <Stack gap="sm">
          <AppText variant="label">Environment</AppText>
          <Row gap="sm" wrap>
            <Badge label={appConfig.environment} tone="primary" />
            <Badge
              label={appConfig.useMockAuth ? 'mock auth' : 'live auth'}
              tone={appConfig.useMockAuth ? 'warning' : 'success'}
            />
          </Row>
          <AppText color="secondary" variant="caption">
            {appConfig.apiBaseUrl}
          </AppText>
        </Stack>
      </Card>

      <Card>
        <Stack gap="sm">
          <AppText variant="label">Connectivity</AppText>
          <Row gap="sm" wrap>
            <Badge
              label={isOffline ? 'offline' : 'online'}
              tone={isOffline ? 'error' : 'success'}
            />
            <Badge label={`connected: ${String(isConnected)}`} />
            <Badge label={`reachable: ${String(isInternetReachable)}`} />
          </Row>
          <AppText color="secondary" variant="caption">
            null means not yet known, which is not the same as offline.
          </AppText>
        </Stack>
      </Card>

      <Stack gap="sm">
        <AppText variant="label">Permissions</AppText>
        <AppButton
          onPress={() => {
            checkAll().catch(() => undefined);
          }}
          size="small"
          testID="check-permissions"
          title="Check all"
          variant="outline"
        />
        {PERMISSIONS.map(name => (
          <ListItem
            key={name}
            rightElement={
              <Badge
                label={statuses[name] ?? 'unchecked'}
                tone={statuses[name] ? toneFor(statuses[name]) : 'neutral'}
              />
            }
            title={name}
          />
        ))}
      </Stack>

      <Stack gap="sm">
        <AppText variant="label">Locale</AppText>
        <Row gap="sm" wrap>
          {LOCALES.map(locale => (
            <Chip
              key={locale}
              label={locale}
              onPress={() => {
                changeLocale(locale)
                  .then(needsRestart => {
                    toast.show({
                      message: needsRestart
                        ? 'Restart required to change layout direction'
                        : `Locale set to ${locale}`,
                      tone: needsRestart ? 'warning' : 'success',
                    });
                  })
                  .catch(() => undefined);
              }}
            />
          ))}
        </Row>
        <AppText color="secondary" variant="caption">
          Direction changes need a restart. React Native reads it when the view
          hierarchy is created.
        </AppText>
      </Stack>

      <Stack gap="sm">
        <AppText variant="label">Dates</AppText>
        <AppText color="secondary" variant="bodySmall">
          {formatDateTime(now)}
        </AppText>
        <AppText color="secondary" variant="bodySmall">
          {formatRelativeTime(now - 3 * 3600 * 1000, 'en', now)}
        </AppText>
      </Stack>

      <Stack gap="sm">
        <AppText variant="label">Logging</AppText>
        <AppButton
          onPress={() => {
            // The context is redacted before it reaches any transport.
            logger.info('playground log', {
              userId: 'user-1',
              password: 'hunter2',
            });
            toast.show({ message: 'Logged with the password redacted' });
          }}
          size="small"
          testID="emit-log"
          title="Log with a secret"
          variant="outline"
        />
      </Stack>
    </Stack>
  );
};
