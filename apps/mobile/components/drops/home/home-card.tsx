import { GlassPanel } from '@flama/design-system-mobile/glass-panel';
import { cn } from '@flama/design-system-mobile/utils';
import { useColorScheme } from 'nativewind';
import type * as React from 'react';
import { View } from 'react-native';

/**
 * The home card surface in both themes: frosted white-glass over the dark
 * gradient, a flat white card with a hairline border on the light "Glow"
 * (home-app.jsx `--surface-card` / `--border-hairline` per theme).
 */
export function HomeCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const dark = useColorScheme().colorScheme === 'dark';
  if (dark) {
    return (
      <GlassPanel variant="on-dark" padded={false} className={className}>
        {children}
      </GlassPanel>
    );
  }
  return (
    <View className={cn('rounded-xl border border-border bg-card', className)}>{children}</View>
  );
}
