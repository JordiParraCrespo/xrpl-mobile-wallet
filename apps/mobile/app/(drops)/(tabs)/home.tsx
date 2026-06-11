import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { vars } from "nativewind";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AccountsSection,
  ActionsRow,
  ActivitySection,
  BalanceHero,
  HOME_ACCOUNTS,
  HOME_ACTIVITY,
  HomeBackground,
  HomeHeader,
  totalUsd,
} from "../../../components/drops/home";
import { Routes } from "../../../lib/routes";
import { darkVars } from "../../../lib/theme";

/**
 * Home — the signed-in hub (design: `home.html`, the "Dark" gradient theme).
 * Fiat-first balance hero, the four core action circles, account tiles per
 * XRPL chain and recent activity, all on the indigo→ink gradient.
 *
 * The screen is pinned to dark tokens (`darkVars` + the `dark` class) so the
 * design-system components resolve white-on-glass regardless of the system
 * theme — the gradient home is always dark. Data is mocked for now (see
 * `home-data.ts`); search, notifications and More are follow-up overlays.
 */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={vars(darkVars)} className="dark flex-1 bg-[#08080b]">
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
