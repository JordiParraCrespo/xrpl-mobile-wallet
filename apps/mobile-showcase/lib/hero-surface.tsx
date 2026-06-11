import * as React from "react";
import { View } from "react-native";

// A mock of the wallet's gradient hero: colorful blobs on a deep indigo
// base. Glass components rendered on top show their real backdrop blur.
export function HeroSurface({ children }: { children: React.ReactNode }) {
  return (
    <View className="overflow-hidden rounded-xl bg-[#160f2b] p-5">
      <View className="absolute -left-10 -top-12 h-40 w-40 rounded-full bg-[#7b6ff2] opacity-90" />
      <View className="absolute -right-8 -top-16 h-44 w-44 rounded-full bg-[#b06bff] opacity-80" />
      <View className="absolute -bottom-14 left-1/3 h-36 w-36 rounded-full bg-[#ff945c] opacity-50" />
      <View className="absolute bottom-2 right-10 h-6 w-24 rounded-full bg-white/70" />
      <View className="items-center gap-4">{children}</View>
    </View>
  );
}
