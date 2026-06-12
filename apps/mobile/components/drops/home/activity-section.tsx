import { Separator } from '@flama/design-system-mobile/separator';
import { Skeleton } from '@flama/design-system-mobile/skeleton';
import { Text } from '@flama/design-system-mobile/text';
import type { RecentPayment } from '@flama/frontend/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { ActivityRow } from './activity-row';
import { HomeCard } from './home-card';

type ActivitySectionProps = {
  /** Recent transactions, newest first (see `useHomeActivity`). */
  activity: RecentPayment[];
  /** True while the first page of history is loading — shows skeleton rows. */
  isLoading?: boolean;
  onSeeAll: () => void;
  /** Open a single transaction's detail. */
  onOpenPayment?: (payment: RecentPayment) => void;
};

/**
 * The Activity section: a heading with "See all" and the recent transactions,
 * grouped in one frosted glass card with hairline separators between rows. Rows
 * are rendered the same way as the payments "Recent" card (contact name,
 * relationship copy, signed amount, date), with loading and empty states.
 */
export function ActivitySection({
  activity,
  isLoading,
  onSeeAll,
  onOpenPayment,
}: ActivitySectionProps) {
  const { t } = useTranslation();
  return (
    <View className="mt-[22px]">
      <View className="flex-row items-center justify-between px-1 pb-2.5">
        <Text className="font-display text-[19px] tracking-[-0.2px] text-foreground">
          {t('home.hub.activity')}
        </Text>
        {activity.length > 0 ? (
          <Pressable onPress={onSeeAll} className="active:opacity-70">
            <Text className="text-[13.5px] font-semibold text-muted-foreground">
              {t('home.hub.seeAll')}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <HomeCard className="rounded-xl">
        {isLoading && activity.length === 0 ? (
          <ActivitySkeleton />
        ) : activity.length === 0 ? (
          <EmptyActivity />
        ) : (
          activity.map((payment, i) => (
            <React.Fragment key={payment.id}>
              {i > 0 ? <Separator className="ml-[68px]" /> : null}
              <ActivityRow payment={payment} onPress={() => onOpenPayment?.(payment)} />
            </React.Fragment>
          ))
        )}
      </HomeCard>
    </View>
  );
}

function EmptyActivity() {
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

function ActivitySkeleton() {
  return (
    <View>
      {[0, 1, 2].map((i) => (
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
