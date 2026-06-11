import { Icon } from "@flama/design-system-mobile/icon";
import { Text } from "@flama/design-system-mobile/text";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Calendar,
  ChartNoAxesColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Copy,
  Delete,
  DollarSign,
  Eye,
  EyeOff,
  FileText,
  Globe,
  History,
  House,
  Info,
  KeyRound,
  Lock,
  LogOut,
  type LucideIcon,
  Moon,
  Plus,
  QrCode,
  Search,
  Send,
  Settings,
  Share,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Wallet,
  X,
} from "lucide-react-native";
import * as React from "react";
import { ScrollView, View } from "react-native";

// Foundations — icons. The Lucide set (2px stroke, round caps) used
// across onboarding and the app shell.

const ICONS: { name: string; icon: LucideIcon }[] = [
  { name: "House", icon: House },
  { name: "ChartNoAxesColumn", icon: ChartNoAxesColumn },
  { name: "ArrowLeftRight", icon: ArrowLeftRight },
  { name: "Sparkles", icon: Sparkles },
  { name: "Send", icon: Send },
  { name: "ArrowDownLeft", icon: ArrowDownLeft },
  { name: "ArrowUpRight", icon: ArrowUpRight },
  { name: "Plus", icon: Plus },
  { name: "Search", icon: Search },
  { name: "Bell", icon: Bell },
  { name: "Settings", icon: Settings },
  { name: "ChevronRight", icon: ChevronRight },
  { name: "ChevronLeft", icon: ChevronLeft },
  { name: "ChevronDown", icon: ChevronDown },
  { name: "X", icon: X },
  { name: "Info", icon: Info },
  { name: "QrCode", icon: QrCode },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Copy", icon: Copy },
  { name: "Check", icon: Check },
  { name: "Share", icon: Share },
  { name: "Calendar", icon: Calendar },
  { name: "Delete", icon: Delete },
  { name: "Wallet", icon: Wallet },
  { name: "Lock", icon: Lock },
  { name: "LogOut", icon: LogOut },
  { name: "Globe", icon: Globe },
  { name: "Moon", icon: Moon },
  { name: "DollarSign", icon: DollarSign },
  { name: "Eye", icon: Eye },
  { name: "EyeOff", icon: EyeOff },
  { name: "KeyRound", icon: KeyRound },
  { name: "FileText", icon: FileText },
  { name: "History", icon: History },
  { name: "TriangleAlert", icon: TriangleAlert },
  { name: "CircleCheck", icon: CircleCheck },
];

export default function IconsScreen() {
  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <Text className="text-sm text-muted-foreground">
        The Lucide icon set (2px stroke, round caps) used across the wallet.
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {ICONS.map(({ name, icon }) => (
          <View
            key={name}
            className="w-[31%] items-center gap-2 rounded-md border border-border p-3"
          >
            <Icon as={icon} size={22} className="text-foreground" />
            <Text
              numberOfLines={1}
              className="font-mono text-[10px] text-muted-foreground"
            >
              {name}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
