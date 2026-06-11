import { cva, type VariantProps } from "class-variance-authority";
import { BlurView } from "expo-blur";
import { cssInterop } from "nativewind";
import * as React from "react";
import { View } from "react-native";
import { cn } from "../../lib/utils";

// GlassPanel — the signature Drops frosted container, used over the
// gradient hero and dark flow surfaces. Real backdrop blur via expo-blur;
// the translucent fill + hairline border carry the look wherever blur is
// unavailable (e.g. Android with experimentalBlurMethod="none").
cssInterop(BlurView, { className: "style" });

type GlassBackdropProps = {
  /** Blur strength, 0–100. The Drops default is a medium frost. */
  intensity?: number;
  tint?: React.ComponentProps<typeof BlurView>["tint"];
  /** Android blur implementation; "none" falls back to the translucent fill. */
  experimentalBlurMethod?: React.ComponentProps<
    typeof BlurView
  >["experimentalBlurMethod"];
};

// Absolute-fill blur layer used inside the glass variants of other
// components (TabBar, IconButton, Chip, ActionButton, SelectorPill).
// The host must be rounded and overflow-hidden so the blur clips.
function GlassBackdrop({
  intensity = 20,
  tint = "light",
  experimentalBlurMethod = "dimezisBlurView",
}: GlassBackdropProps) {
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      experimentalBlurMethod={experimentalBlurMethod}
      pointerEvents="none"
      className="absolute inset-0"
    />
  );
}

const glassPanelVariants = cva("overflow-hidden rounded-xl border", {
  variants: {
    variant: {
      // white-glass over the gradient / dark heroes
      "on-dark": "border-white/15 bg-white/10",
      // neutral light-glass over light surfaces
      light: "border-white/60 bg-white/40",
    },
    padded: {
      true: "p-5",
      false: "",
    },
  },
  defaultVariants: {
    variant: "on-dark",
    padded: true,
  },
});

type GlassPanelProps = React.ComponentProps<typeof View> &
  VariantProps<typeof glassPanelVariants> &
  GlassBackdropProps;

function GlassPanel({
  className,
  variant,
  padded,
  intensity,
  tint,
  experimentalBlurMethod,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <View
      className={cn(glassPanelVariants({ variant, padded }), className)}
      {...props}
    >
      <GlassBackdrop
        intensity={intensity}
        tint={tint}
        experimentalBlurMethod={experimentalBlurMethod}
      />
      {children}
    </View>
  );
}

export type { GlassBackdropProps, GlassPanelProps };
export { GlassBackdrop, GlassPanel, glassPanelVariants };
