import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

// Drops palette: ink ramp + indigo brand accent (see global.css).
const THEME = {
  light: {
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(220 13% 9%)',
    card: 'hsl(0 0% 100%)',
    primary: 'hsl(220 13% 9%)',
    destructive: 'hsl(0 73.8% 53.5%)',
    border: 'hsl(228 9.8% 90%)',
  },
  dark: {
    background: 'hsl(220 16.7% 7.1%)',
    foreground: 'hsl(240 10% 96.1%)',
    card: 'hsl(220 13% 9%)',
    primary: 'hsl(0 0% 100%)',
    destructive: 'hsl(358 85.1% 60.4%)',
    border: 'hsl(218 11.4% 13.7%)',
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
