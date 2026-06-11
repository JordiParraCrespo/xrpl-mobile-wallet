import * as React from "react";
import { TextInput, View } from "react-native";
import { cn } from "../../lib/utils";
import { Text, TextClassContext } from "./text";

// InputField — the composite Drops text field: optional label,
// leading/trailing adornments, hint and error. 12px radius, hairline
// border, ring-coloured focus border. Calm and flat — no shadows.
type InputFieldProps = React.ComponentProps<typeof TextInput> & {
  label?: string;
  /** Helper line under the field; replaced by `error` when present. */
  hint?: string;
  /** Error message — paints the border and replaces the hint. */
  error?: string;
  /** Leading adornment, e.g. <Icon as={Search} size={18} />. */
  leading?: React.ReactNode;
  /** Trailing adornment, e.g. a clear or paste affordance. */
  trailing?: React.ReactNode;
  /** Tinted look — soft fill, no border. */
  filled?: boolean;
  /** Class overrides for the outer wrapper / inner box. */
  containerClassName?: string;
  boxClassName?: string;
};

function InputField({
  label,
  hint,
  error,
  leading,
  trailing,
  filled = false,
  className,
  containerClassName,
  boxClassName,
  onFocus,
  onBlur,
  ...props
}: InputFieldProps) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View className={cn("w-full gap-[7px]", containerClassName)}>
      {label ? (
        <Text className="text-muted-foreground text-[13px] font-semibold">
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          "border-border bg-card min-h-[52px] flex-row items-center gap-2.5 rounded-md border px-3.5",
          filled && "bg-muted border-transparent",
          focused && "border-ring",
          error && "border-destructive",
          props.editable === false && "opacity-50",
          boxClassName,
        )}
      >
        {leading ? (
          <TextClassContext.Provider value="text-muted-foreground">
            <View className="shrink-0">{leading}</View>
          </TextClassContext.Provider>
        ) : null}
        <TextInput
          className={cn(
            "text-foreground min-w-0 flex-1 py-3.5 text-base leading-5",
            "placeholder:text-muted-foreground/50",
            className,
          )}
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
        {trailing ? (
          <TextClassContext.Provider value="text-muted-foreground">
            <View className="shrink-0">{trailing}</View>
          </TextClassContext.Provider>
        ) : null}
      </View>
      {error ? (
        <Text className="text-destructive text-xs">{error}</Text>
      ) : hint ? (
        <Text className="text-muted-foreground text-xs">{hint}</Text>
      ) : null}
    </View>
  );
}

export type { InputFieldProps };
export { InputField };
