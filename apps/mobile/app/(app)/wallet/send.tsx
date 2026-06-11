import { Button } from '@flama/design-system-mobile/button';
import { Input } from '@flama/design-system-mobile/input';
import { Label } from '@flama/design-system-mobile/label';
import { Text } from '@flama/design-system-mobile/text';
import { useChainBalance, useSendTransaction, useWalletState } from '@flama/frontend/react';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, View } from 'react-native';

export default function SendScreen() {
  const { t } = useTranslation();
  const { chainId } = useLocalSearchParams<{ chainId: string }>();
  const { accounts } = useWalletState();
  const account = accounts.find((a) => a.chainId === chainId);

  const [to, setTo] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const balance = useChainBalance(chainId ?? '', { enabled: !!account });
  const send = useSendTransaction();

  if (!account) {
    return <Redirect href="/(app)/wallet" />;
  }

  const result = send.data;

  return (
    <>
      <Stack.Screen options={{ title: t('wallet.send.title', { symbol: account.symbol }) }} />
      <ScrollView contentContainerClassName="p-6 gap-6">
        <View className="gap-2">
          <Text className="text-base text-muted-foreground">{account.chainName}</Text>
          {balance.data && (
            <Text className="text-sm text-muted-foreground">
              {t('wallet.accounts.balance')}: {balance.data.formatted} {account.symbol}
            </Text>
          )}
        </View>

        <View className="gap-2">
          <Label>{t('wallet.send.destination')}</Label>
          <Input
            value={to}
            onChangeText={setTo}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={account.kind === 'evm' ? '0x…' : 'r…'}
          />
        </View>

        <View className="gap-2">
          <Label>{t('wallet.send.amount')}</Label>
          <Input
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.0"
          />
        </View>

        {send.isError && <Text className="text-sm text-destructive">{send.error.message}</Text>}

        {result && (
          <View className="gap-2">
            <Text
              className={result.success ? 'text-sm text-foreground' : 'text-sm text-destructive'}
            >
              {result.success ? t('wallet.send.success') : t('wallet.send.failure')}
              {result.error ? ` (${result.error})` : ''}
            </Text>
            <Text selectable className="text-xs text-muted-foreground">
              {result.hash}
            </Text>
            {result.explorerUrl && (
              <Button
                variant="outline"
                onPress={() => result.explorerUrl && Linking.openURL(result.explorerUrl)}
              >
                <Text>{t('wallet.send.viewExplorer')}</Text>
              </Button>
            )}
          </View>
        )}

        <Button
          onPress={() => send.mutate({ chainId: account.chainId, to: to.trim(), amount })}
          disabled={!to.trim() || !amount.trim() || send.isPending}
        >
          <Text>{send.isPending ? t('wallet.send.sending') : t('wallet.send.submit')}</Text>
        </Button>
      </ScrollView>
    </>
  );
}
