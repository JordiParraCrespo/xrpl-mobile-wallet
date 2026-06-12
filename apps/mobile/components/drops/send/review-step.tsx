import { AmountDisplay } from '@flama/design-system-mobile/amount-display';
import { Button } from '@flama/design-system-mobile/button';
import { Callout } from '@flama/design-system-mobile/callout';
import { DetailList, DetailRow } from '@flama/design-system-mobile/detail-list';
import { Icon } from '@flama/design-system-mobile/icon';
import { InitialsAvatar } from '@flama/design-system-mobile/initials-avatar';
import { Text } from '@flama/design-system-mobile/text';
import { Send } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fmtUsd, fmtXrp } from './send-data';
import type { UseSend } from './use-send';

/**
 * Review step — the safety gate for an irreversible payment. Restates who, how
 * much, and the From / Network / Fee / Note breakdown, then the brand Send
 * button. A failed broadcast surfaces inline rather than dropping the user.
 */
export function ReviewStep({ send }: { send: UseSend }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { account, recipient } = send;

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="items-center px-5 pt-5"
      >
        <InitialsAvatar name={recipient.name} size="lg" />
        <Text className="text-foreground mt-3 text-lg font-bold">{recipient.name}</Text>
        {recipient.handle ? (
          <Text className="text-muted-foreground mt-0.5 font-mono text-[13px]">
            {recipient.handle}
          </Text>
        ) : null}

        <AmountDisplay
          value={send.value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          symbol="$"
          symbolPosition="prefix"
          className="mt-5"
        />
        {send.xrp != null ? (
          <Text className="text-muted-foreground mt-1 text-sm">
            {t('send.approx', { amount: fmtXrp(send.xrp, 2) })}
          </Text>
        ) : null}

        <DetailList card className="mt-6">
          <DetailRow
            label={t('send.from')}
            value={`${account?.label ?? ''} · ${account?.network ?? ''}`}
          />
          <DetailRow label={t('send.network')} value={account?.network ?? 'XRP Ledger'} />
          <DetailRow label={t('send.fee')} value="0.00001 XRP" mono />
          <DetailRow label={t('send.note')} value={send.note || t('send.none')} />
        </DetailList>

        {send.error ? (
          <Callout variant="negative" className="mt-4">
            {t('send.failed')}
          </Callout>
        ) : null}
      </ScrollView>

      <View className="px-5 pt-3" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button
          variant="brand"
          size="lg"
          disabled={!send.canSend}
          onPress={send.confirm}
          className="h-[54px] w-full rounded-full"
        >
          <Icon as={Send} size={18} className="text-brand-foreground" />
          <Text>
            {send.isSending
              ? t('send.sending')
              : recipient.address
                ? t('send.submit', { amount: fmtUsd(send.value) })
                : t('send.noRecipient')}
          </Text>
        </Button>
      </View>
    </>
  );
}
