import type { ChatMessageData } from '@flama/design-system-mobile/chat-message';

/** A thread message: the design-system payload plus our routing metadata. */
export type ChatPayload = ChatMessageData & { qid?: string };
export type Msg = ChatPayload & { id: number };

export type SessionGroup = 'Today' | 'Earlier';

/** A single Dewy conversation, with its full message thread. */
export type Session = {
  id: string;
  title: string;
  preview: string;
  time: string;
  group: SessionGroup;
  msgs: Msg[];
};
