import { Button } from "@flama/design-system-mobile/button";
import {
  MnemonicGrid,
  MnemonicWord,
} from "@flama/design-system-mobile/mnemonic-grid";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

const WORDS = [
  "absorb",
  "gravity",
  "dolphin",
  "tornado",
  "velvet",
  "ranch",
  "puzzle",
  "eager",
  "flavor",
  "unique",
  "noble",
  "cruise",
];

export default function MnemonicGridScreen() {
  const [revealed, setRevealed] = React.useState(false);
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          12 words · tap to reveal
        </Text>
        <MnemonicGrid words={WORDS} revealed={revealed} />
        <Button
          variant="secondary"
          size="sm"
          className="self-start"
          onPress={() => setRevealed((r) => !r)}
        >
          <Text>{revealed ? "Hide words" : "Reveal words"}</Text>
        </Button>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">3 columns</Text>
        <MnemonicGrid words={WORDS} revealed columns={3} />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Single words
        </Text>
        <View className="flex-row gap-2">
          <MnemonicWord index={1} word="absorb" revealed className="flex-1" />
          <MnemonicWord index={2} word="gravity" className="flex-1" />
        </View>
      </View>
    </ScrollView>
  );
}
