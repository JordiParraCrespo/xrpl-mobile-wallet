import { Callout } from '@flama/design-system-mobile/callout';
import { Text } from '@flama/design-system-mobile/text';

// Network safety warning — always visible, since the biggest risk in receiving
// is sending from the wrong network. Uses the design-system `warning` Callout.
export function NetworkWarning({ network }: { network: string }) {
  return (
    <Callout variant="warning" className="mt-[18px] max-w-[340px] self-center">
      <Text>
        Only send assets on the <Text className="font-semibold">{network}</Text>. Sending from
        another network may lose your funds.
      </Text>
    </Callout>
  );
}
