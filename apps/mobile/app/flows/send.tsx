import { InitialsAvatar } from '@flama/design-system-mobile/initials-avatar';
import { Keypad } from '@flama/design-system-mobile/keypad';
import { Text } from '@flama/design-system-mobile/text';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { vars } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
// The money flows share one set of dark tokens; they live with the first flow
// that needed them (receive) and are reused here so the design-system primitives
// resolve white-on-dark regardless of the system theme.
import { FLOW_DARK_VARS } from '../../components/drops/receive';
import { AmountStep, ReviewStep, SendHeader, SentStep, useSend } from '../../components/drops/send';
import { Routes } from '../../lib/routes';

/**
 * Send — the peer-to-peer payment flow (design: `send.html` ·
 * `flows/send-app.jsx`). Three steps in one screen — Amount, Review, Sent — over
 * a shared dark surface. A thin shell: it pins the flow tokens and the keypad,
 * delegating each step to a part under `components/drops/send` and the wallet
 * domain to `useSend` (paying account · live rate · balance guard · broadcast).
 */
export default function SendScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const send = useSend();

  const done = () => router.replace(Routes.Payments);

  return (
    <View style={vars(FLOW_DARK_VARS)} className="dark flex-1 bg-[#08080b]">
      <StatusBar style="light" />

      {send.step === 'amount' ? (
        <SendHeader
          title={send.recipient.name}
          subtitle={send.recipient.handle}
          onBack={() => router.back()}
          right={<InitialsAvatar name={send.recipient.name} size="sm" />}
        />
      ) : send.step === 'review' ? (
        <SendHeader title={t('send.review')} onBack={send.toAmount} />
      ) : null}

      {send.account ? (
        send.step === 'amount' ? (
          <>
            <AmountStep send={send} />
            <Keypad onKey={send.onKey} className="px-2 pb-1" />
          </>
        ) : send.step === 'review' ? (
          <ReviewStep send={send} />
        ) : (
          <SentStep send={send} onDone={done} />
        )
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-[15px] leading-[22px] text-white/60">
            {send.status === 'locked' ? t('send.locked') : t('send.empty')}
          </Text>
        </View>
      )}
    </View>
  );
}
