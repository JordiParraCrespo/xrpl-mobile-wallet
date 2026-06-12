import { cn } from '@flama/design-system-mobile/utils';
import { vars } from 'nativewind';
import type * as React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { darkVars, FLOW_BG } from '../../lib/theme';

/**
 * FlowScreen — the dark surface shared by the money-flow modals (add money ·
 * receive · swap · send).
 *
 * The flows are always dark, regardless of the system colour scheme: the
 * design leads with a near-black on-ramp surface so the amount and the indigo
 * money-action carry the screen. We force the dark design tokens onto this
 * subtree with `vars(darkVars)` (so every `@flama/design-system-mobile`
 * primitive resolves to its dark values) and add the `dark` class so
 * `dark:` utilities apply too — then paint the pure-black flow background
 * (`FLOW_BG`) over the slightly-lifted app dark background.
 *
 * Top/bottom safe-area insets are applied here so the children lay out as a
 * simple top-to-bottom column.
 */
type FlowScreenProps = {
  children: React.ReactNode;
  className?: string;
};

export function FlowScreen({ children, className }: FlowScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[vars(darkVars), { backgroundColor: FLOW_BG }]}
      className={cn('dark flex-1', className)}
    >
      <View
        className="flex-1"
        style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
      >
        {children}
      </View>
    </View>
  );
}
