import { ChainBadge } from '@flama/design-system-mobile/chain-badge';
import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { HomeCard } from './home-card';
import {
  accountUsd,
  type ChainBadgeKind,
  formatUsd,
  formatXrp,
  type HomeAccount,
} from './home-data';

/** Maps a mocked badge descriptor onto the design-system `ChainBadge`. */
export function AccountBadge({ badge, size }: { badge: ChainBadgeKind; size: number }) {
  if (badge.kind === 'letter') {
    return <ChainBadge kind="letter" label={badge.label} color={badge.color} size={size} />;
  }
  return <ChainBadge kind={badge.kind} size={size} />;
}

/**
 * A single account card in the Accounts grid: a frosted glass tile showing the
 * chain badge, fiat value and native amount (address stays hidden — web2 feel).
 */
export function AccountTile({ account, onPress }: { account: HomeAccount; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-1 active:opacity-90">
      <HomeCard className="min-h-[134px] justify-between rounded-xl p-4">
        <View className="flex-row items-start justify-between">
          <AccountBadge badge={account.badge} size={38} />
          <Icon as={ChevronRight} size={16} className="mt-0.5 text-muted-foreground" />
        </View>
        <View className="mt-4 gap-0.5">
          <Text numberOfLines={1} className="text-[13px] font-medium text-muted-foreground">
            {account.name}
          </Text>
          <Text className="font-mono text-[22px] font-semibold tracking-[-0.4px] text-foreground">
            {formatUsd(accountUsd(account))}
          </Text>
          <Text className="font-mono text-xs text-muted-foreground">
            {formatXrp(account.amount)} {account.unit}
          </Text>
        </View>
      </HomeCard>
    </Pressable>
  );
}
