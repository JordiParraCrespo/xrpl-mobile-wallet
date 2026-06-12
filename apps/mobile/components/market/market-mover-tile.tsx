import { AssetIcon } from '@flama/design-system-mobile/asset-icon';
import { PriceChange } from '@flama/design-system-mobile/price-change';
import { Text } from '@flama/design-system-mobile/text';
import { Pressable } from 'react-native';
import type { Mover } from './market-data';

// MarketMoverTile — a single token in the top gainers / losers grid: a large
// asset icon stacked over its symbol and percent change. One-third width so
// three sit per row. Feature-specific.
type MarketMoverTileProps = {
  mover: Mover;
  onPress?: () => void;
};

export function MarketMoverTile({ mover, onPress }: MarketMoverTileProps) {
  return (
    <Pressable onPress={onPress} className="w-1/3 items-center gap-1.5 py-1 active:scale-[0.97]">
      <AssetIcon symbol={mover.symbol} color={mover.color} size={56} />
      <Text className="text-sm font-semibold text-foreground">{mover.symbol}</Text>
      <PriceChange value={mover.change} className="text-[13px]" />
    </Pressable>
  );
}
