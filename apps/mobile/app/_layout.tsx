import "react-native-get-random-values";
import "../global.css";
import "../lib/i18n";
import "react-native-gesture-handler";
import "reflect-metadata";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

import { FlamaProvider, useSessionRestore } from "@flama/frontend/react";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";
import { Slot, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, vars } from "nativewind";
import * as React from "react";
import { View } from "react-native";
import { app } from "../lib/flama";
import { queryClient } from "../lib/query";
import { darkVars, lightVars, NAV_THEME } from "../lib/theme";
import { useLoadFonts } from "../lib/use-load-fonts";

// Keep the native splash up until fonts and the session are ready.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { fontsLoaded } = useLoadFonts();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? darkVars : lightVars;
  const isDark = colorScheme === "dark";

  // Hold on the splash (rendered by the OS) until the fonts are in.
  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <FlamaProvider app={app}>
        <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
          <View
            style={vars(theme)}
            className={
              isDark ? "dark flex-1 bg-background" : "flex-1 bg-background"
            }
          >
            <StatusBar style={isDark ? "light" : "dark"} />
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

  return <Slot />;
}
