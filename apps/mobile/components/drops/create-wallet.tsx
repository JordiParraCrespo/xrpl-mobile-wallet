import { useFlamaApp } from "@flama/frontend/react";
import * as React from "react";

export type WordCount = 12 | 24;

type CreateWalletValue = {
  /** The generated recovery phrase (in-memory only until committed), or null. */
  words: string[] | null;
  wordCount: WordCount;
  /** Generate — or regenerate — a fresh phrase of the given length. */
  generate: (wordCount?: WordCount) => void;
  /** Drop the draft after committing (or abandoning) the flow. */
  reset: () => void;
};

const CreateWalletContext = React.createContext<CreateWalletValue | null>(null);

/**
 * Holds the create-a-new-wallet draft across the onboarding screens
 * (reveal → backup quiz). The phrase lives in memory only; it is persisted to
 * secure storage by the keyring once `importMnemonic` commits it, after which
 * `reset()` clears it here.
 */
export function CreateWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const app = useFlamaApp();
  const [wordCount, setWordCount] = React.useState<WordCount>(12);
  const [words, setWords] = React.useState<string[] | null>(null);

  const generate = React.useCallback(
    (count: WordCount = wordCount) => {
      setWords(app.wallet.generateMnemonic(count).split(" "));
      setWordCount(count);
    },
    [app, wordCount],
  );

  const reset = React.useCallback(() => setWords(null), []);

  const value = React.useMemo<CreateWalletValue>(
    () => ({ words, wordCount, generate, reset }),
    [words, wordCount, generate, reset],
  );

  return (
    <CreateWalletContext.Provider value={value}>
      {children}
    </CreateWalletContext.Provider>
  );
}

export function useCreateWallet(): CreateWalletValue {
  const ctx = React.useContext(CreateWalletContext);
  if (!ctx) {
    throw new Error(
      "useCreateWallet must be used within a CreateWalletProvider",
    );
  }
  return ctx;
}
