import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { Check, Copy } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import type { ReceiveAccount } from './receive-data';

// Address card — the full `r…` / `0x…` address in mono on a hairline card,
// tap-to-copy. The trailing glyph swaps copy → check on the shared `copied`
// state (also driven by the Copy action button).
export function AddressCard({
  account,
  copied,
  onCopy,
}: {
  account: ReceiveAccount;
  copied: boolean;
  onCopy: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="mt-[18px] items-center">
      <Text className="text-muted-foreground mb-1.5 text-[13px]">
        {t('receive.yourAddress', { name: account.name })}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Copy address"
        onPress={onCopy}
        className="border-border bg-card max-w-[300px] flex-row items-center gap-2 rounded-[14px] border px-3.5 py-3 active:scale-[0.97]"
      >
        <Text className="text-foreground flex-1 font-mono text-[13.5px] leading-[18px]">
          {account.address}
        </Text>
        <Icon
          as={copied ? Check : Copy}
          size={17}
          className={copied ? 'text-positive' : 'text-brand'}
        />
      </Pressable>
    </View>
  );
}
