import { Button } from "@flama/design-system-mobile/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@flama/design-system-mobile/card";
import { Text } from "@flama/design-system-mobile/text";
import type { WalletAccount } from "@flama/frontend";
import {
  useChainBalance,
  useResetWallet,
  useWalletRestore,
  useWalletState,
} from "@flama/frontend/react";
import { Redirect, Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { buildRoute, Routes } from "../../../lib/routes";

export default function WalletScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const restore = useWalletRestore();
  const { status, accounts } = useWalletState();

  const reset = useResetWallet({
    onSuccess: () => router.replace(Routes.WalletImport),
  });

  if (restore.isLoading || status === "idle") {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status === "no_wallet") {
    return <Redirect href={Routes.WalletImport} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: t("wallet.title") }} />
      <ScrollView contentContainerClassName="p-6 gap-6">
        {accounts.map((account) => (
          <AccountCard key={account.chainId} account={account} />
        ))}
        <Button
          variant="destructive"
          onPress={() => reset.mutate()}
          disabled={reset.isPending}
        >
          <Text>{t("wallet.accounts.reset")}</Text>
        </Button>
      </ScrollView>
    </>
  );
}

function AccountCard({ account }: { account: WalletAccount }) {
  const { t } = useTranslation();
  const router = useRouter();
  const balance = useChainBalance(account.chainId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{account.chainName}</CardTitle>
      </CardHeader>
      <CardContent className="gap-4">
        <Text selectable className="text-xs text-muted-foreground">
          {account.address}
        </Text>
        <Text className="text-3xl font-bold text-foreground">
          {balance.data ? `${balance.data.formatted} ${account.symbol}` : "…"}
        </Text>
        <View className="flex-row gap-3">
          <Button
            className="flex-1"
            onPress={() => router.push(buildRoute.walletSend(account.chainId))}
          >
            <Text>{t("wallet.accounts.send")}</Text>
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => balance.refetch()}
            disabled={balance.isFetching}
          >
            <Text>{t("wallet.accounts.refresh")}</Text>
          </Button>
        </View>
      </CardContent>
    </Card>
  );
}
