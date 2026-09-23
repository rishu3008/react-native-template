# Working in this template

How the pieces fit together, and how to add new ones.

[AGENTS.md](../AGENTS.md) is the ruleset. This is the practical companion: it
answers "where does this go" rather than "why".

---

## 1. The mental model

Four layers. Things only ever depend **downward**.

```text
features/          business code: screens, feature hooks, feature APIs
    |
navigation/  components/  hooks/  store/
    |
services/          api, auth, storage, logging, permissions, i18n
    |
theme/  utils/  constants/  types/  assets/
```

**This is enforced by lint, not by convention.** A component importing a
feature, or a util importing navigation, fails `npm run lint`. If you hit
that error, the fix is almost never to weaken the rule -- it is that the
thing you are importing belongs one layer lower.

Two consequences that surprise people:

- **Components cannot reach services.** A reusable component that fetches, or
  writes storage, is no longer reusable. Pass data in, raise events out.
- **The theme layer cannot reach services.** That is why `ThemeProvider` lives
  in `app/providers` while the theme tokens and context live in `theme/`.

### Where state lives

| Kind of state              | Where                                                   |
| -------------------------- | ------------------------------------------------------- |
| One screen's state         | `useState` in the component                             |
| Server data                | React Query, via a hook in the feature                  |
| Session (signed in or not) | `useSession()` from `@store`                            |
| Theme                      | `useTheme()` from `@theme`                              |
| Anything persisted         | `storageService`, or `secureStorageService` for secrets |

There is no Redux. Server data belongs in React Query, and what is genuinely
global is small enough for context. If you later need real global client state
-- an offline queue, a multi-step wizard -- add a store then; nothing here has
to change.

---

## 2. Where does this go?

| You are adding                    | Put it in                                                          |
| --------------------------------- | ------------------------------------------------------------------ |
| A screen                          | `src/features/<feature>/screens/`                                  |
| A reusable component              | `src/components/common/` (or `primitives/`, `feedback/`, `forms/`) |
| A component only one feature uses | `src/features/<feature>/components/`                               |
| An API call                       | `src/features/<feature>/api/` as a repository                      |
| A hook wrapping that call         | `src/features/<feature>/hooks/`                                    |
| A hook any feature could use      | `src/hooks/`                                                       |
| Something talking to a vendor SDK | `src/services/<name>/`, behind an interface                        |
| A colour, spacing or type token   | `src/theme/tokens/`                                                |
| A constant                        | `src/constants/` -- focused modules, not one big file              |

---

## 3. Recipes

### Add a screen

```tsx
// src/features/profile/screens/ProfileScreen.tsx
import { AppScreen, AppText, Stack } from '@components';

export const ProfileScreen = () => (
  <AppScreen scrollable testID="profile-screen">
    <Stack gap="lg">
      <AppText variant="heading1">Profile</AppText>
    </Stack>
  </AppScreen>
);
```

Always start from `AppScreen`. It handles safe areas, keyboard avoidance,
scrolling and keyboard dismissal so you never do it per screen.

Then export it from `src/features/profile/index.ts` and add a route (below).

### Add a route

Two edits, both required, and TypeScript enforces the second.

```ts
// 1. src/navigation/types.ts
export type AppStackParamList = {
  Tabs: NavigatorScreenParams<AppTabParamList>;
  Details: { id: string };
  Profile: { userId: string }; // <- new
};
```

```tsx
// 2. src/navigation/AppNavigator.tsx
<Stack.Screen
  component={ProfileScreen}
  name="Profile"
  options={{ title: 'Profile' }}
/>
```

Now `navigation.navigate('Profile', { userId })` is typed everywhere, with no
generics at the call site.

**Pass ids, never objects.** Navigation state is serialised for deep links and
state restoration, so a whole record in a param becomes stale data that
survives a reload.

### Add a deep link

`src/navigation/linking/index.ts`, mirroring the navigator shape:

