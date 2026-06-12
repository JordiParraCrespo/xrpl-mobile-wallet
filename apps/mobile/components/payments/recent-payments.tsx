import { AmountText } from '@flama/design-system-mobile/amount-text';
import { InitialsAvatar } from '@flama/design-system-mobile/initials-avatar';
import { ListRow } from '@flama/design-system-mobile/list-row';
import { Skeleton } from '@flama/design-system-mobile/skeleton';
import { Text } from '@flama/design-system-mobile/text';
import type { RecentPayment } from '@flama/frontend/react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { formatPaymentDate } from './format-date';

type RecentPaymentsProps = {
  payments: RecentPayment[];
  isLoading: boolean;
  onOpenPayment: (payment: RecentPayment) => void;
  onSeeAll?: () => void;
};

/**
 * The "Recent" card: each transaction as a contact row with the resolved name,
 * the relationship copy ("Sent you" / "You sent"), a signed XRP amount and a
 * compact date. Incoming reads positive (green +), outgoing stays ink (−).
 */
export function RecentPayments({
  payments,
  isLoading,
  onOpenPayment,
  onSeeAll,
}: RecentPaymentsProps) {
  const { t } = useTranslation();

  return (
    <View className="px-4">
      <View className="flex-row items-baseline justify-between px-1 pb-2.5">
        <Text variant="h4">{t('payments.recent')}</Text>
        {payments.length > 0 ? (
          <Pressable onPress={onSeeAll} disabled={!onSeeAll} className="active:opacity-70">
            <Text className="text-muted-foreground text-[13.5px] font-semibold">
              {t('payments.seeAll')}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="bg-card border-border overflow-hidden rounded-xl border">
        {isLoading && payments.length === 0 ? (
          <RecentPaymentsSkeleton />
        ) : payments.length === 0 ? (
          <EmptyRecent />
        ) : (
          payments.map((payment) => {
            const incoming = payment.direction === 'in';
            const tone = !payment.success ? 'muted' : incoming ? 'positive' : 'default';
            return (
              <ListRow
                key={payment.id}
                onPress={() => onOpenPayment(payment)}
                media={<InitialsAvatar name={payment.name} size="md" />}
                title={payment.key === 'unknown' ? t('payments.unknown') : payment.name}
                subtitle={t(`payments.relationship.${payment.direction}`)}
                value={
                  <AmountText
                    value={incoming ? payment.amount : -payment.amount}
                    currency={payment.symbol}
                    signed
                    mono
                    size="md"
                    tone={tone}
                    decimals={2}
                  />
                }
                meta={formatPaymentDate(payment.timestamp)}
              />
            );
          })
        )}
      </View>
    </View>
  );
}

function EmptyRecent() {
  const { t } = useTranslation();

  return (
    <View className="items-center gap-1 px-6 py-10">
      <Text className="text-foreground text-[15px] font-semibold">{t('payments.emptyTitle')}</Text>
      <Text className="text-muted-foreground text-center text-[13px]">
        {t('payments.emptyDescription')}
      </Text>
    </View>
  );
}

function RecentPaymentsSkeleton() {
  return (
    <View>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} className="flex-row items-center gap-3.5 px-4 py-3.5">
          <Skeleton className="h-11 w-11 rounded-full" />
          <View className="flex-1 gap-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </View>
          <Skeleton className="h-3.5 w-16" />
        </View>
      ))}
    </View>
  );
}
