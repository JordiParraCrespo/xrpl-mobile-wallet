import { Button } from '@flama/design-system-mobile/button';
import { Text } from '@flama/design-system-mobile/text';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { buildRoute } from '../../lib/routes';

// The immersive entry screen (onboarding/screens-immersive.jsx — Welcome, photo
// variant): a full-bleed market photo under a cinematic veil, the Drops
// wordmark up top, and the two account-entry choices anchored to the base.
const INK = '#080610';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-[#0a0812]">
      <StatusBar style="light" />
      <ImageBackground
        source={require('../../assets/welcome-photo.png')}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      >
        {/* Cinematic veil — dark at the top for the logo, clear through the
            middle, dark at the base for the buttons. */}
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <LinearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={INK} stopOpacity={0.62} />
              <Stop offset="0.2" stopColor={INK} stopOpacity={0.14} />
              <Stop offset="0.38" stopColor={INK} stopOpacity={0} />
              <Stop offset="0.62" stopColor={INK} stopOpacity={0.46} />
              <Stop offset="1" stopColor={INK} stopOpacity={0.94} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#veil)" />
        </Svg>

        <View
          style={{
            flex: 1,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 28,
          }}
        >
          <Text className="self-center font-display text-[30px] tracking-[-0.5px] text-white">
            Drops
          </Text>

          <View className="flex-1" />

          <View style={{ gap: 12 }}>
            <Button
              size="lg"
              className="w-full bg-white active:bg-white/90"
              onPress={() => router.push(buildRoute.onboardingName('create'))}
            >
              <Text className="text-[15px] font-semibold text-[#0a0812]">
                {t('onboarding.welcome.create')}
              </Text>
            </Button>

            <Button
              variant="glass"
              size="lg"
              className="w-full"
              onPress={() => router.push(buildRoute.onboardingName('import'))}
            >
              <Text>{t('onboarding.welcome.import')}</Text>
            </Button>

            <Text className="mt-1.5 text-center text-xs leading-[17px] text-white/60">
              {t('onboarding.welcome.legal')}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
