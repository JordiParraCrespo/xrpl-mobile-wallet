import { Button } from '@flama/design-system-mobile/button';
import { DetailList, DetailRow } from '@flama/design-system-mobile/detail-list';
import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Download, Globe, MoreHorizontal, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getContact,
  getTransaction,
  TransactionActions,
  TransactionHero,
} from '../../components/drops/payments';

// A small white round control for the modal top bar (close / more).
function RoundControl({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress?: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="bg-card border-border h-10 w-10 items-center justify-center rounded-full border active:scale-[0.97]"
    >
      {children}
    </Pressable>
  );
}

/**
 * Transaction detail — the full record behind a payment bubble (design:
 * `payments.html` · `payments/payments-screens.jsx` TxDetailSheet). The
 * counterparty hero, the quick-action chips, then Status / parties, the ledger
 * timestamps and the tx hash, finishing on Open in explorer.
 *
 * Mocked: the transaction comes from `getTransaction`; the counterparty is the
 * chat contact when present (`contact` param), otherwise the transaction's own
 * default peer. Presented as a modal, so it slides up over the chat.
 */
export default function TransactionDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id, contact } = useLocalSearchParams<{
    id: string;
    contact?: string;
  }>();

  const tx = getTransaction(id);
  const peer = contact ? getContact(contact).name : tx.peer;
  const incoming = tx.dir === 'in';

  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />

      <View
        className="flex-row items-center justify-between px-4 pb-1"
        style={{ paddingTop: insets.top + 8 }}
      >
        <RoundControl label="Close" onPress={() => router.back()}>
          <Icon as={X} size={19} className="text-foreground" />
        </RoundControl>
        <RoundControl label="More">
          <Icon as={MoreHorizontal} size={19} className="text-foreground" />
        </RoundControl>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-[18px] pt-2"
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      >
        <TransactionHero tx={tx} peer={peer} />

        <View className="mt-5">
          <TransactionActions />
        </View>

        {/* Status + parties */}
        <DetailList card className="mt-3">
          <DetailRow
            label={t('payments.transaction.status')}
            value={
              <View className="flex-row items-center gap-1.5">
                <View className="bg-positive h-[7px] w-[7px] rounded-full" />
                <Text className="text-foreground text-sm font-semibold">
                  {t('payments.transaction.settled')}
                </Text>
              </View>
            }
          />
          <DetailRow
            label={incoming ? t('payments.transaction.from') : t('payments.transaction.to')}
            value={peer}
          />
          <DetailRow
            label={t('payments.transaction.account')}
            value={t('payments.transaction.accountValue')}
            accent
          />
        </DetailList>

        {/* Ledger timestamps */}
        <DetailList card className="mt-3">
          <DetailRow label={t('payments.transaction.date')} value={tx.date} />
          <DetailRow label={t('payments.transaction.submitted')} value={tx.submitted} mono />
          <DetailRow label={t('payments.transaction.validated')} value={tx.validated} mono />
          <DetailRow
            label={t('payments.transaction.network')}
            value={t('payments.transaction.networkValue')}
          />
          <DetailRow
            label={t('payments.transaction.ledgerIndex')}
            value={tx.ledger.toLocaleString('en-US')}
            mono
          />
          <DetailRow label={t('payments.transaction.networkFee')} value={`${tx.fee} XRP`} mono />
        </DetailList>

        {/* Transaction hash + confirmation */}
        <DetailList card className="mt-3">
          <DetailRow label={t('payments.transaction.transaction')} value={tx.hash} mono />
          <DetailRow
            label={t('payments.transaction.confirmation')}
            value={
              <View className="flex-row items-center gap-1.5">
                <Text className="text-brand text-sm font-semibold">
                  {t('payments.transaction.download')}
                </Text>
                <Icon as={Download} size={16} className="text-brand" />
              </View>
            }
          />
        </DetailList>

        <Button variant="brand" size="lg" className="mt-4 w-full">
          <Icon as={Globe} size={18} />
          <Text>{t('payments.transaction.openExplorer')}</Text>
        </Button>

        <Pressable accessibilityRole="button" className="mt-3 items-center py-1 active:opacity-70">
          <Text className="text-muted-foreground text-[14px] font-semibold">
            {t('payments.transaction.getHelp')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
