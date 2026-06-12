import { Badge } from '@flama/design-system-mobile/badge';
import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { formatUsd } from './home-data';

/**
 * The fiat-first balance hero: the active wallet's name switcher with a network
 * badge above a single large USD total in the display serif. The total is the
 * sum of every account balance converted to USD; while it loads, a spinner
 * stands in for the figure.
 */
export function BalanceHero({
  usd,
  walletName,
  loading,
}: {
  usd: number;
  walletName: string;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View className="items-center px-6 pb-11 pt-14">
      <Pressable className="mb-4 flex-row items-center gap-2 active:opacity-80">
        <View className="flex-row items-center gap-1">
          <Text className="text-sm font-semibold text-foreground">{walletName}</Text>
          <Icon as={ChevronDown} size={15} className="text-muted-foreground" />
        </View>
        <Badge variant="warning" dot>
          <Text>{t('home.hub.testnet')}</Text>
        </Badge>
      </Pressable>

      {loading ? (
        <View className="h-[56px] justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <Text className="font-display text-[46px] leading-[56px] tracking-[-0.8px] text-foreground tabular-nums">
          {formatUsd(usd)}
        </Text>
      )}
    </View>
  );
}
