import { AssetIcon } from '@flama/design-system-mobile/asset-icon';
import { PriceChange } from '@flama/design-system-mobile/price-change';
import { Sparkline } from '@flama/design-system-mobile/sparkline';
import { Text } from '@flama/design-system-mobile/text';
import * as React from 'react';
import { type LayoutChangeEvent, Pressable, View } from 'react-native';
import { formatPrice, type MarketHero } from './market-data';

type MarketHeroCardProps = {
  asset: MarketHero;
  /** Sparkline height; the design uses a compact 42px on the Market screen. */
  chartHeight?: number;
};

/**
 * The full-width hero price card: symbol + asset disc, the price in the serif
 * display face, percent change, and a green/red sparkline that fills the card
 * width (measured via `onLayout` since the SVG needs an explicit width).
 */
export function MarketHeroCard({ asset, chartHeight = 42 }: MarketHeroCardProps) {
  const [chartWidth, setChartWidth] = React.useState(0);
  const trend = asset.change >= 0 ? 'up' : 'down';

  const onChartLayout = (event: LayoutChangeEvent) => {
    setChartWidth(event.nativeEvent.layout.width);
  };

  return (
    <Pressable className="bg-card border-border overflow-hidden rounded-xl border px-4 pb-3 pt-4 active:scale-[0.99]">
      <View className="flex-row items-center justify-between">
        <Text className="text-muted-foreground text-sm font-semibold">{asset.symbol}</Text>
        <AssetIcon symbol={asset.symbol} size={30} color={asset.color} />
      </View>

      <Text
        className="font-display text-foreground mb-1 mt-2 tabular-nums"
        style={{ fontSize: 25, lineHeight: 30, letterSpacing: -0.4 }}
      >
        {formatPrice(asset.price)}
      </Text>

      <PriceChange value={asset.change} className="text-[13.5px]" />

      <View className="-mx-1 mt-2.5" onLayout={onChartLayout}>
        {chartWidth > 0 ? (
          <Sparkline data={asset.spark} trend={trend} width={chartWidth} height={chartHeight} />
        ) : null}
      </View>
    </Pressable>
  );
}
