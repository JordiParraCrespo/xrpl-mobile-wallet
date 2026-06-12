import { AssetIcon } from '@flama/design-system-mobile/asset-icon';
import { PriceChange } from '@flama/design-system-mobile/price-change';
import { Text } from '@flama/design-system-mobile/text';
import { Pressable } from 'react-native';
import type { MarketMover } from './market-data';

/**
 * A single top-mover tile in the 3-up grid: a large asset disc above the
 * symbol and its percent change.
 */
export function MarketMoverTile({ mover }: { mover: MarketMover }) {
  return (
    <Pressable className="items-center gap-[7px] py-1 active:scale-[0.97]">
      <AssetIcon symbol={mover.symbol} size={56} color={mover.color} />
      <Text className="text-foreground text-sm font-semibold">{mover.symbol}</Text>
      <PriceChange value={mover.change} className="text-[13px]" />
    </Pressable>
  );
}
