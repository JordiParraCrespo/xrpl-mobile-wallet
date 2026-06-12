import { Separator } from '@flama/design-system-mobile/separator';
import { Text } from '@flama/design-system-mobile/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { ActivityRow } from './activity-row';
import { HomeCard } from './home-card';
import type { HomeActivity } from './home-data';

/**
 * The Activity section: a heading with "See all" and the recent transactions,
 * grouped in one frosted glass card with hairline separators between rows.
 */
export function ActivitySection({
  activity,
  onSeeAll,
}: {
  activity: HomeActivity[];
  onSeeAll: () => void;
}) {
  return (
    <View className="mt-[22px]">
      <View className="flex-row items-center justify-between px-1 pb-2.5">
        <Text className="font-display text-[19px] tracking-[-0.2px] text-foreground">Activity</Text>
        <Pressable onPress={onSeeAll} className="active:opacity-70">
          <Text className="text-[13.5px] font-semibold text-muted-foreground">See all</Text>
        </Pressable>
      </View>

      <HomeCard className="rounded-xl">
        {activity.map((item, i) => (
          <React.Fragment key={item.id}>
            {i > 0 ? <Separator className="ml-[68px]" /> : null}
            <ActivityRow activity={item} />
          </React.Fragment>
        ))}
      </HomeCard>
    </View>
  );
}
