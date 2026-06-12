import { AmountDisplay } from '@flama/design-system-mobile/amount-display';
import { Button } from '@flama/design-system-mobile/button';
import { Chip } from '@flama/design-system-mobile/chip';
import { Icon } from '@flama/design-system-mobile/icon';
import { IconButton } from '@flama/design-system-mobile/icon-button';
import { InputField } from '@flama/design-system-mobile/input-field';
import { SelectorPill } from '@flama/design-system-mobile/selector-pill';
import { Text } from '@flama/design-system-mobile/text';
import { Calendar, Sparkles, Wallet } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { fmtUsd, fmtXrp } from './send-data';
import type { UseSend } from './use-send';

/**
 * Amount step — the keypad-driven dollar entry. The big amount (with the brand
 * caret and a muted "$"), a live ≈ XRP / balance-guard line, the paying-account
 * pill, an optional note, then Continue + quick chips over the shared keypad.
 */
export function AmountStep({ send }: { send: UseSend }) {
  const { t } = useTranslation();
  const { account } = send;

  const conversion = send.over
    ? t('send.insufficient')
    : send.value > 0 && send.xrp != null
      ? t('send.approxNoFees', { amount: fmtXrp(send.xrp, 2) })
      : t('send.noFees');

  return (
    <>
      <View className="flex-1 px-5 pt-7">
        <View className="items-center">
          <AmountDisplay value={send.amount} symbol="$" symbolPosition="suffix" showCursor />
          <Text
            className={`mt-3 text-sm ${send.over ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            {conversion}
          </Text>

          {account ? (
            <View className="mt-5">
              <SelectorPill
                glass
                icon={Wallet}
                label={`${account.label} · ${send.usdBalance != null ? fmtUsd(send.usdBalance) : '—'}`}
                onPress={() => {}}
              />
            </View>
          ) : null}
        </View>

        <InputField
          placeholder={t('send.addNote')}
          value={send.note}
          onChangeText={send.setNote}
          containerClassName="mt-8"
          boxClassName="h-14 rounded-2xl"
          trailing={
            <View className="bg-secondary h-[34px] w-[34px] items-center justify-center rounded-full">
              <Icon as={Sparkles} size={16} className="text-muted-foreground" />
            </View>
          }
        />
      </View>

      {/* Continue + quick amounts */}
      <View className="px-[18px] pb-1.5">
        <View className="mb-3.5 flex-row gap-3">
          <IconButton variant="glass" size="lg" accessibilityLabel={t('send.schedule')}>
            <Icon as={Calendar} size={20} />
          </IconButton>
          <Button
            variant="brand"
            disabled={!send.canContinue}
            onPress={send.toReview}
            className="h-14 flex-1 rounded-full"
          >
            <Text>{t('send.continue')}</Text>
          </Button>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2.5"
        >
          {send.quickAmounts.map((q) => (
            <Chip
              key={q}
              variant="glass"
              className="min-w-[78px] justify-center"
              onPress={() => send.setQuickAmount(q)}
            >
              {`$${q}`}
            </Chip>
          ))}
        </ScrollView>
      </View>
    </>
  );
}
