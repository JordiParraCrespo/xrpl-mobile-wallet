import { ChatMessage } from '@flama/design-system-mobile/chat-message';
import * as React from 'react';
import { ScrollView } from 'react-native';
import { DewyAvatar } from './dewy-avatar';
import type { Msg } from './types';

// The scrolling message thread. Renders each message through the design-system
// ChatMessage and pins itself to the newest message as the thread grows.
export function ChatThread({
  msgs,
  onAnswer,
  onAction,
  onError,
}: {
  msgs: Msg[];
  onAnswer: (msg: Msg, opt: string) => void;
  onAction: (msg: Msg, approve: boolean) => void;
  onError: (msg: Msg, retry: boolean) => void;
}) {
  const scrollRef = React.useRef<ScrollView>(null);
  return (
    <ScrollView
      ref={scrollRef}
      className="flex-1"
      contentContainerClassName="px-4 pb-2 pt-[18px] gap-3"
      keyboardDismissMode="interactive"
      onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
    >
      {msgs.map((m) => (
        <ChatMessage
          key={m.id}
          message={m}
          avatar={<DewyAvatar />}
          onAnswer={(opt) => onAnswer(m, opt)}
          onAction={(approved) => onAction(m, approved)}
          onErrorAction={(retry) => onError(m, retry)}
        />
      ))}
    </ScrollView>
  );
}
