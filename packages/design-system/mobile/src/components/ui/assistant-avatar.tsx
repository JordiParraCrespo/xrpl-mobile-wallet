import * as React from "react";
import { Image, type ImageSourcePropType, View } from "react-native";
import { cn } from "../../lib/utils";

// AssistantAvatar — circular avatar for the wallet assistant (Dewy).
// Flat per the Drops language — no shadows; `ring` adds a subtle
// hairline for dark / gradient surfaces.
type AssistantAvatarProps = React.ComponentProps<typeof View> & {
  source: ImageSourcePropType;
  size?: number;
  /** Subtle white hairline ring for dark surfaces. */
  ring?: boolean;
};

function AssistantAvatar({
  source,
  size = 44,
  ring = false,
  className,
  ...props
}: AssistantAvatarProps) {
  return (
    <View
      className={cn(
        "shrink-0 overflow-hidden rounded-full",
        ring && "border border-white/20",
        className,
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      <Image
        source={source}
        accessibilityLabel="Assistant"
        className="h-full w-full"
        resizeMode="cover"
      />
    </View>
  );
}

export type { AssistantAvatarProps };
export { AssistantAvatar };
