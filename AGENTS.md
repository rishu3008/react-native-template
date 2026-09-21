# AGENTS.md

# Production React Native Template — Engineering Rules

This repository is a reusable, production-grade React Native starter template.

The goal is to provide a stable engineering foundation for multiple future applications. Code must be written as if this repository will be used by a team maintaining applications with millions of users.

The template must remain:

- Production-ready
- Maintainable
- Testable
- Accessible
- Performant
- Upgradeable
- Vendor-independent where practical
- Easy to generate into a new project
- Easy to understand for a new developer
- Safe for long-term React Native upgrades

> **Status note.** Several rules below describe the intended end state and are not yet
> true of this repository. Rules 41 (strict TS), 46 (path aliases), 53 (`typecheck`
> script) and 54 (CI) become true in Phase 1. Until then, treat them as the target,
> not as a description of the current code.

---

## 1. Engineering Mindset

Think like a senior mobile engineer.

Prioritize:

1. Correctness
2. Maintainability
3. Reliability
4. Performance
5. Security
6. Testability
7. Developer experience
8. Feature velocity

Prefer boring, explicit, predictable code over clever code.

---

## 2. Scope of This Repository

The template must contain:

- React Native foundation
- TypeScript
- Application architecture
- Design system foundation
- Theme system
- Navigation foundation
- API architecture
- Storage abstraction
- Authentication/session foundation
- Error handling
- Logging
- Common UI
- Testing infrastructure
- CI
- Project generation support
- Documentation

The template must NOT contain:

- Business-specific features
- Client-specific API models
- Client-specific branding
- Client-specific screens
- Client-specific business rules
- Unnecessary third-party integrations

---

## 3. React Native Version Policy

- Never use an unpinned React Native version in the template.
- Record the supported React Native version in template metadata.
- Upgrade React Native deliberately, never automatically.
- Every RN upgrade must include Android and iOS verification.
- Review release notes and migration requirements before upgrading.
- Verify third-party native dependencies after every RN upgrade.
- Never change native files just to silence a build error without understanding the cause.

Every template release must have an identifiable version.

Example:

```text
Template 1.0.0 → React Native X.Y
Template 1.1.0 → React Native X.Z
```

### 3.1 Pinning policy (applies to all dependencies, not just RN)

A template is only reproducible if two developers generating from the same template
version resolve the same dependency tree.

- **Exact pins (no range) for every package containing native code.** A caret range on
  a native module means an unreviewed native upgrade can enter a generated project
  without anyone running an Android or iOS build.
- **Caret ranges are acceptable for pure-JS development tooling** (types, eslint
  plugins, jest helpers) where the blast radius is a failed CI run, not a broken build.
- **`package-lock.json` is committed and authoritative.** Never delete and regenerate it
  to resolve a conflict; resolve the conflict.

### 3.2 Automated dependency bots

Rule 3 says RN is never upgraded automatically. Bots do not read this file, so the
constraint must be configured:

- Renovate/Dependabot must be configured to **ignore** `react-native`, `react`, and every
  package with native code.
- Those upgrades happen only through the Rule 58 process, on a dedicated branch.

---

## 4. Dependency Rules

Every dependency is a maintenance cost.

Before adding one, ask:

- Is it genuinely required?
- Does React Native already provide the capability?
- Is it actively maintained?
- Does it support the current architecture?
- Does it add native Android/iOS code?
- Does it increase build or upgrade risk?
- Can a small abstraction solve the problem?

Do not add a dependency only because it is popular.

Do not add project-specific dependencies to the core template.

After adding a dependency:

- typecheck
- lint
- test
- Android build
- iOS build
- verify architecture compatibility
- verify 16 KB page-size compatibility if it ships native code (see Rule 34)

---

## 5. Architecture Rules

Use feature-based architecture for business functionality.

Preferred:

```text
src/features/
  auth/
  profile/
  home/
  settings/
```

A feature may contain:

