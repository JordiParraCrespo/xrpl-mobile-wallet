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
  HOME_ACTIVITY,
  HomeBackground,
  HomeHeader,
  useHome,
} from '../../components/drops/home';
import { Routes } from '../../lib/routes';

/**
 * Home — the signed-in hub (design: `home.html`). Fiat-first balance hero,
 * the four core action circles, account tiles per XRPL chain and recent
 * activity, in both design themes: the light lavender "Glow" (default) and
 * the indigo→ink "Dark" gradient, following the system color scheme. The
 * theme tokens come from the root layout. Balances and their USD value are
 * live (`useHome`); recent activity is still mocked (`home-data.ts`).
 */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dark = useColorScheme().colorScheme === 'dark';
  const { walletName, accounts, totalUsd, isLoading } = useHome();

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={dark ? 'light' : 'dark'} />
      <HomeBackground dark={dark} />

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
        <BalanceHero usd={totalUsd} walletName={walletName} loading={isLoading} />

        <ActionsRow
          onAddMoney={() => router.push(Routes.AddMoney)}
          onReceive={() => router.push(Routes.Receive)}
          onSwap={() => router.push(Routes.Swap)}
          onMore={() => {}}
        />

        <AccountsSection
          accounts={accounts}
          loading={isLoading}
          onAccountPress={() => router.push(Routes.Receive)}
          onAddAccount={() => {}}
        />

        <ActivitySection activity={HOME_ACTIVITY} onSeeAll={() => {}} />
      </ScrollView>
    </View>
  );
}
