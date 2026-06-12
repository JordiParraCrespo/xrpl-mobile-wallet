import { Text } from '@flama/design-system-mobile/text';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { vars } from 'nativewind';
import { ScrollView, View } from 'react-native';
import {
  AccountSwitcher,
  AddressCard,
  DestinationTag,
  FLOW_DARK_VARS,
  NetworkWarning,
  ReceiveActions,
  ReceiveHeader,
  ReceiveQr,
  useReceive,
} from '../../components/drops/receive';

/**
 * Receive — share an address to get paid (design: `receive.html` ·
 * `flows/receive-app.jsx`). A thin shell that pins the dark flow tokens
 * (`FLOW_DARK_VARS` + the `dark` class) so the design-system primitives resolve
 * white-on-dark, then composes the parts under `components/drops/receive`.
 *
 * The receiving accounts come from the wallet domain via `useReceive`
 * (`useWalletState().accounts`); when none are available yet (still restoring,
 * or locked) we show a quiet placeholder rather than empty controls.
 */
export default function ReceiveScreen() {
  const router = useRouter();
  const { account, status, copied, cycle, copy, share } = useReceive();

  return (
    <View style={vars(FLOW_DARK_VARS)} className="dark flex-1 bg-[#08080b]">
      <StatusBar style="light" />

      <ReceiveHeader title="Receive" onBack={() => router.back()} />

      {account ? (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="items-center px-5 pt-2"
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <AccountSwitcher account={account} onCycle={cycle} />
            <ReceiveQr seed={account.seed} />
            <AddressCard account={account} copied={copied} onCopy={copy} />
            {account.tag ? <DestinationTag tag={account.tag} /> : null}
            <NetworkWarning network={account.network} />
          </ScrollView>

          <ReceiveActions copied={copied} onCopy={copy} onShare={share} />
        </>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-[15px] leading-[22px] text-white/60">
            {status === 'locked'
              ? 'Unlock your wallet to receive.'
              : 'No receiving account is available yet.'}
          </Text>
        </View>
      )}
    </View>
  );
}
