import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@flama/design-system-mobile/avatar";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function AvatarScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          With Image
        </Text>
        <View className="flex-row gap-4 items-center">
          <Avatar className="size-12">
            <AvatarImage
              source={{
                uri: "https://api.dicebear.com/9.x/initials/png?seed=JD",
              }}
            />
            <AvatarFallback>
              <Text>JD</Text>
            </AvatarFallback>
          </Avatar>
          <Avatar className="size-12">
            <AvatarImage
              source={{
                uri: "https://api.dicebear.com/9.x/initials/png?seed=AB",
              }}
            />
            <AvatarFallback>
              <Text>AB</Text>
            </AvatarFallback>
          </Avatar>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Fallback Only
        </Text>
        <View className="flex-row gap-4 items-center">
          <Avatar className="size-12">
            <AvatarFallback>
              <Text className="text-sm">CN</Text>
            </AvatarFallback>
          </Avatar>
          <Avatar className="size-10">
            <AvatarFallback>
              <Text className="text-xs">SM</Text>
            </AvatarFallback>
          </Avatar>
          <Avatar className="size-8">
            <AvatarFallback>
              <Text className="text-xs">XS</Text>
            </AvatarFallback>
          </Avatar>
        </View>
      </View>
    </ScrollView>
  );
}
