import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "../../lib/utils";

// BottomSheet — modal sheet rising over a scrim, used for in-flow helpers
// ("Which one do I have?") and pickers. Card surface, rounded top, drag
// handle. Flat — no shadows, per the Drops design language.
//
// Backed by @gorhom/bottom-sheet so the sheet has real physics: drag the
// handle (or the content) to dismiss, with a coordinated backdrop fade and a
// spring settle instead of a one-shot slide. Still controlled — `open` shows
// it; dragging down, tapping the scrim, or the hardware back button all route
// back through `onClose`.
//
// The gorhom surface itself is transparent: the rounded card, handle, and
// padding live inside `BottomSheetView` so they keep flowing through
// NativeWind theme tokens (bg-card / bg-muted) for light + dark.
type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

const TRANSPARENT = { backgroundColor: "transparent" } as const;

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
        className={cn("rounded-t-3xl bg-card px-6 pt-3", className)}
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <View className="mb-4 h-[5px] w-10 self-center rounded-full bg-muted" />
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export type { BottomSheetProps };
export { BottomSheet };
