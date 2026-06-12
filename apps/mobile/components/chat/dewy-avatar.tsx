import { AssistantAvatar } from '@flama/design-system-mobile/assistant-avatar';

// Dewy's circular avatar — wraps AssistantAvatar with the bundled mascot so the
// header and every bot bubble share one source of truth for the image.
const dewyAvatar = require('../../assets/dewy.png');

export function DewyAvatar({ size = 26, ring = false }: { size?: number; ring?: boolean }) {
  return <AssistantAvatar source={dewyAvatar} size={size} ring={ring} />;
}
