import { AddressPill } from '@flama/design-system-mobile/address-pill';
import { Button } from '@flama/design-system-mobile/button';
import { ChainBadge } from '@flama/design-system-mobile/chain-badge';
import { GlassPanel } from '@flama/design-system-mobile/glass-panel';
import { Icon } from '@flama/design-system-mobile/icon';
import { SuccessTick } from '@flama/design-system-mobile/success-tick';
import { Text } from '@flama/design-system-mobile/text';
import { useWalletState } from '@flama/frontend/react';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Info, Link2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Routes } from '../../lib/routes';

// The immersive flow finale (onboarding/screens-immersive.jsx — Success,
// black variant): glass tick, "You're all set", and a frosted account card
// listing the restored chain accounts. `via=phrase` restored every chain;
// `via=xrpl` (family seed / secret numbers) restored the XRP Ledger only.
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
    <View className="flex-1 bg-[#08060f]">
      <StatusBar style="light" />
      <View
        className="flex-1 px-6"
        style={{
          paddingTop: insets.top + 34,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="items-center gap-3.5">
          <SuccessTick variant="glass" size={72} />
          <Text className="font-display text-[34px] tracking-[-0.5px] text-white">
            {t('onboarding.success.title')}
          </Text>
          <Text className="max-w-[300px] text-center text-[15.5px] leading-6 text-white/80">
            {phrase ? t('onboarding.success.subtitlePhrase') : t('onboarding.success.subtitleXrpl')}
          </Text>
        </View>

        <View className="flex-1 justify-center">
          <GlassPanel variant="on-dark" padded={false} className="rounded-2xl px-[18px]">
            <View className="flex-row items-center justify-between pt-3.5 pb-3">
              <Text className="text-[13px] font-semibold tracking-[0.3px] text-white/70">
                {walletName.toUpperCase()}
              </Text>
              <Text className="text-xs text-white/60">
                {t('onboarding.success.networks', { count: accounts.length })}
              </Text>
            </View>
            {accounts.map((account) => (
              <View
                key={account.chainId}
                className="flex-row items-center gap-3 border-t border-white/[0.12] py-3.5"
              >
                <ChainBadge kind={account.kind === 'evm' ? 'evm' : 'xrp'} size={40} />
                <View className="min-w-0 flex-1">
                  <Text className="text-[15px] font-semibold text-white">{account.chainName}</Text>
                  <AddressPill
                    address={account.address}
                    onDark
                    className="mt-1"
                    onCopy={(address) => Clipboard.setStringAsync(address)}
                  />
                </View>
              </View>
            ))}
          </GlassPanel>

          <View className="mt-4 flex-row items-start gap-2 px-1">
            <Icon as={phrase ? Link2 : Info} size={15} className="mt-0.5 shrink-0 text-white/65" />
            <Text className="flex-1 text-[13px] leading-5 text-white/65">
              {phrase
                ? t('onboarding.success.footnotePhrase')
                : t('onboarding.success.footnoteXrpl')}
            </Text>
          </View>
        </View>

        <Button
          size="lg"
          className="w-full bg-white active:bg-white/90"
          onPress={() => router.replace(Routes.Home)}
        >
          <Text className="text-[15px] font-semibold text-[#0a0812]">
            {t('onboarding.success.cta')}
          </Text>
          <Icon as={ArrowRight} size={18} className="text-[#0a0812]" />
        </Button>
      </View>
    </View>
  );
}
