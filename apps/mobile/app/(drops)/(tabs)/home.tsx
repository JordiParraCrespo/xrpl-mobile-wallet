import { ScreenStub } from "../../../components/drops/screen-stub";

export default function HomeScreen() {
  return (
    <ScreenStub
      eyebrow="$942.76 · Wallet 1"
      title="Home"
      blurb="The hub: fiat-first balance hero, action circles, account tiles per chain, and recent activity. Search, notifications and More open as glass overlays."
      design="home.html · home/home-app.jsx (+ home-parts.jsx, home-parts2.jsx)"
      showBack={false}
      links={[
        { label: "Add money", href: "/(drops)/flows/add-money" },
        {
          label: "Receive",
          href: "/(drops)/flows/receive",
          variant: "secondary",
        },
        { label: "Swap", href: "/(drops)/flows/swap", variant: "secondary" },
        { label: "Profile", href: "/(drops)/profile", variant: "outline" },
        { label: "Ask Dewy", href: "/(drops)/chat", variant: "outline" },
      ]}
    />
  );
}
