import { useFonts } from "expo-font";

/**
 * The Drops typefaces, loaded at runtime so they're ready in Expo Go and the
 * dev client (native builds also embed them via the `expo-font` config plugin
 * in `app.config.ts` — loading the same files here is idempotent).
 *
 * Keys are the family names referenced by NativeWind (`font-display`,
 * `font-sans`, `font-mono` in tailwind.config.js); the weighted Inter / mono
 * files are registered so every face is available.
 */
export const DROPS_FONTS = {
  // Refero Title — editorial display serif, weight 400 only.
  ReferoTitle: require("../assets/fonts/ReferoTitle-Regular.ttf"),
  // Inter — body.
  Inter: require("../assets/fonts/Inter_400Regular.ttf"),
  Inter_500Medium: require("../assets/fonts/Inter_500Medium.ttf"),
  Inter_600SemiBold: require("../assets/fonts/Inter_600SemiBold.ttf"),
  Inter_700Bold: require("../assets/fonts/Inter_700Bold.ttf"),
  // JetBrains Mono — addresses, tags, hashes.
  JetBrainsMono: require("../assets/fonts/JetBrainsMono_400Regular.ttf"),
  JetBrainsMono_500Medium: require("../assets/fonts/JetBrainsMono_500Medium.ttf"),
  JetBrainsMono_600SemiBold: require("../assets/fonts/JetBrainsMono_600SemiBold.ttf"),
} as const;

export type UseLoadFontsResult = {
  /** True once every font is ready (or has failed — never blocks the app). */
  fontsLoaded: boolean;
  /** The font-loading error, if any. */
  fontError: Error | null;
};

/** Loads the Drops fonts and reports when they're ready. */
export function useLoadFonts(): UseLoadFontsResult {
  const [loaded, error] = useFonts(DROPS_FONTS);
  return { fontsLoaded: loaded || error != null, fontError: error };
}
