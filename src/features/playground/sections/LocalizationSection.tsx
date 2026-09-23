import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AppButton,
  AppText,
  Badge,
  Card,
  Chip,
  Divider,
  Row,
  Stack,
  useToast,
} from '@components';
import { changeLocale, directionFor, type SupportedLocale } from '@services';
import { formatDate, formatRelativeTime } from '@utils';

const LOCALES: readonly SupportedLocale[] = ['en', 'ar'];

/**
 * Localisation, end to end (brief section 28, AGENTS.md 29).
 *
 * Switching the locale here re-renders every `t()` call immediately. Layout
 * direction is different: React Native reads it when the view hierarchy is
 * created, so a change to RTL needs a restart. That is a platform constraint
 * rather than a bug, which is why changeLocale reports whether one is needed
 * instead of pretending it applied.
 */
export const LocalizationSection = () => {
  const { t, i18n } = useTranslation();
  const toast = useToast();

  const current = i18n.language as SupportedLocale;
  const now = Date.now();

  return (
    <Stack gap="lg">
      <AppText variant="heading3">Localisation</AppText>

      <Stack gap="sm">
        <Row gap="sm" wrap>
          {LOCALES.map(locale => (
            <Chip
              key={locale}
              label={locale === 'ar' ? 'العربية (ar)' : 'English (en)'}
              onPress={() => {
                changeLocale(locale)
                  .then(needsRestart => {
                    toast.show({
                      message: needsRestart
                        ? 'Restart required for right-to-left layout'
                        : `Switched to ${locale}`,
                      tone: needsRestart ? 'warning' : 'success',
                    });
                  })
                  .catch(() => undefined);
              }}
              selected={current === locale}
              testID={`locale-${locale}`}
            />
          ))}
        </Row>
        <Row gap="sm" wrap>
          <Badge label={`locale: ${current}`} tone="primary" />
          <Badge label={`text: ${directionFor(current)}`} />
          <Badge
            label={`layout: ${I18nManager.isRTL ? 'rtl' : 'ltr'}`}
            tone={
              directionFor(current) === (I18nManager.isRTL ? 'rtl' : 'ltr')
                ? 'success'
                : 'warning'
            }
          />
        </Row>
        <AppText color="secondary" variant="caption">
          When those last two disagree, the locale changed but the layout has
          not yet: React Native applies direction at startup.
        </AppText>
      </Stack>

      <Divider />

      <Card>
        <Stack gap="sm">
          <AppText color="secondary" variant="label">
            Translated strings
          </AppText>
          {(
            [
              'common.loading',
              'common.retry',
              'common.cancel',
              'common.offline',
              'auth.signIn',
              'auth.email',
              'errors.network',
            ] as const
          ).map(key => (
            <Row gap="md" justify="space-between" key={key}>
              <AppText color="secondary" variant="caption">
                {key}
              </AppText>
              <AppText style={{ flex: 1 }} variant="bodySmall">
                {t(key)}
              </AppText>
            </Row>
          ))}
        </Stack>
      </Card>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          Used in real components
        </AppText>
        <AppButton
          onPress={() => toast.show({ message: t('common.done') })}
          title={t('common.retry')}
          variant="outline"
        />
        <AppText color="secondary" variant="caption">
          The button label comes from the locale file, so switching above
          changes it without a reload.
        </AppText>
      </Stack>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          Locale-aware dates
        </AppText>
        <AppText color="secondary" variant="bodySmall">
          {formatDate(now, current)}
        </AppText>
        <AppText color="secondary" variant="bodySmall">
          {formatRelativeTime(now - 3 * 3600 * 1000, current, now)}
        </AppText>
        <AppText color="secondary" variant="caption">
          Intl formats these per locale, so Arabic renders its own numerals and
          month names without a date library.
        </AppText>
      </Stack>
    </Stack>
  );
};
