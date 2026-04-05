# Minimum Profile Completeness Validation — Design

## Goal

Block export and BLE send when a loaded profile lacks the minimum points required for a roast: fewer than 3 temperature points, or fewer than 1 annotation airflow point.

## Context

`validateProfile()` in `AppController.tsx` already runs on every render and gates both export paths:

- BLE send: `canDirectBleSend = isValid` → `sendProfileDisabled`
- Open in App FAB: `openInAppDisabled = !canDirectBleSend && !canOpenInHome`

Validation errors already surface in `ProfileEditor` via the `validationErrors` prop. Adding minimum-count checks to `validateProfile()` requires no new plumbing — errors flow automatically to all existing gates and display.

## Changes

### `src/rules.ts`

Add two constants alongside their existing MAX counterparts:

```typescript
export const MIN_TEMP_POINTS = 3;
export const MIN_AIRFLOW_ANNOTATION_POINTS = 1;
```

`MIN_TEMP_POINTS = 3` pairs with `MAX_TEMP_POINTS = 7`.
`MIN_AIRFLOW_ANNOTATION_POINTS = 1` pairs with `MAX_AIRFLOW_POINTS = 3`. The value 1 reflects the display convention: 1 annotation (Start) + the always-derived Cooldown meta point = 2 visible rows, which is the agreed minimum.

### `src/AppController.tsx` — `validateProfile()`

Add two checks at the top of the function body, before the per-point range loops:

```typescript
if (cp.length < MIN_TEMP_POINTS)
    errs.push(`At least ${MIN_TEMP_POINTS} temperature points required`);
if (ap.length < MIN_AIRFLOW_ANNOTATION_POINTS)
    errs.push(`At least ${MIN_AIRFLOW_ANNOTATION_POINTS} airflow point required (plus Cooldown)`);
```

Both checks apply to `directValidationErrors` (BLE send gate) and `homeValidationErrors` (Open in App gate) since a profile missing minimum points is not roastable via either path.

## Scope

- No UI changes required — error display is already wired.
- No new files.
- Two new constants in `rules.ts`, two new checks in `validateProfile()`.
- Future minimum constraints (duration, profile name, etc.) follow the same pattern: constant in `rules.ts`, check in `validateProfile()`.
