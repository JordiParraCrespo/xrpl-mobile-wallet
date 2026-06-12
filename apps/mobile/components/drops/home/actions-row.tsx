import { ActionButton } from '@flama/design-system-mobile/action-button';
import { Icon } from '@flama/design-system-mobile/icon';
import { ArrowDownLeft, MoreHorizontal, Plus, Repeat } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';

/**
 * The core action cluster under the balance: Add money (brand-emphasized) plus
 * the frosted Receive · Swap · More circles.
 */
export function ActionsRow({
  onAddMoney,
  onReceive,
  onSwap,
  onMore,
}: {
  onAddMoney: () => void;
  onReceive: () => void;
  onSwap: () => void;
  onMore: () => void;
}) {
  const dark = useColorScheme().colorScheme === 'dark';
  const circle = dark ? 'glass' : 'soft';
  return (
    <View className="flex-row items-start justify-between px-3">
      <ActionButton
        variant="brand"
        label="Add money"
        icon={<Icon as={Plus} size={19} className="text-brand-foreground" />}
        onPress={onAddMoney}
      />
      <ActionButton
        variant={circle}
        label="Receive"
        icon={<Icon as={ArrowDownLeft} size={19} />}
        onPress={onReceive}
      />
      <ActionButton
        variant={circle}
        label="Swap"
        icon={<Icon as={Repeat} size={19} />}
        onPress={onSwap}
      />
      <ActionButton
        variant={circle}
        label="More"
        icon={<Icon as={MoreHorizontal} size={19} />}
        onPress={onMore}
      />
    </View>
  );
}
