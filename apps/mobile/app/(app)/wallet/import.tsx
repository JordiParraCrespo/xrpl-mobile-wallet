import { Button } from '@flama/design-system-mobile/button';
import { Text } from '@flama/design-system-mobile/text';
import { Textarea } from '@flama/design-system-mobile/textarea';
import { useImportWallet } from '@flama/frontend/react';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

export default function ImportWalletScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [mnemonic, setMnemonic] = React.useState('');

  const importWallet = useImportWallet({
    onSuccess: () => router.replace('/(app)/wallet'),
  });

  return (
    <>
      <Stack.Screen options={{ title: t('wallet.import.title') }} />
      <ScrollView contentContainerClassName="p-6 gap-6">
        <View className="gap-2">
          <Text className="text-base text-muted-foreground">{t('wallet.import.subtitle')}</Text>
        </View>
        <Textarea
          value={mnemonic}
          onChangeText={setMnemonic}
          placeholder={t('wallet.import.placeholder')}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          numberOfLines={4}
        />
        {importWallet.isError && (
          <Text className="text-sm text-destructive">{t('wallet.import.invalid')}</Text>
        )}
        <Button
          onPress={() => importWallet.mutate(mnemonic)}
          disabled={!mnemonic.trim() || importWallet.isPending}
        >
          <Text>
            {importWallet.isPending ? t('wallet.import.importing') : t('wallet.import.submit')}
          </Text>
        </Button>
      </ScrollView>
    </>
  );
}
