"use client";

import { useState, type ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { formatMoneyInput, parseMoneyInput } from "@/lib/money";

type MoneyInputProps = Omit<ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: number | null | undefined;
  onValueChange: (value: number | null) => void;
};

/**
 * Campo de valor em reais que aceita colar "R$ 4.390,00". Enquanto digita,
 * mostra o texto como está; fora de foco, o valor formatado.
 */
export function MoneyInput({ value, onValueChange, onFocus, onBlur, ...props }: MoneyInputProps) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={draft ?? formatMoneyInput(value)}
      onFocus={(event) => {
        setDraft(formatMoneyInput(value));
        onFocus?.(event);
      }}
      onChange={(event) => {
        setDraft(event.target.value);
        onValueChange(parseMoneyInput(event.target.value));
      }}
      onBlur={(event) => {
        setDraft(null);
        onBlur?.(event);
      }}
    />
  );
}
