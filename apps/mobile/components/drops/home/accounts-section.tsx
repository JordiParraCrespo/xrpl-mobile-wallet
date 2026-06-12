import { Icon } from '@flama/design-system-mobile/icon';
import { IconButton } from '@flama/design-system-mobile/icon-button';
import { Text } from '@flama/design-system-mobile/text';
import { Plus } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import { AccountTile } from './account-tile';
import type { HomeAccount } from './home-data';

/**
 * The Accounts section: a heading with an add affordance and a 2-up grid of
 * account tiles, one per XRPL chain.
 */
export function AccountsSection({
  accounts,
  onAccountPress,
  onAddAccount,
}: {
  accounts: HomeAccount[];
  onAccountPress: (account: HomeAccount) => void;
  onAddAccount: () => void;
}) {
  const dark = useColorScheme().colorScheme === 'dark';
  return (
    <View className="mt-[22px]">
      <View className="flex-row items-center justify-between px-1 pb-2.5">
        <Text className="font-display text-[19px] tracking-[-0.2px] text-foreground">Accounts</Text>
        <IconButton
          variant={dark ? 'glass' : 'soft'}
          size="sm"
          accessibilityLabel="Add account"
          onPress={onAddAccount}
        >
          <Icon as={Plus} size={18} />
        </IconButton>
      </View>

      <View className="flex-row gap-3">
        {accounts.map((account) => (
          <AccountTile key={account.id} account={account} onPress={() => onAccountPress(account)} />
        ))}
      </View>
    </View>
  );
}
