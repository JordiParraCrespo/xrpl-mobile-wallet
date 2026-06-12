import { ArrowUpRight, Droplet, type LucideIcon, Sparkles } from 'lucide-react-native';

/** A single DropPoints perk row on the teaser screen. */
export type DroppointsPerk = {
  /** i18n leaf under `droppoints.perks.*` holding `title` + `description`. */
  key: 'earn' | 'rebates' | 'perks';
  icon: LucideIcon;
};

// The three rewards perks from drops.html (DP_PERKS): earn on every move ·
// fee rebates · member perks. Icons map the design's glyph names — send
// (arrow-up-right), faucet (droplet), sparkles — onto lucide-react-native.
export const DROPPOINTS_PERKS: DroppointsPerk[] = [
  { key: 'earn', icon: ArrowUpRight },
  { key: 'rebates', icon: Droplet },
  { key: 'perks', icon: Sparkles },
];
