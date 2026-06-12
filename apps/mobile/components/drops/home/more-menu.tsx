import { BottomSheet } from '@flama/design-system-mobile/bottom-sheet';
import { MenuRow } from '@flama/design-system-mobile/menu-row';
import { Text } from '@flama/design-system-mobile/text';
import { useRouter } from 'expo-router';
import {
  ArrowLeftRight,
  ArrowUpRight,
  ChartColumn,
  type LucideIcon,
  Repeat,
  Sparkle,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Routes } from '../../../lib/routes';

type MoreItem = {
  key: 'buy' | 'request' | 'convert' | 'statements' | 'rewards';
  icon: LucideIcon;
  route?: Routes;
};

const ITEMS: MoreItem[] = [
  { key: 'buy', icon: ChartColumn, route: Routes.AddMoney },
  { key: 'request', icon: ArrowUpRight, route: Routes.Receive },
  { key: 'convert', icon: Repeat, route: Routes.Swap },
  { key: 'statements', icon: ArrowLeftRight },
  { key: 'rewards', icon: Sparkle, route: Routes.DropPoints },
];

/**
 * The home "More" options menu (home-parts2.jsx `HMoreMenu`): a bottom sheet
 * of secondary money actions, each an icon disc + label + sub-label row.
 * Rows with a destination dismiss the sheet and navigate.
 */
export function MoreMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <BottomSheet open={open} onClose={onClose}>
      <Text className="px-2 pb-2.5 font-display text-[20px] tracking-[-0.3px] text-foreground">
        {t('home.more.title')}
      </Text>
      {ITEMS.map((item) => (
        <MenuRow
          key={item.key}
          icon={item.icon}
          label={t(`home.more.${item.key}.label`)}
          sub={t(`home.more.${item.key}.sub`)}
          onPress={() => {
            onClose();
            if (item.route) router.push(item.route);
          }}
        />
      ))}
    </BottomSheet>
  );
}
