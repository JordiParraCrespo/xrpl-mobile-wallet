import { ScreenStub } from '../../components/drops/screen-stub';
import { buildRoute } from '../../lib/routes';

export default function ChatScreen() {
  return (
    <ScreenStub
      eyebrow="Online · XRPL assistant"
      title="Dewy"
      blurb="A tool-using assistant: text + question chips, approve/decline cards for every money action, balance/result/error cards, and a composer. The drawer holds past sessions."
      design="chat.html · chat/chat-app.jsx (+ chat-msg.jsx, chat-sessions.jsx)"
      links={[
        {
          label: 'Open a past session',
          href: buildRoute.chatSession('today-1'),
          variant: 'secondary',
        },
      ]}
    />
  );
}
