# Drops — mobile routing

This is the **routing skeleton** for the Drops XRPL wallet design (the handoff
bundle under `xrpl-wallet/project/`, indexed by its `SCREENS.md`). Every screen
in the design has a route and is reachable end-to-end; the screens themselves
are still stubs (`components/drops/screen-stub.tsx`) that name the source design
file as a build TODO. Fill them in one at a time, composing the real UI from
`@flama/design-system-mobile` primitives (`AmountText`, `ActionButton`,
`AssetIcon`, `ListRow`, `Card`, `Button`, …) and the wallet hooks in
`@flama/frontend/react` (`useWalletState`, `useChainBalance`,
`useSendTransaction`, `useImportWallet`).

It lives in its own route group, separate from the placeholder `(app)` demo
screens. Entry point: the "Open Drops wallet (design)" button on `(app)/index`.

## Route tree

```
(drops)/
  index.tsx                       redirect: no wallet → onboarding, else → home
  onboarding/                     pre-wallet flow (9 screens, two paths)
    index.tsx                     Welcome
    secure-intro.tsx              ┐ create path
    reveal-phrase.tsx             │
    backup-quiz.tsx               ┘
    import.tsx                    ┐ import path (method picker)
    import-phrase.tsx             │
    import-seed.tsx               │
    import-secret-numbers.tsx     ┘
    success.tsx                   shared success → home
  (tabs)/                         signed-in hub (bottom tab bar)
    home.tsx                      balance hero · actions · accounts · activity
    market.tsx                    prices
    payments/                     people & activity (nested stack)
      index.tsx                   list
      add-recipient.tsx
      [contact].tsx               payment chat
      transaction/[id].tsx        transaction detail (modal)
    droppoints.tsx                rewards teaser
    dewy.tsx                      tab → opens the full assistant
  flows/                          money actions (presented as modals)
    add-money.tsx
    receive.tsx
    swap.tsx
    send.tsx
  profile.tsx                     account & settings
  chat/                           Dewy assistant
    index.tsx
    [session].tsx                 a past conversation
```

## Why it's shaped this way

- **Onboarding is its own stack**, gated by wallet state in `(drops)/index`,
  matching the design's `onboarding → home` flow. It is pre-wallet, so it sits
  outside the tabs.
- **The hub is a tab group** (`(tabs)`) — Home · Market · Payments · DropPoints.
  Dewy appears in the tab bar but opens the full-screen assistant rather than a
  page (a `tabPress` listener in the tabs layout).
- **Money flows are modals**, so they layer above the hub and dismiss back to
  it — the design's "temporary layer" language. They are reachable from
  multiple entry points (Home actions, a payment chat's Send), so they are
  shared routes rather than nested under any one screen.
- **Per-entity screens use dynamic segments** (`payments/[contact]`,
  `payments/transaction/[id]`, `chat/[session]`) so the structure scales to real
  contacts, transactions and conversations.

## Not yet wired

- The floating frosted-glass tab bar with the Dewy mascot (`HBottomNav`) — the
  current tab bar is the default Expo Router one, themed with the brand accent.
- Glass overlays on Home (search, notifications, More) — these are in-screen
  layers, not routes, so they belong inside `home.tsx` when it's built.
- The component gallery (`components.html`) is a design reference doc, not an
  app screen, so it has no route here.
- Per-screen theme tweaks (accent Indigo/Ocean/Emerald, Home/Chat backgrounds).
