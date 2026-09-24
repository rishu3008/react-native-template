# Contributing

Read [AGENTS.md](./AGENTS.md) first. It is the architecture ruleset this
template is built under, and it is not optional -- most review comments would
otherwise be quoting it back.

## Before opening a pull request

```bash
npm run validate     # typecheck, lint, tests
npm run test:coverage
```

Native changes need the matching platform build, not just the gate (rule 53).

Coverage thresholds ratchet upward and are never lowered to make a build pass
(rule 49). If a change cannot meet them, it needs tests.

## Commits

Conventional commits, enforced by commitlint:

```text
feat: add reusable AppInput component
fix: prevent duplicate profile requests
refactor: isolate authentication session handling
```

## What a pull request should answer

What changed, why, how it was tested, any risks, and any native changes
(rule 50). Keep them focused: mixing a feature, a refactor and a dependency
bump makes all three harder to review and impossible to revert cleanly.

## Adding a dependency

Rule 4 is the bar. Every dependency is a maintenance cost, and a native one is
an upgrade risk for every project generated from this template. A pull request
adding one should say why React Native cannot do it, whether the package is
actively maintained, whether it supports the New Architecture, and -- if it
ships native code -- the result of the 16 KB page-size check.

## Verifying your own work

Rule 70 applies to contributors as much as to maintainers. A passing test
suite is not a working screen: run UI changes on a device before calling them
done, and when you add a test for a bug, watch it fail against the broken code
first.
