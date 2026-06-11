import * as SwitchPrimitives from "@rn-primitives/switch";
import { Platform } from "react-native";
import { cn } from "../../lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitives.Root>) {
  return (
    <SwitchPrimitives.Root
      className={cn(
        // Drops switch: 50×30 pill, brand fill when on, calm slide.
        "flex h-[30px] w-[50px] shrink-0 flex-row items-center rounded-full border border-transparent shadow-none",
        Platform.select({
          web: "focus-visible:border-ring focus-visible:ring-ring/50 peer inline-flex outline-none transition-all focus-visible:ring-[3px] disabled:cursor-not-allowed",
        }),
        props.checked ? "bg-brand" : "bg-foreground/25",
        props.disabled && "opacity-45",
        className,
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "size-6 rounded-full bg-white transition-transform",
          Platform.select({
            web: "pointer-events-none block ring-0",
          }),
          props.checked ? "translate-x-[23px]" : "translate-x-[3px]",
        )}
      />
    </SwitchPrimitives.Root>
  );
}

export { Switch };
