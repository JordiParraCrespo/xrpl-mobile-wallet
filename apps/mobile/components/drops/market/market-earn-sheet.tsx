import { Badge } from '@flama/design-system-mobile/badge';
import { BottomSheet } from '@flama/design-system-mobile/bottom-sheet';
import { Button } from '@flama/design-system-mobile/button';
import { FeatureRow } from '@flama/design-system-mobile/feature-row';
import { GlassBackdrop } from '@flama/design-system-mobile/glass-panel';
import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { ArrowLeftRight, type LucideIcon, ShieldCheck, TrendingUp } from 'lucide-react-native';
import { View } from 'react-native';

type Perk = { icon: LucideIcon; title: string; description: string };

const PERKS: Perk[] = [
  {
    icon: ArrowLeftRight,
    title: 'Auto-staked XRP',
    description: 'Put idle XRP to work, no lock-up.',
  },
  {
    icon: TrendingUp,
    title: 'Up to 5.2% APY',
    description: 'Variable rate, paid daily.',
  },
  {
    icon: ShieldCheck,
    title: 'Withdraw anytime',
    description: 'Your keys, your funds — always.',
  },
];

/**
 * The Earn "coming soon" sheet, opened by the Market → Earn feature row. Shares
 * the DropPoints glass language: a frosted % disc with an upward-trend mark, a
 * glass COMING SOON chip, the serif title, three perks, and a Notify button
 * that just dismisses for now.
 */
export function MarketEarnSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <View className="items-center">
        <View
          className="relative h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white/55"
          style={{
            shadowColor: '#5b41dd',
            shadowOpacity: 0.14,
            shadowRadius: 17,
            shadowOffset: { width: 0, height: 10 },
            elevation: 6,
          }}
        >
          <GlassBackdrop intensity={18} />
          <Text className="font-display text-brand" style={{ fontSize: 40, lineHeight: 44 }}>
            %
          </Text>
          <View className="absolute right-4 top-3.5">
            <Icon as={TrendingUp} size={18} strokeWidth={2.4} className="text-brand" />
          </View>
        </View>

        <Badge variant="glass" className="mt-5">
          <Text>COMING SOON</Text>
        </Badge>

        <Text
          className="font-display text-foreground mt-3.5 text-center"
          style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.5 }}
        >
          Earn on your XRP
        </Text>
        <Text
          className="text-muted-foreground mt-2 text-center text-[15px] leading-6"
          style={{ maxWidth: 300 }}
        >
          Soon you’ll grow your balance just by holding. We’re finishing the audit — it won’t be
          long.
        </Text>

        <View className="mt-5 w-full gap-2.5">
          {PERKS.map((perk) => (
            <FeatureRow
              key={perk.title}
              circle
              tone="brand"
              icon={perk.icon}
              title={perk.title}
              description={perk.description}
            />
          ))}
        </View>

        <Button variant="brand" size="lg" className="mt-4 w-full" onPress={onClose}>
          <Text>Notify me when it’s ready</Text>
        </Button>
      </View>
    </BottomSheet>
  );
}
