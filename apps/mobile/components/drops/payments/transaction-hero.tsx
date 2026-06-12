import { AmountText } from '@flama/design-system-mobile/amount-text';
import { Icon } from '@flama/design-system-mobile/icon';
import { InitialsAvatar } from '@flama/design-system-mobile/initials-avatar';
import { Text } from '@flama/design-system-mobile/text';
import { cn } from '@flama/design-system-mobile/utils';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { View } from 'react-native';
import { formatUsd, type PaymentTransaction, XRP_USD_RATE } from './payments-data';

// TransactionHero — the top of the payment detail: the counterparty avatar with
// a direction badge, their name, the signed amount in the display serif and the
// date · time · ≈ USD line. Incoming reads positive (green), outgoing neutral.
export function TransactionHero({ tx, peer }: { tx: PaymentTransaction; peer: string }) {
  const incoming = tx.dir === 'in';
  const usd = tx.xrp * XRP_USD_RATE;
  return (
    <View className="items-center">
      <InitialsAvatar
        name={peer}
        size="xl"
        badge={
          <View
            className={cn(
              'h-full w-full items-center justify-center',
              incoming ? 'bg-positive' : 'bg-brand',
            )}
          >
            <Icon as={incoming ? ArrowDownLeft : ArrowUpRight} size={13} className="text-white" />
          </View>
        }
      />
      <Text className="text-foreground mt-3.5 text-[18px] font-semibold">{peer}</Text>
      <AmountText
        className="mt-2"
        value={incoming ? tx.xrp : -tx.xrp}
        currency="XRP"
        signed
        size="xl"
        tone={incoming ? 'positive' : 'default'}
      />
      <Text className="text-muted-foreground mt-2 text-[14.5px]">
        {tx.date}, {tx.time} · ≈ {formatUsd(usd)}
      </Text>
    </View>
  );
}
