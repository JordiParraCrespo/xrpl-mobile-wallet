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
 * Interaction state lives in `useReceive`; data is mocked.
 */
export default function ReceiveScreen() {
  const router = useRouter();
  const { account, copied, cycle, copy, share } = useReceive();

  return (
    <View style={vars(FLOW_DARK_VARS)} className="dark flex-1 bg-[#08080b]">
      <StatusBar style="light" />

      <ReceiveHeader title="Receive" onBack={() => router.back()} />

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
    </View>
  );
}
