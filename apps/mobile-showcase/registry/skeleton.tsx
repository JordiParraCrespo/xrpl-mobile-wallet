import { Skeleton } from "@flama/design-system-mobile/skeleton";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function SkeletonScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Card</Text>
        <View className="flex-row items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <View className="gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </View>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Content Block
        </Text>
        <View className="gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Image</Text>
        <Skeleton className="h-48 w-full rounded-lg" />
      </View>
    </ScrollView>
  );
}
