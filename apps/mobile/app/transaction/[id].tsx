import { AmountText } from '@flama/design-system-mobile/amount-text';
import { Button } from '@flama/design-system-mobile/button';
import { Icon } from '@flama/design-system-mobile/icon';
import { IconButton } from '@flama/design-system-mobile/icon-button';
import { InitialsAvatar } from '@flama/design-system-mobile/initials-avatar';
import { Separator } from '@flama/design-system-mobile/separator';
import { Skeleton } from '@flama/design-system-mobile/skeleton';
import { Text } from '@flama/design-system-mobile/text';
import { cn } from '@flama/design-system-mobile/utils';
import { shortenAddress } from '@flama/frontend';
import type { RecentPayment } from '@flama/frontend/react';
import { useExchangeRate, usePaymentDetail, useWalletState } from '@flama/frontend/react';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  Copy,
  ExternalLink,
  UserPlus,
} from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatPaymentDateTime } from '../../components/payments/format-date';
import { PaymentsBackdrop } from '../../components/payments/payments-backdrop';
import { buildRoute } from '../../lib/routes';

/** Default chain when no wallet is loaded yet, so the screen still renders. */
const FALLBACK_CHAIN_ID = 'xrpl:testnet';

function formatUsd(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Transaction detail — a payment opened from the payments hub
 * (`payments/payments-screens.jsx`, Transaction detail). The row comes from
 * {@link usePaymentDetail}, which joins the active XRPL account's history with
 * the address book, so the counterparty already reads as a saved name where one
 * exists. When it doesn't, a "Save recipient" action pre-fills the address book
 * with this address — merging the payment into your contacts.
 */
export default function TransactionDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { accounts } = useWalletState();
  const xrpl = accounts.find((account) => account.kind === 'xrpl');
  const { payment, isLoading } = usePaymentDetail(
    xrpl?.chainId ?? FALLBACK_CHAIN_ID,
    xrpl?.address,
    id,
  );

  const rate = useExchangeRate('XRP', 'usd').data;

  return (
    <View className="bg-background flex-1">
      <PaymentsBackdrop />

      <View style={{ paddingTop: insets.top + 14 }} className="px-5 pb-1">
        <IconButton
          variant="soft"
          accessibilityLabel={t('payments.transaction.back')}
          onPress={() => router.back()}
        >
          <Icon as={ChevronLeft} size={20} />
        </IconButton>
      </View>

      {isLoading && !payment ? (
        <DetailSkeleton />
      ) : !payment ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-muted-foreground text-center text-[15px] leading-[22px]">
            {t('payments.transaction.notFound')}
          </Text>
        </View>
      ) : (
        <Detail payment={payment} usd={rate ? payment.amount * rate : null} />
      )}
    </View>
  );
}

