import { AssetIcon } from "@flama/design-system-mobile/asset-icon";
import { ChainBadge } from "@flama/design-system-mobile/chain-badge";
import { Icon } from "@flama/design-system-mobile/icon";
import { InitialsAvatar } from "@flama/design-system-mobile/initials-avatar";
import { Text } from "@flama/design-system-mobile/text";
import type { LucideIcon } from "lucide-react-native";
import {
  ArrowDownLeft,
  Bell,
  ChevronDown,
  ChevronRight,
  Coffee,
  MoreHorizontal,
  Plus,
  Repeat,
  Search,
} from "lucide-react-native";
import { ActivityIndicator, Pressable, View } from "react-native";
import {
  type ChainBadgeKind,
  type HomeAccount,
  type HomeActivity,
  XRP_USD_RATE,
  accountUsd,
  formatUsd,
  formatXrp,
} from "./home-data";

// The Drops "Dark" home is white-on-glass over an indigo→ink gradient, so
// these parts use explicit white/translucent colors rather than the light
// theme tokens — the same approach the onboarding hero takes.

/* ---- chain badge -------------------------------------------------------- */
function AccountBadge({
  badge,
  size,
}: {
  badge: ChainBadgeKind;
  size: number;
}) {
  if (badge.kind === "xrp") return <ChainBadge kind="xrp" size={size} />;
  if (badge.kind === "evm") return <ChainBadge kind="evm" size={size} />;
  return (
    <ChainBadge
      kind="letter"
      label={badge.label}
      color={badge.color}
      size={size}
    />
  );
}

/* ---- header: avatar · search · bell ------------------------------------ */
export function HomeHeader({
  onProfile,
  onSearch,
  onNotifications,
}: {
  onProfile: () => void;
  onSearch: () => void;
  onNotifications: () => void;
}) {
  return (
    <View className="flex-row items-center gap-3 px-5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profile"
        onPress={onProfile}
        className="active:opacity-80"
      >
        <InitialsAvatar name="Jordan Pierce" size="md" color="#5b41dd" />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search"
        onPress={onSearch}
        className="h-11 flex-1 flex-row items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.16] px-4 active:bg-white/[0.22]"
      >
        <Icon as={Search} size={18} className="text-white/55" />
        <Text className="text-[15px] text-white/55">Search</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        onPress={onNotifications}
        className="h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.16] active:bg-white/[0.22]"
      >
        <Icon as={Bell} size={20} className="text-white" />
        <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-[1.5px] border-[#3a2a86] bg-destructive" />
      </Pressable>
    </View>
  );
}

/* ---- balance hero ------------------------------------------------------- */
export function BalanceHero({ usd }: { usd: number }) {
  return (
    <View className="items-center px-6 pb-11 pt-14">
      <Pressable className="mb-4 flex-row items-center gap-2 active:opacity-80">
        <View className="flex-row items-center gap-1">
          <Text className="text-sm font-semibold text-white/80">Wallet 1</Text>
          <Icon as={ChevronDown} size={15} className="text-white/55" />
        </View>
        <View className="flex-row items-center gap-1.5 rounded-full bg-white/[0.16] px-2.5 py-1">
          <View className="h-1.5 w-1.5 rounded-full bg-warning" />
          <Text className="text-[11px] font-bold tracking-wide text-[#ffe2ad]">
            TESTNET
          </Text>
        </View>
      </Pressable>

      <Text className="font-display text-[46px] leading-[56px] tracking-[-0.8px] text-white tabular-nums">
        {formatUsd(usd)}
      </Text>
    </View>
  );
}

/* ---- action circles ----------------------------------------------------- */
function HomeAction({
  icon,
  label,
  primary,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  primary?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="items-center gap-2 active:opacity-80"
    >
      <View
        className={
          primary
            ? "h-11 w-11 items-center justify-center rounded-full bg-brand"
            : "h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.16]"
        }
      >
        <Icon as={icon} size={19} className="text-white" />
      </View>
      <Text className="text-xs font-medium text-white/80">{label}</Text>
    </Pressable>
  );
}

export function ActionsRow({
  onAddMoney,
  onReceive,
  onSwap,
  onMore,
}: {
  onAddMoney: () => void;
  onReceive: () => void;
  onSwap: () => void;
  onMore: () => void;
}) {
  return (
    <View className="flex-row items-start justify-between px-3">
      <HomeAction icon={Plus} label="Add money" primary onPress={onAddMoney} />
      <HomeAction icon={ArrowDownLeft} label="Receive" onPress={onReceive} />
      <HomeAction icon={Repeat} label="Swap" onPress={onSwap} />
      <HomeAction icon={MoreHorizontal} label="More" onPress={onMore} />
    </View>
  );
}

/* ---- section heading ---------------------------------------------------- */
function SectionHeading({
  title,
  action,
  onAction,
  trailing,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between px-1 pb-2.5">
      <Text className="font-display text-[19px] tracking-[-0.2px] text-white">
        {title}
      </Text>
      {action ? (
        <Pressable onPress={onAction} className="active:opacity-70">
          <Text className="text-[13.5px] font-semibold text-white/70">
            {action}
          </Text>
        </Pressable>
      ) : null}
      {trailing}
    </View>
  );
}

/* ---- accounts ----------------------------------------------------------- */
function AccountTile({
  account,
  onPress,
}: {
  account: HomeAccount;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-[134px] flex-1 justify-between rounded-xl border border-white/[0.13] bg-white/10 p-4 active:bg-white/[0.14]"
    >
      <View className="flex-row items-start justify-between">
        <AccountBadge badge={account.badge} size={38} />
        <Icon as={ChevronRight} size={16} className="mt-0.5 text-white/45" />
      </View>
      <View className="mt-4 gap-0.5">
        <Text
          numberOfLines={1}
          className="text-[13px] font-medium text-white/70"
        >
          {account.name}
        </Text>
        <Text className="font-mono text-[22px] font-semibold tracking-[-0.4px] text-white">
          {formatUsd(accountUsd(account))}
        </Text>
        <Text className="font-mono text-xs text-white/55">
          {formatXrp(account.amount)} {account.unit}
        </Text>
      </View>
    </Pressable>
  );
}

export function AccountsSection({
  accounts,
  onAccountPress,
  onAddAccount,
}: {
  accounts: HomeAccount[];
  onAccountPress: (account: HomeAccount) => void;
  onAddAccount: () => void;
}) {
  return (
    <View className="mt-[22px]">
      <SectionHeading
        title="Accounts"
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add account"
            onPress={onAddAccount}
            className="h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.16] active:bg-white/[0.22]"
          >
            <Icon as={Plus} size={18} className="text-white" />
          </Pressable>
        }
      />
      <View className="flex-row gap-3">
        {accounts.map((account) => (
          <AccountTile
            key={account.id}
            account={account}
            onPress={() => onAccountPress(account)}
          />
        ))}
      </View>
    </View>
  );
}

