import { Tabs, useRouter } from "expo-router";
import {
  ChartLine,
  Droplets,
  House,
  Sparkles,
  Users,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";

// Indigo brand accent for the active tab; muted ink for idle (see Drops DS).
const BRAND = { light: "hsl(250 69.6% 56.1%)", dark: "hsl(249 77.5% 63.3%)" };
const IDLE = { light: "hsl(210 9.3% 46.3%)", dark: "hsl(208 8.1% 58.6%)" };
const SURFACE = { light: "hsl(0 0% 100%)", dark: "hsl(220 13% 9%)" };
const BORDER = { light: "hsl(228 9.8% 90%)", dark: "hsl(218 11.4% 13.7%)" };

/**
 * The signed-in hub. Bottom tab bar: Home · Market · Payments · DropPoints,
 * plus the Dewy assistant (a tab that opens the full chat rather than a page).
 *
 * TODO: replace this default tab bar with the design's floating frosted-glass
 * capsule (`HBottomNav` in home/home-parts2.jsx) — a pill that sits above the
 * content with the Dewy mascot beside it.
 */
export default function TabsLayout() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const mode = colorScheme === "dark" ? "dark" : "light";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BRAND[mode],
        tabBarInactiveTintColor: IDLE[mode],
        tabBarStyle: {
          backgroundColor: SURFACE[mode],
          borderTopColor: BORDER[mode],
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: "Market",
          tabBarIcon: ({ color, size }) => (
            <ChartLine color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: "Payments",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="droppoints"
        options={{
          title: "DropPoints",
          tabBarIcon: ({ color, size }) => (
            <Droplets color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="dewy"
        options={{
          title: "Dewy",
          tabBarIcon: ({ color, size }) => (
            <Sparkles color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Dewy opens the full assistant, not a tab page.
            e.preventDefault();
            router.push("/(drops)/chat");
          },
        }}
      />
    </Tabs>
  );
}
