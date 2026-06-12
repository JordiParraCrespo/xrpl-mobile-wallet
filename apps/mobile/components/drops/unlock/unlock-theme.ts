// Light (watercolor) theme tokens for the unlock screen, lifted verbatim from
// UN_THEME.light in the Drops design (unlock/unlock-app.jsx). The glass keypad
// and dots own their styling (see @flama/design-system-mobile PasscodeKeypad /
// PasscodeDots `onDark`); these cover the identity and supporting text.
export const UNLOCK_LIGHT = {
  fg: '#fff',
  sub: 'rgba(255,255,255,0.78)',
  avatarBg: 'rgba(255,255,255,0.92)',
  avatarFg: '#6a3fb0',
} as const;

// Mock account behind the lock screen.
export const MOCK_ACCOUNT = { initials: 'JP' } as const;
