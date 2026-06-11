import * as React from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "../../lib/utils";

// BottomSheet — modal sheet rising over a scrim, used for in-flow helpers
// ("Which one do I have?") and pickers. Card surface, rounded top, drag
// handle. Flat — no shadows, per the Drops design language. Controlled:
// `open` shows it, the scrim (and the hardware back button) call `onClose`.
type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

function BottomSheet({ open, onClose, children, className }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={open}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/45"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <Animated.View
          entering={SlideInDown.springify().damping(28).stiffness(260)}
          className={cn("rounded-t-3xl bg-card px-6 pt-3", className)}
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          <View className="mb-4 h-[5px] w-10 self-center rounded-full bg-muted" />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

export type { BottomSheetProps };
export { BottomSheet };
