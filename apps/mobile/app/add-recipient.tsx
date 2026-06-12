import { BottomSheet } from '@flama/design-system-mobile/bottom-sheet';
import { Button } from '@flama/design-system-mobile/button';
import { Callout } from '@flama/design-system-mobile/callout';
import { ChainBadge } from '@flama/design-system-mobile/chain-badge';
import { Chip } from '@flama/design-system-mobile/chip';
import { GlassBackdrop } from '@flama/design-system-mobile/glass-panel';
import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { cn } from '@flama/design-system-mobile/utils';
import { AddressBookErrors, AppError } from '@flama/frontend';
import { useAddContact, useWalletState } from '@flama/frontend/react';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ChevronDown, ChevronLeft, ScanLine, ShieldCheck } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaymentsBackdrop } from '../components/payments/payments-backdrop';
import { Routes } from '../lib/routes';

/**
 * The design's PField: a white hairline card with the small label INSIDE,
 * above the value (payments-screens.jsx). Children render the field body.
 */
function Field({
  label,
  trailing,
  onPress,
  children,
}: {
  label: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  children: React.ReactNode;
}) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      className={cn(
        'border-border bg-card flex-row items-center gap-2.5 rounded-lg border px-4 py-[11px]',
        onPress && 'active:scale-[0.99] active:opacity-90',
      )}
    >
      <View className="min-w-0 flex-1 gap-[3px]">
        <Text className="text-muted-foreground text-[12.5px]">{label}</Text>
        {children}
      </View>
      {trailing}
    </Wrapper>
  );
}

const fieldInputClass =
  'text-foreground min-w-0 p-0 text-base placeholder:text-muted-foreground/50';

// iOS's number-pad has no return key, so the destination-tag input gets a
// keyboard accessory bar with a Done button to dismiss it.
const TAG_ACCESSORY_ID = 'add-recipient-tag-done';

/** Map address-book error codes to the screen's translated messages. */
type SaveErrorKey = 'invalidName' | 'invalidAddress' | 'duplicate' | 'generic';
const ERROR_KEYS: Record<string, SaveErrorKey> = {
  [AddressBookErrors.INVALID_NAME.code]: 'invalidName',
  [AddressBookErrors.INVALID_ADDRESS.code]: 'invalidAddress',
  [AddressBookErrors.DUPLICATE_CONTACT.code]: 'duplicate',
};

/**
 * Add recipient — saves a contact to the on-device address book
 * (payments/payments-screens.jsx, AddRecipient; the Individual/Business
 * segmented control is deliberately not implemented). Network comes from the
 * wallet's derived accounts; address, optional XRPL destination tag and a
 * name to save. Presented as a modal over the payments hub.
 */
