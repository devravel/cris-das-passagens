"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string; disabled?: boolean };

type SelectProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Texto do botão quando o valor atual não bate com nenhuma opção. */
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
  /** Borda vermelha quando o campo está com erro de validação. */
  invalid?: boolean;
  /** Classe do botão (e do <select> nativo antes de hidratar). */
  className?: string;
  /** Classe da lista aberta — pra ajustar largura/posição num caso específico. */
  menuClassName?: string;
};

export const selectTriggerClassName =
  "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 text-left text-sm text-foreground transition-colors outline-none hover:border-ring/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[invalid=true]:border-destructive";

/**
 * Nenhum navegador deixa estilizar o popup de um <select> nativo — a lista
 * aberta sai com a cara do sistema. Aqui a UI é botão + <ul role="listbox">;
 * um <select> escondido carrega `name`/`value` pro form. Antes de hidratar
 * renderiza o <select> nativo, então funciona sem JS.
 *
 * Teclado: setas trocam o valor com a lista fechada (igual ao nativo);
 * aberta, setas navegam, Enter/Espaço escolhe, Esc fecha.
 */
export function Select({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Selecione",
  disabled = false,
  "aria-label": ariaLabel,
  invalid = false,
  className,
  menuClassName,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const listId = useId();

  // false no servidor e na hidratação, true depois — sem setState em effect.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Opção ativa sempre visível dentro da lista rolável.
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  function pick(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    setOpen(false);
  }

  /** Próximo índice habilitado a partir de `from`, andando `step` (pula desabilitados). */
  function step(from: number, direction: 1 | -1) {
    let index = from;
    for (let i = 0; i < options.length; i += 1) {
      index = (index + direction + options.length) % options.length;
      if (!options[index]?.disabled) return index;
    }
    return from;
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (!open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        pick(step(selectedIndex, event.key === "ArrowDown" ? 1 : -1));
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActive(selectedIndex);
        setOpen(true);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        setActive((current) => step(current < 0 ? selectedIndex : current, event.key === "ArrowDown" ? 1 : -1));
        break;
      case "Home":
        event.preventDefault();
        setActive(step(-1, 1));
        break;
      case "End":
        event.preventDefault();
        setActive(step(0, -1));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        pick(active);
        break;
      case "Escape":
      case "Tab":
        setOpen(false);
        break;
    }
  }

  const nativeSelect = (visible: boolean) => (
    <select
      id={visible ? id : undefined}
      name={name}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      aria-label={visible ? ariaLabel : undefined}
      aria-hidden={visible ? undefined : true}
      tabIndex={visible ? undefined : -1}
      className={visible ? cn(selectTriggerClassName, className) : "sr-only"}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );

  if (!hydrated) {
    return nativeSelect(true);
  }

  return (
    <div ref={rootRef} className="relative">
      {nativeSelect(false)}

      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        data-invalid={invalid || undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        onClick={() => {
          setActive(selectedIndex);
          setOpen((state) => !state);
        }}
        onKeyDown={onKeyDown}
        className={cn(selectTriggerClassName, className)}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            "absolute left-0 top-[calc(100%+0.375rem)] z-30 max-h-64 w-max min-w-full max-w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-border/70 bg-popover p-1 text-sm text-popover-foreground shadow-lg",
            menuClassName,
          )}
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            const isActive = index === active;
            return (
              <li
                key={option.value || `empty-${index}`}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                onPointerMove={() => !option.disabled && setActive(index)}
                onClick={() => pick(index)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 transition-colors",
                  isActive && "bg-muted",
                  isSelected && "font-medium text-brand",
                  option.disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected ? <Check className="size-4 shrink-0" aria-hidden /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
