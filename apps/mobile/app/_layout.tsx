import '../global.css';
import '../lib/i18n';
import 'react-native-gesture-handler';
import 'reflect-metadata';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

import { FlamaProvider, useSessionRestore } from '@flama/frontend/react';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, vars } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';
import { app } from '../lib/flama';
import { queryClient } from '../lib/query';
import { NAV_THEME } from '../lib/theme';
import { useLoadFonts } from '../lib/use-load-fonts';

// Keep the native splash up until fonts and the session are ready.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { fontsLoaded } = useLoadFonts();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === 'dark' ? darkVars : lightVars;
  const isDark = colorScheme === 'dark';

  // Hold on the splash (rendered by the OS) until the fonts are in.
  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <FlamaProvider app={app}>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <View
            style={vars(theme)}
            className={isDark ? 'dark flex-1 bg-background' : 'flex-1 bg-background'}
          >
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <SessionGate />
            <PortalHost />
          </View>
        </ThemeProvider>
      </FlamaProvider>
    </QueryClientProvider>
  );
}

function SessionGate() {
  // Drops is self-custody — there is no email login to gate on, so this just
  // holds the splash until the (better-auth) session has restored.
  const { isLoading } = useSessionRestore();

  React.useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) return null;

  return <DropsStack />;
}

/**
 * Drops wallet shell — the single root presentation layer.
 *
 * This is the only navigator that sits above the tab bar, so EVERY screen that
 * must cover the tabs (full-screen pushes and modals alike) is declared here as
 * a sibling of `(tabs)`. Expo Router resolves an href against the nearest
 * navigator that owns it and walks up, so `router.push('/flows/send')` from
 * inside a tab presents on THIS stack and covers the tab bar automatically.
 *
 * Presentation hierarchy (bottom → top):
 *   onboarding ─ pre-wallet, shown before the hub
 *   (tabs) ───── the hub (owns the tab bar)
 *   pushes ───── profile · chat · payment/[contact]   (full screen, with back)
 *   modals ───── flows/* · add-recipient · transaction/[id]  (slide up, dismiss)
 *
 * Modals stack on top of pushes, and modal-over-modal works (e.g. open Send
 * from a payment chat), because they all share this one root stack.
 */
function DropsStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="unlock" options={{ gestureEnabled: false }} />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />

      {/* Full-screen pushes — cover the tab bar, keep a back gesture. */}
      <Stack.Screen name="profile" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="payment/[contact]" />

      {/* Modals — slide up over everything, including the tab bar. */}
      <Stack.Screen name="flows/add-money" options={{ presentation: 'modal' }} />
      <Stack.Screen name="flows/receive" options={{ presentation: 'modal' }} />
      <Stack.Screen name="flows/swap" options={{ presentation: 'modal' }} />
      <Stack.Screen name="flows/send" options={{ presentation: 'modal' }} />
      <Stack.Screen name="add-recipient" options={{ presentation: 'modal' }} />
      <Stack.Screen name="transaction/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

// Drops design tokens — keep in sync with global.css.
const lightVars = {
  '--background': '0 0% 100%',
  '--foreground': '220 13% 9%',
  '--card': '0 0% 100%',
  '--card-foreground': '220 13% 9%',
  '--popover': '0 0% 100%',
  '--popover-foreground': '220 13% 9%',
  '--primary': '220 13% 9%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '240 14.3% 93.1%',
  '--secondary-foreground': '220 13% 9%',
  '--muted': '240 10% 96.1%',
  '--muted-foreground': '210 9.3% 46.3%',
  '--accent': '240 14.3% 93.1%',
  '--accent-foreground': '220 13% 9%',
  '--destructive': '0 73.8% 53.5%',
  '--destructive-foreground': '0 0% 100%',
  '--destructive-soft': '0 81% 95.9%',
  '--destructive-soft-foreground': '0 65.4% 47.6%',
  '--border': '228 9.8% 90%',
  '--input': '228 9.8% 90%',
  '--ring': '250 69.6% 56.1%',
  '--radius': '1.25rem',
  '--brand': '250 69.6% 56.1%',
  '--brand-foreground': '0 0% 100%',
  '--brand-soft': '245 86.7% 97.1%',
  '--brand-soft-foreground': '250 57% 46.5%',
  '--positive': '162 82.2% 39.6%',
  '--positive-foreground': '0 0% 100%',
  '--positive-soft': '155 51.5% 93.5%',
  '--positive-soft-foreground': '162 88.4% 30.4%',
  '--warning': '39 100% 48%',
  '--warning-foreground': '0 0% 100%',
  '--warning-soft': '37 100% 94.3%',
  '--warning-soft-foreground': '34 91.7% 47.5%',
  '--info': '217 89.9% 61%',
  '--info-foreground': '0 0% 100%',
  '--info-soft': '215 100% 95.3%',
  '--info-soft-foreground': '218 74.1% 53.1%',
  '--inverse': '220 13% 9%',
  '--inverse-foreground': '0 0% 100%',
} as const;

const darkVars = {
  '--background': '220 16.7% 7.1%',
  '--foreground': '240 10% 96.1%',
  '--card': '220 13% 9%',
  '--card-foreground': '240 10% 96.1%',
  '--popover': '220 13% 9%',
  '--popover-foreground': '240 10% 96.1%',
  '--primary': '0 0% 100%',
  '--primary-foreground': '220 13% 9%',
  '--secondary': '218 11.4% 13.7%',
  '--secondary-foreground': '240 10% 96.1%',
  '--muted': '218 11.4% 13.7%',
  '--muted-foreground': '208 8.1% 58.6%',
  '--accent': '218 11.4% 13.7%',
  '--accent-foreground': '240 10% 96.1%',
  '--destructive': '358 85.1% 60.4%',
  '--destructive-foreground': '0 0% 100%',
  '--destructive-soft': '0 50% 14%',
  '--destructive-soft-foreground': '358 85% 78%',
  '--border': '218 11.4% 13.7%',
  '--input': '218 11.4% 13.7%',
  '--ring': '249 80.6% 71.8%',
  '--radius': '1.25rem',
  '--brand': '249 77.5% 63.3%',
  '--brand-foreground': '0 0% 100%',
  '--brand-soft': '250 40% 17%',
  '--brand-soft-foreground': '248 85.5% 89.2%',
  '--positive': '162 82.2% 39.6%',
  '--positive-foreground': '0 0% 100%',
  '--positive-soft': '162 60% 11%',
  '--positive-soft-foreground': '155 52% 78%',
  '--warning': '39 100% 48%',
  '--warning-foreground': '0 0% 100%',
  '--warning-soft': '39 70% 12%',
  '--warning-soft-foreground': '37 95% 75%',
  '--info': '217 89.9% 61%',
  '--info-foreground': '0 0% 100%',
  '--info-soft': '217 60% 14%',
  '--info-soft-foreground': '215 90% 80%',
  '--inverse': '0 0% 100%',
  '--inverse-foreground': '220 13% 9%',
} as const;
