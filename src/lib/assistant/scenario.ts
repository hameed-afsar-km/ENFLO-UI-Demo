import { mockData } from "@/data/mock";
import { PLANT_PANELS, detectPlantName, panelIdsFromText } from "./plants";

export type ScenarioMetric = {
  label: string;
  baseline: number;
  projected: number;
  unit: "panels" | "MWh/day" | "MWh/yr" | "MW" | "MWh" | "INR/yr";
  goodDirection: "up" | "down" | "neutral";
};

export type ScenarioPoint = {
  label: string;
  baseline: number;
  projected: number;
};

export type ScenarioResult = {
  id: string;
  kind: "panels" | "solar" | "battery";
  action: "add" | "remove" | "change";
  plantName: string | null;
  title: string;
  assumption: string;
  deltaPercent: number;
  capexLabel: string;
  capex: number;
  paybackYears: number | null;
  metrics: ScenarioMetric[];
  monthly: ScenarioPoint[];
  verbal: string;
  prompt: string;
};

const DAYS_PER_YEAR = 330;
const PEAK_TARIFF = 9.8;
const SOLAR_CAPEX_PER_MW = 40_000_000;
const BESS_CAPEX_PER_MWH = 25_000_000;
const BESS_BASELINE_MWH = 5;
const BESS_ANNUAL_PER_MWH = 850_000;

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

type PanelRecord = (typeof mockData.panels)[number];

function formatInr(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 10_000_000) return `${sign}Rs ${(abs / 10_000_000).toFixed(2)} Cr`;
  if (abs >= 100_000) return `${sign}Rs ${(abs / 100_000).toFixed(1)} lakh`;
  return `${sign}Rs ${Math.round(abs).toLocaleString("en-IN")}`;
}

function signed(value: number, digits = 2): string {
  const rounded = Number(value.toFixed(digits));
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}

function pct(value: number, baseline: number): number {
  if (!baseline) return 0;
  return (value / baseline) * 100;
}

function panelsForPlant(plantName: string | null): PanelRecord[] {
  const ids = plantName
    ? PLANT_PANELS[plantName] ?? []
    : Object.values(PLANT_PANELS).flat();
  return ids
    .map((id) => mockData.panels.find((panel) => panel.id === id))
    .filter((panel): panel is PanelRecord => Boolean(panel));
}

function sumEnergy(panels: PanelRecord[]): number {
  return panels.reduce((sum, panel) => sum + panel.energyMwh, 0);
}

function sumAcMw(panels: PanelRecord[]): number {
  return panels.reduce((sum, panel) => sum + panel.acKw, 0) / 1000;
}

function cumulativeSeries(baselineAnnual: number, projectedAnnual: number): ScenarioPoint[] {
  return MONTHS.map((label, index) => ({
    label,
    baseline: (baselineAnnual / 12) * (index + 1),
    projected: (projectedAnnual / 12) * (index + 1),
  }));
}

function extractPanelCount(text: string): number | null {
  const digits = text.match(/(\d+)\s*(?:more\s+)?(?:panels?|modules?|arrays?)/i);
  if (digits) return Number(digits[1]);

  const words: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  };
  const word = text.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:more\s+)?(?:panels?|modules?|arrays?)/i);
  return word ? words[word[1].toLowerCase()] : null;
}

function scenarioId(kind: string, plantName: string | null): string {
  return `${kind}-${plantName ?? "fleet"}-${Date.now().toString(36)}`;
}