```text
components/
hooks/
screens/
services/
store/
types/
utils/
```

Reusable infrastructure belongs outside features:

```text
src/components/
src/theme/
src/navigation/
src/services/
src/hooks/
```

---

## 6. Dependency Direction

Reusable layers must not depend on business features.

Correct:

```text
feature
  ↓
common component / hook / service
```

Incorrect:

```text
common component
  ↓
feature
```

Rules:

- Components must not import feature-specific business logic.
- Generic services must not depend on screens.
- Theme must not depend on features.
- UI primitives must not depend on API services.
- Utilities must not depend on navigation.
- Avoid circular dependencies.

> This is the single most important rule in this document, and the one most likely to
> erode silently. It is enforced mechanically — see Rule 68.

---

## 7. Component Rules

Reusable components must have:

- Clear responsibility
- Typed props
- Predictable behavior
- Accessibility support
- Theme compatibility
- Sensible defaults
- Minimal internal state
- Tests for non-trivial behavior

Common components must not contain business-specific logic.

---

## 8. UI Component Hierarchy

Maintain three layers.

### 8.1 Naming rule

> **Prefix a component with `App` only where the bare name would shadow a React Native
> export.** Everything else is unprefixed.

Names that require the prefix because React Native exports them:

```text
Text  Button  Image  Modal  Switch  Pressable  ScrollView  FlatList  View
```

Names that do not collide keep their plain form. The prefix exists to prevent import
ambiguity, not as decoration — applying it to a name that collides with nothing adds
noise, and omitting it on a name that does collide causes the exact bug the convention
was invented to prevent.

### Primitives

```text
Box
Row
Stack
Spacer
AppPressable
Divider
```

### Common Components

```text
AppText
AppButton
AppInput
AppImage
AppIcon
Card
Avatar
Badge
Chip
```

### Complex Components

```text
AppModal
AppBottomSheet
DatePicker
SearchInput
InfiniteList
```

Do not contaminate primitives with business behavior.

---

## 9. Design System

All reusable UI must consume design tokens.

Tokens should cover:

```text
Colors
Typography
Spacing
Radius
Shadows
Sizes
Elevation
Breakpoints
```

Avoid hardcoded visual values when an appropriate design token exists.

Prefer:

```tsx
theme.colors.text.primary
theme.spacing.md
theme.radius.md
```

Do not create arbitrary tokens for one-off values without justification.

---

## 10. Theme Rules

Support:

```text
system
light
dark
```

Theme logic must be centralized.

Use semantic tokens such as:

```text
text.primary
text.secondary
surface
background
border
primary
error
success
warning
```

Never duplicate dark-mode detection across components.

Theme changes must not require rewriting screens.

---

## 11. Typography Rules

Use typography variants:

```text
display
heading1
heading2
heading3
body
bodySmall
caption
label
button
```

Do not repeatedly define font sizes, weights and line heights when an existing design-system role is appropriate.

---

## 12. Spacing Rules

Use spacing tokens.

Avoid arbitrary values throughout the app unless required by a specific visual constraint.

---

## 13. Screen Rules

Screens are responsible for composition and orchestration.

Screens should not contain:

- duplicated API implementations
- vendor-specific storage calls
- reusable complex UI
- giant validation engines
- duplicated permission logic
- unnecessary business logic

Move reusable logic into hooks, services and components.

---

## 14. Business Logic

Business logic must not live inside generic UI components.

Preferred:

```text
Screen
  ↓
Hook
  ↓
Service / Repository
```

Components answer:

> How should the UI behave?

Services answer:

> How should the business operation execute?

Repositories answer:

> Where does the data come from?

---

## 15. API / Networking

Screens must never call raw HTTP clients.

Do not write HTTP calls directly inside screens/components.

Preferred:

```text
Feature
  ↓
Hook
  ↓
Service / Repository
  ↓
ApiClient
  ↓
HTTP
```

