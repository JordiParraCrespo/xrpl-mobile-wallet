import { Text } from '@flama/design-system-mobile/text';
import {
  type PaymentPerson,
  type RecentPayment,
  usePaymentsFeed,
  useProfileState,
  useWalletState,
} from '@flama/frontend/react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaymentQuickActions } from '../../components/payments/payment-quick-actions';
import { PaymentsBackdrop } from '../../components/payments/payments-backdrop';
import { PaymentsHeader } from '../../components/payments/payments-header';
import { PeopleRail } from '../../components/payments/people-rail';
import { RecentPayments } from '../../components/payments/recent-payments';
import { buildRoute, Routes } from '../../lib/routes';

/** Default chain when no wallet is loaded yet, so the screen still renders. */
const FALLBACK_CHAIN_ID = 'xrpl:testnet';

/**
 * Payments — the people-and-activity hub. Frames sending money as messaging a
 * person: quick actions, a rail of people, and a recent-activity list. The
 * people and the rows come from {@link usePaymentsFeed}, which joins the active
 * account's transaction history with the on-device address book so each entry
 * carries a saved name where one exists.
 */
export default function PaymentsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const profile = useProfileState();
  const { accounts } = useWalletState();

  // The payments hub is XRP-denominated; pull the active wallet's XRPL account.
  const xrpl = accounts.find((account) => account.kind === 'xrpl');
  const { people, recents, isLoading } = usePaymentsFeed(
    xrpl?.chainId ?? FALLBACK_CHAIN_ID,
    xrpl?.address,
  );

  const openChat = (contact: string) => router.push(buildRoute.paymentChat(contact));

  const openPerson = (person: PaymentPerson) =>
    openChat(person.contactId ?? person.address ?? person.key);

  // A row opens the transaction detail, which merges the payment with the
  // address book (saved name when known, "save recipient" when not).
  const openPayment = (payment: RecentPayment) => router.push(buildRoute.transaction(payment.id));

  return (
    <View className="bg-background flex-1">
      <PaymentsBackdrop />

      <View style={{ paddingTop: insets.top + 12 }}>
        <PaymentsHeader
          name={profile.name ?? t('payments.you')}
          onOpenProfile={() => router.push(Routes.Profile)}
          onNewRecipient={() => router.push(Routes.AddRecipient)}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-5 pb-28 pt-5">
        <Text variant="h2" className="px-5">
          {t('payments.title')}
        </Text>

        <PaymentQuickActions
          onSend={() => router.push(Routes.Send)}
          onRequest={() => router.push(Routes.Receive)}
        />

        <PeopleRail
          people={people}
          onNewRecipient={() => router.push(Routes.AddRecipient)}
          onOpenPerson={openPerson}
        />

        <RecentPayments payments={recents} isLoading={isLoading} onOpenPayment={openPayment} />
      </ScrollView>
    </View>
  );
}