function buildPanelScenario(
  text: string,
  plantName: string | null,
  action: "add" | "remove",
): ScenarioResult | null {
  const pool = panelsForPlant(plantName);
  if (pool.length === 0) return null;

  const explicitIds = panelIdsFromText(text);
  const requested = explicitIds.length || extractPanelCount(text) || 0;
  if (requested <= 0) return null;

  const plantLabel = plantName ?? "the full fleet";
  let affected: PanelRecord[] = [];
  let assumption = "";
  let projectedPanels = pool.length;

  if (action === "remove") {
    const count = Math.min(requested, pool.length);
    affected = explicitIds.length
      ? pool.filter((panel) => explicitIds.includes(panel.id)).slice(0, count)
      : [...pool].sort((a, b) => a.pr - b.pr).slice(0, count);

    if (affected.length === 0) return null;
    projectedPanels = pool.length - affected.length;
    assumption = explicitIds.length
      ? `Assuming ${affected.map((panel) => panel.id).join(", ")} are decommissioned.`
      : `Assuming the ${affected.length} lowest-performing arrays (${affected.map((panel) => panel.id).join(", ")}) are the ones removed.`;
  } else {
    const count = requested;
    const avgEnergy = sumEnergy(pool) / pool.length;
    const avgAcKw = pool.reduce((sum, panel) => sum + panel.acKw, 0) / pool.length;
    affected = Array.from({ length: count }, (_, index) => ({
      ...pool[0],
      id: `NEW-${index + 1}`,
      energyMwh: avgEnergy,
      acKw: avgAcKw,
    }));
    projectedPanels = pool.length + count;
    assumption = `Assuming each new array produces the plant average of ${avgEnergy.toFixed(2)} MWh/day and ${avgAcKw.toFixed(0)} kW AC.`;
  }

  const baselineDaily = sumEnergy(pool);
  const affectedDaily = sumEnergy(affected);
  const projectedDaily = action === "remove" ? baselineDaily - affectedDaily : baselineDaily + affectedDaily;
  const baselineAnnual = baselineDaily * DAYS_PER_YEAR;
  const projectedAnnual = projectedDaily * DAYS_PER_YEAR;
  const baselineProfit = baselineAnnual * 1000 * PEAK_TARIFF;
  const projectedProfit = projectedAnnual * 1000 * PEAK_TARIFF;
  const deltaPercent = pct(projectedProfit - baselineProfit, baselineProfit);

  const affectedMw = sumAcMw(affected);
  const capex = affectedMw * SOLAR_CAPEX_PER_MW;
  const paybackYears = action === "add" && projectedProfit > baselineProfit
    ? capex / (projectedProfit - baselineProfit)
    : null;

  const title = action === "remove"
    ? `Remove ${affected.length} panel${affected.length === 1 ? "" : "s"} from ${plantLabel}`
    : `Add ${affected.length} panel${affected.length === 1 ? "" : "s"} to ${plantLabel}`;

  const metrics: ScenarioMetric[] = [
    { label: "Panels", baseline: pool.length, projected: projectedPanels, unit: "panels", goodDirection: "neutral" },
    { label: "Generation / day", baseline: baselineDaily, projected: projectedDaily, unit: "MWh/day", goodDirection: "up" },
    { label: "Generation / year", baseline: baselineAnnual, projected: projectedAnnual, unit: "MWh/yr", goodDirection: "up" },
    { label: "Annual profit", baseline: baselineProfit, projected: projectedProfit, unit: "INR/yr", goodDirection: "up" },
  ];

  const verbal = [
    action === "remove"
      ? `Removing ${affected.length} panel${affected.length === 1 ? "" : "s"} from ${plantLabel} cuts generation from ${baselineDaily.toFixed(2)} to ${projectedDaily.toFixed(2)} MWh a day, a ${Math.abs(deltaPercent).toFixed(1)}% drop.`
      : `Adding ${affected.length} panel${affected.length === 1 ? "" : "s"} to ${plantLabel} lifts generation from ${baselineDaily.toFixed(2)} to ${projectedDaily.toFixed(2)} MWh a day, a ${Math.abs(deltaPercent).toFixed(1)}% gain.`,
    `Annual profit ${action === "add" ? "rises" : "falls"} from ${formatInr(baselineProfit)} to ${formatInr(projectedProfit)}, a change of ${formatInr(projectedProfit - baselineProfit)}.`,
    `${assumption} The projection chart below shows the profit curve and the other metric deltas.`,
  ].join(" ");

  const prompt = [
    "SCENARIO PREDICTION (precomputed for the user's exact question — use these numbers, do not recalculate):",
    `Scenario: ${title}. ${assumption}`,
    `Panels: ${pool.length} -> ${projectedPanels}.`,
    `Generation: ${baselineDaily.toFixed(2)} -> ${projectedDaily.toFixed(2)} MWh/day (${signed(projectedDaily - baselineDaily)} MWh/day, ${signed(deltaPercent, 1)}%). Annual: ${baselineAnnual.toFixed(0)} -> ${projectedAnnual.toFixed(0)} MWh.`,
    `Annual profit (generation valued at Rs ${PEAK_TARIFF}/kWh peak tariff avoided): ${formatInr(baselineProfit)} -> ${formatInr(projectedProfit)} (${formatInr(projectedProfit - baselineProfit)}, ${signed(deltaPercent, 1)}%).`,
    action === "add"
      ? `Capex ${formatInr(capex)}; simple payback ${paybackYears ? paybackYears.toFixed(1) : "not applicable"} years.`
      : `Capex avoided ${formatInr(capex)}.`,
    "Answer instruction: reply with a verbal prediction in at most 4 sentences. Lead with generation and annual profit impact, name the plant, state the assumption in one clause, and end by noting the projection chart shown with this reply. Never tell the user to open the What-If Simulator or any other page.",
  ].join("\n");

  return {
    id: scenarioId("panels", plantName),
    kind: "panels",
    action,
    plantName,
    title,
    assumption,
    deltaPercent,
    capexLabel: action === "add" ? "Capex" : "Capex avoided",
    capex,
    paybackYears,
    metrics,
    monthly: cumulativeSeries(baselineProfit, projectedProfit),
    verbal,
    prompt,
  };
}

