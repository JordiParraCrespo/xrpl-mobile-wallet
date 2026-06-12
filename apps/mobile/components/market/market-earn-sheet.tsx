import { Badge } from '@flama/design-system-mobile/badge';
import { BottomSheet } from '@flama/design-system-mobile/bottom-sheet';
import { Button } from '@flama/design-system-mobile/button';
import { FeatureRow } from '@flama/design-system-mobile/feature-row';
import { Text } from '@flama/design-system-mobile/text';
import { ArrowLeftRight, ShieldCheck, TrendingUp } from 'lucide-react-native';
import { View } from 'react-native';

// MarketEarnSheet — the "Earn on your XRP" teaser sheet behind the Features
// row. A coming-soon explainer: brand glyph, status pill, copy, three perks,
// and a notify CTA. Feature-specific; composed from the DS BottomSheet, Badge,
// FeatureRow and Button.
type MarketEarnSheetProps = {
  open: boolean;
  onClose: () => void;
};

const PERKS = [
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
] as const;

export function MarketEarnSheet({ open, onClose }: MarketEarnSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <View className="items-center">
        <View className="h-[88px] w-[88px] items-center justify-center rounded-full bg-brand-soft">
          <Text className="font-display text-[40px] leading-none text-brand">%</Text>
        </View>
        <Badge variant="glass" className="mt-5">
          <Text>COMING SOON</Text>
        </Badge>
        <Text className="mt-3.5 font-display text-3xl tracking-[-0.5px] text-foreground">
          Earn on your XRP
        </Text>
        <Text className="mt-2 max-w-[300px] text-center text-[15px] leading-6 text-muted-foreground">
          Soon you’ll grow your balance just by holding. We’re finishing the audit — it won’t be
          long.
        </Text>
      </View>

      <View className="mt-5 gap-2.5">
        {PERKS.map((perk) => (
          <FeatureRow
            key={perk.title}
            icon={perk.icon}
            tone="brand"
            circle
            title={perk.title}
            description={perk.description}
          />
        ))}
      </View>

      <Button variant="brand" size="lg" className="mt-4 w-full" onPress={onClose}>
        <Text>Notify me when it’s ready</Text>
      </Button>
    </BottomSheet>
  );
}
