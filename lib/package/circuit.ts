export const CIRCUIT_START_DAY_OPTIONS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

export type CircuitStartDayValue = (typeof CIRCUIT_START_DAY_OPTIONS)[number];

export function isCircuitStartDay(value: string): value is CircuitStartDayValue {
  return (CIRCUIT_START_DAY_OPTIONS as readonly string[]).includes(value);
}