function Detail({ payment, usd }: { payment: RecentPayment; usd: number | null }) {
  const { t } = useTranslation();
  const router = useRouter();
  const incoming = payment.direction === 'in';
  const DirectionIcon = incoming ? ArrowDownLeft : ArrowUpRight;

  const onSaveRecipient = () => router.push(buildRoute.addRecipient({ address: payment.address }));

  const openExplorer = () => {
    if (payment.explorerUrl) Linking.openURL(payment.explorerUrl).catch(() => {});
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-5 pb-10"
      contentContainerStyle={{ paddingTop: 6 }}
    >
      {/* hero — avatar with a direction badge, then the signed amount */}
      <View className="items-center pb-7 pt-2">
        <View className="relative">
          <InitialsAvatar name={payment.name} size="xl" />
          <View
            className={cn(
              'border-background absolute -bottom-1 -right-1 h-7 w-7 items-center justify-center rounded-full border-2',
              incoming ? 'bg-positive' : 'bg-foreground',
            )}
          >
            <Icon as={DirectionIcon} size={15} className="text-background" />
          </View>
        </View>

        <Text className="text-foreground mt-3.5 text-[17px] font-semibold">
          {payment.key === 'unknown' ? t('payments.unknown') : payment.name}
        </Text>
        <Text className="text-muted-foreground mt-0.5 text-[13px]">
          {t(`payments.relationship.${payment.direction}`)}
        </Text>

        <View className="mt-3.5">
          <AmountText
            value={incoming ? payment.amount : -payment.amount}
            currency={payment.symbol}
            signed
            tone={!payment.success ? 'muted' : incoming ? 'positive' : 'default'}
            size="xl"
            decimals={2}
          />
        </View>
        <Text className="text-muted-foreground mt-1 text-[13.5px]">
          {formatPaymentDateTime(payment.timestamp)}
          {usd !== null ? ` · ≈ ${formatUsd(usd)}` : ''}
        </Text>
      </View>

      {/* details card */}
      <View className="bg-card border-border overflow-hidden rounded-xl border">
        <DetailRow
          label={t('payments.transaction.status')}
          value={
            <View className="flex-row items-center gap-1.5">
              <View
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  payment.success ? 'bg-positive' : 'bg-destructive',
                )}
              />
              <Text className="text-foreground text-[14.5px] font-medium">
                {payment.success
                  ? t('payments.transaction.confirmed')
                  : t('payments.transaction.failed')}
              </Text>
            </View>
          }
        />
        <Separator />
        <DetailRow
          label={incoming ? t('payments.transaction.from') : t('payments.transaction.to')}
          value={
            <Text className="text-foreground max-w-[60%] text-right text-[14.5px] font-medium">
              {payment.known ? payment.name : t('payments.transaction.notSaved')}
            </Text>
          }
        />
        {payment.address ? (
          <>
            <Separator />
            <CopyRow
              label={t('payments.transaction.address')}
              value={payment.address}
              display={shortenAddress(payment.address)}
            />
          </>
        ) : null}
        {payment.fee !== undefined ? (
          <>
            <Separator />
            <DetailRow
              label={t('payments.transaction.fee')}
              value={
                <Text className="text-foreground text-[14.5px] font-medium tabular-nums">
                  {payment.fee} {payment.symbol}
                </Text>
              }
            />
          </>
        ) : null}
        <Separator />
        <CopyRow
          label={t('payments.transaction.hash')}
          value={payment.id}
          display={shortenAddress(payment.id, 8, 6)}
        />
      </View>

      {/* actions */}
      <View className="mt-5 gap-3">
        {payment.address && !payment.known ? (
          <Button variant="brand" size="lg" className="w-full" onPress={onSaveRecipient}>
            <Icon as={UserPlus} size={18} className="text-brand-foreground" />
            <Text className="text-brand-foreground font-semibold">
              {t('payments.transaction.saveRecipient')}
            </Text>
          </Button>
        ) : null}

        {payment.explorerUrl ? (
          <Button variant="secondary" size="lg" className="w-full" onPress={openExplorer}>
            <Icon as={ExternalLink} size={18} className="text-foreground" />
            <Text className="text-foreground font-semibold">
              {t('payments.transaction.openExplorer')}
            </Text>
          </Button>
        ) : null}
      </View>
    </ScrollView>
  );
}

/** A label/value row inside the details card. */
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5">
      <Text className="text-muted-foreground text-[13.5px]">{label}</Text>
      {value}
    </View>
  );
}

/** A details row whose value is a tap-to-copy mono string (address, hash). */
function CopyRow({ label, value, display }: { label: string; value: string; display: string }) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = () => {
    Clipboard.setStringAsync(value).catch(() => {});
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={copy}
      className="flex-row items-center justify-between px-4 py-3.5 active:opacity-70"
    >
      <Text className="text-muted-foreground text-[13.5px]">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Text className="text-foreground font-mono text-[13.5px]">{display}</Text>
        <Icon
          as={copied ? Check : Copy}
          size={15}
          className={copied ? 'text-positive' : 'text-muted-foreground'}
        />
      </View>
    </Pressable>
  );
}

function DetailSkeleton() {
  return (
    <View className="items-center px-5 pt-2">
      <Skeleton className="h-[72px] w-[72px] rounded-full" />
      <Skeleton className="mt-3.5 h-4 w-32" />
      <Skeleton className="mt-3 h-10 w-44" />
      <Skeleton className="mt-2 h-3.5 w-40" />
      <View className="mt-7 w-full gap-3">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </View>
    </View>
  );
}
