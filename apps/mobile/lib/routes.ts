import type { Href } from "expo-router";

/**
 * Every Drops route path, in one place. Use these instead of hand-written
 * strings so the route graph is refactor-safe and discoverable.
 *
 * Values mirror the file tree under `app/(drops)/`. Dynamic routes keep their
 * `[param]` template here; use the `buildRoute` helpers below to fill them in.
 */
export enum Routes {
  // Shell
  Root = "/(drops)",

  // Onboarding (pre-wallet flow)
  Onboarding = "/(drops)/onboarding",
  OnboardingSecureIntro = "/(drops)/onboarding/secure-intro",
  OnboardingRevealPhrase = "/(drops)/onboarding/reveal-phrase",
  OnboardingBackupQuiz = "/(drops)/onboarding/backup-quiz",
  OnboardingImport = "/(drops)/onboarding/import",
  OnboardingImportPhrase = "/(drops)/onboarding/import-phrase",
  OnboardingImportSeed = "/(drops)/onboarding/import-seed",
  OnboardingImportSecretNumbers = "/(drops)/onboarding/import-secret-numbers",
  OnboardingSuccess = "/(drops)/onboarding/success",

  // Hub (tabs)
  Home = "/(drops)/(tabs)/home",
  Market = "/(drops)/(tabs)/market",
  Payments = "/(drops)/(tabs)/payments",
  DropPoints = "/(drops)/(tabs)/droppoints",

  // Full-screen pushes (cover the tab bar)
  Profile = "/(drops)/profile",
  Chat = "/(drops)/chat",
  ChatSession = "/(drops)/chat/[session]",
  PaymentChat = "/(drops)/payment/[contact]",

  // Modals
  AddMoney = "/(drops)/flows/add-money",
  Receive = "/(drops)/flows/receive",
  Swap = "/(drops)/flows/swap",
  Send = "/(drops)/flows/send",
  AddRecipient = "/(drops)/add-recipient",
  Transaction = "/(drops)/transaction/[id]",
}

/** Which identity a successful onboarding restored (phrase = all chains). */
export type OnboardingVia = "phrase" | "xrpl";

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
  onboardingSuccess: (via: OnboardingVia): Href => ({
    pathname: Routes.OnboardingSuccess,
    params: { via },
  }),
} as const;
