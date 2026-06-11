import { ScreenStub } from "../../../components/drops/screen-stub";
import { Routes } from "../../../lib/routes";

export default function HomeScreen() {
  return (
    <ScreenStub
      eyebrow="$942.76 · Wallet 1"
      title="Home"
      blurb="The hub: fiat-first balance hero, action circles, account tiles per chain, and recent activity. Search, notifications and More open as glass overlays."
      design="home.html · home/home-app.jsx (+ home-parts.jsx, home-parts2.jsx)"
      showBack={false}
      links={[
        { label: "Add money", href: Routes.AddMoney },
        { label: "Receive", href: Routes.Receive, variant: "secondary" },
        { label: "Swap", href: Routes.Swap, variant: "secondary" },
        { label: "Profile", href: Routes.Profile, variant: "outline" },
        { label: "Ask Dewy", href: Routes.Chat, variant: "outline" },
      ]}
    />
  );
}
