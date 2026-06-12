/**
 * Pure identity derivations for the local profile name. Shared between the
 * service (which persists the name) and the UI (which previews how the name
 * lands in the profile and in conversations with the agent), so both stay in
 * lockstep.
 */

/** Longest `@handle` slug derived from a name, excluding the leading `@`. */
const HANDLE_MAX_LENGTH = 18;

/** Derive a clean `@handle` from a display name (e.g. "Jordan Pierce" → "@jordanpierce"). */
export function deriveHandle(name: string): string {
  const base = (name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return base ? `@${base.slice(0, HANDLE_MAX_LENGTH)}` : '@yourname';
}

/** The first word of a name, used to greet the user; falls back to "there". */
export function deriveFirstName(name: string): string {
  const first = (name ?? '').trim().split(/\s+/)[0];
  return first || 'there';
}