The API layer owns:

- base URL
- request configuration
- authentication headers
- interceptors
- timeout behavior
- retries where appropriate
- response normalization
- error normalization
- logging

---

## 16. API Response Validation

TypeScript types do not validate runtime API data.

For external/untrusted responses:

- validate when necessary
- normalize data
- handle missing fields
- handle unexpected values
- prevent malformed data from crashing the UI

Do not blindly cast API responses.

---

## 17. Server State vs Global State

Separate server state from client state.

Server state includes:

```text
API responses
remote resources
paginated data
cached backend data
```

Use a dedicated query/cache strategy.

Do not place every API response into global state.

Global state should contain only genuinely global client state.

---

## 18. Storage

Separate:

```text
normal storage
secure storage
```

Normal storage:

```text
preferences
theme mode
onboarding state
```

Secure storage:

```text
access token
refresh token
sensitive credentials
```

Centralize storage keys.

Application code should use storage abstractions rather than vendor APIs directly.

---

## 19. Authentication

Authentication must have a single owner.

Session flow should support:

```text
bootstrap
restore session
validate session
refresh session
authenticated
unauthenticated
logout
```

Token lifecycle behavior must be centralized.

---

## 20. Error Handling

Errors are normal application states.

Conceptually distinguish:

```text
validation
authentication
authorization
network
server
not found
timeout
unknown
```

Do not silently swallow errors.

Never expose raw technical errors to users.

---

## 21. Loading / Empty / Error States

Every asynchronous feature should define:

```text
loading
success
empty
error
retry
refreshing
pagination
offline
```

Avoid blank screens caused by missing failure states.

---

## 22. Logging

Use a centralized logger:

```text
logger.debug()
logger.info()
logger.warn()
logger.error()
```

Avoid uncontrolled `console.log()`.

Production logs must not contain:

- passwords
- tokens
- secrets
- sensitive personal information
- payment information

### 22.1 Crash symbolication

A production stack trace from a Hermes bundle is unreadable without its source map.
Release builds must emit source maps, and the release process must retain or upload
them for the build being shipped. A crash reporter without symbolication is a crash
reporter that tells you nothing.

---

## 23. Security

Never commit:

- API secrets
- private keys
- certificates
- passwords
- service credentials
- production tokens

Treat anything embedded in a mobile app as potentially extractable.

Validate and sanitize untrusted input.

Do not trust external deep-link parameters.

---

## 24. Environment Management

Support:

```text
development
staging
production
```

Centralize environment-specific configuration.

Do not scatter environment checks or API URLs across features.

Never hardcode production/staging endpoints in screens.

---

## 25. Navigation

Centralize navigation.

Use:

```text
RootNavigator
AuthNavigator
AppNavigator
```

where appropriate.

Navigation params must be strongly typed.

Avoid passing large objects through navigation when an ID is enough.

---

## 26. Deep Linking

Deep links must enter through a defined linking layer.

Support where appropriate:

```text
custom URL schemes
Android App Links
iOS Universal Links
push notification navigation
share links
email links
```

Validate all deep-link parameters.

Handle cold, warm and background entry paths where supported.

---

## 27. Permissions

Centralize platform permissions:

```text
services/permissions/
├── camera.ts
├── location.ts
├── notifications.ts
├── photos.ts
└── index.ts
```

Do not duplicate platform-specific permission logic throughout screens.

---

## 28. Accessibility

Accessibility is part of implementation.

Interactive components should define:

```text
accessibilityRole
accessibilityLabel
accessibilityHint
accessibilityState
```

Pay special attention to:

```text
Button
IconButton
Input
Checkbox
Radio
Switch
Modal
BottomSheet
```

Do not use color alone to communicate state.

---

## 29. RTL

Prefer:

```text
marginStart
marginEnd
paddingStart
paddingEnd
```

over unnecessary left/right hardcoding.

RTL must be considered for directional UI components.

---

## 30. Performance

