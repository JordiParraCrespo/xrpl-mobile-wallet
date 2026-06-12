// Profile screen theme tokens, lifted verbatim from PR_THEMES in the Drops
// design (profile/profile-app.jsx). The screen is "glass-on-gradient": white
// glass panels over the wallet gradient (dark) or ink-tinted glass over the
// light wash. Colours are explicit hex/rgba because the React Native glass and
// SVG layers can't read the design's CSS custom properties.
export type ProfileVariant = 'dark' | 'light';

export type ProfileTheme = {
  /** Primary text / icon colour. */
  fg: string;
  /** Secondary (value / handle) text. */
  dim: string;
  /** Faintest text (trailing chevron). */
  faint: string;
  /** Glass panel fill. */
  glassBg: string;
  /** Glass panel hairline border. */
  glassBorder: string;
  /** Row divider inside a panel. */
  divider: string;
  /** Leading icon disc background. */
  iconBg: string;
  /** Destructive (Sign out) tint. */
  danger: string;
  /** expo-blur intensity for the glass panels. */
  blur: number;
  /** expo-blur tint. */
  blurTint: 'light' | 'dark';
  /** Status-bar glyph colour for this variant. */
  statusBar: 'light' | 'dark';
};

export const PROFILE_THEME: Record<ProfileVariant, ProfileTheme> = {
  dark: {
    fg: '#ffffff',
    dim: 'rgba(255,255,255,0.62)',
    faint: 'rgba(255,255,255,0.45)',
    glassBg: 'rgba(255,255,255,0.10)',
    glassBorder: 'rgba(255,255,255,0.18)',
    divider: 'rgba(255,255,255,0.10)',
    iconBg: 'rgba(255,255,255,0.12)',
    danger: '#ff9b9b',
    blur: 22,
    blurTint: 'light',
    statusBar: 'light',
  },
  light: {
    fg: '#14161a',
    dim: '#6b7681',
    faint: '#8d969e',
    glassBg: 'rgba(255,255,255,0.70)',
    glassBorder: '#e3e4e8',
    divider: '#e3e4e8',
    iconBg: '#ebebf0',
    danger: '#e03131',
    blur: 22,
    blurTint: 'light',
    statusBar: 'dark',
  },
};

/** Brand indigo of the Upgrade pill (design default accent, brand-600). */
export const PROFILE_BRAND = '#5b41dd';
