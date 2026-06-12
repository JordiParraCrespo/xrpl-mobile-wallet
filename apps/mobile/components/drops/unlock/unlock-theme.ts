// Light (watercolor) theme tokens for the unlock screen, lifted verbatim from
// UN_THEME.light in the Drops design (unlock/unlock-app.jsx). The glass keypad
// owns its own white-on-glass styling (see @flama/design-system-mobile
// PasscodeKeypad); these cover the identity, dots and supporting text.
export const UNLOCK_LIGHT = {
  fg: '#fff',
  sub: 'rgba(255,255,255,0.78)',
  dotOn: '#fff',
  dotOff: 'rgba(255,255,255,0.4)',
  avatarBg: 'rgba(255,255,255,0.92)',
  avatarFg: '#6a3fb0',
} as const;

// Mock account behind the lock screen.
export const MOCK_ACCOUNT = { initials: 'JP' } as const;
