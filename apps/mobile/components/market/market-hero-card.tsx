import { AssetIcon } from '@flama/design-system-mobile/asset-icon';
import { PriceChange } from '@flama/design-system-mobile/price-change';
import { Sparkline } from '@flama/design-system-mobile/sparkline';
import { Text } from '@flama/design-system-mobile/text';
import * as React from 'react';
import { type LayoutChangeEvent, Pressable, View } from 'react-native';
import { formatPrice, type HeroAsset } from './market-data';

// MarketHeroCard — the prominent, full-width price card that leads the Market
// screen (XRP, the user's primary holding). Symbol + asset icon, the price in
// the display serif, percent change, and a sparkline that spans the card. The
// sparkline width is measured so it stretches edge-to-edge regardless of the
// device width. Feature-specific composition over DS primitives.
type MarketHeroCardProps = {
  asset: HeroAsset;
  onPress?: () => void;
};

export function MarketHeroCard({ asset, onPress }: MarketHeroCardProps) {
  const [width, setWidth] = React.useState(0);
  const trend = asset.change >= 0 ? 'up' : 'down';

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-xl border-hairline border-border bg-card px-4 pt-4 pb-3 active:scale-[0.99]"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-muted-foreground">{asset.symbol}</Text>
        <AssetIcon symbol={asset.symbol} color={asset.color} size={30} />
      </View>
      <Text className="mt-2 font-display text-[25px] tracking-[-0.4px] text-foreground tabular-nums">
        {formatPrice(asset.price)}
      </Text>
      <PriceChange value={asset.change} className="mt-1" />
      <View className="-mx-1 mt-2.5" onLayout={onLayout}>
        {width > 0 ? (
          <Sparkline data={asset.spark} trend={trend} width={width} height={42} />
        ) : null}
      </View>
    </Pressable>
  );
}