function buildSolarScenario(
  text: string,
  plantName: string | null,
  action: "add" | "remove" | "change",
): ScenarioResult | null {
  const pool = panelsForPlant(plantName);
  if (pool.length === 0) return null;

  const plantLabel = plantName ?? "the full fleet";
  const baselineDaily = sumEnergy(pool);
  const baselineMw = sumAcMw(pool);
  if (baselineMw <= 0) return null;

  const mwPerDay = baselineDaily / baselineMw;
  const numberMatch =
    text.match(/(?:solar|pv)[^\d]{0,24}(\d+(?:\.\d+)?)\s*mw/i) ||
    text.match(/(\d+(?:\.\d+)?)\s*mw\s*(?:of\s*)?(?:solar|pv)/i);
  const doubled = /double[^.]{0,20}(?:solar|pv)/i.test(text);
  const halved = /(?:half|halve)[^.]{0,20}(?:solar|pv)|(?:solar|pv)[^.]{0,20}(?:half|halve)/i.test(text);

  let targetMw = baselineMw;
  if (doubled) targetMw = baselineMw * 2;
  else if (halved) targetMw = baselineMw * 0.5;
  else if (numberMatch) {
    const value = Number(numberMatch[1]);
    targetMw = /to\s+\d/i.test(numberMatch[0]) ? value : underlying(action, baselineMw, value);
  }

  targetMw = Math.max(0, targetMw);
  const projectedDaily = targetMw * mwPerDay;
  const baselineAnnual = baselineDaily * DAYS_PER_YEAR;
  const projectedAnnual = projectedDaily * DAYS_PER_YEAR;
  const baselineProfit = baselineAnnual * 1000 * PEAK_TARIFF;
  const projectedProfit = projectedAnnual * 1000 * PEAK_TARIFF;
  const deltaPercent = pct(projectedProfit - baselineProfit, baselineProfit);
  const addedMw = targetMw - baselineMw;
  const capex = Math.abs(addedMw) * SOLAR_CAPEX_PER_MW;
  const paybackYears = addedMw > 0 && projectedProfit > baselineProfit
    ? capex / (projectedProfit - baselineProfit)
    : null;

  const resolvedAction: "add" | "remove" | "change" = addedMw > 0 ? "add" : addedMw < 0 ? "remove" : "change";
  const title = `${resolvedAction === "add" ? "Add" : resolvedAction === "remove" ? "Remove" : "Resize"} solar PV at ${plantLabel}`;
  const assumption = `Assuming linear scaling at ${mwPerDay.toFixed(2)} MWh per MW per day and no change in soiling or PR.`;

  const metrics: ScenarioMetric[] = [
    { label: "Solar capacity", baseline: baselineMw, projected: targetMw, unit: "MW", goodDirection: "up" },
    { label: "Generation / day", baseline: baselineDaily, projected: projectedDaily, unit: "MWh/day", goodDirection: "up" },
    { label: "Generation / year", baseline: baselineAnnual, projected: projectedAnnual, unit: "MWh/yr", goodDirection: "up" },
    { label: "Annual profit", baseline: baselineProfit, projected: projectedProfit, unit: "INR/yr", goodDirection: "up" },
  ];

  const verbal = [
    `${title} moves generation from ${baselineDaily.toFixed(2)} to ${projectedDaily.toFixed(2)} MWh a day, a ${Math.abs(deltaPercent).toFixed(1)}% ${addedMw >= 0 ? "gain" : "drop"}.`,
    `Annual profit ${addedMw >= 0 ? "rises" : "falls"} from ${formatInr(baselineProfit)} to ${formatInr(projectedProfit)}, a change of ${formatInr(projectedProfit - baselineProfit)}.`,
    `${assumption} The projection chart below shows the profit curve and the other metric deltas.`,
  ].join(" ");

  const prompt = [
    "SCENARIO PREDICTION (precomputed for the user's exact question — use these numbers, do not recalculate):",
    `Scenario: ${title}. ${assumption}`,
    `Solar capacity: ${baselineMw.toFixed(2)} -> ${targetMw.toFixed(2)} MW.`,
    `Generation: ${baselineDaily.toFixed(2)} -> ${projectedDaily.toFixed(2)} MWh/day (${signed(projectedDaily - baselineDaily)} MWh/day, ${signed(deltaPercent, 1)}%). Annual: ${baselineAnnual.toFixed(0)} -> ${projectedAnnual.toFixed(0)} MWh.`,
    `Annual profit (generation valued at Rs ${PEAK_TARIFF}/kWh peak tariff avoided): ${formatInr(baselineProfit)} -> ${formatInr(projectedProfit)} (${formatInr(projectedProfit - baselineProfit)}, ${signed(deltaPercent, 1)}%).`,
    resolvedAction === "add"
      ? `Capex ${formatInr(capex)}; simple payback ${paybackYears ? paybackYears.toFixed(1) : "not applicable"} years.`
      : `Capex avoided ${formatInr(capex)}.`,
    "Answer instruction: reply with a verbal prediction in at most 4 sentences. Lead with generation and annual profit impact, name the plant, state the assumption in one clause, and end by noting the projection chart shown with this reply. Never tell the user to open the What-If Simulator or any other page.",
  ].join("\n");

  return {
    id: scenarioId("solar", plantName),
    kind: "solar",
    action: resolvedAction,
    plantName,
    title,
    assumption,
    deltaPercent,
    capexLabel: resolvedAction === "add" ? "Capex" : "Capex avoided",
    capex,
    paybackYears,
    metrics,
    monthly: cumulativeSeries(baselineProfit, projectedProfit),
    verbal,
    prompt,
  };
}

