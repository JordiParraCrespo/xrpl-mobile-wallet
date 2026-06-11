# OpenClaw Architecture Review — Handoff for the XRP Wallet Chat Agent

> Source: review of the [openclaw/openclaw](https://github.com/openclaw/openclaw) repository
> (local checkout: `~/Documents/ai/openclaw`). All file paths below are relative to that repo's root.
> Date: 2026-06-11.

Goal: identify what can be extracted (code or design) from OpenClaw for building a
chat-driven agent that manages an XRP wallet (user chats via Telegram/WhatsApp/web,
agent executes XRP Ledger operations with human confirmation).

---

## TL;DR

OpenClaw is a much bigger system than a wallet agent needs (multi-channel,
multi-agent, plugin marketplace), but four of its subsystems map almost one-to-one
onto a wallet agent:

1. **Two-phase approval flow** — perfect template for transaction confirmation.
2. **Tool definition + policy system** — schemas, allowlists, approval classification.
3. **Session/routing model** — one conversation = one session key = one wallet binding.
4. **SecretRef config pattern** — for API keys and (critically) seeds/keys.

Plus a fifth, from the persona layer: **file-based personality** (`SOUL.md` /
`IDENTITY.md` / `USER.md`) with code-owned prompt assembly.

The gateway, plugin loader, and channel multiplexing are best treated as **design
reference**, not code to lift.

---

## 1. How OpenClaw is structured (four layers)

1. **Channels** (`src/telegram`, `src/whatsapp` web, `src/channels/*`) receive
   messages and normalize them into inbound envelopes. Each channel implements a
   `ChannelPlugin` contract (`src/channels/plugins/types.plugin.ts`) with adapters
   for config, messaging (poll/send), pairing, allowlists, and security.
2. **Routing** (`src/routing/resolve-route.ts`) maps an inbound message
   (channel + account + peer) to an agent and a session key like
   `pi:telegram:0@<peerId>`. Pure, config-driven logic — no side effects.
3. **Agent loop** (`src/agents/pi-embedded-runner/run.ts`) embeds the Pi SDK's
   agent session (`@mariozechner/pi-coding-agent`): assembles the system prompt,
   injects tools, runs the LLM tool-call loop, persists transcripts as JSONL under
   `~/.openclaw/sessions/`. Tools are TypeBox-schema'd functions registered in
   `src/agents/pi-tools.ts`, gated by policy (`src/agents/tool-policy.ts`).
4. **Gateway** (`src/gateway`) is a long-lived WebSocket control plane
   (default `127.0.0.1:18789`). Clients (CLI, web UI, mobile apps) connect with
   device tokens and scoped permissions (`operator.read/write/admin`); approvals
   and events flow over a versioned typed protocol
   (`src/gateway/protocol/schema.ts`, TypeBox + JSON Schema codegen).

---

## 2. What to extract (highest value first)

### 2.1 Two-phase approval flow → transaction confirmation

A wallet agent must never sign on the model's say-so alone. OpenClaw solved exactly
this shape for shell commands:

- **Request phase** (`src/agents/bash-tools.exec-approval-request.ts`): the tool
  requests approval and returns `approval-pending` to the agent instead of executing.
  Server-side, an approval ID is registered with a timeout; response is
  `{ id, expiresAtMs }` — no decision yet.
- **Decision phase** (`src/gateway/exec-approval-manager.ts`): a client resolves
  `exec.approval.resolve(id, decision)` over WS; the manager matches the ID, stores
  the decision (`"approved" | "rejected"`), and the waiting tool resumes or fails.
  Default timeout: 30s (configurable).
- **Classification** (`src/acp/approval-classifier.ts`): decides which tool calls
  need approval at all. For the wallet: `get_balance` auto-approved,
  `sign_and_submit` always gated.
- Approval display context lives in `src/infra/system-run-approval-binding.ts`;
  approvals can be forwarded to external systems
  (`src/infra/exec-approval-forwarder.ts`).

**Adaptations needed for a wallet:**

- The manager is **in-memory**; persist approval records (DB) so a pending tx
  approval survives a restart.
- Attach **structured tx context** (destination, amount in drops, fee, memo,
  resulting balance) so the user confirms what's actually being signed, not a
  summary the model wrote.

### 2.2 Tool schema conventions

From `src/agents/pi-tools.schema.ts` and the repo's guardrails — these exist because
real LLM providers choke on fancier schemas. Adopt wholesale for the XRPL tools
(`send_xrp`, `get_balance`, `set_trustline`, `lookup_transaction`, ...):

- Top-level tool schema: `type: "object"` with `properties` (never a union/ref).
- String enums via `Type.Unsafe` enum, **not** `Type.Union`.
- No `anyOf` / `oneOf` / `allOf`.
- `Type.Optional(...)` instead of `... | null`.
- Avoid raw `format` property names (some validators treat it as reserved).

Tool policy layering: `src/agents/tool-policy.ts` (allowlist/denylist per
agent/channel), `src/agents/pi-tools.policy.ts` (owner-only, subagent depth
restrictions). Pure data + functions, no gateway coupling — highly reusable.

### 2.3 Session model

- JSONL transcripts (`~/.openclaw/sessions/<sessionId>.jsonl`) + a `store.json`
  registry: `Record<sessionKey, SessionEntry>` (`src/config/sessions/types.ts`,
  `src/config/sessions/store.ts`, `src/config/sessions/transcript.ts`).
- Session key format: `agent:channel:account@peer`
  (e.g. `pi:whatsapp:0@+1234567890`); main/DM session collapses the peer.
- File-based, no DB, portable. For a wallet agent where each user maps to one
  wallet and one conversation, the session key effectively becomes the wallet
  binding.

### 2.4 SecretRef config

`src/config/types.secrets.ts` + `src/config/zod-schema.secret-input-validation.ts`:

```ts
type SecretRef = {
  source: "env" | "file" | "exec";
  provider: string; // "default", "vault", ...
  id: string;       // "OPENAI_API_KEY", "/providers/openai/key", ...
}
type SecretInput = string | SecretRef;
```

For a project holding XRP seeds this discipline matters even more than in OpenClaw:
never let a seed live in plain config; `source: "exec"` gives a path to an HSM or OS
keychain later. Config is zod-validated end to end.

### 2.5 Pairing + allowlists → chat identity ↔ wallet authorization

- Challenge-code pairing flow: `src/plugin-sdk/channel-pairing.ts`,
  `src/channels/plugins/pairing-adapters.ts`. Pattern: user messages the bot →
  pairing challenge issued out-of-band → approved → persisted to
  `channels.<id>.accounts.<accountId>.allowFrom`.
- Allowlist merge/resolution: `src/channels/allowlists/resolve-utils.ts`.
- This is the critical identity step for the wallet: "this Telegram user ID is
  allowed to operate this wallet."

---

## 3. Personality / persona layer

OpenClaw treats personality as a first-class, separately-engineered layer.

### 3.1 Personality lives in markdown files, not code

Each agent has a workspace (`~/.openclaw/workspace`) seeded with bootstrap files,
each with a single job:

| File | Job |
|---|---|
| `SOUL.md` | Persona, tone, boundaries |
| `IDENTITY.md` | Agent's name, vibe, emoji |
| `USER.md` | Who the user is, how to address them |
| `AGENTS.md` | Operating instructions, priorities, memory usage |
| `TOOLS.md` | Conventions/guidance (does NOT control tool availability) |
| `MEMORY.md` | Curated long-term memory (private session only) |
| `memory/YYYY-MM-DD.md` | Daily logs, fetched on demand via tools (not injected) |
| `BOOTSTRAP.md` | One-time first-run ritual, deleted after completion |

### 3.2 System prompt assembly (`src/agents/system-prompt.ts`)

- Code-owned fixed sections (tooling list, safety reminder, workspace, runtime,
  timezone) + bootstrap files injected verbatim under "Project Context".
- Injection budgets: 20k chars per file, 150k total, truncation markers
  (`agents.defaults.bootstrapMaxChars` / `bootstrapTotalMaxChars`).
- Prompt modes: `full` / `minimal` (subagents — drops persona/memory sections) /
  `none`.
- **Cache stability**: the time section includes only the timezone, never a live
  clock; the model calls a `session_status` tool when it needs the current time.

### 3.3 Identity drives behavior beyond the prompt

`src/agents/identity-file.ts` parses `IDENTITY.md` into structured fields (name,
emoji, avatar); `src/agents/identity.ts` uses them for message prefixes in group
chats, ack reactions, and a configurable "human delay" before replies.

### 3.4 First-run ritual

A brand-new workspace gets `BOOTSTRAP.md`: the agent names itself and writes its own
`IDENTITY.md` in conversation with the user, then the file is deleted. Persona is
co-created with the user.

### 3.5 The key design rule (carve in stone for a wallet)

**Persona and prompt-level safety are advisory; hard enforcement lives in tool
policy, approvals, and allowlists.** OpenClaw's docs state this explicitly. For the
wallet: "never send funds without confirmation" must be enforced by the approval
manager in code and merely *echoed* in the persona. A jailbroken persona must still
be physically unable to sign without the human's tap.

### 3.6 What to take for the XRP agent's persona

1. Ship `SOUL.md` (tone: precise, calm, states amounts/fees plainly, no price
   predictions or financial advice), `USER.md`, `IDENTITY.md`. Iterate on
   personality by editing markdown — no redeploy.
2. Code-owned structural prompt + injected persona files, with size budgets.
3. Keep volatile data (XRP balance, ledger index) OUT of the prompt — expose via
   tools to preserve prompt caching.
4. Memory split: curated `MEMORY.md` always injected (private sessions only);
   daily logs behind a search tool.
5. Use the bootstrap ritual as wallet onboarding: agent introduces itself +
   pairing flow + wallet setup in one guided conversation.

---

## 4. What to leave behind (design reference only)

- **Gateway** — a versioned WS control plane with device pairing and role scopes is
  overkill for one agent on one or two channels. Study `docs/gateway/protocol.md`
  if a remote approval UI is wanted later; don't extract.
- **Plugin system** (`src/plugins/*`) — manifest discovery (`openclaw.plugin.json`),
  jiti loading, registries. The wallet has one "plugin" (XRPL); hardcode it.
- **Channel multiplexing** — the `ChannelPlugin` adapter contract is elegant but
  designed for 9+ channels. For one channel, a thin inbound/outbound module is
  simpler; keep the contract as a reference for separation of concerns
  (receive, send, pairing, allowlist, threading).
- **Pi SDK coupling** — OpenClaw's agent loop is built directly on
  `@mariozechner/pi-coding-agent` with no abstraction layer. Unless that exact
  dependency is wanted, build the loop on the Anthropic SDK's tool-use loop and
  copy OpenClaw's *patterns* (system prompt assembly, policy wrapping around
  tools) rather than its code.
