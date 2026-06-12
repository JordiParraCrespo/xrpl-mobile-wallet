import { GlassPanel } from '@flama/design-system-mobile/glass-panel';
import { Text } from '@flama/design-system-mobile/text';
import type * as React from 'react';
import { View } from 'react-native';
import type { ProfileTheme } from './profile-theme';

type SettingsSectionProps = {
  theme: ProfileTheme;
  /** Optional uppercase section heading (omitted for the danger group). */
  title?: string;
  children: React.ReactNode;
};

/**
 * A titled group of settings rows in a single glass card — the `PrSection`
 * from the Drops profile design. Wraps the DS `GlassPanel`, tinted to the
 * profile theme so the rows read as one frosted panel over the gradient.
 */
export function SettingsSection({ theme, title, children }: SettingsSectionProps) {
  return (
    <View style={{ marginTop: 18 }}>
      {title ? (
        <Text
          className="font-sans"
          style={{
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 0.7,
            color: theme.dim,
            paddingHorizontal: 6,
            paddingBottom: 9,
          }}
        >
          {title.toUpperCase()}
        </Text>
      ) : null}
      <GlassPanel
        padded={false}
        intensity={theme.blur}
        tint={theme.blurTint}
        style={{
          backgroundColor: theme.glassBg,
          borderColor: theme.glassBorder,
        }}
      >
        {children}
      </GlassPanel>
    </View>
  );
}