function underlying(action: "add" | "remove" | "change", baseline: number, value: number): number {
  if (action === "remove") return baseline - value;
  if (action === "add") return baseline + value;
  return value;
}

function buildBatteryScenario(text: string): ScenarioResult | null {
  const numberMatch =
    text.match(/(?:battery|bess|storage)[^\d]{0,24}(\d+(?:\.\d+)?)\s*mwh/i) ||
    text.match(/(\d+(?:\.\d+)?)\s*mwh\s*(?:battery|bess|storage)/i);
  const doubled = /double[^.]{0,20}(?:battery|bess|storage)/i.test(text);
  const removeIntent = /\b(remove|reduce|cut|drop|decommission|shrink|less)\b/i.test(text);
  const addIntent = /\b(add|increase|expand|more|additional)\b/i.test(text);

  let targetMwh = BESS_BASELINE_MWH;
  if (doubled) targetMwh = BESS_BASELINE_MWH * 2;
  else if (numberMatch) {
    const value = Number(numberMatch[1]);
    targetMwh = /to\s+\d/i.test(numberMatch[0]) ? value : underlying(removeIntent ? "remove" : "add", BESS_BASELINE_MWH, value);
  } else if (addIntent || removeIntent) {
    return null;
  } else {
    return null;
  }

  targetMwh = Math.max(0, targetMwh);
  const baselineProfit = BESS_BASELINE_MWH * BESS_ANNUAL_PER_MWH;
  const projectedProfit = targetMwh * BESS_ANNUAL_PER_MWH;
  const deltaPercent = pct(projectedProfit - baselineProfit, baselineProfit);
  const deltaMwh = targetMwh - BESS_BASELINE_MWH;
  const capex = Math.abs(deltaMwh) * BESS_CAPEX_PER_MWH;
  const paybackYears = deltaMwh > 0 && projectedProfit > baselineProfit
    ? capex / (projectedProfit - baselineProfit)
    : null;
  const resolvedAction: "add" | "remove" | "change" = deltaMwh > 0 ? "add" : deltaMwh < 0 ? "remove" : "change";
  const title = `${resolvedAction === "add" ? "Expand" : resolvedAction === "remove" ? "Shrink" : "Resize"} BESS to ${targetMwh.toFixed(1)} MWh`;
  const assumption = `Using the simulator model of ${formatInr(BESS_ANNUAL_PER_MWH)} annual arbitrage value per MWh.`;

  const metrics: ScenarioMetric[] = [
    { label: "Battery capacity", baseline: BESS_BASELINE_MWH, projected: targetMwh, unit: "MWh", goodDirection: "up" },
    { label: "Annual profit", baseline: baselineProfit, projected: projectedProfit, unit: "INR/yr", goodDirection: "up" },
  ];

  const verbal = [
    `${title} changes storage from ${BESS_BASELINE_MWH.toFixed(1)} to ${targetMwh.toFixed(1)} MWh, a ${Math.abs(deltaPercent).toFixed(1)}% ${deltaMwh >= 0 ? "increase" : "reduction"}.`,
    `Annual profit from peak arbitrage ${deltaMwh >= 0 ? "rises" : "falls"} from ${formatInr(baselineProfit)} to ${formatInr(projectedProfit)}, a change of ${formatInr(projectedProfit - baselineProfit)}.`,
    `${assumption} The projection chart below shows the profit curve and the other metric deltas.`,
  ].join(" ");

  const prompt = [
    "SCENARIO PREDICTION (precomputed for the user's exact question — use these numbers, do not recalculate):",
    `Scenario: ${title}. ${assumption}`,
    `Battery capacity: ${BESS_BASELINE_MWH.toFixed(1)} -> ${targetMwh.toFixed(1)} MWh (${signed(deltaMwh, 1)} MWh, ${signed(deltaPercent, 1)}%).`,
    `Annual profit from peak arbitrage: ${formatInr(baselineProfit)} -> ${formatInr(projectedProfit)} (${formatInr(projectedProfit - baselineProfit)}, ${signed(deltaPercent, 1)}%).`,
    resolvedAction === "add"
      ? `Capex ${formatInr(capex)}; simple payback ${paybackYears ? paybackYears.toFixed(1) : "not applicable"} years.`
      : `Capex avoided ${formatInr(capex)}.`,
    "Answer instruction: reply with a verbal prediction in at most 4 sentences. Lead with the battery and annual profit impact, state the assumption in one clause, and end by noting the projection chart shown with this reply. Never tell the user to open the What-If Simulator or any other page.",
  ].join("\n");

  return {
    id: scenarioId("battery", null),
    kind: "battery",
    action: resolvedAction,
    plantName: null,
    title,
    assumption,
    deltaPercent,
    capexLabel: resolvedAction === "add" ? "Capex" : "Capex avoided",
    capex,
    paybackYears,
    metrics,
    monthly: cumulativeSeries(baselineProfit, projectedProfit),
    verbal,
    prompt,
  };
}