```ts
App: {
  screens: {
    Details: 'details/:id',
    Profile: 'profile/:userId',   // <- templateproject://profile/42
  },
},
```

Validate every incoming parameter before using it. A deep link is untrusted
input.

### Add an API call

Three files, following `Screen -> hook -> repository -> ApiClient`. Screens
never call `apiClient` directly.

```ts
// 1. src/features/profile/api/profileSchema.ts
export const profileSchema = z.object({ id: z.number(), name: z.string() });
export type Profile = z.infer<typeof profileSchema>;
```

```ts
// 2. src/features/profile/api/profileRepository.ts
export const profileRepository = {
  async byId(id: string, signal?: AbortSignal): Promise<Profile> {
    const response = await apiClient.get<unknown>(`/profiles/${id}`, {
      ...(signal != null && { signal }),
    });

    const result = profileSchema.safeParse(response);
    if (!result.success) throw AppError.from('parse', { cause: response });
    return result.data;
  },
};
```

```ts
// 3. src/features/profile/hooks/useProfile.ts
export const profileKeys = {
  all: ['profiles'] as const,
  detail: (id: string) => [...profileKeys.all, 'detail', id] as const,
};

export const useProfile = (id: string) =>
  useQuery({
    queryKey: profileKeys.detail(id),
    queryFn: ({ signal }) => profileRepository.byId(id, signal),
  });
```

**Validate the response.** TypeScript checks nothing at runtime. Without a
schema, a field the API renames arrives as `undefined` and fails somewhere far
from the request, usually as a render crash.

In the screen, render every state -- not just the happy one:

```tsx
const { data, isPending, isError, error, refetch } = useProfile(id);

if (isPending) return <Skeleton height={20} />;
if (isError)
  return (
    <ErrorState description={toAppError(error).message} onRetry={refetch} />
  );
```

### Add a colour

```bash
# 1. Add the raw value to src/theme/tokens/palette.ts, then:
npm run theme:add-color -- --role brandAccent --light palette.blue600 --dark palette.blue400
```

That wires it into `ThemeColors` and **both** themes. Use it as
`theme.colors.brandAccent`.

Never write a hex code in a component -- `react-native/no-color-literals` is
an error everywhere outside `src/theme`.

### Add an icon or image

```bash
# Drop the file in src/assets/icons (svg) or src/assets/images (png/jpg), then:
npm run assets
```

```tsx
import { StarIcon } from '@assets/icons';
import { images } from '@assets/images';

<AppIcon source={StarIcon} size="large" color={theme.colors.primary} />
<AppImage source={images.heroBanner} style={{ width: '100%', height: 160 }} />
```

Use `fill="currentColor"` in SVGs so `AppIcon`'s `color` drives them from the
theme. Icons are decorative by default; pass `accessibilityLabel` only when
the icon stands alone with no visible text beside it.

### Add a font

```bash
# Drop the .ttf in src/assets/fonts, then:
npm run fonts
```

Add it to `fontFamily` in `src/theme/tokens/typography.ts`, then **rebuild
both platforms** -- a font changes the native bundle, so a Metro reload will
not pick it up.

Each weight is a separate file and a separate family name. React Native does
not synthesise weights, which is why `AppText` takes `weight="semiBold"`
rather than a number.

### Add a permission

```ts
const status = await permissionsService.request('camera');

if (status === 'blocked') {
  await permissionsService.openSettings();
}
```

`blocked` is not `denied`. Denied can be asked again; blocked cannot and must
send the user to Settings. Treating them the same produces a button that
appears to do nothing.

For a **new** capability, add it to `PermissionName`, map it in
`permissionsService`, and update the two native lists: `setup_permissions` in
`ios/Podfile` and `uses-permission` in `AndroidManifest.xml`. A permission
missing from the Podfile list returns `unavailable` at runtime with no other
symptom.

### Add a translation

