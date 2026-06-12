import { FlowHeader } from '@flama/design-system-mobile/flow-header';
import { applyKeypadKey, Keypad } from '@flama/design-system-mobile/keypad';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AddMoneyAmount } from '../../components/flows/add-money-amount';
import { AddMoneySubmit } from '../../components/flows/add-money-submit';
import { FlowScreen } from '../../components/flows/flow-screen';

// Mocked on-ramp data — where the money lands and where it comes from.
// Wiring the real funding source + transfer is a follow-up (the screen is
// presentation-only for now). Design: addMoney.html · flows/addmoney-app.jsx.
const DESTINATION = { ledger: 'XRP Ledger', balance: '$744.87' };
const FUNDING_SOURCE = 'Bankinter · USD';

/**
 * Add money — the fund-your-wallet on-ramp, styled like a neobank top-up
 * rather than a crypto deposit. Leads with a large local-currency amount and
 * a "no fee / instant" reassurance; the source and destination are stated
 * plainly. Presented as a dark modal over the hub.
 */
export default function AddMoneyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [amount, setAmount] = React.useState('100');
  const value = Number.parseFloat(amount || '0') || 0;

  return (
    <FlowScreen>
      <View className="px-4">
        <FlowHeader
          title={t('flows.addMoney.title')}
          subtitle={t('flows.addMoney.destination', DESTINATION)}
          onBack={() => router.back()}
        />
      </View>

      <AddMoneyAmount
        amount={amount}
        sourceLabel={FUNDING_SOURCE}
        feeNote={t('flows.addMoney.noFee')}
      />

      <AddMoneySubmit
        arrivingLabel={t('flows.addMoney.arrivingLabel')}
        arrivingValue={t('flows.addMoney.arrivingValue')}
        submitLabel={t('flows.addMoney.submit')}
        disabled={value <= 0}
        onPress={() => {}}
      />

      <View className="px-2">
        <Keypad operators onKey={(key) => setAmount((prev) => applyKeypadKey(prev, key))} />
      </View>
    </FlowScreen>
  );
}
