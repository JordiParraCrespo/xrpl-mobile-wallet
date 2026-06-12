import { Chip } from '@flama/design-system-mobile/chip';
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, CalendarClock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

// TransactionActions — the quick-action chip rail under the detail hero
// (Send · Request · Schedule · Split). Send is the brand-emphasized action;
// the rest are neutral hairline chips. Horizontally scrollable on narrow
// screens. Mocked — chips are presentational for now.
export function TransactionActions() {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2.5 px-0.5 py-1"
    >
      <Chip variant="primary" icon={ArrowUpRight}>
        {t('payments.transaction.actions.send')}
      </Chip>
      <Chip icon={ArrowDownLeft}>{t('payments.transaction.actions.request')}</Chip>
      <Chip icon={CalendarClock}>{t('payments.transaction.actions.schedule')}</Chip>
      <Chip icon={ArrowLeftRight}>{t('payments.transaction.actions.split')}</Chip>
    </ScrollView>
  );
}