Add the key to `src/services/i18n/locales/en.ts`. TypeScript then requires it
in every other locale.

```tsx
const { t } = useTranslation();
<AppText>{t('common.retry')}</AppText>;
```

### Add an environment variable

Add it to all three `.env` files, to `NativeConfig` in `src/types/env.d.ts`,
and parse it in `src/constants/appConfig.ts`. Everything crosses the native
bridge as a string, which is why `appConfig` does the parsing and nothing else
reads `Config` directly.

Never put a secret there. Anything compiled into a mobile binary is
extractable.

### Run a different environment

```bash
npm run ios:dev       npm run android:dev
npm run ios:staging   npm run android:staging
npm run ios:prod      npm run android:prod
```

All three install as the same app, `com.templateproject`, so one replaces
another rather than sitting beside it. That is deliberate; the reasoning is in
the README. What it means day to day is that switching environments signs you
out: `tokenManager` records which environment the stored credentials belong to
and purges them when that changes, so a production token is never sent to the
staging API.

From the Xcode GUI, pick the scheme named after the environment:
`TemplateProject Dev`, `TemplateProject Staging` or `TemplateProject
Production`.

### Add a persisted value

```ts
// src/constants/storageKeys.ts
export const storageKeys = {
  themePreference: '@template/theme-preference',
  lastOpenedTab: '@template/last-opened-tab', // <- new
} as const;
```

`storageService` for preferences, `secureStorageService` for anything secret.
Tokens never go in AsyncStorage -- it is plain files on a rooted device.

### Show feedback

```tsx
const toast = useToast();
toast.show({ message: 'Saved', tone: 'success' });

<AppModal visible={isOpen} onClose={close} title="Confirm">...</AppModal>
<AppBottomSheet visible={isOpen} onClose={close} snapPoints={['40%']}>...</AppBottomSheet>
```

Both overlays are driven by `visible`. Do not reach for the underlying
library's imperative API.

### Add a feature

A feature is a folder, not a file. Give it only the parts it needs:

```text
src/features/orders/
├── api/            repositories and Zod schemas
├── components/     components only this feature uses
├── hooks/          React Query hooks and feature logic
├── screens/
├── types.ts
└── index.ts        the feature's public surface
```

Import across features through the barrel (`@features/orders`), never into
another feature's internals. `index.ts` is the contract; everything else is
private by convention and by the deep-import lint rule.

A component used by two features has outgrown the feature -- move it to
`src/components/`. One used by one feature should stay in it, however
reusable it looks.

### Add a mutation

Mutations are not retried automatically: a create that appears to fail may
have succeeded, and repeating it risks duplicates. That is configured once, in
the query client.

```ts
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => orderRepository.create(input),
    onSuccess: () => {
      // Invalidate by the key tree, not by a hand-written string: that is
      // what the keys object is for.
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
};
```

### Authenticated requests

There is nothing to do. `installAuthInterceptors` attaches the bearer token
and, on a 401, refreshes once and replays the request. Concurrent 401s
coalesce into a single refresh, because servers rotate refresh tokens and a
second concurrent refresh would send one the server has already invalidated.

Two flags exist for the exceptions:

```ts
apiClient.post('/auth/sign-in', credentials, { skipAuth: true });
apiClient.post('/analytics/event', payload, { skipRetry: true });
```

`skipAuth` on the sign-in and refresh calls is not optional -- attaching an
expired token to the request that renews it is how refresh loops start.

### Handle an error

Everything the API layer throws is an `AppError` with a `kind`, a message safe
to show, and the original failure kept as `cause` for logging only.

```ts
try {
  await orderRepository.create(input);
} catch (caught) {
  const error = toAppError(caught);

  if (error.kind === 'validation' && error.fieldErrors) {
    setFieldErrors(error.fieldErrors);
    return;
  }

  toast.show({ message: error.message, tone: 'error' });
  logger.error('Order creation failed', error, { input });
}
```

