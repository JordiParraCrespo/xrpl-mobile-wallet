import { Button } from '@flama/design-system-mobile/button';
import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { Check, Copy, Share2 } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Footer actions — a neutral Copy and the brand Share (the money-action accent
// is reserved for Share here). Copy mirrors the shared `copied` state. Owns its
// own bottom safe-area inset.
export function ReceiveActions({
  copied,
  onCopy,
  onShare,
}: {
  copied: boolean;
  onCopy: () => void;
  onShare: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-row gap-2.5 px-5 pt-2" style={{ paddingBottom: insets.bottom + 16 }}>
      <Button variant="secondary" size="lg" className="flex-1" onPress={onCopy}>
        <Icon as={copied ? Check : Copy} size={18} />
        <Text>{copied ? 'Copied' : 'Copy'}</Text>
      </Button>
      <Button variant="brand" size="lg" className="flex-1" onPress={onShare}>
        <Icon as={Share2} size={18} />
        <Text>Share</Text>
      </Button>
    </View>
  );
}
