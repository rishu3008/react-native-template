/**
 * Stacking order. Centralised so overlays cannot fight each other with
 * ad-hoc values scattered across features.
 */
export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 100,
  banner: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const;
