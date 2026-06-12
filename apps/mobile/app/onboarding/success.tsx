import { AddressPill } from '@flama/design-system-mobile/address-pill';
import { Button } from '@flama/design-system-mobile/button';
import { ChainBadge } from '@flama/design-system-mobile/chain-badge';
import { Icon } from '@flama/design-system-mobile/icon';
import { SuccessTick } from '@flama/design-system-mobile/success-tick';
import { Text } from '@flama/design-system-mobile/text';
import { useWalletState } from '@flama/frontend/react';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight, Info, Link2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Routes } from '../../lib/routes';

// The flow finale, on the light onboarding scaffold (white surface, flat
// hairline card — the immersive dark variant from screens-immersive.jsx was
// retired in favor of consistency with the rest of the flow): positive tick,
// "You're all set", and an account card listing the restored chain accounts.
// `via=phrase` restored every chain; `via=xrpl` (family seed / secret
// numbers) restored the XRP Ledger only.
export default function OnboardingSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { via } = useLocalSearchParams<{ via?: string }>();
  const { accounts, wallets, activeWalletId } = useWalletState();

  const phrase = via !== 'xrpl';
  const walletName =
    wallets.find((w) => w.id === activeWalletId)?.name ?? t('onboarding.success.defaultWalletName');

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-1 px-6"
        style={{
          paddingTop: insets.top + 34,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="items-center gap-3.5">
          <SuccessTick variant="positive" size={72} glow />
          <Text className="font-display text-[34px] tracking-[-0.5px] text-foreground">
            {t('onboarding.success.title')}
          </Text>
          <Text className="max-w-[300px] text-center text-[15.5px] leading-6 text-muted-foreground">
            {phrase ? t('onboarding.success.subtitlePhrase') : t('onboarding.success.subtitleXrpl')}
          </Text>
        </View>

        <View className="flex-1 justify-center">
          <View className="rounded-xl border-hairline border-border bg-card px-[18px]">
            <View className="flex-row items-center justify-between pt-3.5 pb-3">
              <Text className="text-[13px] font-semibold tracking-[0.3px] text-muted-foreground">
                {walletName.toUpperCase()}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {t('onboarding.success.networks', { count: accounts.length })}
              </Text>
            </View>
            {accounts.map((account) => (
              <View
                key={account.chainId}
                className="flex-row items-center gap-3 border-t border-border py-3.5"
              >
                <ChainBadge kind={account.kind === 'evm' ? 'evm' : 'xrp'} size={40} />
                <View className="min-w-0 flex-1">
                  <Text className="text-[15px] font-semibold text-foreground">
                    {account.chainName}
                  </Text>
                  <AddressPill
                    address={account.address}
                    className="mt-1"
                    onCopy={(address) => Clipboard.setStringAsync(address)}
                  />
                </View>
              </View>
            ))}
          </View>

          <View className="mt-4 flex-row items-start gap-2 px-1">
            <Icon
              as={phrase ? Link2 : Info}
              size={15}
              className="mt-0.5 shrink-0 text-muted-foreground"
            />
            <Text className="flex-1 text-[13px] leading-5 text-muted-foreground">
              {phrase
                ? t('onboarding.success.footnotePhrase')
                : t('onboarding.success.footnoteXrpl')}
            </Text>
          </View>
        </View>

        <Button
          variant="brand"
          size="lg"
          className="w-full"
          onPress={() => router.replace(Routes.OnboardingNotifications)}
        >
          <Text>{t('onboarding.success.cta')}</Text>
          <Icon as={ArrowRight} size={18} className="text-brand-foreground" />
        </Button>
      </View>
    </View>
  );
}
