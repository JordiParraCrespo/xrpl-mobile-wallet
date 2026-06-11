import { Redirect } from "expo-router";

/**
 * Dewy is presented as a tab, but pressing it opens the full-screen assistant
 * (handled by the `tabPress` listener in the tabs layout). This fallback keeps
 * the route valid if it is ever reached directly.
 */
export default function DewyTab() {
  return <Redirect href="/(drops)/chat" />;
}
