import { ScreenStub } from "../../../components/drops/screen-stub";

export default function ImportPickerScreen() {
  return (
    <ScreenStub
      eyebrow="Import"
      title="How do you want to restore?"
      blurb="Recovery phrase restores every XRPL chain. A family seed or secret numbers restore the XRP Ledger only."
      design="onboarding/screens-input.jsx (Import method picker)"
      links={[
        { label: "Recovery phrase", href: "/(drops)/onboarding/import-phrase" },
        {
          label: "Family seed",
          href: "/(drops)/onboarding/import-seed",
          variant: "secondary",
        },
        {
          label: "Secret numbers",
          href: "/(drops)/onboarding/import-secret-numbers",
          variant: "secondary",
        },
      ]}
    />
  );
}
