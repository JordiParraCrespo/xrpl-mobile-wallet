import '../global.css';
import '../lib/i18n';
import 'react-native-gesture-handler';
import 'reflect-metadata';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

import {
  FlamaProvider,
  useAddressBookRestore,
  useProfileRestore,
  useSecurityRestore,
  useSecurityState,
  useSessionRestore,
  useSettingsRestore,
  useWalletRestore,
} from '@flama/frontend/react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, vars } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { app } from '../lib/flama';
import { queryClient } from '../lib/query';
import { Routes } from '../lib/routes';
import { darkVars, lightVars, NAV_THEME } from '../lib/theme';
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <FlamaProvider app={app}>
          <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
            <View
              style={vars(theme)}
              // Every touch re-arms the security auto-lock timer; returning
              // false leaves the touch for whoever actually owns it.
              onStartShouldSetResponderCapture={() => {
                app.security.touch();
                return false;
              }}
              className={isDark ? 'dark flex-1 bg-background' : 'flex-1 bg-background'}
            >
              {/* Sheets portal into this provider, so it sits inside the
                  themed View to inherit the NativeWind CSS vars. */}
              <BottomSheetModalProvider>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <SessionGate />
                <PortalHost />
              </BottomSheetModalProvider>
            </View>
          </ThemeProvider>
        </FlamaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function SessionGate() {
  // Drops is self-custody — there is no email login to gate on. Hold the
  // splash until the (better-auth) session, the wallet vault, and the
  // security state have all restored, so the index gate sees a settled
  // wallet status instead of 'idle'.
  const session = useSessionRestore();
  const wallet = useWalletRestore();
  const security = useSecurityRestore();
  const profile = useProfileRestore();
  const settings = useSettingsRestore();
  // Restore the address book too so saved recipients resolve on the payments
  // screen from the first paint. It is local-only and must never hold the
  // splash, so it stays out of the `isLoading` gate below.
  useAddressBookRestore();
  const isLoading =
    session.isLoading ||
    wallet.isLoading ||
    security.isLoading ||
    profile.isLoading ||
    settings.isLoading;

  React.useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) return null;

  return <DropsStack />;
}

/**
 * Drives the app to the unlock gate whenever the vault locks mid-session
 * (the security module's inactivity auto-lock, or an explicit lock). Cold
 * starts are handled by the index gate; this covers locks that happen while
 * the user is already inside the app.
 */
function useLockGate() {
  const { status } = useSecurityState();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (status === 'locked' && pathname !== Routes.Unlock) {
      router.replace(Routes.Unlock);
    }
  }, [status, pathname, router]);
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
 *   pushes ───── profile · chat · payment/[contact] · flows/{receive,add-money}  (full screen, with back)
 *   modals ───── flows/{swap,send} · add-recipient · transaction/[id]  (slide up, dismiss)
 *
 * Modals stack on top of pushes, and modal-over-modal works (e.g. open Send
 * from a payment chat), because they all share this one root stack.
 */
function DropsStack() {
  useLockGate();

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
      {/* Receive and Add money are destination screens (account switcher /
          QR / amount entry), so they push full-screen with a back gesture
          rather than sliding up. */}
      <Stack.Screen name="flows/receive" />
      <Stack.Screen name="flows/add-money" />

      {/* Modals — slide up over everything, including the tab bar. */}
      <Stack.Screen name="flows/swap" options={{ presentation: 'modal' }} />
      <Stack.Screen name="flows/send" options={{ presentation: 'modal' }} />
      <Stack.Screen name="add-recipient" options={{ presentation: 'modal' }} />
      <Stack.Screen name="transaction/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
