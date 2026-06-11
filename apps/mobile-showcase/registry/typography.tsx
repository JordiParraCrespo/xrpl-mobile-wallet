import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

// Foundations — type. Refero Title (serif, weight 400 only) for
// balances and display headings; Inter for body and labels; JetBrains
// Mono for amounts, addresses and codes.

function Specimen({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-1.5">
      <Text className="font-mono text-[11px] text-muted-foreground">
        {label}
      </Text>
      {children}
    </View>
  );
}

export default function TypographyScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-5">
        <Text className="text-lg font-semibold text-foreground">
          Text variants
        </Text>
        <Specimen label='variant="display"'>
          <Text variant="display">Drops</Text>
        </Specimen>
        <Specimen label='variant="balance" · tabular'>
          <Text variant="balance">$942.76</Text>
        </Specimen>
        <Specimen label='variant="h1"'>
          <Text variant="h1">Heading 1</Text>
        </Specimen>
        <Specimen label='variant="h2"'>
          <Text variant="h2">Heading 2</Text>
        </Specimen>
        <Specimen label='variant="h3"'>
          <Text variant="h3">Heading 3</Text>
        </Specimen>
        <Specimen label='variant="h4"'>
          <Text variant="h4">Heading 4</Text>
        </Specimen>
        <Specimen label='variant="default"'>
          <Text>Hold, send and receive across every XRPL chain.</Text>
        </Specimen>
        <Specimen label='variant="lead"'>
          <Text variant="lead">
            Calm, plain-spoken interface copy in sentence case.
          </Text>
        </Specimen>
        <Specimen label='variant="large"'>
          <Text variant="large">Large text</Text>
        </Specimen>
        <Specimen label='variant="small"'>
          <Text variant="small">Small text</Text>
        </Specimen>
        <Specimen label='variant="muted"'>
          <Text variant="muted">Muted text for secondary content</Text>
        </Specimen>
        <Specimen label='variant="caption"'>
          <Text variant="caption">Account 1</Text>
        </Specimen>
        <Specimen label='variant="code"'>
          <Text variant="code">rJordn4…Kq7vZ2</Text>
        </Specimen>
      </View>

      <View className="gap-5">
        <Text className="text-lg font-semibold text-foreground">
          Font families
        </Text>
        <View className="gap-1.5 rounded-lg border border-border bg-card p-4">
          <Text className="font-mono text-[11px] text-muted-foreground">
            font-display · Refero Title
          </Text>
          <Text className="font-display text-5xl font-normal tracking-tight text-foreground">
            $942.76
          </Text>
        </View>
        <View className="gap-1.5 rounded-lg border border-border bg-card p-4">
          <Text className="font-mono text-[11px] text-muted-foreground">
            font-sans · Inter
          </Text>
          <Text className="font-sans text-xl font-semibold text-foreground">
            Hold, send and receive across every XRPL chain.
          </Text>
          <Text className="font-sans text-[15px] text-muted-foreground">
            Calm, plain-spoken interface copy in sentence case.
          </Text>
        </View>
        <View className="gap-1.5 rounded-lg border border-border bg-card p-4">
          <Text className="font-mono text-[11px] text-muted-foreground">
            font-mono · JetBrains Mono
          </Text>
          <Text className="font-mono text-lg text-foreground">
            1,204.51 XRP · rJordn4…Kq7vZ2
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
