import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Flama',
  slug: 'flama',
  version: '0.1.0',
  scheme: 'flama',
  newArchEnabled: true,
  platforms: ['ios', 'android'],
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.flama.app',
    supportsTablet: true,
    infoPlist: {
      // Face ID never works in Expo Go (the host app lacks this key) — it
      // needs a development build, where this description is shown the first
      // time the OS asks for Face ID permission.
      NSFaceIDUsageDescription: 'Drops uses Face ID to unlock your wallet.',
    },
  },
  android: {
    package: 'com.flama.app',
    adaptiveIcon: {
      backgroundColor: '#ffffff',
    },
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-localization',
    [
      // The camera is used solely to scan a recipient's payment QR when adding
      // them. This description is shown the first time iOS/Android asks; audio
      // recording is disabled since we never need the microphone.
      'expo-camera',
      {
        cameraPermission: "Drops uses the camera to scan a recipient's payment QR code.",
        recordAudioAndroid: false,
      },
    ],
    [
      'expo-font',
      {
        // Drops typography: ReferoTitle (display serif, weight 400 only),
        // Inter (body), JetBrainsMono (addresses/hashes).
        ios: {
          fonts: [
            './assets/fonts/ReferoTitle-Regular.ttf',
            './assets/fonts/Inter_400Regular.ttf',
            './assets/fonts/Inter_500Medium.ttf',
            './assets/fonts/Inter_600SemiBold.ttf',
            './assets/fonts/Inter_700Bold.ttf',
            './assets/fonts/JetBrainsMono_400Regular.ttf',
            './assets/fonts/JetBrainsMono_500Medium.ttf',
            './assets/fonts/JetBrainsMono_600SemiBold.ttf',
          ],
        },
        android: {
          fonts: [
            {
              fontFamily: 'ReferoTitle',
              fontDefinitions: [{ path: './assets/fonts/ReferoTitle-Regular.ttf', weight: 400 }],
            },
            {
              fontFamily: 'Inter',
              fontDefinitions: [
                { path: './assets/fonts/Inter_400Regular.ttf', weight: 400 },
                { path: './assets/fonts/Inter_500Medium.ttf', weight: 500 },
                { path: './assets/fonts/Inter_600SemiBold.ttf', weight: 600 },
                { path: './assets/fonts/Inter_700Bold.ttf', weight: 700 },
              ],
            },
            {
              fontFamily: 'JetBrainsMono',
              fontDefinitions: [
                {
                  path: './assets/fonts/JetBrainsMono_400Regular.ttf',
                  weight: 400,
                },
                {
                  path: './assets/fonts/JetBrainsMono_500Medium.ttf',
                  weight: 500,
                },
                {
                  path: './assets/fonts/JetBrainsMono_600SemiBold.ttf',
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
