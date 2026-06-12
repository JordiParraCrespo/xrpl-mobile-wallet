import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useColorScheme } from "nativewind";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { cn } from "../../lib/utils";

// BottomSheet — modal sheet rising over a scrim, used for in-flow helpers
// ("Which one do I have?") and feature teasers (Market → Earn). Frosted card
// surface, rounded top, drag handle.
//
// Backed by @gorhom/bottom-sheet so the sheet has real physics: drag the
// handle (or the content) to dismiss, with a coordinated backdrop fade and a
// spring settle instead of a one-shot slide. Still controlled — `open` shows
// it; dragging down, tapping the scrim, or the hardware back button all route
// back through `onClose`.
//
// The gorhom surface itself is transparent: the rounded card, light bloom,
// handle, and padding live inside `BottomSheetView` so they keep flowing
// through NativeWind theme tokens (bg-card / bg-muted) for light + dark.
type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

const TRANSPARENT = { backgroundColor: "transparent" } as const;

// A soft light bloom near the top of the sheet, so the surface reads as a
// frosted panel catching light rather than a flat card — the Drops sheet
// look. Tuned per theme: a faint lavender wash in light, a low brand glow in
// dark. Purely decorative, so it never intercepts touches.
const WASH = {
  light: { color: "#e7defb", opacity: 0.95 },
  dark: { color: "#7b6ff2", opacity: 0.22 },
} as const;

function SheetWash() {
  const { colorScheme } = useColorScheme();
  const wash = colorScheme === "dark" ? WASH.dark : WASH.light;
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      pointerEvents="none"
    >
      <Defs>
        <RadialGradient
          id="sheet-bloom"
          gradientUnits="userSpaceOnUse"
          cx={0}
          cy={0}
          r={1}
          // Centred near the top third, where the hero sits, then fading out.
          gradientTransform="translate(50 16) scale(64 48)"
        >
          <Stop offset="0" stopColor={wash.color} stopOpacity={wash.opacity} />
          <Stop offset="0.8" stopColor={wash.color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="100" fill="url(#sheet-bloom)" />
    </Svg>
  );
}

function BottomSheet({ open, onClose, children, className }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const ref = React.useRef<BottomSheetModal>(null);

  // Drive the imperative present/dismiss from the controlled `open` prop.
  // Dismissing here re-fires `onDismiss`, but `onClose` is idempotent (it
  // only flips the caller's flag back to false), so the round-trip is safe.
  React.useEffect(() => {
    if (open) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [open]);

  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.45}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={onClose}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      // The card + handle render inside, so keep gorhom's own chrome invisible.
      handleComponent={null}
      backgroundStyle={TRANSPARENT}
      style={TRANSPARENT}
    >
      <BottomSheetView
        className={cn(
          "overflow-hidden rounded-t-3xl bg-card px-6 pt-3",
          className,
        )}
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Decorative frosted wash, behind the handle and content. */}
        <SheetWash />
        <View className="mb-4 h-[5px] w-10 self-center rounded-full bg-muted" />
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export type { BottomSheetProps };
export { BottomSheet };