export function detectScenario(raw: string, selectedPlant?: string | null): ScenarioResult | null {
  const text = raw.toLowerCase();
  const plantName = detectPlantName(text, selectedPlant);

  const isSolar = /\b(solar|pv|photovoltaic)\b/.test(text);
  const isBattery = /\b(battery|bess|storage)\b/.test(text);
  const isPanel = /\b(panel|panels|module|modules|array|arrays)\b/.test(text);
  const removeIntent = /\b(remove|removing|drop|dropping|decommission|decommissioning|cut|cutting|take out|shut|without|delete)\b/.test(text);
  const addIntent = /\b(add|adding|install|installing|deploy|expanding|expand|increase|increasing|more|additional|another|double)\b/.test(text);
  const planningIntent = /\bwhat if|scenario|suppose|imagine|what happens if\b/.test(text);

  const panelCount = extractPanelCount(text);
  const explicitIds = panelIdsFromText(text);
  if (isPanel && (panelCount || explicitIds.length || planningIntent)) {
    if (removeIntent) {
      const result = buildPanelScenario(text, plantName, "remove");
      if (result) return result;
    }
    if (addIntent) {
      const result = buildPanelScenario(text, plantName, "add");
      if (result) return result;
    }
  }

  if (isSolar && (removeIntent || addIntent || planningIntent || /double|half|halve/.test(text))) {
    const action: "add" | "remove" | "change" = removeIntent ? "remove" : addIntent ? "add" : "change";
    const result = buildSolarScenario(text, plantName, action);
    if (result) return result;
  }

  if (isBattery && (removeIntent || addIntent || planningIntent || /double|half|halve/.test(text))) {
    const result = buildBatteryScenario(text);
    if (result) return result;
  }

  return null;
}
