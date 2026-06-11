import { Icon } from "@flama/design-system-mobile/icon";
import { InputField } from "@flama/design-system-mobile/input-field";
import { Text } from "@flama/design-system-mobile/text";
import {
  AtSign,
  ClipboardPaste,
  Search,
  TriangleAlert,
  X,
} from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function InputFieldScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Basic</Text>
        <View className="gap-4">
          <InputField placeholder="Search people, payments…" />
          <InputField label="Name" placeholder="e.g. Savings" />
          <InputField
            label="Recipient"
            placeholder="Name, @drops tag, or address"
            hint="You can paste an XRPL or EVM address."
          />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">
          Adornments
        </Text>
        <View className="gap-4">
          <InputField
            placeholder="Search people, payments…"
            leading={<Icon as={Search} size={18} />}
            trailing={<Icon as={X} size={16} />}
          />
          <InputField
            label="Drops tag"
            placeholder="yourname"
            leading={<Icon as={AtSign} size={18} />}
          />
          <InputField
            label="Address"
            placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            trailing={<Icon as={ClipboardPaste} size={18} />}
          />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Filled</Text>
        <InputField filled label="Memo" placeholder="Add a note (optional)" />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Error</Text>
        <InputField
          label="Address"
          defaultValue="rXyz…bad"
          error="That isn't a valid XRPL address."
          trailing={
            <Icon as={TriangleAlert} size={18} className="text-destructive" />
          }
        />
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Disabled</Text>
        <InputField
          label="Network"
          defaultValue="XRPL Mainnet"
          editable={false}
        />
      </View>
    </ScrollView>
  );
}
