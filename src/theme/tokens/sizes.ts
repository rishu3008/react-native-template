export const sizes = {
  /**
   * Minimum interactive target. 44dp is the smaller of the two platform
   * guidelines (iOS 44pt, Android 48dp) and is the floor every pressable in
   * this template must meet (AGENTS.md 28).
   */
  minTouchTarget: 44,

  control: {
    small: 32,
    medium: 44,
    large: 56,
  },

  icon: {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 32,
  },

  avatar: {
    small: 32,
    medium: 40,
    large: 56,
    xlarge: 80,
  },

  border: {
    hairline: 1,
    thick: 2,
  },
} as const;
