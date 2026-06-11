import { AmountText } from "@flama/design-system-mobile/amount-text";
import { AssetIcon } from "@flama/design-system-mobile/asset-icon";
import { Icon } from "@flama/design-system-mobile/icon";
import { InitialsAvatar } from "@flama/design-system-mobile/initials-avatar";
import { ListRow } from "@flama/design-system-mobile/list-row";
import { Text } from "@flama/design-system-mobile/text";
import { Coffee } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";
import {
  type HomeActivity,
  XRP_USD_RATE,
  formatUsd,
  formatXrp,
} from "./home-data";

/** Leading media for an activity row — contact avatar, asset icon or a glyph. */
function ActivityMedia({
  media,
  pending,
}: {
  media: HomeActivity["media"];
  pending: boolean;
}) {
  const inner =
    "avatar" in media ? (
      <InitialsAvatar name={media.avatar} size="md" />
    ) : "asset" in media ? (
      <AssetIcon symbol={media.asset} size={40} />
    ) : (
      <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon as={Coffee} size={19} className="text-muted-foreground" />
      </View>
    );

  return (
    <View className="relative">
      {inner}
      {pending ? (
        <View className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-warning" />
      ) : null}
    </View>
  );
}

/**
 * One recent-activity row: incoming (positive) and outgoing amounts render via
 * `AmountText`; a pending transfer shows its amount with a spinner instead.
 */
export function ActivityRow({ activity }: { activity: HomeActivity }) {
  const pending = activity.kind === "pending";
  const incoming = activity.kind === "in";
  const usd = activity.xrp * XRP_USD_RATE;

  return (
    <ListRow
      media={<ActivityMedia media={activity.media} pending={pending} />}
      title={activity.name}
      subtitle={`${activity.sub} · ${activity.time}`}
      value={
        pending ? (
          <View className="flex-row items-center gap-2">
            <Text className="font-mono text-[14.5px] text-muted-foreground">
              {formatXrp(activity.xrp)} XRP
            </Text>
            <ActivityIndicator size="small" color="#f59f00" />
          </View>
        ) : (
          <AmountText
            value={incoming ? activity.xrp : -activity.xrp}
            currency="XRP"
            signed
            mono
            tone={incoming ? "positive" : "default"}
          />
        )
      }
      meta={pending ? undefined : `${incoming ? "+" : "−"}${formatUsd(usd)}`}
    />
  );
}
