import { useLocalSearchParams } from 'expo-router';
import { ScreenStub } from '../../components/drops/screen-stub';

export default function ChatSessionScreen() {
  const { session } = useLocalSearchParams<{ session: string }>();

  return (
    <ScreenStub
      eyebrow="Dewy · Session"
      title="Conversation"
      blurb="A past Dewy conversation loaded from the sessions drawer, with its full message thread."
      design={`chat/chat-sessions.jsx · session=${session ?? '—'}`}
    />
  );
}
