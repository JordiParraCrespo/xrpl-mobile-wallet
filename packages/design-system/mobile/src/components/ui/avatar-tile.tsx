import { Plus } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";
import { InitialsAvatar } from "./initials-avatar";
import { Text } from "./text";

// AvatarTile — a single entry in a horizontal "people" rail: an avatar
// (tinted initials disc) stacked above a short caption. The `add` variant
// swaps the avatar for a dashed "+" disc to start a new entry. Used by the
// payments people rail and any recipient picker; tap targets stay 64px wide
// so the captions line up under their discs.
const SIZES = { md: 44, lg: 56, xl: 72 } as const;

type AvatarTileProps = Omit<
  React.ComponentProps<typeof Pressable>,
  "children"
> & {
  /** Full name — drives the initials disc and the default caption. */
  name?: string;
  /** Caption under the disc. Defaults to the first word of `name`. */
  label?: string;
  size?: keyof typeof SIZES;
  /** Render the dashed "add" disc instead of an avatar. */
  add?: boolean;
  /** Small overlay badge on the avatar (e.g. a chain mark). */
  badge?: React.ReactNode;
  /** Override the deterministic avatar colour. */
  color?: string;
};

function AvatarTile({
  name,
  label,
  size = "lg",
  add = false,
  badge,
  color,
  className,
  ...props
}: AvatarTileProps) {
  const px = SIZES[size] ?? SIZES.lg;
  const caption = label ?? (name ? name.trim().split(/\s+/)[0] : "");
  const interactive = !!props.onPress;
  return (
    <Pressable
      disabled={!interactive}
      className={cn(
        "w-16 shrink-0 items-center gap-2",
        interactive && "active:scale-[0.97]",
        className,
      )}
      {...props}
    >
      {add ? (
        <View
          className="border-border items-center justify-center rounded-full border-[1.5px] border-dashed"
          style={{ width: px, height: px }}
        >
          <Icon
            as={Plus}
            size={Math.round(px * 0.4)}
            className="text-muted-foreground"
          />
        </View>
      ) : (
        <InitialsAvatar
          name={name ?? "?"}
          size={size}
          color={color}
          badge={badge}
        />
      )}
      {caption ? (
        <Text
          numberOfLines={1}
          className="text-muted-foreground max-w-16 text-xs"
        >
          {caption}
        </Text>
      ) : null}
    </Pressable>
  );
}

export type { AvatarTileProps };
export { AvatarTile };
