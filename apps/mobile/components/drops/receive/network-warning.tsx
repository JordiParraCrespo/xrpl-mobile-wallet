import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { Info } from 'lucide-react-native';
import { Trans } from 'react-i18next';
import { View } from 'react-native';

// Network safety warning — always visible, since the biggest risk in receiving
// is sending from the wrong network. The design's quiet inline note (amber
// icon, dim text, the network name highlighted) rather than a boxed callout.
export function NetworkWarning({ network }: { network: string }) {
  return (
    <View className="mt-[18px] max-w-[320px] flex-row items-start gap-2 self-center px-1">
      <Icon as={Info} size={15} className="mt-0.5 shrink-0 text-warning" />
      <Text className="flex-1 text-[12.5px] leading-[18px] text-muted-foreground">
        <Trans
          i18nKey="receive.warning"
          values={{ network }}
          components={{
            network: <Text className="text-[12.5px] text-foreground" />,
          }}
        />
      </Text>
    </View>
  );
}
