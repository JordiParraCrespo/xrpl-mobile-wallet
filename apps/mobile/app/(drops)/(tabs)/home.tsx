import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeBackground } from "../../../components/drops/home/home-background";
import {
  HOME_ACCOUNTS,
  HOME_ACTIVITY,
  totalUsd,
} from "../../../components/drops/home/home-data";
import {
  AccountsSection,
  ActionsRow,
  ActivitySection,
  BalanceHero,
  HomeHeader,
} from "../../../components/drops/home/home-parts";
import { Routes } from "../../../lib/routes";

/**
 * Home — the signed-in hub (design: `home.html`, the "Dark" gradient theme).
 * Fiat-first balance hero, the four core action circles, account tiles per
 * XRPL chain and recent activity, all on the indigo→ink gradient. Data is
 * mocked for now (see `home-data.ts`) until the wallet/explorer modules wire
 * in live balances. Search, notifications and the More menu are stubbed as
 * follow-up overlays.
 */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#08080b]">
      <StatusBar style="light" />
      <HomeBackground />

      <View style={{ paddingTop: insets.top + 8 }}>
        <HomeHeader
          onProfile={() => router.push(Routes.Profile)}
          onSearch={() => {}}
          onNotifications={() => {}}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <BalanceHero usd={totalUsd(HOME_ACCOUNTS)} />

        <ActionsRow
          onAddMoney={() => router.push(Routes.AddMoney)}
          onReceive={() => router.push(Routes.Receive)}
          onSwap={() => router.push(Routes.Swap)}
          onMore={() => {}}
        />

        <AccountsSection
          accounts={HOME_ACCOUNTS}
          onAccountPress={() => router.push(Routes.Receive)}
          onAddAccount={() => {}}
        />

        <ActivitySection activity={HOME_ACTIVITY} onSeeAll={() => {}} />
      </ScrollView>
    </View>
  );
}