Never surface `caught.message` directly. Server messages leak implementation
detail and are not written for users -- which is why only validation failures
use them.

### Log something

```ts
logger.info('Checkout started', { orderId, total });
```

Context is **redacted before it reaches any transport**, so passing an object
that happens to contain a token or a password is safe. Keys matching
`password`, `token`, `authorization`, `card` and similar are replaced.

`console.log` is a lint error everywhere except the logger itself.

### Report a crash or an event

```ts
analytics.track({ name: 'checkout_started', properties: { method: 'card' } });
crashReporter.recordError(error, { screen: 'Checkout' });
```

No vendor is registered, so both route to the logger. Wiring is therefore
verifiable before an SDK exists. To plug one in, implement the interface and
register it in `bootstrap`:

```ts
crashReporter.configure(sentryReporter);
```

Application code never imports the SDK, so swapping vendors is one line.

### Navigate from outside a component

Notification handlers, deep-link routing and interceptors have no component to
call `useNavigation` from.

```ts
const delivered = dispatchWhenReady(action);
```

It returns `false` rather than silently dropping the intent when the container
is not mounted -- which is exactly the cold-start case for a tapped
notification. Queue and replay when it does.

### Use a translated string

```tsx
const { t } = useTranslation();
<AppText>{t('common.retry')}</AppText>;
```

Switching locale re-renders every `t()` immediately. **Layout direction does
not follow**: React Native reads it when the view hierarchy is created, so
switching to Arabic needs a restart. `changeLocale` returns whether one is
required rather than pretending it applied.

Write RTL-safe styles from the start: `marginStart` and `paddingEnd`, never
`marginLeft`. The one exception is safe-area insets, which describe physical
screen edges -- the notch stays on the physical left under RTL.

---

## 4. Things that will fight you

Each of these cost real debugging time while the template was built.

| Symptom                                                        | Cause                                                                                                                                          |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| A screen will not scroll                                       | `flex: 1` on a ScrollView's `contentContainerStyle` sizes content to the viewport so it can never overflow. Use `flexGrow: 1`.                 |
| "Unrecognized font" never appears, but the font is wrong       | iOS falls back silently. Verify by changing the family to something bogus and checking the render actually differs.                            |
| A native module is "not found" after adding a dependency       | The binary is stale. A Metro reload does not add native code -- rebuild and reinstall.                                                         |
| `TurboModuleRegistry ... could not be found` for a core module | Usually a poisoned Metro cache, not configuration. `watchman watch-del-all` then `npm start`.                                                  |
| A bottom sheet opens once and never again                      | The adapter's state drifted from the library's. Already handled -- but the same trap exists in any declarative wrapper over an imperative API. |
| An import "typechecks but crashes at runtime"                  | A path alias added to `tsconfig.json` only. All three places must agree: tsconfig, `babel.config.js`, `jest.config.js`.                        |

---

## 5. Before you commit

```bash
npm run validate       # typecheck, lint, tests
```

Native changes need the matching platform build as well. Commits use
conventional format and are checked by commitlint; the pre-commit hook runs
lint-staged only, so `validate` is on you.

And the rule that matters most: **run it**. A passing test suite is not a
working screen. Every UI bug found while building this template passed its
tests first.

---

## 6. The playground

`src/features/playground/` is the template's own visual surface. It renders
every component, every state and every service that has no UI of its own --
typography and the four Inter weights, the layout primitives, buttons, inputs,
selection controls, overlays, loading and empty and error states, the data
layer end to end, images and icons, surfaces, lists, the error boundary,
upload progress, the vendor adapters, localisation, permissions, connectivity
and the colour palette.

It is the fastest way to see what exists before building anything, and the
fastest way to check a change to a shared component did not break something
else.

It is also the first thing to delete. It is excluded from coverage for that
reason: it is a visual surface rather than logic, and measuring long stretches
of demo JSX would drag the threshold down until it stopped protecting the code
that matters.
