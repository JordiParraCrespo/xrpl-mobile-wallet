import { ScreenStub } from "../../../components/drops/screen-stub";

export default function SendScreen() {
  return (
    <ScreenStub
      eyebrow="Send"
      title="Send money"
      blurb="Three steps in one screen — Amount (keypad + quick chips, balance guard), Review (the safety gate for an irreversible payment), and Sent (settlement + fee)."
      design="send.html · flows/send-app.jsx (+ flow-kit.jsx)"
    />
  );
}
