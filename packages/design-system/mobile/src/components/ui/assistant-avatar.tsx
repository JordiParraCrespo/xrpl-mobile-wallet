import * as React from "react";
import { Image, type ImageSourcePropType, View } from "react-native";
import { cn } from "../../lib/utils";

// AssistantAvatar — circular avatar for the wallet assistant (Dewy).
// `ring` adds the design's dark-surface treatment: a white hairline plus
// a soft indigo glow (home-parts2.jsx: 0 0 0 1px white/18, 0 2px 10px
// rgba(91,65,221,0.4)) — the one place the Drops language allows a shadow.
const RING_GLOW = {
  shadowColor: "#5b41dd",
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 5,
  shadowOpacity: 0.4,
  elevation: 6,
} as const;

type AssistantAvatarProps = React.ComponentProps<typeof View> & {
  source: ImageSourcePropType;
  size?: number;
  /** White hairline + indigo glow for dark / gradient surfaces. */
  ring?: boolean;
};

function AssistantAvatar({
  source,
  size = 44,
  ring = false,
  className,
  style,
  ...props
}: AssistantAvatarProps) {
  return (
    <View
      className={cn(
        "shrink-0 rounded-full",
        ring && "border border-white/[0.18]",
      )}
      style={[{ width: size, height: size }, ring && RING_GLOW, style]}
      {...props}
    >
      <Image
        source={source}
        accessibilityLabel="Assistant"
        className={cn("h-full w-full rounded-full", className)}
        resizeMode="cover"
      />
    </View>
  );
}

export type { AssistantAvatarProps };
export { AssistantAvatar };
