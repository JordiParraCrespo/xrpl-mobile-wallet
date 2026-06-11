import * as React from "react";
import { Platform, TextInput } from "react-native";
import { cn } from "../../lib/utils";

function Textarea({
  className,
  multiline = true,
  numberOfLines = Platform.select({ web: 2, native: 8 }), // On web, numberOfLines also determines initial height. On native, it determines the maximum height.
  placeholderClassName,
  onFocus,
  onBlur,
  ...props
}: React.ComponentProps<typeof TextInput>) {
  const [focused, setFocused] = React.useState(false);
  return (
    <TextInput
      className={cn(
        "text-foreground border-border dark:bg-input/30 bg-card flex min-h-16 w-full flex-row rounded-md border px-3.5 py-3 text-base shadow-none md:text-sm",
        focused && "border-ring",
        Platform.select({
          web: "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive field-sizing-content resize-y outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed",
        }),
        props.editable === false && "opacity-50",
        className,
      )}
      placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}

export { Textarea };
