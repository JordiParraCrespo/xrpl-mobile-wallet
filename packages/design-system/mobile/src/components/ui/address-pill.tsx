import { Check, Copy } from "lucide-react-native";
import * as React from "react";
import { Pressable, Text as RNText } from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";

// AddressPill — mono truncated address + copy affordance with inline
// "Copied" feedback. Use `onDark` on gradient / dark hero surfaces.
// Copying itself is delegated to `onCopy` (clipboard is app-land).
type AddressPillProps = Omit<
  React.ComponentProps<typeof Pressable>,
  "children" | "onPress"
> & {
  address: string;
  /** Truncate to `rPLkM9…ke` style (default true). */
  truncate?: boolean;
  /** Render white-on-dark (gradient hero, glass cards). */
  onDark?: boolean;
  onCopy?: (address: string) => void;
};

function AddressPill({
  address,
  truncate = true,
  onDark = false,
  onCopy,
  className,
  ...props
}: AddressPillProps) {
  const [copied, setCopied] = React.useState(false);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  const handlePress = () => {
    onCopy?.(address);
    setCopied(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setCopied(false), 1400);
  };

  const shown = truncate
    ? `${address.slice(0, 6)}…${address.slice(-5)}`
    : address;

  return (
    <Pressable
      className={cn(
        "flex-row items-center gap-2 self-start active:scale-[0.97]",
        className,
      )}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Copy address"
      {...props}
    >
      <RNText
        className={cn(
          "font-mono text-sm tracking-[-0.2px]",
          onDark ? "text-white" : "text-foreground",
        )}
        numberOfLines={1}
      >
        {shown}
      </RNText>
      <Icon
        as={copied ? Check : Copy}
        size={16}
        className={cn(
          copied
            ? "text-positive"
            : onDark
              ? "text-white/60"
              : "text-muted-foreground",
        )}
      />
      {copied ? (
        <RNText className="text-positive font-sans text-xs font-semibold">
          Copied
        </RNText>
      ) : null}
    </Pressable>
  );
}

export type { AddressPillProps };
export { AddressPill };
