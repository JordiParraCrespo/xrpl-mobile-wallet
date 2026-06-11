import { Badge } from '@flama/design-system-mobile/badge';
import { Callout } from '@flama/design-system-mobile/callout';
import { SecretNumbersInput } from '@flama/design-system-mobile/secret-numbers-input';
import { Text } from '@flama/design-system-mobile/text';
import {
  isValidSecretNumbersRow,
  SECRET_NUMBERS_ROW_COUNT,
  SECRET_NUMBERS_ROW_LENGTH,
} from '@flama/frontend';
import { useImportSecretNumbers } from '@flama/frontend/react';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { OnboardingStepScreen } from '../../components/auth/onboarding-step-screen';
import { buildRoute } from '../../lib/routes';

/** Rows still being typed are neutral; only complete rows are checked. */
const validateRow = (row: string, index: number): boolean | null => {
  if (row.length < SECRET_NUMBERS_ROW_LENGTH) return null;
  return isValidSecretNumbersRow(row, index);
};

export default function ImportSecretNumbersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [rows, setRows] = React.useState<string[]>(() =>
    Array.from({ length: SECRET_NUMBERS_ROW_COUNT }, () => ''),
  );

  const importNumbers = useImportSecretNumbers({
    onSuccess: () => router.replace(buildRoute.onboardingSuccess('xrpl')),
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
      title={t('onboarding.importSecretNumbers.title')}
      titleBadge={
        <Badge variant="secondary">
          <Text>{t('onboarding.common.xrplOnly')}</Text>
        </Badge>
      }
      subtitle={t('onboarding.importSecretNumbers.subtitle')}
      cta={{
        label: importNumbers.isPending
          ? t('onboarding.common.importing')
          : t('onboarding.common.continue'),
        disabled: !allValid || importNumbers.isPending,
        onPress: confirm,
      }}
    >
      <View className="mt-6">
        <SecretNumbersInput rows={rows} onChangeRows={setRows} validateRow={validateRow} />
      </View>

      <View className="mt-4">
        {anyBad || importNumbers.isError ? (
          <Callout variant="negative">
            {importNumbers.isError
              ? t('onboarding.importSecretNumbers.errorImport')
              : t('onboarding.importSecretNumbers.errorInvalid')}
          </Callout>
        ) : (
          <Callout variant="neutral">{t('onboarding.importSecretNumbers.securityNote')}</Callout>
        )}
      </View>
    </OnboardingStepScreen>
  );
}