export default function AddRecipientScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { accounts } = useWalletState();

  // Params seed the form two ways: an initial prefill when arriving from a
  // payment's counterparty (address + network known, just name it), and the
  // values the scan screen returns with (`scanned*`).
  const params = useLocalSearchParams<{
    address?: string;
    chainId?: string;
    name?: string;
    scannedAddress?: string;
    scannedTag?: string;
  }>();

  const [chainId, setChainId] = React.useState<string | undefined>(params.chainId);
  const [address, setAddress] = React.useState(params.address ?? '');
  const [destinationTag, setDestinationTag] = React.useState('');
  const [name, setName] = React.useState(params.name ?? '');
  const [networkOpen, setNetworkOpen] = React.useState(false);
  const [errorKey, setErrorKey] = React.useState<SaveErrorKey | null>(null);

  // The scan screen returns here with the parsed address (and XRPL tag). Track
  // the last applied address so a re-render doesn't clobber edits the user
  // makes after the scan.
  const appliedScan = React.useRef<string | undefined>(undefined);
  React.useEffect(() => {
    const scanned = params.scannedAddress;
    if (!scanned || scanned === appliedScan.current) return;
    appliedScan.current = scanned;
    setAddress(scanned);
    if (params.scannedTag) setDestinationTag(params.scannedTag);
  }, [params.scannedAddress, params.scannedTag]);

  // Networks the wallet can pay on; default to the first (XRPL).
  const networks = accounts.map((account) => ({
    chainId: account.chainId,
    name: account.chainName,
    kind: account.kind,
  }));
  const selected = networks.find((network) => network.chainId === chainId) ?? networks[0];

  const addContact = useAddContact({
    onSuccess: () => router.back(),
    onError: (error) => {
      const key = error instanceof AppError ? ERROR_KEYS[error.code] : undefined;
      setErrorKey(key ?? 'generic');
    },
  });
  const { mutate: saveContact, isPending } = addContact;

  const canSave = name.trim().length >= 2 && address.trim().length > 0 && !!selected;

  const save = () => {
    if (!canSave || isPending) return;
    setErrorKey(null);
    saveContact({
      name,
      address,
      chainId: selected.chainId,
      destinationTag: destinationTag || undefined,
    });
  };

  const pasteAddress = async () => {
    const text = (await Clipboard.getStringAsync()).trim();
    if (text) setAddress(text);
  };

  // The sheet slides over the form — drop the keyboard first so it doesn't
  // sit behind (or on top of) the sheet.
  const openNetworkPicker = () => {
    Keyboard.dismiss();
    setNetworkOpen(true);
  };

  return (
    <View className="bg-background flex-1">
      <PaymentsBackdrop />

      <View style={{ paddingTop: insets.top + 14 }} className="px-5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('payments.addRecipient.back')}
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-white/[0.42] active:scale-[0.97]"
        >
          <GlassBackdrop intensity={18} />
          <Icon as={ChevronLeft} size={20} className="text-foreground" />
        </Pressable>
        <Text className="font-display text-foreground mt-[18px] text-[32px] leading-[36px] tracking-[-0.5px]">
          {t('payments.addRecipient.title')}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="gap-3.5 px-5 pb-2 pt-5"
      >
        <Field
          label={t('payments.addRecipient.network')}
          onPress={networks.length > 1 ? openNetworkPicker : undefined}
          trailing={
            networks.length > 1 ? (
              <Icon as={ChevronDown} size={18} className="text-muted-foreground" />
            ) : undefined
          }
        >
          <View className="flex-row items-center gap-2">
            {selected ? (
              <ChainBadge kind={selected.kind === 'evm' ? 'evm' : 'xrp'} size={22} />
            ) : null}
            <Text className="text-foreground text-base font-medium">{selected?.name ?? '—'}</Text>
          </View>
        </Field>

        <Field
          label={t('payments.addRecipient.address')}
          trailing={
            <View className="flex-row items-center gap-2">
              <Chip size="sm" icon={ScanLine} onPress={() => router.push(Routes.ScanRecipient)}>
                {t('payments.addRecipient.scan')}
              </Chip>
              <Chip size="sm" onPress={pasteAddress}>
                {t('payments.addRecipient.paste')}
              </Chip>
            </View>
          }
        >
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder={t('payments.addRecipient.addressPlaceholder')}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            returnKeyType="done"
            className={cn(fieldInputClass, 'font-mono')}
          />
        </Field>

        <Field label={t('payments.addRecipient.destinationTag')}>
          <TextInput
            value={destinationTag}
            onChangeText={(value) => setDestinationTag(value.replace(/[^0-9]/g, ''))}
            placeholder={t('payments.addRecipient.destinationTagPlaceholder')}
            keyboardType="number-pad"
            returnKeyType="done"
            inputAccessoryViewID={Platform.OS === 'ios' ? TAG_ACCESSORY_ID : undefined}
            className={cn(fieldInputClass, 'font-mono')}
          />
        </Field>

        <Field label={t('payments.addRecipient.recipientName')}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('payments.addRecipient.namePlaceholder')}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            className={fieldInputClass}
          />
        </Field>

        <View className="flex-row items-start gap-2.5 px-1 pt-1">
          <Icon as={ShieldCheck} size={16} className="text-muted-foreground mt-px shrink-0" />
          <Text className="text-muted-foreground flex-1 text-[13px] leading-[19px]">
            {t('payments.addRecipient.securityNote')}
          </Text>
        </View>

        {errorKey ? (
          <Callout variant="negative">{t(`payments.addRecipient.errors.${errorKey}`)}</Callout>
        ) : null}
      </ScrollView>

      <View className="px-5 pt-3" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button
          variant="brand"
          size="lg"
          className="w-full"
          disabled={!canSave || isPending}
          onPress={save}
        >
          <Text>
            {isPending ? t('payments.addRecipient.saving') : t('payments.addRecipient.save')}
          </Text>
        </Button>
      </View>

      <BottomSheet open={networkOpen} onClose={() => setNetworkOpen(false)}>
        <Text className="font-display text-foreground mb-1 text-[22px] tracking-[-0.3px]">
          {t('payments.addRecipient.network')}
        </Text>
        <Text className="text-muted-foreground mb-4 text-[13.5px] leading-5">
          {t('payments.addRecipient.networkSubtitle')}
        </Text>
        <View className="gap-2.5">
          {networks.map((network) => {
            const isSelected = network.chainId === selected?.chainId;
            const kind = network.kind === 'evm' ? 'evm' : 'xrp';
            return (
              <Pressable
                key={network.chainId}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  setChainId(network.chainId);
                  setNetworkOpen(false);
                }}
                className={cn(
                  'w-full flex-row items-center gap-3.5 rounded-xl border-[1.5px] p-3.5 active:scale-[0.97]',
                  isSelected ? 'bg-brand-soft border-brand' : 'bg-card border-border',
                )}
              >
                <ChainBadge kind={kind} size={40} />
                <View className="min-w-0 flex-1">
                  <Text className="text-foreground text-[15.5px] font-semibold">
                    {network.name}
                  </Text>
                  <Text className="text-muted-foreground mt-0.5 text-[13px]">
                    {t(`payments.addRecipient.networkHint.${kind}`)}
                  </Text>
                </View>
                <View
                  className={cn(
                    'h-[22px] w-[22px] items-center justify-center rounded-full',
                    isSelected ? 'bg-brand' : 'border-border border-2 bg-transparent',
                  )}
                >
                  {isSelected ? (
                    <Icon as={Check} size={14} strokeWidth={3} className="text-brand-foreground" />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>

      {Platform.OS === 'ios' ? (
        <InputAccessoryView nativeID={TAG_ACCESSORY_ID}>
          <View className="border-border bg-card flex-row justify-end border-t px-4 py-2">
            <Pressable
              accessibilityRole="button"
              onPress={() => Keyboard.dismiss()}
              className="active:opacity-70"
            >
              <Text className="text-brand text-[15px] font-semibold">
                {t('payments.addRecipient.done')}
              </Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      ) : null}
    </View>
  );
}
