import type { Href } from 'expo-router';

/**
 * Every app route path, in one place. Use these instead of hand-written
 * strings so the route graph is refactor-safe and discoverable.
 *
 * Values mirror the file tree under `app/`. Dynamic routes keep their
 * `[param]` template here; use the `buildRoute` helpers below to fill them in.
 */
export enum Routes {
  /** The wallet-status gate: routes to onboarding, unlock, or home. */
  Root = '/',

  // Vault gate (initialized but locked)
  Unlock = '/unlock',

  // Onboarding (pre-wallet flow)
  Onboarding = '/onboarding',
  OnboardingName = '/onboarding/name',
  OnboardingBackupInfo = '/onboarding/backup-info',
  OnboardingSetPasscode = '/onboarding/set-passcode',
  OnboardingSecureIntro = '/onboarding/secure-intro',
  OnboardingRevealPhrase = '/onboarding/reveal-phrase',
  OnboardingBackupQuiz = '/onboarding/backup-quiz',
  OnboardingImport = '/onboarding/import',
  OnboardingImportPhrase = '/onboarding/import-phrase',
  OnboardingImportSeed = '/onboarding/import-seed',
  OnboardingImportSecretNumbers = '/onboarding/import-secret-numbers',
  OnboardingSuccess = '/onboarding/success',
  OnboardingBiometrics = '/onboarding/biometrics',
  OnboardingNotifications = '/onboarding/notifications',

  // Hub (tabs)
  Home = '/(tabs)/home',
  Market = '/(tabs)/market',
  Payments = '/(tabs)/payments',
  DropPoints = '/(tabs)/droppoints',

  // Full-screen pushes (cover the tab bar)
  Profile = '/profile',
  Chat = '/chat',
  ChatSession = '/chat/[session]',
  PaymentChat = '/payment/[contact]',

  // Modals
  AddMoney = '/flows/add-money',
  Receive = '/flows/receive',
  Swap = '/flows/swap',
  Send = '/flows/send',
  AddRecipient = '/add-recipient',
  Transaction = '/transaction/[id]',
}

/** Which identity a successful onboarding restored (phrase = all chains). */
export type OnboardingVia = 'phrase' | 'xrpl';

/** Which onboarding path the passcode step continues into. */
export type OnboardingPath = 'create' | 'import';

/** Builders for routes that take params, returning an Expo Router `Href`. */
export const buildRoute = {
  paymentChat: (contact: string): Href => ({
    pathname: Routes.PaymentChat,
    params: { contact },
  }),
  transaction: (id: string): Href => ({
    pathname: Routes.Transaction,
    params: { id },
  }),
  chatSession: (session: string): Href => ({
    pathname: Routes.ChatSession,
    params: { session },
  }),
  /**
   * Open the Send flow, optionally pre-seeded with a recipient (from a payment
   * chat). With no recipient the screen falls back to a demo peer so the flow
   * stays walkable; `address` is what the broadcast actually pays.
   */
  send: (recipient?: { name?: string; handle?: string; address?: string }): Href => ({
    pathname: Routes.Send,
    params: { ...recipient },
  }),
  onboardingSuccess: (via: OnboardingVia): Href => ({
    pathname: Routes.OnboardingSuccess,
    params: { via },
  }),
  onboardingName: (next: OnboardingPath): Href => ({
    pathname: Routes.OnboardingName,
    params: { next },
  }),
  onboardingBackupInfo: (next: OnboardingPath): Href => ({
    pathname: Routes.OnboardingBackupInfo,
    params: { next },
  }),
  onboardingSetPasscode: (next: OnboardingPath): Href => ({
    pathname: Routes.OnboardingSetPasscode,
    params: { next },
  }),
  onboardingBiometrics: (next: OnboardingPath): Href => ({
    pathname: Routes.OnboardingBiometrics,
    params: { next },
  }),
} as const;
