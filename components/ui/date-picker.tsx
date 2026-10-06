"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Select, selectTriggerClassName } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  id?: string;
  /** `YYYY-MM-DD`, ou `YYYY-MM-DDTHH:mm` com `withTime` — o mesmo formato do input nativo. */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  withTime?: boolean;
  placeholder?: string;
  invalid?: boolean;
  className?: string;
};

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const pad = (n: number) => String(n).padStart(2, "0");
const toIsoDate = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function parse(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(value);
  if (!match) return null;
  return {
    date: `${match[1]}-${match[2]}-${match[3]}`,
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
    time: match[4] ? `${match[4]}:${match[5]}` : null,
  };
}

/** 42 dias (6 semanas) começando no domingo antes do dia 1 — inclui as pontas dos meses vizinhos. */
function buildGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(year, month, 1 - first.getDay() + i);
    return {
      iso: toIsoDate(date.getFullYear(), date.getMonth(), date.getDate()),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    };
  });
}

/**
 * Calendário no tema do site, no lugar do `<input type="date|datetime-local">`
 * (o popup nativo sai com a cara do sistema e não dá pra estilizar).
 * Fecha em clique fora e Esc; setas andam entre os dias.
 */
export function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  withTime = false,
  placeholder = withTime ? "Selecionar data e hora" : "Selecionar data",
  invalid = false,
  className,
}: DatePickerProps) {
  const parsed = parse(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const now = new Date();
    return { year: parsed?.year ?? now.getFullYear(), month: parsed?.month ?? now.getMonth() };
  });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const now = new Date();
  const today = toIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
  const time = parsed?.time ?? "00:00";

  function close(focusTrigger = false) {
    setOpen(false);
    onBlur?.();
    if (focusTrigger) triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close só lê refs/props estáveis o bastante aqui
  }, [open]);

  // Ao abrir, foco no dia escolhido (ou hoje, ou o primeiro do mês).
  useEffect(() => {
    if (!open) return;
    const grid = gridRef.current;
    const target =
      grid?.querySelector<HTMLButtonElement>('[aria-pressed="true"]') ??
      grid?.querySelector<HTMLButtonElement>("[data-today]") ??
      grid?.querySelector<HTMLButtonElement>("[data-in-month]");
    target?.focus();
  }, [open]);

  function toggle() {
    if (!open && parsed) setView({ year: parsed.year, month: parsed.month });
    if (open) close();
    else setOpen(true);
  }

  function shiftMonth(delta: number) {
    setView(({ year, month }) => {
      const date = new Date(year, month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  function pickDay(iso: string) {
    if (withTime) {
      onChange(`${iso}T${time}`);
      return;
    }
    onChange(iso);
    close(true);
  }

  function setTime(part: "hour" | "minute", next: string) {
    const [hour, minute] = time.split(":");
    const date = parsed?.date ?? today;
    onChange(`${date}T${part === "hour" ? next : hour}:${part === "minute" ? next : minute}`);
  }

  function onGridKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const delta = moves[event.key];
    if (!delta) return;
    event.preventDefault();
    const buttons = Array.from(gridRef.current?.querySelectorAll("button") ?? []);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    buttons[index + delta]?.focus();
  }

  const display = parsed
    ? `${pad(parsed.day)}/${pad(parsed.month + 1)}/${parsed.year}${withTime && parsed.time ? ` às ${parsed.time}` : ""}`
    : null;

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          close(true);
        }
      }}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-invalid={invalid || undefined}
        onClick={toggle}
        className={cn(selectTriggerClassName, className)}
      >
        <span className={cn("truncate", !display && "text-muted-foreground")}>
          {display ?? placeholder}
        </span>
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={withTime ? "Escolher data e hora" : "Escolher data"}
          className="absolute left-0 top-[calc(100%+0.375rem)] z-30 w-[min(18.5rem,calc(100vw-2rem))] rounded-xl border border-border/70 bg-popover p-3 text-sm text-popover-foreground shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Mês anterior"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <p className="font-medium capitalize" aria-live="polite">
              {MONTHS[view.month]} de {view.year}
            </p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Próximo mês"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs text-muted-foreground" aria-hidden>
            {WEEKDAYS.map((weekday, index) => (
              <span key={index} className="py-1">
                {weekday}
              </span>
            ))}
          </div>

          <div ref={gridRef} className="grid grid-cols-7 gap-0.5" onKeyDown={onGridKeyDown}>
            {buildGrid(view.year, view.month).map((cell) => {
              const selected = cell.iso === parsed?.date;
              const isToday = cell.iso === today;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  aria-pressed={selected}
                  aria-label={cell.iso.split("-").reverse().join("/")}
                  data-today={isToday || undefined}
                  data-in-month={cell.inMonth || undefined}
                  onClick={() => pickDay(cell.iso)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-lg tabular-nums transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                    !cell.inMonth && "text-muted-foreground/60",
                    isToday && !selected && "font-semibold text-brand",
                    selected && "bg-brand font-medium text-brand-foreground hover:bg-brand/90",
                  )}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {withTime ? (
            <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3">
              <span className="text-xs font-medium text-muted-foreground">Hora</span>
              <div className="w-20">
                <Select
                  value={time.slice(0, 2)}
                  onChange={(next) => setTime("hour", next)}
                  options={HOURS.map((hour) => ({ value: hour, label: hour }))}
                  aria-label="Hora"
                  menuClassName="max-h-48"
                />
              </div>
              <span aria-hidden>:</span>
              <div className="w-20">
                <Select
                  value={time.slice(3, 5)}
                  onChange={(next) => setTime("minute", next)}
                  options={MINUTES.map((minute) => ({ value: minute, label: minute }))}
                  aria-label="Minuto"
                  menuClassName="max-h-48"
                />
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onChange("");
                close(true);
              }}
              className="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => pickDay(today)}
              className="rounded-lg px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10"
            >
              Hoje
            </button>
            {withTime ? (
              <button
                type="button"
                onClick={() => close(true)}
                className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-brand-foreground transition-colors hover:bg-brand/90"
              >
                Pronto
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
