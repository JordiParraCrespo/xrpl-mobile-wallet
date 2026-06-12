import { Icon } from '@flama/design-system-mobile/icon';
import { IconButton } from '@flama/design-system-mobile/icon-button';
import { Text } from '@flama/design-system-mobile/text';
import { Plus } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AccountTile, AccountTileSkeleton } from './account-tile';
import type { HomeAccount } from './home-data';

/**
 * The Accounts section: a heading with an add affordance and a 2-up grid of
 * account tiles, one per XRPL chain.
 */
export function AccountsSection({
  accounts,
  loading,
  onAccountPress,
  onAddAccount,
}: {
  accounts: HomeAccount[];
  /** First-load state: renders two placeholder tiles instead of the grid. */
  loading?: boolean;
  onAccountPress: (account: HomeAccount) => void;
  onAddAccount: () => void;
}) {
  const dark = useColorScheme().colorScheme === 'dark';
  const { t } = useTranslation();
  return (
    <View className="mt-[22px]">
      <View className="flex-row items-center justify-between px-1 pb-2.5">
        <Text className="font-display text-[19px] tracking-[-0.2px] text-foreground">
          {t('home.hub.accounts')}
        </Text>
        <IconButton
          variant={dark ? 'glass' : 'soft'}
          size="sm"
          accessibilityLabel={t('home.hub.addAccount')}
          onPress={onAddAccount}
        >
          <Icon as={Plus} size={18} />
        </IconButton>
      </View>

      <View className="flex-row gap-3">
        {loading ? (
          <>
            <AccountTileSkeleton />
            <AccountTileSkeleton />
          </>
        ) : (
          accounts.map((account) => (
            <AccountTile
              key={account.id}
              account={account}
              onPress={() => onAccountPress(account)}
            />
          ))
        )}
      </View>
    </View>
  );
}
