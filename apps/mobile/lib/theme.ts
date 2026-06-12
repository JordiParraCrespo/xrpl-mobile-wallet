import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";

// Drops palette: ink ramp + indigo brand accent (see global.css).
const THEME = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(220 13% 9%)",
    card: "hsl(0 0% 100%)",
    primary: "hsl(220 13% 9%)",
    destructive: "hsl(0 73.8% 53.5%)",
    border: "hsl(228 9.8% 90%)",
  },
  dark: {
    background: "hsl(220 16.7% 7.1%)",
    foreground: "hsl(240 10% 96.1%)",
    card: "hsl(220 13% 9%)",
    primary: "hsl(0 0% 100%)",
    destructive: "hsl(358 85.1% 60.4%)",
    border: "hsl(218 11.4% 13.7%)",
  },
};

export const NAV_THEME: Record<"light" | "dark", Theme> = {
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

// Drops design tokens as NativeWind CSS-variable maps — fed to `vars()` so a
// subtree resolves `hsl(var(--token))` utilities. Applied at the app root, and
// reused to pin an always-dark surface (e.g. the gradient Home). Keep in sync
// with global.css.
export const lightVars = {
  "--background": "0 0% 100%",
  "--foreground": "220 13% 9%",
  "--card": "0 0% 100%",
  "--card-foreground": "220 13% 9%",
  "--popover": "0 0% 100%",
  "--popover-foreground": "220 13% 9%",
  "--primary": "220 13% 9%",
  "--primary-foreground": "0 0% 100%",
  "--secondary": "240 14.3% 93.1%",
  "--secondary-foreground": "220 13% 9%",
  "--muted": "240 10% 96.1%",
  "--muted-foreground": "210 9.3% 46.3%",
  "--accent": "240 14.3% 93.1%",
  "--accent-foreground": "220 13% 9%",
  "--destructive": "0 73.8% 53.5%",
  "--destructive-foreground": "0 0% 100%",
  "--destructive-soft": "0 81% 95.9%",
  "--destructive-soft-foreground": "0 65.4% 47.6%",
  "--border": "228 9.8% 90%",
  "--input": "228 9.8% 90%",
  "--ring": "250 69.6% 56.1%",
  "--radius": "1.25rem",
  "--brand": "250 69.6% 56.1%",
  "--brand-foreground": "0 0% 100%",
  "--brand-soft": "245 86.7% 97.1%",
  "--brand-soft-foreground": "250 57% 46.5%",
  "--positive": "162 82.2% 39.6%",
  "--positive-foreground": "0 0% 100%",
  "--positive-soft": "155 51.5% 93.5%",
  "--positive-soft-foreground": "162 88.4% 30.4%",
  "--warning": "39 100% 48%",
  "--warning-foreground": "0 0% 100%",
  "--warning-soft": "37 100% 94.3%",
  "--warning-soft-foreground": "34 91.7% 47.5%",
  "--info": "217 89.9% 61%",
  "--info-foreground": "0 0% 100%",
  "--info-soft": "215 100% 95.3%",
  "--info-soft-foreground": "218 74.1% 53.1%",
  "--inverse": "220 13% 9%",
  "--inverse-foreground": "0 0% 100%",
} as const;

export const darkVars = {
  "--background": "220 16.7% 7.1%",
  "--foreground": "240 10% 96.1%",
  "--card": "220 13% 9%",
  "--card-foreground": "240 10% 96.1%",
  "--popover": "220 13% 9%",
  "--popover-foreground": "240 10% 96.1%",
  "--primary": "0 0% 100%",
  "--primary-foreground": "220 13% 9%",
  "--secondary": "218 11.4% 13.7%",
  "--secondary-foreground": "240 10% 96.1%",
  "--muted": "218 11.4% 13.7%",
  "--muted-foreground": "208 8.1% 58.6%",
  "--accent": "218 11.4% 13.7%",
  "--accent-foreground": "240 10% 96.1%",
  "--destructive": "358 85.1% 60.4%",
  "--destructive-foreground": "0 0% 100%",
  "--destructive-soft": "0 50% 14%",
  "--destructive-soft-foreground": "358 85% 78%",
  "--border": "218 11.4% 13.7%",
  "--input": "218 11.4% 13.7%",
  "--ring": "249 80.6% 71.8%",
  "--radius": "1.25rem",
  "--brand": "249 77.5% 63.3%",
  "--brand-foreground": "0 0% 100%",
  "--brand-soft": "250 40% 17%",
  "--brand-soft-foreground": "248 85.5% 89.2%",
  "--positive": "162 82.2% 39.6%",
  "--positive-foreground": "0 0% 100%",
  "--positive-soft": "162 60% 11%",
  "--positive-soft-foreground": "155 52% 78%",
  "--warning": "39 100% 48%",
  "--warning-foreground": "0 0% 100%",
  "--warning-soft": "39 70% 12%",
  "--warning-soft-foreground": "37 95% 75%",
  "--info": "217 89.9% 61%",
  "--info-foreground": "0 0% 100%",
  "--info-soft": "217 60% 14%",
  "--info-soft-foreground": "215 90% 80%",
  "--inverse": "0 0% 100%",
  "--inverse-foreground": "220 13% 9%",
} as const;

// The full-screen money flows (add money · receive · swap · send) paint on a
// near-black base — darker than the app's dark `--background` — matching the
// Drops money-flow design (`flow-kit.jsx`).
export const FLOW_BG = "#08080b";
