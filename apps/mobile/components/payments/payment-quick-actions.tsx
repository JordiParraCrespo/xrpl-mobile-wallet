import { Chip } from '@flama/design-system-mobile/chip';
import { ArrowDownLeft, ArrowUpRight, Split } from 'lucide-react-native';
import { ScrollView } from 'react-native';

type PaymentQuickActionsProps = {
  onSend?: () => void;
  onRequest?: () => void;
  onSplit?: () => void;
};

/** The Send / Request / Split quick-action row above the people rail. */
export function PaymentQuickActions({ onSend, onRequest, onSplit }: PaymentQuickActionsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2.5 px-4"
    >
      <Chip variant="primary" icon={ArrowUpRight} onPress={onSend}>
        Send
      </Chip>
      <Chip variant="outline" icon={ArrowDownLeft} onPress={onRequest}>
        Request
      </Chip>
      <Chip variant="outline" icon={Split} onPress={onSplit}>
        Split
      </Chip>
    </ScrollView>
  );
}
