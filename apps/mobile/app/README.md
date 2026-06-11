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

Route paths are centralized in the **`Routes` enum** (`apps/mobile/lib/routes.ts`)
— navigate with `Routes.Home` etc. rather than raw strings. Parameterized routes
(`payment/[contact]`, `transaction/[id]`, `chat/[session]`, the onboarding
success `via`) have `buildRoute.*` helpers that return a typed `Href`.

## Route tree

```
app/                              ← the single root stack (the presentation layer)
  _layout.tsx                     declares (tabs) + every screen that covers it
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
  (tabs)/                         signed-in hub — owns the tab bar
    home.tsx                      balance hero · actions · accounts · activity
    market.tsx                    prices
    payments.tsx                  people & activity (the list only)
    droppoints.tsx                rewards teaser
    dewy.tsx                      tab → opens the full assistant
  ── cover the tab bar (declared at root, NOT inside a tab) ──
  profile.tsx                     account & settings          (push)
  chat/                           Dewy assistant              (push)
    index.tsx
    [session].tsx                 a past conversation
  payment/[contact].tsx           payment chat                (push)
  flows/                          money actions               (modal)
    add-money.tsx · receive.tsx · swap.tsx · send.tsx
  add-recipient.tsx               new recipient form          (modal)
  transaction/[id].tsx            transaction detail          (modal)
```

## Modal & navigation hierarchy

The whole design works off **one root stack** (`app/_layout.tsx`). The tab
navigator is just one screen inside it; everything that must appear over the tab
bar — full-screen pushes (profile, chat, a payment thread) and modals (money
flows, add-recipient, transaction detail) — is a **sibling of `(tabs)` at the
root**, never nested inside a tab.

This matters because **`presentation: 'modal'` only covers siblings in the same
navigator.** A modal declared inside the Payments tab's stack would render in
the tab's content area with the tab bar still showing — not full screen. Hoisting
those screens to the root stack is what lets them cover the tabs.

It still composes cleanly from inside a tab: Expo Router resolves an href against
the nearest navigator that owns it and walks up, so
`router.push('/flows/send')` from the Payments tab presents on the root
stack. Modals stack on top of pushes, and modal-over-modal works (open Send from
a payment chat), because they share the one root stack.

The Payments tab is therefore a single list file (`payments.tsx`); its
sub-screens live at the root (`payment/[contact]`, `add-recipient`,
`transaction/[id]`). Note the segment is **`payment`** (singular) for the thread
vs the **`payments`** tab — distinct paths, no collision between the two
navigators.

## Why it's shaped this way

- **Onboarding is its own stack**, gated by wallet state in `app/index`,
  matching the design's `onboarding → home` flow. It is pre-wallet, so it sits
  outside the tabs.
- **The hub is a tab group** (`(tabs)`) — Home · Market · Payments · DropPoints.
  Dewy appears in the tab bar but opens the full-screen assistant rather than a
  page (a `tabPress` listener in the tabs layout).
- **Money flows are modals**, so they layer above the hub and dismiss back to
  it — the design's "temporary layer" language. They are reachable from
  multiple entry points (Home actions, a payment chat's Send), so they are
  shared root routes rather than nested under any one screen.
- **Per-entity screens use dynamic segments** (`payment/[contact]`,
  `transaction/[id]`, `chat/[session]`) so the structure scales to real
  contacts, transactions and conversations.

## Not yet wired

- The floating frosted-glass tab bar with the Dewy mascot (`HBottomNav`) — the
  current tab bar is the default Expo Router one, themed with the brand accent.
- Glass overlays on Home (search, notifications, More) — these are in-screen
  layers, not routes, so they belong inside `home.tsx` when it's built.
- The component gallery (`components.html`) is a design reference doc, not an
  app screen, so it has no route here.
- Per-screen theme tweaks (accent Indigo/Ocean/Emerald, Home/Chat backgrounds).
