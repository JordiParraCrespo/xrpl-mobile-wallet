import { ImportMethodCard } from "@flama/design-system-mobile/import-method-card";
import { Text } from "@flama/design-system-mobile/text";
import { FileText, Hash, KeyRound } from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function ImportMethodCardScreen() {
  const [method, setMethod] = React.useState("phrase");
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Interactive · pick one
        </Text>
        <ImportMethodCard
          icon={FileText}
          title="Recovery phrase"
          description="12 or 24 words — restores every XRPL chain."
          badge="All chains"
          badgeTone="positive"
          selected={method === "phrase"}
          onPress={() => setMethod("phrase")}
        />
        <ImportMethodCard
          icon={KeyRound}
          title="Family seed"
          description="A single s… secret for the XRP Ledger."
          badge="XRPL only"
          badgeTone="secondary"
          selected={method === "seed"}
          onPress={() => setMethod("seed")}
        />
        <ImportMethodCard
          icon={Hash}
          title="Secret numbers"
          description="8 rows of 6 digits, Xaman-style."
          badge="XRPL only"
          badgeTone="secondary"
          selected={method === "numbers"}
          onPress={() => setMethod("numbers")}
        />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">States</Text>
        <ImportMethodCard
          icon={FileText}
          title="Selected"
          description="Brand-soft surface, indigo border and radio."
          badge="All chains"
          badgeTone="positive"
          selected
          onPress={() => {}}
        />
        <ImportMethodCard
          icon={KeyRound}
          title="Default"
          description="Card surface with a hairline border."
          badge="XRPL only"
          badgeTone="secondary"
          onPress={() => {}}
        />
        <ImportMethodCard
          icon={KeyRound}
          title="No badge"
          description="Description only, radio idle."
          onPress={() => {}}
        />
      </View>
    </ScrollView>
  );
}