Performance is a product requirement.

Avoid:

- unnecessary re-renders
- unnecessary global state updates
- expensive calculations during render
- unnecessary API calls
- unbounded lists
- oversized images
- heavy JS-thread work
- unnecessary native communication

For large lists:

- use virtualization
- use stable keys
- keep item components lightweight
- handle pagination intentionally

Do not add memoization everywhere without a reason.

Measure before significant optimization.

### 30.1 List primitive

The template standardizes on **one** list primitive so that feature code does not mix
approaches. The choice is recorded in `docs/decisions/` with its rationale. Do not
introduce a second virtualization library without revisiting that decision.

---

## 31. Images

Images must consider:

```text
size
resolution
memory
caching
loading
placeholder
error
```

Do not load unnecessarily large media.

---

## 32. Animation

Animations must not compromise interaction or accessibility.

Prefer modern animation solutions that are compatible with the current React Native architecture.

Avoid high-frequency JS-thread animation when an appropriate native/worklet approach exists.

---

## 33. Native Code

Android and iOS code are production code.

Before changing native configuration:

1. Identify the real problem.
2. Check compatibility.
3. Understand the change.
4. Document non-obvious behavior.

Keep native customizations minimal.

---

## 34. Android

Track the compatibility relationship between:

```text
React Native
Node
Java
Kotlin
Gradle
AGP
compileSdk
targetSdk
minSdk
Build Tools
NDK
```

Do not independently upgrade native tooling without checking compatibility.

Verify relevant modern Android behavior:

```text
edge-to-edge
permissions
large screens
background restrictions
16 KB page-size compatibility
```

Review all native third-party dependencies for compatibility.

> 16 KB page-size compatibility must be evaluated for **every** native third-party
> dependency, not only for React Native itself. Evaluate it when the dependency is
> added, not at release time.

---

## 35. iOS

Track:

```text
Xcode
iOS deployment target
Swift/native dependencies
CocoaPods
build configurations
```

Avoid unnecessary native dependencies.

All permissions in Info.plist must have a legitimate product reason and correct purpose description.

---

## 36. Safe Area

Centralize safe-area handling.

The shared screen/layout abstraction must handle:

```text
status bar
notches
home indicator
edge-to-edge
portrait
landscape
```

Avoid scattering safe-area calculations across screens.

---

## 37. Forms

Validation belongs in the form/validation layer.

Forms must support:

```text
loading
error
disabled
accessibility
keyboard configuration
```

Do not duplicate validation logic across components.

---

## 38. Async Code

Every async operation should consider:

```text
loading
success
error
cancellation
unmount lifecycle
race conditions
duplicate requests
```

Do not create uncontrolled repeated requests.

Do not suppress hook dependency warnings without understanding the lifecycle.

---

## 39. React Hooks

Hooks must have focused responsibilities.

Do not create giant hooks that handle:

```text
API
navigation
analytics
storage
permissions
state
UI
```

all at once unless those behaviors are genuinely one cohesive workflow.

---

## 40. useEffect

Do not use `useEffect` merely for derived values.

Use effects for synchronization with external systems such as:

```text
subscriptions
timers
native/platform state
network side effects
external services
```

Avoid duplicated state created solely through effects.

---

## 41. TypeScript

Use strict TypeScript.

Avoid `any`.

Prefer `unknown` for genuinely unknown input.

Do not use type assertions to hide incorrect data.

Use runtime validation when necessary.

---

## 42. Naming

Names must communicate intent.

Prefer:

```text
userProfile
isAuthenticated
selectedCategory
paymentStatus
```

Boolean names should use:

```text
is...
has...
can...
should...
```

Avoid meaningless names such as:

```text
data
obj
tmp
res
item2
flag
```

when better names are available.

---

## 43. File Size

Large files are a warning sign.

Extract by responsibility:

```text
components
hooks
services
utilities
```

Do not split into meaningless micro-files merely to reduce line count.

