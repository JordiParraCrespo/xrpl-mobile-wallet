import { GlassBackdrop } from '@flama/design-system-mobile/glass-panel';
import { Icon } from '@flama/design-system-mobile/icon';
import { type LucideIcon, Sparkles } from 'lucide-react-native';
import { View } from 'react-native';

type GlassIconDiscProps = {
  /** Lucide glyph shown inside the disc. Defaults to the DropPoints sparkle. */
  icon?: LucideIcon;
};

/**
 * The frosted-glass circular icon that crowns the DropPoints teaser — an 84px
 * white-glass disc (real backdrop blur via the DS `GlassBackdrop`) with a
 * brand-indigo glyph and the sanctioned ambient lift under floating glass.
 */
export function GlassIconDisc({ icon = Sparkles }: GlassIconDiscProps) {
  return (
    <View
      className="h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full border border-white/[0.65] bg-white/50"
      style={{
        shadowColor: '#5b41dd',
        shadowOpacity: 0.12,
        shadowRadius: 17,
        shadowOffset: { width: 0, height: 10 },
        elevation: 6,
      }}
    >
      <GlassBackdrop intensity={18} />
      <Icon as={icon} size={36} strokeWidth={2} className="text-brand" />
    </View>
  );
}
