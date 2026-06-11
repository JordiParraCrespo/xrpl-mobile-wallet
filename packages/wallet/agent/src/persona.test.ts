import { describe, expect, it } from 'vitest';
import { buildSystemPrompt, DEFAULT_PERSONA, type Persona, personaFromMarkdown } from './persona';

const runtime = { address: 'rSENDER', network: 'XRPL Testnet', symbol: 'XRP' };

describe('buildSystemPrompt', () => {
  it('injects persona name, tone, runtime, and code-owned safety', () => {
    const prompt = buildSystemPrompt(DEFAULT_PERSONA, runtime);
    expect(prompt).toContain(`You are ${DEFAULT_PERSONA.name}`);
    expect(prompt).toContain(DEFAULT_PERSONA.tone);
    expect(prompt).toContain('rSENDER');
    expect(prompt).toContain('XRPL Testnet');
    // Code-owned safety is always present regardless of persona.
    expect(prompt).toContain('You cannot move funds on your own');
    expect(prompt).toContain('come ONLY');
  });

  it('renders custom boundaries and extra instructions', () => {
    const persona: Persona = {
      name: 'Ledger',
      tone: 'terse',
      boundaries: ['Refuse mainnet operations'],
      extraInstructions: 'Always greet in Catalan.',
    };
    const prompt = buildSystemPrompt(persona, runtime);
    expect(prompt).toContain('You are Ledger');
    expect(prompt).toContain('- Refuse mainnet operations');
    expect(prompt).toContain('Always greet in Catalan.');
  });
});

describe('personaFromMarkdown', () => {
  it('takes the first heading as the name and keeps the body as instructions', () => {
    const persona = personaFromMarkdown('# Sol\n\nWarm and concise. Loves the ledger.');
    expect(persona.name).toBe('Sol');
    expect(persona.extraInstructions).toContain('Warm and concise');
    // Falls back to the base persona's tone when the markdown does not set one.
    expect(persona.tone).toBe(DEFAULT_PERSONA.tone);
  });

  it('falls back to the base name when there is no heading', () => {
    const persona = personaFromMarkdown('just some prose');
    expect(persona.name).toBe(DEFAULT_PERSONA.name);
  });
});