---

## 44. Utilities

Avoid giant utility files.

Prefer focused modules:

```text
date.ts
number.ts
string.ts
validation.ts
url.ts
platform.ts
error.ts
```

Feature-specific utilities belong inside the owning feature.

---

## 45. Constants

Avoid one giant global constants file.

Use focused constant modules:

```text
storageKeys
apiConstants
navigationConstants
validationConstants
```

Business constants should remain close to the business feature that owns them.

---

## 46. Imports

Use configured absolute/path aliases consistently.

Avoid very deep relative imports.

Do not bypass module boundaries through internal/private paths.

Avoid barrel exports that create circular dependencies.

> Path aliases must be configured in **three** places that agree: `tsconfig.json`
> `paths`, the Babel module resolver, and the Metro resolver. Configuring only the
> TypeScript half produces code that typechecks and then fails at runtime.

---

## 47. Comments

Comments should explain:

- why something exists
- non-obvious technical decisions
- compatibility workarounds
- platform-specific behavior
- constraints

Do not comment obvious code.

---

## 48. Vendor Abstraction

Where practical, keep application code vendor-independent.

Examples:

```text
HTTP library
    ↓
ApiClient

Storage library
    ↓
StorageService

Bottom-sheet library
    ↓
AppBottomSheet

Analytics SDK
    ↓
AnalyticsService

Notification SDK
    ↓
NotificationService
```

> **Precedence over Rule 60.** Vendor boundaries are abstracted on principle, before a
> second consumer exists. The justification is replaceability and upgrade risk, not
> reuse. Rule 60 does not apply here.

---

## 49. Testing

Prioritize tests for:

```text
business logic
services
hooks
validation
state transitions
critical UI behavior
```

Prefer behavior-focused tests over implementation-detail tests.

Coverage thresholds are enforced in CI. Thresholds ratchet upward and are never lowered
to make a build pass; if a change cannot meet the threshold, it needs tests, not a
smaller threshold.

---

## 50. Pull Requests

Every PR should be:

- focused
- reviewable
- explainable
- tested

Avoid mixing feature development, large refactors and dependency upgrades unless necessary.

PRs should explain:

```text
What changed?
Why?
How was it tested?
Any risks?
Any native changes?
```

---

## 51. Code Review

Review for:

- correctness
- architecture
- maintainability
- performance
- security
- testing
- upgradeability

Do not approve code only because it works on today's happy path.

---

## 52. Git

Prefer meaningful commits:

```text
feat: add reusable AppInput component
fix: prevent duplicate profile requests
refactor: isolate authentication session handling
chore: upgrade React Native compatibility
```

Never commit secrets or machine-specific artifacts.

---

## 53. Validation

Before completing work, run relevant checks:

```bash
npm run typecheck
npm run lint
npm test
```

or the combined `npm run validate`.

Native changes must include relevant Android/iOS verification.

Never claim a check passed unless it actually passed.

---

## 54. CI

CI should validate:

```text
install
typecheck
lint
tests
Android build
iOS build
template packaging
generated-project creation
generated-project validation
```

Do not merge known broken builds into the stable template branch.

CI is split by cost so that pull-request feedback stays fast:

| Trigger | Runs |
|---|---|
| Every PR | install, typecheck, lint, tests, Android debug build |
| Merge to `main` | the above, plus iOS build |
| Nightly / release tag | the above, plus generated-project creation and validation |

---

## 55. Template Generation

A generated project must:

- receive the requested project name
- receive correct native identifiers
- contain no accidental template-only references
- **contain no template git history** — a generated project starts at its own initial commit
- install successfully
- pass TypeScript
- pass lint
- pass tests
- build successfully

Always test template generation before release.

---

## 56. Project Naming

`TemplateProject` is a placeholder.

Do not write code that assumes the real application will always be called `TemplateProject`.

Project-specific identities are generated from template configuration:

