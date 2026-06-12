import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { Send } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHIPS } from './chat-seeds';

// Placeholder color tracks the chat theme (--chat-faint): faint white on the
// dark surface, neutral ink on light. TextInput needs a literal colour, so it
// can't ride the Tailwind token like the rest of the composer.
const PLACEHOLDER = {
  dark: 'rgba(255,255,255,0.45)',
  light: '#8d969e',
} as const;

// Composer — quick-action chips (hidden once the user starts typing) above an
// auto-growing "Ask Dewy…" input. Owns its own draft and bottom safe-area
// inset; hands finished text up via `onSubmit`.
export function ChatComposer({ onSubmit }: { onSubmit: (text: string) => void }) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const [draft, setDraft] = React.useState('');
  const [composing, setComposing] = React.useState(false);
  const canSend = draft.trim().length > 0;

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    onSubmit(text);
  };

  return (
    <View
      className="border-chat-hairline border-t-hairline px-3.5 pt-2"
      style={{ paddingBottom: insets.bottom + 10 }}
    >
      {!composing ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 pb-2.5"
        >
          {CHIPS.map((c) => (
            <Pressable
              key={c}
              onPress={() => onSubmit(c)}
              className="border-chat-chip-line bg-chat-chip rounded-full border px-3.5 py-2 active:opacity-70"
            >
              <Text className="text-chat-fg text-[13px] font-medium">{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View className="border-chat-border bg-chat-input flex-row items-end gap-2.5 rounded-[24px] border py-1.5 pl-4 pr-1.5">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onFocus={() => setComposing(true)}
          onBlur={() => {
            if (!draft) setComposing(false);
          }}
          placeholder="Ask Dewy to do something…"
          placeholderTextColor={colorScheme === 'dark' ? PLACEHOLDER.dark : PLACEHOLDER.light}
          multiline
          className="text-chat-fg max-h-[120px] flex-1 py-2 text-[15px] leading-[22px]"
          onSubmitEditing={send}
        />
        <Pressable
          onPress={send}
          disabled={!canSend}
          accessibilityLabel="Send"
          className={`h-10 w-10 items-center justify-center rounded-full ${
            canSend ? 'bg-chat-brand active:opacity-90' : 'bg-chat-chip-line'
          }`}
        >
          <Icon as={Send} size={18} className={canSend ? 'text-white' : 'text-chat-faint'} />
        </Pressable>
      </View>
    </View>
  );
}
