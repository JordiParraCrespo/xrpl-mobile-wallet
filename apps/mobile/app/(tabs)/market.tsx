import { ScreenStub } from '../../components/drops/screen-stub';
import { Routes } from '../../lib/routes';

export default function MarketScreen() {
  return (
    <ScreenStub
      eyebrow="Market"
      title="Prices"
      blurb="An XRP hero card with sparkline, a top gainers/losers toggle, the full asset list, and an Earn teaser."
      design="market.html · market/market-app.jsx"
      showBack={false}
      links={[{ label: 'Profile', href: Routes.Profile, variant: 'outline' }]}
    />
  );
}