/* ---- activity ----------------------------------------------------------- */
function ActivityMedia({ media }: { media: HomeActivity["media"] }) {
  if ("avatar" in media)
    return <InitialsAvatar name={media.avatar} size="md" />;
  if ("asset" in media) return <AssetIcon symbol={media.asset} size={40} />;
  return (
    <View className="h-10 w-10 items-center justify-center rounded-full bg-white/15">
      <Icon as={Coffee} size={19} className="text-white/80" />
    </View>
  );
}

function ActivityRow({
  activity,
  first,
}: {
  activity: HomeActivity;
  first: boolean;
}) {
  const pending = activity.kind === "pending";
  const incoming = activity.kind === "in";
  const usd = activity.xrp * XRP_USD_RATE;
  return (
    <View
      className={`flex-row items-center gap-3.5 px-4 py-3.5 ${
        first ? "" : "border-t border-white/[0.13]"
      }`}
    >
      <View className="relative">
        <ActivityMedia media={activity.media} />
        {pending ? (
          <View className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#15131f] bg-warning" />
        ) : null}
      </View>

      <View className="min-w-0 flex-1">
        <Text
          numberOfLines={1}
          className="text-[15px] font-semibold text-white"
        >
          {activity.name}
        </Text>
        <Text className="mt-0.5 text-[13px] text-white/55">
          <Text
            className={
              pending ? "font-semibold text-[#ffd07a]" : "text-white/55"
            }
          >
            {activity.sub}
          </Text>
          {`  ·  ${activity.time}`}
        </Text>
      </View>

      {pending ? (
        <View className="flex-row items-center gap-2">
          <Text className="font-mono text-[14.5px] text-white/55">
            {formatXrp(activity.xrp)} XRP
          </Text>
          <ActivityIndicator size="small" color="#f59f00" />
        </View>
      ) : (
        <View className="items-end gap-0.5">
          <Text
            className={`font-mono text-[15px] font-semibold ${
              incoming ? "text-positive" : "text-white"
            }`}
          >
            {incoming ? "+" : "−"}
            {formatXrp(activity.xrp)} XRP
          </Text>
          <Text className="font-mono text-xs text-white/55">
            {incoming ? "+" : "−"}
            {formatUsd(usd)}
          </Text>
        </View>
      )}
    </View>
  );
}

export function ActivitySection({
  activity,
  onSeeAll,
}: {
  activity: HomeActivity[];
  onSeeAll: () => void;
}) {
  return (
    <View className="mt-[22px]">
      <SectionHeading title="Activity" action="See all" onAction={onSeeAll} />
      <View className="overflow-hidden rounded-xl border border-white/[0.13] bg-white/10">
        {activity.map((item, i) => (
          <ActivityRow key={item.id} activity={item} first={i === 0} />
        ))}
      </View>
    </View>
  );
}
