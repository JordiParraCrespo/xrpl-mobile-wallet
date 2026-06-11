import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { Send } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHIPS } from './chat-seeds';

// Composer — quick-action chips (hidden once the user starts typing) above an
// auto-growing "Ask Dewy…" input. Owns its own draft and bottom safe-area
// inset; hands finished text up via `onSubmit`.
export function ChatComposer({ onSubmit }: { onSubmit: (text: string) => void }) {
  const insets = useSafeAreaInsets();
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
      className="border-border border-t-hairline px-3.5 pt-2"
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
              className="border-input bg-card rounded-full border px-3.5 py-2 active:opacity-70"
            >
              <Text className="text-foreground text-[13px] font-medium">{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View className="border-border bg-card flex-row items-end gap-2.5 rounded-[24px] border py-1.5 pl-4 pr-1.5">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onFocus={() => setComposing(true)}
          onBlur={() => {
            if (!draft) setComposing(false);
          }}
          placeholder="Ask Dewy to do something…"
          placeholderTextColor="#8d969e"
          multiline
          className="text-foreground max-h-[120px] flex-1 py-2 text-[15px] leading-[22px]"
          onSubmitEditing={send}
        />
        <Pressable
          onPress={send}
          disabled={!canSend}
          accessibilityLabel="Send"
          className={`h-10 w-10 items-center justify-center rounded-full ${
            canSend ? 'bg-brand active:bg-brand/90' : 'bg-secondary'
          }`}
        >
          <Icon as={Send} size={18} className={canSend ? 'text-white' : 'text-muted-foreground'} />
        </Pressable>
      </View>
    </View>
  );
}
