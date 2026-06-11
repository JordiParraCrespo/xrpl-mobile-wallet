import { useLocalSearchParams } from 'expo-router';
import { ScreenStub } from '../../components/drops/screen-stub';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenStub
      eyebrow="Transaction"
      title="Payment detail"
      blurb="An avatar hero with a direction badge, the serif amount and date · time · ≈ USD. Then Status / From / Account, ledger timestamps, the tx hash and Open in explorer."
      design={`payments/payments-screens.jsx (Transaction detail) · id=${id ?? '—'}`}
    />
  );
}
