import { Text } from "@flama/design-system-mobile/text";
import { View } from "react-native";
import { MOCK_ACCOUNT, UNLOCK_LIGHT } from "./unlock-theme";

type UnlockIdentityProps = {
  /** Initials shown on the avatar disc. Defaults to the mock account. */
  initials?: string;
  /** First name shown in the greeting. Defaults to the mock account. */
  name?: string;
};

/**
 * The locked-vault identity block: a 96px avatar disc with the account
 * initials over a translucent-white circle, and a "Welcome back, …" greeting.
 */
export function UnlockIdentity({
  initials = MOCK_ACCOUNT.initials,
  name = MOCK_ACCOUNT.name,
}: UnlockIdentityProps) {
  return (
    <View className="items-center">
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 96,
          height: 96,
          backgroundColor: UNLOCK_LIGHT.avatarBg,
        }}
      >
        <Text
          className="font-sans font-bold"
          style={{ fontSize: 34, color: UNLOCK_LIGHT.avatarFg }}
        >
          {initials}
        </Text>
      </View>
      <Text
        className="font-sans font-bold"
        style={{
          fontSize: 27,
          color: UNLOCK_LIGHT.fg,
          marginTop: 22,
          letterSpacing: -0.2,
        }}
      >
        Welcome back, {name}
      </Text>
    </View>
  );
}
