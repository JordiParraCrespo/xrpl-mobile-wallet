import { Badge } from "@flama/design-system-mobile/badge";
import { Callout } from "@flama/design-system-mobile/callout";
import { SecretNumbersInput } from "@flama/design-system-mobile/secret-numbers-input";
import { Text } from "@flama/design-system-mobile/text";
import {
  isValidSecretNumbersRow,
  SECRET_NUMBERS_ROW_COUNT,
  SECRET_NUMBERS_ROW_LENGTH,
} from "@flama/frontend";
import { useImportSecretNumbers } from "@flama/frontend/react";
import { useRouter } from "expo-router";
import * as React from "react";
import { View } from "react-native";
import { OnboardingStepScreen } from "../../../components/auth/onboarding-step-screen";
import { buildRoute } from "../../../lib/routes";

/** Rows still being typed are neutral; only complete rows are checked. */
const validateRow = (row: string, index: number): boolean | null => {
  if (row.length < SECRET_NUMBERS_ROW_LENGTH) return null;
  return isValidSecretNumbersRow(row, index);
};

export default function ImportSecretNumbersScreen() {
  const router = useRouter();
  const [rows, setRows] = React.useState<string[]>(() =>
    Array.from({ length: SECRET_NUMBERS_ROW_COUNT }, () => ""),
  );

  const importNumbers = useImportSecretNumbers({
    onSuccess: () => router.replace(buildRoute.onboardingSuccess("xrpl")),
  });

  const allValid = rows.every((row, i) => validateRow(row, i) === true);
  const anyBad = rows.some((row, i) => validateRow(row, i) === false);

  const confirm = () => {
    if (!allValid || importNumbers.isPending) return;
    importNumbers.mutate({ rows });
  };

  return (
    <OnboardingStepScreen
      step={2}
      title="Enter your secret numbers"
      titleBadge={
        <Badge variant="secondary">
          <Text>XRP Ledger only</Text>
        </Badge>
      }
      subtitle="Eight rows of six digits, as shown in your backup. Each row checks itself as you type."
      cta={{
        label: importNumbers.isPending ? "Importing…" : "Continue",
        disabled: !allValid || importNumbers.isPending,
        onPress: confirm,
      }}
    >
      <View className="mt-6">
        <SecretNumbersInput
          rows={rows}
          onChangeRows={setRows}
          validateRow={validateRow}
        />
      </View>

      <View className="mt-4">
        {anyBad || importNumbers.isError ? (
          <Callout variant="negative">
            {importNumbers.isError
              ? "Those numbers couldn't be imported. Re-check them against your backup and try again."
              : "One or more rows don't add up. A red row means a digit is off — re-check it against your backup."}
          </Callout>
        ) : (
          <Callout variant="neutral">
            Each row carries its own checksum, so typos are caught instantly.
            Nothing leaves this device.
          </Callout>
        )}
      </View>
    </OnboardingStepScreen>
  );
}
