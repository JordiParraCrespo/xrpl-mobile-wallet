import { Button } from "@flama/design-system-mobile/button";
import { Text } from "@flama/design-system-mobile/text";
import { Link } from "expo-router";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { SECTIONS } from "../lib/constants";

export default function HomeScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-3">
      <Text variant="h2" className="text-foreground">
        Drops
      </Text>
      <Text className="text-base text-muted-foreground mb-2">
        The building blocks used across the XRPL wallet.
      </Text>
      {SECTIONS.map(({ title, items }) => (
        <View key={title} className="gap-3">
          <Text variant="caption" className="mt-4">
            {title}
          </Text>
          {items.map(({ slug, name }) => (
            <Link key={slug} href={`/components/${slug}`} asChild>
              <Button variant="outline" size="lg" className="w-full">
                <Text>{name}</Text>
              </Button>
            </Link>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
