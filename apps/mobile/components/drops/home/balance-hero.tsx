import { Badge } from "@flama/design-system-mobile/badge";
import { Icon } from "@flama/design-system-mobile/icon";
import { Text } from "@flama/design-system-mobile/text";
import { ChevronDown } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { formatUsd } from "./home-data";

/**
 * The fiat-first balance hero: the wallet-name switcher with a network badge
 * above a single large USD total in the display serif.
 */
export function BalanceHero({ usd }: { usd: number }) {
  return (
    <View className="items-center px-6 pb-11 pt-14">
      <Pressable className="mb-4 flex-row items-center gap-2 active:opacity-80">
        <View className="flex-row items-center gap-1">
          <Text className="text-sm font-semibold text-foreground">
            Wallet 1
          </Text>
          <Icon as={ChevronDown} size={15} className="text-muted-foreground" />
        </View>
        <Badge variant="warning" dot>
          <Text>TESTNET</Text>
        </Badge>
      </Pressable>

      <Text className="font-display text-[46px] leading-[56px] tracking-[-0.8px] text-foreground tabular-nums">
        {formatUsd(usd)}
      </Text>
    </View>
  );
}
