import { Button } from '@flama/design-system-mobile/button';
import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, ScanLine } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { parsePaymentTarget } from '../lib/payment-uri';
import { Routes } from '../lib/routes';

/**
 * Scan recipient — point the camera at a payment QR to capture a destination
 * address (and XRPL destination tag, when the code carries one). On a readable
 * code it returns to Add recipient with the parsed values pre-filled; the
 * address is still validated there against the paying chain before it can be
 * saved. Presented as a modal over the Add recipient form.
 */
export default function ScanRecipientScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();

  // A single QR fills the whole form, so latch the first readable code and
  // stop reacting — `onBarcodeScanned` otherwise fires every frame.
  const handled = React.useRef(false);
  const [invalid, setInvalid] = React.useState(false);

  const onBarcodeScanned = React.useCallback(
    ({ data }: { data: string }) => {
      if (handled.current) return;
      const target = parsePaymentTarget(data);
      if (!target) {
        setInvalid(true);
        return;
      }
      handled.current = true;
      // `navigate` (not `push`) returns to the Add recipient screen already in
      // the stack, updating its params instead of stacking a second instance.
      router.navigate({
        pathname: Routes.AddRecipient,
        params: {
          scannedAddress: target.address,
          scannedTag: target.destinationTag ?? '',
        },
      });
    },
    [router],
  );

  const Header = (
    <View style={{ paddingTop: insets.top + 14 }} className="absolute inset-x-0 top-0 z-10 px-5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('payments.scanRecipient.back')}
        onPress={() => router.back()}
        className="h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 active:scale-[0.97]"
      >
        <Icon as={ChevronLeft} size={20} className="text-white" />
      </Pressable>
    </View>
  );

  // Permission is still resolving (null) — render nothing but the dark surface.
  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  // Not granted yet: ask in-context, with a manual-entry escape hatch.
  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black">
        <StatusBar style="light" />
        {Header}
        <View
          className="flex-1 items-center justify-center px-8"
          style={{ paddingBottom: insets.bottom }}
        >
          <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <Icon as={ScanLine} size={30} className="text-white" />
          </View>
          <Text className="font-display mb-2 text-center text-[24px] text-white">
            {t('payments.scanRecipient.permissionTitle')}
          </Text>
          <Text className="mb-7 text-center text-[15px] leading-[22px] text-white/60">
            {t('payments.scanRecipient.permissionBody')}
          </Text>
          <Button variant="brand" size="lg" className="w-full" onPress={() => requestPermission()}>
            <Text>{t('payments.scanRecipient.grant')}</Text>
          </Button>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            className="mt-4 active:opacity-70"
          >
            <Text className="text-[15px] font-semibold text-white/70">
              {t('payments.scanRecipient.enterManually')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onBarcodeScanned}
      />
      {Header}

      {/* Framing reticle + instructions over the live feed. */}
      <View className="flex-1 items-center justify-center px-10" pointerEvents="none">
        <View className="aspect-square w-full max-w-[260px] rounded-[28px] border-2 border-white/85" />
        <Text className="font-display mt-7 text-center text-[22px] text-white">
          {t('payments.scanRecipient.title')}
        </Text>
        <Text className="mt-2 text-center text-[14.5px] leading-[21px] text-white/65">
          {invalid ? t('payments.scanRecipient.invalid') : t('payments.scanRecipient.subtitle')}
        </Text>
      </View>
    </View>
  );
}
