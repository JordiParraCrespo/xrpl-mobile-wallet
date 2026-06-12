import { ArrowUpRight, Droplet, type LucideIcon, Sparkles } from 'lucide-react-native';

/** A single DropPoints perk, rendered as a perk row on the teaser screen. */
export type DroppointsPerk = {
  icon: LucideIcon;
  title: string;
  description: string;
};

// The three rewards perks from drops.html (DP_PERKS): earn on every move ·
// fee rebates · member perks. Icons map the design's Lucide names — send
// (arrow-up-right), faucet (droplet), sparkles — onto lucide-react-native.
export const DROPPOINTS_PERKS: DroppointsPerk[] = [
  {
    icon: ArrowUpRight,
    title: 'Earn on every move',
    description: 'Collect points when you send, receive or swap.',
  },
  {
    icon: Droplet,
    title: 'Fee rebates',
    description: 'Redeem points to cut your network fees.',
  },
  {
    icon: Sparkles,
    title: 'Member perks',
    description: 'Unlock boosts, early features and surprises.',
  },
];
