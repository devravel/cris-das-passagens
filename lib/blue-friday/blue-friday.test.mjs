// node lib/blue-friday/blue-friday.test.mjs
import assert from "node:assert/strict";

import { formatPackagePublishedAgo } from "../package/dates.ts";
import { buildDestinationRanking, createBlueFridayRequestSchema, normalizeDestinationKey } from "./rules.ts";

// Chave do destino
assert.equal(normalizeDestinationKey("  Florianópolis "), "florianopolis");
assert.equal(normalizeDestinationKey("RIO  de   JANEIRO"), "rio de janeiro");
assert.equal(normalizeDestinationKey("Cancún"), normalizeDestinationKey("cancun"));

// Ranking: só a lista no público, rótulo da config, empate em ordem alfabética
const destinations = ["Rio de Janeiro", "Gramado", "Cancún"];
const counts = [
  { destinationKey: "gramado", destination: "gramado", count: 5 },
  { destinationKey: "paris", destination: "Paris", count: 9 },
  { destinationKey: "cancun", destination: "cancun", count: 5 },
  { destinationKey: "rio de janeiro", destination: "Rio de janeiro", count: 7 },
];

assert.deepEqual(buildDestinationRanking(counts, destinations, { publicOnly: true }), [
  { position: 1, destinationKey: "rio de janeiro", destination: "Rio de Janeiro", count: 7, inList: true },
  { position: 2, destinationKey: "cancun", destination: "Cancún", count: 5, inList: true },
  { position: 3, destinationKey: "gramado", destination: "Gramado", count: 5, inList: true },
]);
assert.equal(buildDestinationRanking(counts, destinations, { publicOnly: true, limit: 1 }).length, 1);

const adminRanking = buildDestinationRanking(counts, destinations);
assert.deepEqual(adminRanking[0], { position: 1, destinationKey: "paris", destination: "Paris", count: 9, inList: false });

// Schema
const schema = createBlueFridayRequestSchema(
  { destinations, flexiblePeriods: ["Ainda em 2026"], budgetRanges: ["Até R$ 3 mil"] },
  "2026-10-21",
);

const base = {
  name: "Maria Silva",
  phone: "(51) 99999-8888",
  departureCity: "Porto Alegre",
  destination: "Gramado",
  dateMode: "SPECIFIC",
  option1Departure: "2026-12-10",
  option1Return: "2026-12-15",
  option2Departure: "",
  option2Return: "",
  flexiblePeriod: "",
  tripDays: null,
  adults: 2,
  childrenAges: [5],
  babies: 0,
  budgetRange: "Até R$ 3 mil",
  paymentPreference: "PIX",
  targetPrice: null,
};

const ok = schema.parse(base);
assert.equal(ok.phone, "51999998888");
assert.equal(ok.destinationKey, "gramado");
assert.equal(ok.flexiblePeriod, null);
assert.equal(ok.option2Departure, null);

const errorPaths = (input) => {
  const result = schema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
};

assert.deepEqual(errorPaths({ ...base, option1Departure: "2026-10-20" }), ["option1Departure"]);
assert.deepEqual(errorPaths({ ...base, option1Return: "2026-12-01" }), ["option1Return"]);
assert.deepEqual(errorPaths({ ...base, option2Departure: "2026-12-17" }), ["option2Return"]);
assert.deepEqual(errorPaths({ ...base, option1Departure: "", option1Return: "" }), ["option1Departure", "option1Return"]);
assert.deepEqual(errorPaths({ ...base, phone: "(51) 3333-4444" }), ["phone"]);
assert.deepEqual(errorPaths({ ...base, childrenAges: [1] }), ["childrenAges.0"]);
assert.deepEqual(errorPaths({ ...base, budgetRange: "Qualquer" }), ["budgetRange"]);

// Erros de data junto com os dos outros campos; corpo inválido não quebra
assert.deepEqual(errorPaths({ ...base, name: "", option1Departure: "" }), ["name", "option1Departure"]);
assert.equal(schema.safeParse(null).success, false);
assert.equal(schema.safeParse("x").success, false);

// Flexível: datas ignoradas, período e dias obrigatórios
assert.deepEqual(errorPaths({ ...base, dateMode: "FLEXIBLE" }), ["flexiblePeriod", "tripDays"]);
const flexible = schema.parse({
  ...base,
  dateMode: "FLEXIBLE",
  option1Departure: "",
  flexiblePeriod: "Ainda em 2026",
  tripDays: 7,
});
assert.equal(flexible.option1Return, null);
assert.equal(flexible.tripDays, 7);

// Publicado há X dias (calendário de Brasília)
const now = new Date("2026-10-21T15:00:00-03:00");
assert.equal(formatPackagePublishedAgo("2026-10-21T08:00:00-03:00", now), "Publicado hoje");
assert.equal(formatPackagePublishedAgo("2026-10-20T23:30:00-03:00", now), "Publicado ontem");
assert.equal(formatPackagePublishedAgo("2026-10-18T10:00:00-03:00", now), "Publicado há 3 dias");
// 01:00 UTC do dia 21 ainda é dia 20 em Brasília
assert.equal(formatPackagePublishedAgo("2026-10-21T01:00:00Z", now), "Publicado ontem");
assert.equal(formatPackagePublishedAgo(null, now), null);

console.log("blue friday ok");
