import { Chip } from '@flama/design-system-mobile/chip';
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

type PaymentQuickActionsProps = {
  onSend?: () => void;
  onRequest?: () => void;
  onSplit?: () => void;
};

/**
 * The Send / Request / Split quick-action row above the people rail. Split
 * carries the design's swap glyph (horizontal arrows), not a fork icon.
 */
export function PaymentQuickActions({ onSend, onRequest, onSplit }: PaymentQuickActionsProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2.5 px-4"
    >
      <Chip variant="primary" icon={ArrowUpRight} onPress={onSend}>
        {t('payments.send')}
      </Chip>
      <Chip variant="outline" icon={ArrowDownLeft} onPress={onRequest}>
        {t('payments.request')}
      </Chip>
      <Chip variant="outline" icon={ArrowLeftRight} onPress={onSplit}>
        {t('payments.split')}
      </Chip>
    </ScrollView>
  );
}