```text
display name
package name
applicationId
namespace
bundle identifier
scheme
URL scheme
```

### 56.1 The canonical placeholder identity

| Field | Placeholder value |
|---|---|
| Project name / Xcode target / scheme | `TemplateProject` |
| Display name | `TemplateProject` |
| Android namespace | `com.templateproject` |
| Android applicationId | `com.templateproject` |
| iOS bundle identifier | `com.templateproject` |
| URL scheme | `templateproject` |

Two constraints on this choice, both deliberate:

- **The placeholder must not be a common substring.** `Template` alone is unusable as a
  rename token: it collides with `@babel/template`, `@babel/plugin-transform-template-literals`,
  `templateFileName`, and the "generated from the Groovy template" comment in `gradlew`.
  A rename that matched those would corrupt the lockfile and the Gradle wrapper.
  `TemplateProject` appears nowhere incidentally, which makes the rename both
  scriptable and verifiable.
- **One placeholder token, not two.** The Android namespace and the iOS bundle
  identifier are deliberately identical, so the rename substitutes one string in two
  places rather than composing an identifier from separate company and project tokens.

Renaming is not search-and-replace. `scripts/rename.js` owns the full surface: string
occurrences, the Kotlin package directory, the iOS project/workspace/scheme/target
directories, and `Info.plist`.

---

## 57. Release Rules

A template release is a product release.

Before releasing, verify:

```text
template version
React Native version
dependency versions
Android configuration
iOS configuration
documentation
tests
CI
generated project
LICENSE present
```

Never overwrite an existing release. Publish a new version.

### 57.1 Branch strategy

`main` contains released code only.

Development happens on `develop` and feature branches; `main` is fast-forwarded and
tagged at release time. This exists because consumers generate projects from the tip of
`main` — if `main` carried unreleased work, every generated project would be an
unreproducible snapshot, defeating the versioning policy in Rule 3.

Older template versions remain available as tags.

---

## 58. React Native Upgrade Process

Every RN upgrade must use a dedicated branch.

Process:

```text
new RN release
    ↓
review release notes
    ↓
review migration changes
    ↓
create upgrade branch
    ↓
update native files
    ↓
update dependencies
    ↓
fix incompatibilities
    ↓
run tests
    ↓
Android build
    ↓
iOS build
    ↓
generated template test
    ↓
release
```

---

## 59. Shared Component Changes

Treat changes to shared components as high-impact changes.

Before changing:

```text
AppButton
AppText
AppInput
AppModal
AppBottomSheet
AppScreen
```

check existing usage.

Prefer backwards-compatible additions.

---

## 60. Avoid Premature Abstraction

Do not create abstractions merely because two files look similar.

Abstract when:

- behavior is genuinely shared
- ownership is clear
- reuse is likely
- complexity is reduced

Avoid generic components with dozens of props.

> **Exception: Rule 48.** Vendor boundaries are abstracted before a second consumer
> exists. This template deliberately ships adapters with one implementation each,
> because the justification there is replaceability, not reuse.

---

## 61. Avoid God Objects

Do not create:

```text
AppManager
CommonService
GlobalHelper
Utils
```

that own unrelated responsibilities.

Prefer focused services.

---

## 62. Avoid God Hooks

Do not create a hook that owns unrelated responsibilities.

Split logic by responsibility.

---

## 63. Avoid Magic Behavior

Reusable components should not secretly:

- make network calls
- navigate
- mutate global state
- write storage
- trigger analytics

unless explicitly designed to do so.

Prefer explicit inputs and outputs.

---

## 64. Maintainability

Ask before merging:

> Would another senior developer understand why this exists without asking the original author?

If not:

- simplify
- rename
- document
- improve the boundary

---

## 65. Production Readiness

A feature is not complete when only the happy path works.

Where relevant, consider:

```text
loading
empty
error
retry
offline
slow network
duplicate action
background/foreground
app restart
invalid input
missing server data
permission denial
unauthorized user
accessibility
dark mode
RTL
small screen
large screen
```

