import { AssetIcon } from '@flama/design-system-mobile/asset-icon';
import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { cn } from '@flama/design-system-mobile/utils';
import { ChevronDown } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

/**
 * One side of the swap — a token-picker pill on the left and a right-aligned
 * amount with a supporting sub-line. Specific to the swap flow (the From / To
 * pair); the muted variant dims the amount for the computed To side.
 *
 * Renders on the dark flow surface, so it pins the flow palette (translucent
 * white on near-black) directly rather than leaning on theme tokens.
 */
type SwapTokenCardProps = {
  symbol: string;
  /** AssetIcon tint; falls back to the asset's default. */
  color?: string;
  /** Amount string shown large on the right. */
  amount: string;
  /** Supporting line under the amount (balance / rate). */
  sub: string;
  /** Dim the amount — used for the computed To side. */
  muted?: boolean;
  onPickToken?: () => void;
};

export function SwapTokenCard({
  symbol,
  color,
  amount,
  sub,
  muted,
  onPickToken,
}: SwapTokenCardProps) {
  return (
    <View className="flex-row items-center gap-3 rounded-[20px] border border-white/[0.12] bg-white/[0.06] p-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Change token, currently ${symbol}`}
        onPress={onPickToken}
        className="flex-row items-center gap-[9px] rounded-full border border-white/[0.12] bg-white/[0.09] py-1.5 pl-1.5 pr-3 active:scale-[0.97]"
      >
        <AssetIcon symbol={symbol} color={color} size={28} />
        <Text className="text-[15px] font-bold text-white">{symbol}</Text>
        <Icon as={ChevronDown} size={15} className="text-white/40" />
      </Pressable>
      <View className="min-w-0 flex-1 items-end">
        <Text
          numberOfLines={1}
          className={cn(
            'font-display text-[28px] font-normal leading-[31px] tracking-[-0.5px]',
            muted ? 'text-white/60' : 'text-white',
          )}
        >
          {amount}
        </Text>
        <Text numberOfLines={1} className="mt-0.5 text-[12.5px] text-white/40">
          {sub}
        </Text>
      </View>
    </View>
  );
}
