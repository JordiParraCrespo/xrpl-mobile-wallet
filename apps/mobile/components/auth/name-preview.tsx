import { Icon } from '@flama/design-system-mobile/icon';
import { InitialsAvatar } from '@flama/design-system-mobile/initials-avatar';
import { Text } from '@flama/design-system-mobile/text';
import { deriveFirstName, deriveHandle } from '@flama/frontend';
import { Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

// The design's Dewy gradient (150deg, brand-500 → brand-700). SVG can't read
// CSS vars, so these are the brand constants, like ChainBadge's discs.
const DEWY_GRADIENT_FROM = '#6f59ea';
const DEWY_GRADIENT_TO = '#4a33ba';

/** Small sparkle disc standing in for Dewy, the wallet assistant. */
function DewyAvatar({ size = 28 }: { size?: number }) {
  return (
    <View
      className="shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      <Svg style={StyleSheet.absoluteFill} width={size} height={size}>
        <Defs>
          <LinearGradient id="dewy-disc" x1="0%" y1="0%" x2="58%" y2="100%">
            <Stop offset="0" stopColor={DEWY_GRADIENT_FROM} />
            <Stop offset="1" stopColor={DEWY_GRADIENT_TO} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dewy-disc)" />
      </Svg>
      <Icon as={Sparkles} size={size * 0.5} className="text-brand-foreground" />
    </View>
  );
}

/**
 * Live preview for the onboarding name screen — shows exactly where the name
 * lands: the profile identity (initials avatar, serif name, derived @handle)
 * and Dewy's greeting bubble. Dims until the user starts typing. The handle
 * and first-name derivations come straight from the `profile` module so the
 * preview matches what gets persisted and used in real conversations.
 */
export function NamePreview({ name }: { name: string }) {
  const { t } = useTranslation();
  const trimmed = name.trim();
  const valid = trimmed.length >= 2;

  return (
    <View
      className="mt-[22px]"
      style={{ opacity: trimmed.length >= 1 ? 1 : 0.5 }}
      accessible={false}
    >
      <Text className="mb-3 text-[12px] font-bold uppercase tracking-[0.4px] text-muted-foreground">
        {t('onboarding.name.preview')}
      </Text>

      {/* Profile identity */}
      <View className="flex-row items-center gap-3.5 rounded-lg bg-muted px-4 py-3.5">
        <InitialsAvatar name={valid ? trimmed : 'Your Name'} size={46} />
        <View className="min-w-0 flex-1">
          <Text
            numberOfLines={1}
            className="font-display text-[19px] leading-[22px] tracking-[-0.2px] text-foreground"
          >
            {trimmed || t('onboarding.name.placeholderName')}
          </Text>
          <Text className="mt-0.5 font-mono text-[13px] text-muted-foreground">
            {deriveHandle(name)}
          </Text>
        </View>
      </View>

      {/* Assistant greeting */}
      <View className="mt-3 flex-row items-end gap-2.5">
        <DewyAvatar size={28} />
        <View className="flex-1 rounded-lg rounded-bl-[5px] border border-border bg-card px-[15px] py-3">
          <Text className="text-[14.5px] leading-[21px] text-foreground">
            {t('onboarding.name.greeting.before')}
            <Text className="font-semibold text-foreground">{deriveFirstName(name)}</Text>
            {t('onboarding.name.greeting.after')}
          </Text>
        </View>
      </View>
    </View>
  );
}
