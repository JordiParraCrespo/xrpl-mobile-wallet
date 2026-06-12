import { AssetIcon } from '@flama/design-system-mobile/asset-icon';
import { PriceChange } from '@flama/design-system-mobile/price-change';
import { Text } from '@flama/design-system-mobile/text';
import { Pressable, View } from 'react-native';
import { type Asset, formatPrice } from './market-data';

// MarketAssetRow — one line in the "All assets" list: icon, name + symbol, and
// a right-aligned price over its percent change. Feature-specific.
type MarketAssetRowProps = {
  asset: Asset;
  onPress?: () => void;
};

export function MarketAssetRow({ asset, onPress }: MarketAssetRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="w-full flex-row items-center gap-3 px-4 py-3 active:bg-accent"
    >
      <AssetIcon symbol={asset.symbol} color={asset.color} size={40} />
      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} className="text-[15.5px] font-semibold text-foreground">
          {asset.name}
        </Text>
        <Text className="text-[13px] text-muted-foreground">{asset.symbol}</Text>
      </View>
      <View className="items-end gap-0.5">
        <Text className="font-mono text-[15px] font-medium text-foreground tabular-nums">
          {formatPrice(asset.price)}
        </Text>
        <PriceChange value={asset.change} className="text-[12.5px]" />
      </View>
    </Pressable>
  );
}
