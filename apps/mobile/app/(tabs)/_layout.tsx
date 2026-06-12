import { AssistantAvatar } from '@flama/design-system-mobile/assistant-avatar';
import { TabBar, type TabBarItem } from '@flama/design-system-mobile/tab-bar';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs, useRouter } from 'expo-router';
import { ArrowLeftRight, ChartColumn, House, Sparkle } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Routes } from '../../lib/routes';

const TAB_ICONS = {
  home: House,
  market: ChartColumn,
  payments: ArrowLeftRight,
  droppoints: Sparkle,
} as const;

type TabKey = keyof typeof TAB_ICONS;

// The design's nav shadows per theme (home-app.jsx --h-nav-shadow):
// dark 0 12px 36px rgba(8,6,20,0.45) · light 0 8px 30px rgba(15,17,21,0.12).
const NAV_SHADOW = {
  dark: {
    shadowColor: '#080614',
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    shadowOpacity: 0.45,
    elevation: 16,
  },
  light: {
    shadowColor: '#0f1115',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
    shadowOpacity: 0.12,
    elevation: 10,
  },
} as const;

/**
 * The design's floating frosted-glass capsule (`HBottomNav` in
 * home/home-parts2.jsx): the four tabs plus the Dewy mascot, hovering 14px
 * from the screen edges. Glass over the dark home gradient; the solid card
 * variant on the light tab surfaces. Content scrolls underneath it.
 */
function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const dark = useColorScheme().colorScheme === 'dark';

  const items: TabBarItem[] = state.routes
    .filter((route) => route.name in TAB_ICONS)
    .map((route) => ({
      key: route.name,
      label: t(`tabs.${route.name as TabKey}`),
      icon: TAB_ICONS[route.name as TabKey],
    }));

  const activeKey = state.routes[state.index]?.name ?? 'home';

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: insets.bottom + 8,
        ...NAV_SHADOW[dark ? 'dark' : 'light'],
      }}
    >
      <TabBar
        items={items}
        activeKey={activeKey}
        onChange={(key) => navigation.navigate(key)}
        // Frosted only over the dark home gradient; the light Glow and the
        // light tab surfaces use the solid card capsule.
        glass={dark && activeKey === 'home'}
        accessory={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('tabs.dewy')}
            onPress={() => router.push(Routes.Chat)}
            className="pr-0.5 active:scale-[0.97]"
          >
            <AssistantAvatar source={require('../../assets/dewy.png')} size={46} ring />
          </Pressable>
        }
      />
    </View>
  );
}

/** The signed-in hub: Home · Market · Payments · DropPoints + Dewy. */
export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="market" />
      <Tabs.Screen name="payments" />
      <Tabs.Screen name="droppoints" />
    </Tabs>
  );
}
