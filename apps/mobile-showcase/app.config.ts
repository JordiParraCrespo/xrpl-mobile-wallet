import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Flama Showcase",
  slug: "flama-showcase",
  version: "0.1.0",
  scheme: "flama-showcase",
  newArchEnabled: true,
  platforms: ["ios", "android"],
  userInterfaceStyle: "automatic",
  ios: {
    bundleIdentifier: "com.flama.showcase",
    supportsTablet: true,
  },
  android: {
    package: "com.flama.showcase",
  },
  plugins: [
    "expo-router",
    [
      "expo-font",
      {
        // Drops typography: ReferoTitle (display serif, weight 400 only),
        // Inter (body), JetBrainsMono (amounts/addresses).
        ios: {
          fonts: [
            "./assets/fonts/ReferoTitle-Regular.ttf",
            "./assets/fonts/Inter_400Regular.ttf",
            "./assets/fonts/Inter_500Medium.ttf",
            "./assets/fonts/Inter_600SemiBold.ttf",
            "./assets/fonts/Inter_700Bold.ttf",
            "./assets/fonts/JetBrainsMono_400Regular.ttf",
            "./assets/fonts/JetBrainsMono_500Medium.ttf",
            "./assets/fonts/JetBrainsMono_600SemiBold.ttf",
          ],
        },
        android: {
          fonts: [
            {
              fontFamily: "ReferoTitle",
              fontDefinitions: [
                { path: "./assets/fonts/ReferoTitle-Regular.ttf", weight: 400 },
              ],
            },
            {
              fontFamily: "Inter",
              fontDefinitions: [
                { path: "./assets/fonts/Inter_400Regular.ttf", weight: 400 },
                { path: "./assets/fonts/Inter_500Medium.ttf", weight: 500 },
                { path: "./assets/fonts/Inter_600SemiBold.ttf", weight: 600 },
                { path: "./assets/fonts/Inter_700Bold.ttf", weight: 700 },
              ],
            },
            {
              fontFamily: "JetBrainsMono",
              fontDefinitions: [
                {
                  path: "./assets/fonts/JetBrainsMono_400Regular.ttf",
                  weight: 400,
                },
                {
                  path: "./assets/fonts/JetBrainsMono_500Medium.ttf",
                  weight: 500,
                },
                {
                  path: "./assets/fonts/JetBrainsMono_600SemiBold.ttf",
                  weight: 600,
                },
              ],
            },
          ],
        },
      },
    ],
  ],
};

export default config;
