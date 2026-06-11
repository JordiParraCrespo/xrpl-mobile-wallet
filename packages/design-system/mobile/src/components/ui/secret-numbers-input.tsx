import { Check, X } from "lucide-react-native";
import * as React from "react";
import {
  type NativeSyntheticEvent,
  TextInput,
  type TextInputKeyPressEventData,
  View,
} from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";

// SecretNumbersInput — the Xaman-style secret-numbers grid: lettered rows
// (A, B, C, …) of digit cells that auto-advance as you type, with per-row
// validity tinting (green when `validateRow` passes, red when it fails)
// and a trailing check / cross. Pasting a long digit run into any cell
// distributes it across the remaining rows.
type SecretNumbersInputProps = {
  /** One string of typed digits per row (each up to `rowLength` long). */
  rows: string[];
  onChangeRows: (rows: string[]) => void;
  /** Per-row validity: true tints green, false red, null neutral. */
  validateRow?: (row: string, index: number) => boolean | null;
  /** Digits per row. */
  rowLength?: number;
  className?: string;
};

function SecretNumbersInput({
  rows,
  onChangeRows,
  validateRow,
  rowLength = 6,
  className,
}: SecretNumbersInputProps) {
  const cellRefs = React.useRef<Record<string, TextInput | null>>({});

  const focusCell = (row: number, cell: number) => {
    if (cell >= rowLength) {
      cellRefs.current[`${row + 1}-0`]?.focus();
      return;
    }
    if (cell < 0) {
      cellRefs.current[`${row - 1}-${rowLength - 1}`]?.focus();
      return;
    }
    cellRefs.current[`${row}-${cell}`]?.focus();
  };

  /** Distributes a digit run starting at `row`, overwriting forward. */
  const bulkFill = (row: number, digits: string) => {
    const next = rows.slice();
    let cursor = 0;
    for (let r = row; r < next.length && cursor < digits.length; r++) {
      next[r] = digits.slice(cursor, cursor + rowLength);
      cursor += rowLength;
    }
    onChangeRows(next);
  };

  const setDigit = (row: number, cell: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const current = rows[row] ?? "";
    if (digits.length > 1) {
      const run = current.slice(0, cell) + digits;
      if (run.length > rowLength) {
        bulkFill(row, run);
        return;
      }
      const next = rows.slice();
      next[row] = run.slice(0, rowLength);
      onChangeRows(next);
      focusCell(row, Math.min(cell + digits.length, rowLength - 1));
      return;
    }
    const cells = current.padEnd(rowLength, " ").split("");
    cells[cell] = digits;
    const next = rows.slice();
    next[row] = cells.join("").trimEnd().slice(0, rowLength);
    onChangeRows(next);
    if (digits) focusCell(row, cell + 1);
  };

  const onKeyPress = (
    row: number,
    cell: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    const filled = (rows[row] ?? "")[cell]?.trim();
    if (e.nativeEvent.key === "Backspace" && !filled) {
      focusCell(row, cell - 1);
    }
  };

  return (
    <View className={cn("gap-2", className)}>
      {rows.map((value, row) => {
        const state = validateRow?.(value, row) ?? null;
        const letter = String.fromCharCode(65 + row);
        const cells = value
          .padEnd(rowLength, " ")
          .slice(0, rowLength)
          .split("");
        return (
          <View
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional by design
            key={row}
            className="flex-row items-center gap-2"
          >
            <Text
              className={cn(
                "w-4 shrink-0 font-mono text-[13px] font-semibold",
                state === true ? "text-positive" : "text-muted-foreground",
              )}
            >
              {letter}
            </Text>
            <View className="min-w-0 flex-1 flex-row gap-1.5">
              {cells.map((digit, cell) => (
                <TextInput
                  // biome-ignore lint/suspicious/noArrayIndexKey: cells are positional by design
                  key={cell}
                  ref={(el) => {
                    cellRefs.current[`${row}-${cell}`] = el;
                  }}
                  value={digit.trim()}
                  onChangeText={(raw) => setDigit(row, cell, raw)}
                  onKeyPress={(e) => onKeyPress(row, cell, e)}
                  inputMode="numeric"
                  className={cn(
                    "h-11 min-w-0 flex-1 rounded-[10px] border p-0 text-center font-mono text-[17px] font-semibold text-foreground",
                    state === true && "border-positive bg-positive-soft",
                    state === false && "border-destructive bg-destructive-soft",
                    state === null && "border-border bg-card",
                  )}
                />
              ))}
            </View>
            <View className="w-4 shrink-0 items-center">
              {state !== null ? (
                <Icon
                  as={state ? Check : X}
                  size={16}
                  strokeWidth={2.5}
                  className={state ? "text-positive" : "text-destructive"}
                />
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export type { SecretNumbersInputProps };
export { SecretNumbersInput };
