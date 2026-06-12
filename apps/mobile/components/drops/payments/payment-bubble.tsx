import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { cn } from '@flama/design-system-mobile/utils';
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { formatXrp, type PaymentTransaction } from './payments-data';

// PaymentBubble — a money message in a payment chat. Incoming payments sit on
// the left as a white hairline card; outgoing ones sit on the right in brand
// indigo. Each shows the direction label, the XRP amount in mono, the memo and
// the time; tapping opens the transaction detail. Specific to the payments
// feature — the design-system ChatMessage is the assistant's text surface, a
// different shape entirely.
export function PaymentBubble({ tx, onPress }: { tx: PaymentTransaction; onPress: () => void }) {
  const { t } = useTranslation();
  const incoming = tx.dir === 'in';
  return (
    <View className={cn('w-full flex-row', incoming ? 'justify-start' : 'justify-end')}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className={cn(
          'max-w-[78%] px-[15px] pb-[11px] pt-3 active:scale-[0.98]',
          incoming
            ? 'bg-card border-border rounded-[20px] rounded-bl-[7px] border'
            : 'bg-brand rounded-[20px] rounded-br-[7px]',
        )}
      >
        <View className="flex-row items-center gap-1.5">
          <Icon
            as={incoming ? ArrowDownLeft : ArrowUpRight}
            size={13}
            className={incoming ? 'text-muted-foreground' : 'text-white/80'}
          />
          <Text
            className={cn(
              'text-[12.5px] font-semibold',
              incoming ? 'text-muted-foreground' : 'text-white/80',
            )}
          >
            {incoming ? t('payments.chat.received') : t('payments.chat.sent')}
          </Text>
        </View>

        <View className="mb-0.5 mt-1 flex-row items-baseline gap-1.5">
          <Text
            className={cn(
              'font-mono text-[25px] font-semibold tracking-[-0.4px]',
              incoming ? 'text-foreground' : 'text-white',
            )}
          >
            {formatXrp(tx.xrp)}
          </Text>
          <Text
            className={cn(
              'text-[13px] font-medium',
              incoming ? 'text-muted-foreground' : 'text-white/75',
            )}
          >
            XRP
          </Text>
        </View>

        <Text className={cn('text-[14px]', incoming ? 'text-muted-foreground' : 'text-white/85')}>
          {tx.note}
        </Text>

        <View className="mt-1 flex-row items-center justify-end gap-1.5">
          <Text
            className={cn('text-[11.5px]', incoming ? 'text-muted-foreground' : 'text-white/60')}
          >
            {tx.time}
          </Text>
          <Icon
            as={ChevronRight}
            size={12}
            className={incoming ? 'text-muted-foreground' : 'text-white/60'}
          />
        </View>
      </Pressable>
    </View>
  );
}
