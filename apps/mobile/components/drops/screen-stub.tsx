import { Button } from '@flama/design-system-mobile/button';
import { Text } from '@flama/design-system-mobile/text';
import { type Href, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type StubLink = {
  label: string;
  href: Href;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  /** Use router.replace instead of push (e.g. ending an onboarding flow). */
  replace?: boolean;
};

export type ScreenStubProps = {
  /** Display title in the Refero serif (sentence case, per the Drops voice). */
  title: string;
  /** Tiny uppercase eyebrow label above the title. */
  eyebrow?: string;
  /** One or two tight sentences describing what this screen does. */
  blurb?: string;
  /** Path to the source design doc, surfaced as a build TODO. */
  design?: string;
  /** Outgoing navigation, so the route graph is walkable end-to-end. */
  links?: StubLink[];
  /** Whether to render a Back button when there is history. Defaults to true. */
  showBack?: boolean;
};

/**
 * Placeholder for a Drops screen that is routed but not yet built.
 *
 * The Drops design (handoff bundle under `xrpl-wallet/project/`) is implemented
 * here as a routing skeleton first: every screen exists and is reachable, but
 * the real UI is still a TODO. Replace each stub with the actual screen,
 * composed from `@flama/design-system-mobile` primitives, when building it out.
 */
export function ScreenStub({
  title,
  eyebrow,
  blurb,
  design,
  links = [],
  showBack = true,
}: ScreenStubProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 gap-6"
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View className="gap-2">
        {eyebrow ? (
          <Text className="text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</Text>
        ) : null}
        <Text className="font-display text-4xl text-foreground">{title}</Text>
        {blurb ? <Text className="text-base text-muted-foreground">{blurb}</Text> : null}
      </View>

      {design ? (
        <View className="gap-2 rounded-2xl border border-border bg-card p-4">
          <Text className="text-xs uppercase tracking-widest text-muted-foreground">Todo</Text>
          <Text className="text-sm text-card-foreground">
            Build this screen from the bound Drops design system.
          </Text>
          <Text className="font-mono text-xs text-muted-foreground">{design}</Text>
        </View>
      ) : null}

      {links.length > 0 ? (
        <View className="gap-3">
          {links.map((link) => (
            <Button
              key={link.label}
              variant={link.variant ?? 'default'}
              onPress={() => (link.replace ? router.replace(link.href) : router.push(link.href))}
            >
              <Text>{link.label}</Text>
            </Button>
          ))}
        </View>
      ) : null}

      {showBack && router.canGoBack() ? (
        <Button variant="outline" onPress={() => router.back()}>
          <Text>Back</Text>
        </Button>
      ) : null}
    </ScrollView>
  );
}
