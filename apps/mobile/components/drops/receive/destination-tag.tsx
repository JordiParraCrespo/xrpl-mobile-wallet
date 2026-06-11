import { Text } from '@flama/design-system-mobile/text';
import { View } from 'react-native';

// Destination tag — surfaced explicitly for XRPL accounts that require one
// (some exchanges need it to credit a transfer). A quiet hairline pill.
export function DestinationTag({ tag }: { tag: string }) {
  return (
    <View className="border-border bg-card mt-3 flex-row items-center gap-2 self-center rounded-full border px-3.5 py-[7px]">
      <Text className="text-muted-foreground text-[12.5px]">Destination tag</Text>
      <Text className="text-foreground font-mono text-[13.5px] font-semibold">{tag}</Text>
    </View>
  );
}
