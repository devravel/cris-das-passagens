// node lib/money.test.mjs
import assert from "node:assert/strict";

import { formatBRL, formatMoneyInput, parseMoneyInput } from "./money.ts";

const cases = [
  ["R$ 4.390,00", 4390],
  ["4.390,00", 4390],
  ["4.390", 4390],
  ["4390", 4390],
  ["4390,5", 4390.5],
  ["4,39", 4.39],
  ["4.39", 4.39],
  ["1.234.567,89", 1234567.89],
  ["1,234.56", 1234.56],
  ["1.000.000", 1000000],
  ["R$ 129,90 ", 129.9],
  [",5", 0.5],
  ["", null],
  ["R$", null],
];

for (const [input, expected] of cases) {
  assert.equal(parseMoneyInput(input), expected, input);
}

for (const value of [0, 0.5, 4.39, 129.9, 4390, 1234567.89]) {
  assert.equal(parseMoneyInput(formatMoneyInput(value)), value, String(value));
}

assert.equal(formatMoneyInput(4390), "4.390,00");
assert.equal(formatMoneyInput(null), "");

// Intl usa espaço não separável depois do "R$".
const brl = (value) => formatBRL(value).replace(/\s/g, " ");
assert.equal(brl(2610.9), "R$ 2.610,90");
assert.equal(brl(834.5), "R$ 834,50");
assert.equal(brl(8345), "R$ 8.345");
assert.equal(brl(10137.26), "R$ 10.137,26");
assert.equal(brl(99.999), "R$ 100");

console.log("money ok");