- **ACP subagent spawning** (`src/acp/*` beyond the approval classifier) — only
  needed for orchestration/subagents.

---

## 5. Wallet-specific safety notes (from OpenClaw's hard rules)

- **Never stream partial replies to external messaging surfaces** — only final
  replies go to Telegram/WhatsApp. For a wallet this is doubly important: a
  half-streamed "sending 500 XRP to r..." before the approval gate resolves is a
  trust disaster. Buffer, gate, then send.
- Prompt-level guardrails are advisory; enforcement is code (approvals, tool
  policy, allowlists).
- Persist approval records; attach structured tx data to every approval request.

---

## 6. Suggested build order

1. **Tool layer**: XRPL tools (`xrpl.js`) with OpenClaw-style TypeBox schemas +
   approval classifier (read-only vs mutating vs signing).
2. **Approval manager**: two-phase, persistent, structured tx context, timeout.
3. **Agent loop**: Anthropic SDK tool-use loop; code-owned prompt sections +
   injected persona files with budgets; JSONL session transcripts.
4. **One channel adapter** (Telegram first): inbound normalize → route to session →
   run agent → final-reply-only send.
5. **Pairing + allowlist**: challenge code binds chat identity to wallet
   authorization.
6. **Persona files + bootstrap onboarding ritual.**

Wallet-specific code (tx building, signing, broadcast) stays cleanly in the tool
layer — which is exactly where OpenClaw's architecture would put it too.

---

## 7. Key OpenClaw files to study (in order)

1. `docs/concepts/agent-loop.md` — the inference loop
2. `src/agents/pi-embedded-runner/run.ts` — agent run entry point
3. `src/acp/approval-classifier.ts` + `src/gateway/exec-approval-manager.ts` +
   `src/agents/bash-tools.exec-approval-request.ts` — approval pattern
4. `src/config/sessions/types.ts` + `src/config/sessions/transcript.ts` — session format
5. `src/agents/pi-tools.schema.ts` + `src/agents/tool-policy.ts` — tool schemas + policy
6. `src/agents/system-prompt.ts` + `src/agents/identity-file.ts` +
   `src/agents/workspace-templates.ts` — persona/prompt assembly
7. `src/routing/resolve-route.ts` — message → session routing
8. `src/plugin-sdk/channel-pairing.ts` + `src/channels/allowlists/resolve-utils.ts` — pairing/allowlists
9. `src/config/types.secrets.ts` — SecretRef
10. `docs/concepts/system-prompt.md` + `docs/concepts/agent-workspace.md` — persona docs
