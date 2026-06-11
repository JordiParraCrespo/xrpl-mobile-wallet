import { Text } from "@flama/design-system-mobile/text";
import { cn } from "@flama/design-system-mobile/utils";
import * as React from "react";
import { ScrollView, View } from "react-native";

// Foundations — color. The design's brand/ink ramps are not exposed as
// raw steps here: the app consumes semantic tokens that resolve per
// scheme (light/dark), so swatches below render the semantic pairs.

type SwatchDef = { name: string; className: string };

const GROUPS: { title: string; swatches: SwatchDef[] }[] = [
  {
    title: "Brand",
    swatches: [
      { name: "Brand · money-action", className: "bg-brand" },
      { name: "Brand soft", className: "bg-brand-soft" },
      { name: "Ring · focus", className: "bg-ring" },
    ],
  },
  {
    title: "Ink & surfaces",
    swatches: [
      { name: "Background", className: "bg-background" },
      { name: "Foreground · primary text", className: "bg-foreground" },
      { name: "Card", className: "bg-card" },
      { name: "Secondary", className: "bg-secondary" },
      { name: "Muted", className: "bg-muted" },
      { name: "Accent", className: "bg-accent" },
      { name: "Border · hairline", className: "bg-border" },
      { name: "Primary · ink pill", className: "bg-primary" },
      { name: "Inverse", className: "bg-inverse" },
    ],
  },
  {
    title: "Semantic",
    swatches: [
      { name: "Positive · received", className: "bg-positive" },
      { name: "Positive soft", className: "bg-positive-soft" },
      { name: "Destructive · sent / failed", className: "bg-destructive" },
      { name: "Destructive soft", className: "bg-destructive-soft" },
      { name: "Warning · pending", className: "bg-warning" },
      { name: "Warning soft", className: "bg-warning-soft" },
      { name: "Info", className: "bg-info" },
      { name: "Info soft", className: "bg-info-soft" },
    ],
  },
];

function Swatch({ name, className }: SwatchDef) {
  return (
    <View className="flex-row items-center gap-3">
      <View
        className={cn("h-9 w-9 rounded-[9px] border border-border", className)}
      />
      <View className="min-w-0 flex-1">
        <Text className="text-[13px] font-semibold text-foreground">
          {name}
        </Text>
        <Text className="font-mono text-[11px] text-muted-foreground">
          {className}
        </Text>
      </View>
    </View>
  );
}

export default function ColorsScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <Text className="text-sm text-muted-foreground">
        Indigo brand for money-actions and selection; a neutral ink ramp for
        text and structure; semantic tones for transaction status. The ramps map
        to semantic tokens that adapt to light and dark mode.
      </Text>
      {GROUPS.map((group) => (
        <View key={group.title} className="gap-3">
          <Text className="text-lg font-semibold text-foreground">
            {group.title}
          </Text>
          <View className="gap-2.5">
            {group.swatches.map((swatch) => (
              <Swatch key={swatch.className} {...swatch} />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