---

## 66. Final Decision Rule

When multiple technically valid solutions exist, prefer the solution with:

1. Fewer long-term dependencies.
2. Clearer ownership.
3. Lower native upgrade risk.
4. Easier testing.
5. Easier replacement.
6. Easier onboarding.
7. Better long-term scalability.

Do not choose only what is fastest to implement today.

---

## 67. Definition of Done (per change)

```text
[ ] Correct implementation
[ ] Correct architecture
[ ] TypeScript passes
[ ] Lint passes
[ ] Tests pass
[ ] Relevant native build passes
[ ] Error states considered
[ ] Loading states considered
[ ] Accessibility considered
[ ] Theme considered
[ ] Performance considered
[ ] Security considered
[ ] Documentation updated when needed
[ ] No unnecessary dependency added
[ ] No unrelated changes introduced
```

This is the per-change bar. The per-release bar is Rule 57.

---

## 68. Enforcement

A rule that is not mechanically checked decays. Prose in this file is the intent;
the table below is what actually holds the line.

| Rule | Check | Status |
|---|---|---|
| 6 — dependency direction | `eslint-plugin-boundaries` / `import/no-restricted-paths` | Phase 1 |
| 9 — no hardcoded visual values | `react-native/no-color-literals`, `no-inline-styles` | Phase 2 |
| 22 — no uncontrolled `console.log` | `no-console` | Phase 1 |
| 23 — no committed secrets | `gitleaks` in CI | Phase 7 |
| 41 — strict TS, avoid `any` | `strict: true`, `@typescript-eslint/no-explicit-any` | Phase 1 |
| 43 — file size | `max-lines` (warning, not error) | Phase 1 |
| 46 — no deep relative imports | `import/no-relative-parent-imports` | Phase 1 |
| 49 — coverage | Jest `coverageThreshold` | Phase 7 |
| 52 — commit format | `commitlint` + Husky | Phase 1 |
| 53 — validation before completion | `npm run validate` + pre-commit hook | Phase 1 |
| 54 — CI | GitHub Actions | Phase 1, expanded Phase 7 |
| 55 — generated project builds | CI generated-project job | Phase 8 |

Rules not in this table are reviewer-enforced and rely on Rule 51. That is a known
limitation, not an oversight: the list above should grow over time, and a rule that
proves hard to follow is a candidate for automation rather than repetition.

---

## 69. Distribution and Repository Layout

Decisions of record. Revisit deliberately, not incidentally.

**The application lives at the repository root.** There is no `template/` subdirectory.
Nesting the app would complicate every Metro, Gradle and Xcode path during development
in exchange for a packaging format this template does not use.

**v1.0 is distributed as a GitHub template repository plus `scripts/rename.js`.**
"Use this template" copies files without git history, which satisfies Rule 55's
no-inherited-history requirement mechanically rather than by convention. Combined with
Rule 57.1's branch strategy, consumers always receive the latest released state.

**v1.1 adds a `create-rn-app` CLI** wrapping the same rename script, providing
`npx create-rn-app MyApp` with interactive prompts for project name, bundle identifier,
package manager and environment.

**The React Native CLI `--template` package format is not used.** It works, but it is
the most expensive route to the same outcome: it requires the nested layout, an npm
publish for every iteration, and a dependency on community CLI internals, while its
built-in rename support handles only the project name — not the bundle identifier, URL
scheme, display name, or the Kotlin package directory. The rename script has to exist
either way, so it is the product; the rest is delivery.

---

# Core Principle

This template is infrastructure.

Every decision here will be copied into future applications.

Therefore:

> Optimize the template for long-term correctness, maintainability and upgradeability rather than short-term development speed.

The template should provide approximately:

```text
90% engineering foundation
0% business logic
```

A future application should primarily add:

```text
src/features/
```

rather than rebuilding the platform foundation.
