import { Button } from '@flama/design-system-mobile/button';
import { GlassBackdrop } from '@flama/design-system-mobile/glass-panel';
import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { ArrowDownLeft, ArrowUpRight, Repeat, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Payment-chat composer — the money-action row (Split · Request · Send) over a
// frosted message field. Mocked: the field is a static placeholder; only the
// money actions are wired. Owns its own bottom safe-area inset.
export function PaymentComposer({
  onSplit,
  onRequest,
  onSend,
}: {
  onSplit: () => void;
  onRequest: () => void;
  onSend: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View className="gap-2.5 px-4 pt-2.5" style={{ paddingBottom: insets.bottom + 12 }}>
      <View className="flex-row gap-2.5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('payments.chat.split')}
          onPress={onSplit}
          className="bg-card border-border h-12 w-12 shrink-0 items-center justify-center rounded-full border active:scale-[0.97]"
        >
          <Icon as={Repeat} size={19} className="text-foreground" />
        </Pressable>
        <Button variant="secondary" size="lg" className="h-12 flex-1" onPress={onRequest}>
          <Icon as={ArrowDownLeft} size={17} />
          <Text>{t('payments.chat.request')}</Text>
        </Button>
        <Button variant="brand" size="lg" className="h-12 flex-1" onPress={onSend}>
          <Icon as={ArrowUpRight} size={17} />
          <Text>{t('payments.chat.send')}</Text>
        </Button>
      </View>

      <View className="h-12 flex-row items-center gap-2.5 overflow-hidden rounded-full border border-white/40 bg-white/40 pl-[18px] pr-2">
        <GlassBackdrop />
        <Text className="text-muted-foreground flex-1 text-[15px]">
          {t('payments.chat.messagePlaceholder')}
        </Text>
        <View className="bg-muted h-[34px] w-[34px] items-center justify-center rounded-full">
          <Icon as={Sparkles} size={17} className="text-muted-foreground" />
        </View>
      </View>
    </View>
  );
}
