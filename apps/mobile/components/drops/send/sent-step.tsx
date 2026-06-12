import { AmountDisplay } from '@flama/design-system-mobile/amount-display';
import { Button } from '@flama/design-system-mobile/button';
import { SuccessTick } from '@flama/design-system-mobile/success-tick';
import { Text } from '@flama/design-system-mobile/text';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { UseSend } from './use-send';

/**
 * Sent step — concrete settlement confirmation (the animated tick, the amount,
 * and a "settled on the XRP Ledger" note) that builds trust after an
 * irreversible payment. "Send again" resets the flow; "Done" returns to chat.
 */
export function SentStep({ send, onDone }: { send: UseSend; onDone: () => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <>
      <View className="flex-1 items-center justify-center px-8">
        <SuccessTick size={84} variant="positive" glow />
        <AmountDisplay
          value={send.value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          symbol="$"
          symbolPosition="prefix"
          className="mt-6"
        />
        <Text className="text-positive mt-0.5 text-[17px] font-semibold">{t('send.sent')}</Text>
        <Text className="text-muted-foreground mt-3 max-w-[260px] text-center text-[15px] leading-[22px]">
          {t('send.settled', { name: send.recipient.name.split(' ')[0] })}
        </Text>
      </View>

      <View className="gap-2.5 px-5 pt-3" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button
          variant="secondary"
          size="lg"
          onPress={send.reset}
          className="h-[54px] w-full rounded-full"
        >
          <Text>{t('send.sendAgain')}</Text>
        </Button>
        <Button variant="brand" size="lg" onPress={onDone} className="h-[54px] w-full rounded-full">
          <Text>{t('send.done')}</Text>
        </Button>
      </View>
    </>
  );
}
