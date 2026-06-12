import { AssetIcon } from '@flama/design-system-mobile/asset-icon';
import { FeatureRow } from '@flama/design-system-mobile/feature-row';
import { GlassBackdrop } from '@flama/design-system-mobile/glass-panel';
import { Icon } from '@flama/design-system-mobile/icon';
import { InitialsAvatar } from '@flama/design-system-mobile/initials-avatar';
import { PriceChange } from '@flama/design-system-mobile/price-change';
import { SegmentedControl } from '@flama/design-system-mobile/segmented-control';
import { Text } from '@flama/design-system-mobile/text';
import { splitMovers, useMarkets } from '@flama/frontend';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Search } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LightWashBackground } from '../../components/drops/light-wash-background';
import {
  buildAssetList,
  buildHeroes,
  buildMovers,
  formatPrice,
  MARKET_SYMBOLS,
} from '../../components/drops/market/market-data';
import { MarketEarnSheet } from '../../components/drops/market/market-earn-sheet';
import { MarketHeroCard } from '../../components/drops/market/market-hero-card';
import { MarketMoverTile } from '../../components/drops/market/market-mover-tile';
import { Routes } from '../../lib/routes';

const SECTION_TITLE = {
  fontSize: 18,
  lineHeight: 22,
  letterSpacing: -0.2,
} as const;

/**
 * Market — XRPL-ecosystem prices (`market.html · market/market-app.jsx`).
 *
 * Over the light gradient wash: a profile avatar + "Search markets" glass pill,
 * an XRP hero card with sparkline, a Top gainers/losers segmented grid, the
 * all-assets list, and an Earn teaser that opens a coming-soon sheet. The
 * bottom tab bar comes from the `(tabs)` layout.
 */
export default function MarketScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [movers, setMovers] = React.useState('gainers');
  const [earnOpen, setEarnOpen] = React.useState(false);

  // Live prices from CoinGecko (free, no API key) via the prices module.
  const { data, isLoading, isError, refetch, isRefetching } = useMarkets(MARKET_SYMBOLS);
  const markets = React.useMemo(() => data ?? [], [data]);

  const heroes = React.useMemo(() => buildHeroes(markets), [markets]);
  const assets = React.useMemo(() => buildAssetList(markets), [markets]);
  const { gainers, losers } = React.useMemo(() => splitMovers(markets), [markets]);
  const tiles = buildMovers(movers === 'gainers' ? gainers : losers);

  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />
      <LightWashBackground />

      {/* header — avatar + search pill, pinned above the scroll area */}
      <View className="px-5" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile"
            className="rounded-full active:scale-[0.97]"
            onPress={() => router.push(Routes.Profile)}
          >
            <InitialsAvatar name="Jordan Pierce" size="md" />
          </Pressable>
          <View className="h-11 flex-1 flex-row items-center gap-2.5 overflow-hidden rounded-full border border-white/60 bg-white/[0.42] px-4">
            <GlassBackdrop intensity={18} />
            <Icon as={Search} size={18} className="text-muted-foreground" />
            <Text className="text-muted-foreground text-[15px]">Search markets</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
      >
        <View className="px-5 pb-1.5 pt-[22px]">
          <Text
            className="font-display text-foreground"
            style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.4 }}
          >
            Market
          </Text>
        </View>

        {/* hero cards — live prices, or a status while they load */}
        {isLoading ? (
          <View className="items-center px-4 py-10">
            <ActivityIndicator />
          </View>
        ) : isError ? (
          <Pressable
            onPress={() => refetch()}
            className="mx-4 mt-2.5 items-center rounded-xl border border-border bg-card px-4 py-8 active:opacity-80"
          >
            <Text className="text-muted-foreground text-[14px]">
              Couldn't load market prices. Tap to retry.
            </Text>
          </Pressable>
        ) : (
          heroes.map((hero) => (
            <View key={hero.symbol} className="px-4 pt-2.5">
              <MarketHeroCard asset={hero} chartHeight={42} />
            </View>
          ))
        )}

        {/* top movers */}
        <View className="px-4 pt-5">
          <View className="px-1 pb-3">
            <Text className="font-display text-foreground" style={SECTION_TITLE}>
              Top movers
            </Text>
          </View>
          <View className="bg-card border-border rounded-xl border p-4">
            <SegmentedControl
              fullWidth
              value={movers}
              onValueChange={setMovers}
              options={[
                { value: 'gainers', label: 'Top gainers' },
                { value: 'losers', label: 'Top losers' },
              ]}
            />
            <View className="mt-[18px] flex-row flex-wrap">
              {tiles.map((mover, index) => (
                <View
                  key={mover.symbol}
                  style={{ width: '33.3333%', marginTop: index >= 3 ? 18 : 0 }}
                >
                  <MarketMoverTile mover={mover} />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* all assets */}
        <View className="px-4 pt-[22px]">
          <View className="px-1 pb-2.5">
            <Text className="font-display text-foreground" style={SECTION_TITLE}>
              All assets
            </Text>
          </View>
          <View className="bg-card border-border overflow-hidden rounded-xl border">
            {assets.map((asset) => (
              <Pressable
                key={asset.symbol}
                className="flex-row items-center gap-[13px] px-4 py-[13px] active:bg-accent"
              >
                <AssetIcon symbol={asset.symbol} size={40} color={asset.color} />
                <View className="min-w-0 flex-1">
                  <Text className="text-foreground text-[15.5px] font-semibold">{asset.name}</Text>
                  <Text className="text-muted-foreground text-[13px]">{asset.symbol}</Text>
                </View>
                <View className="items-end gap-[3px]">
                  <Text className="text-foreground font-mono text-[15px] font-medium tabular-nums">
                    {formatPrice(asset.price)}
                  </Text>
                  <PriceChange value={asset.change} className="text-[12.5px]" />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* features — earn teaser */}
        <View className="px-4 pt-[22px]">
          <View className="px-1 pb-2.5">
            <Text className="font-display text-foreground" style={SECTION_TITLE}>
              Features
            </Text>
          </View>
          <FeatureRow
            glyph="%"
            tone="brand"
            title="Earn"
            description="Up to 5.2% APY on XRP · coming soon"
            onPress={() => setEarnOpen(true)}
          />
        </View>
      </ScrollView>

      <MarketEarnSheet open={earnOpen} onClose={() => setEarnOpen(false)} />
    </View>
  );
}
