import { AmountText } from '@flama/design-system-mobile/amount-text';
import { InitialsAvatar } from '@flama/design-system-mobile/initials-avatar';
import { ListRow } from '@flama/design-system-mobile/list-row';
import type { RecentPayment } from '@flama/frontend/react';
import { useTranslation } from 'react-i18next';
import { formatPaymentDate } from '../../payments/format-date';

/**
 * One recent-activity row, rendered the same way as the payments "Recent" card:
 * a contact avatar, the resolved name, relationship copy ("Sent you" / "You
 * sent"), a signed XRP amount (incoming reads positive green, outgoing ink) and
 * a compact date. A failed transfer reads muted.
 */
export function ActivityRow({
  payment,
  onPress,
}: {
  payment: RecentPayment;
  onPress?: () => void;
}) {
  const { t } = useTranslation();
  const incoming = payment.direction === 'in';
  const tone = !payment.success ? 'muted' : incoming ? 'positive' : 'default';

  return (
    <ListRow
      onPress={onPress}
      media={<InitialsAvatar name={payment.name} size="md" />}
      title={payment.key === 'unknown' ? t('payments.unknown') : payment.name}
      subtitle={t(`payments.relationship.${payment.direction}`)}
      value={
        <AmountText
          value={incoming ? payment.amount : -payment.amount}
          currency={payment.symbol}
          signed
          mono
          size="md"
          tone={tone}
          decimals={2}
        />
      }
      meta={formatPaymentDate(payment.timestamp)}
    />
  );
}
