import { FeatureRow } from '@flama/design-system-mobile/feature-row';
import { GlassPanel } from '@flama/design-system-mobile/glass-panel';
import { GradientBackdrop } from '@flama/design-system-mobile/gradient-backdrop';
import { Icon } from '@flama/design-system-mobile/icon';
import { InitialsAvatar } from '@flama/design-system-mobile/initials-avatar';
import { SegmentedControl } from '@flama/design-system-mobile/segmented-control';
import { Text } from '@flama/design-system-mobile/text';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MarketAssetRow } from '../../components/market/market-asset-row';
import {
  ALL_ASSETS,
  HERO_ASSET,
  TOP_GAINERS,
  TOP_LOSERS,
} from '../../components/market/market-data';
import { MarketEarnSheet } from '../../components/market/market-earn-sheet';
import { MarketHeroCard } from '../../components/market/market-hero-card';
import { MarketMoverTile } from '../../components/market/market-mover-tile';
import { Routes } from '../../lib/routes';

/**
 * Market — XRPL-ecosystem prices on the signature Drops aurora gradient.
 * Leads with XRP as a single prominent hero card, then broadens to a
 * gainers/losers movers grid, the full asset list, and an Earn teaser.
 * Data is mocked for now (see `components/market/market-data.ts`).
 */
export default function MarketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [movers, setMovers] = React.useState('gainers');
  const [earnOpen, setEarnOpen] = React.useState(false);

  const tiles = movers === 'gainers' ? TOP_GAINERS : TOP_LOSERS;

  return (
    <View className="flex-1 bg-background">
      <GradientBackdrop />

      <View style={{ paddingTop: insets.top + 8 }}>
        {/* header: avatar → profile + search pill */}
        <View className="flex-row items-center gap-3 px-5 pt-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile"
            onPress={() => router.push(Routes.Profile)}
            className="rounded-full active:scale-[0.97]"
          >
            <InitialsAvatar name="Jordan Pierce" size="md" />
          </Pressable>
          <GlassPanel
            variant="on-dark"
            padded={false}
            className="h-11 flex-1 flex-row items-center gap-2 rounded-full border-white/60 bg-white/45 px-4 dark:border-white/20 dark:bg-white/10"
          >
            <Icon as={Search} size={18} className="text-muted-foreground" />
            <Text className="text-[15px] text-muted-foreground">Search markets</Text>
          </GlassPanel>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View className="px-5 pt-5 pb-1.5">
          <Text className="font-display text-3xl tracking-[-0.4px] text-foreground">Market</Text>
        </View>

        {/* hero card */}
        <View className="px-4 pt-2.5">
          <MarketHeroCard asset={HERO_ASSET} />
        </View>

        {/* top movers */}
        <View className="px-4 pt-5">
          <Text className="px-1 pb-3 font-display text-lg tracking-[-0.2px] text-foreground">
            Top movers
          </Text>
          <View className="rounded-xl border-hairline border-border bg-card p-4">
            <SegmentedControl
              fullWidth
              value={movers}
              onValueChange={setMovers}
              options={[
                { value: 'gainers', label: 'Top gainers' },
                { value: 'losers', label: 'Top losers' },
              ]}
            />
            <View className="mt-3 flex-row flex-wrap">
              {tiles.map((mover) => (
                <MarketMoverTile key={mover.symbol} mover={mover} />
              ))}
            </View>
          </View>
        </View>

        {/* all assets */}
        <View className="px-4 pt-5">
          <Text className="px-1 pb-2.5 font-display text-lg tracking-[-0.2px] text-foreground">
            All assets
          </Text>
          <View className="overflow-hidden rounded-xl border-hairline border-border bg-card">
            {ALL_ASSETS.map((asset) => (
              <MarketAssetRow key={asset.symbol} asset={asset} />
            ))}
          </View>
        </View>

        {/* earn feature */}
        <View className="px-4 pt-5">
          <Text className="px-1 pb-2.5 font-display text-lg tracking-[-0.2px] text-foreground">
            Features
          </Text>
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
