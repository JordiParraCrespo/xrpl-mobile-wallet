import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
} from '../../components/drops/home';
import { Routes } from '../../lib/routes';

/**
 * Home — the signed-in hub (design: `home.html`). Fiat-first balance hero,
 * the four core action circles, account tiles per XRPL chain and recent
 * activity, in both design themes: the light lavender "Glow" (default) and
 * the indigo→ink "Dark" gradient, following the system color scheme. The
 * theme tokens come from the root layout; data is mocked for now (see
 * `home-data.ts`). The bell opens the notifications centre; search and More
 * are follow-up overlays.
 */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dark = useColorScheme().colorScheme === 'dark';

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={dark ? 'light' : 'dark'} />
      <HomeBackground dark={dark} />

      <View style={{ paddingTop: insets.top + 8 }}>
        <HomeHeader
          onProfile={() => router.push(Routes.Profile)}
          onSearch={() => {}}
          onNotifications={() => router.push(Routes.Notifications)}
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
