import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { ChatComposer } from '../../../components/chat/chat-composer';
import { ChatHeader } from '../../../components/chat/chat-header';
import { ChatThread } from '../../../components/chat/chat-thread';
import { SessionsDrawer } from '../../../components/chat/sessions-drawer';
import { useChatFlow } from '../../../components/chat/use-chat-flow';
import { Routes } from '../../../lib/routes';

// Dewy — the wallet assistant (chat.html). A full-screen, tool-using chat:
// text + user bubbles, AskUserQuestions chips, approve/decline action cards,
// balance / result / error cards, and a composer with quick chips. The
// sessions drawer slides in from the left and swaps the thread in place.
//
// This screen is a thin shell — the conversation state and scripted flows live
// in `useChatFlow`, and the header, thread, composer and drawer are their own
// components under `components/chat/`.
export default function ChatScreen() {
  const router = useRouter();
  const flow = useChatFlow();

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace(Routes.Home);
  };

  return (
    <View className="bg-background flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ChatHeader
          onClose={close}
          onOpenSessions={() => flow.setDrawerOpen(true)}
          onNewChat={flow.startNew}
        />
        <ChatThread
          msgs={flow.msgs}
          onAnswer={flow.onAnswer}
          onAction={flow.onAction}
          onError={flow.onError}
        />
        <ChatComposer onSubmit={flow.submit} />
      </KeyboardAvoidingView>

      <SessionsDrawer
        open={flow.drawerOpen}
        sessions={flow.sessions}
        activeId={flow.activeId}
        onClose={() => flow.setDrawerOpen(false)}
        onSelect={flow.loadSession}
        onNew={flow.startNew}
      />
    </View>
  );
}
