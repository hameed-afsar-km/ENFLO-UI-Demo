import { mockData } from "@/data/mock";

export type RuntimeContext = {
  route?: string | null;
  routeLabel?: string | null;
  selectedPlant?: string | null;
  activeSimulations?: Array<{
    type: string;
    plantName: string;
    panelId: string;
    location?: string;
    time: string;
    message: string;
  }>;
  notifications?: Array<{
    title: string;
    message: string;
    type: string;
    time: string;
    read: boolean;
  }>;
  emsState?: any;
};

const ROUTE_LABELS: Record<string, string> = {
  "/": "Overview",
  "/plant-map": "Plant Map",
  "/analytics": "Analytics",
  "/assets": "Assets",
  "/reports": "Reports",
};

export function labelForRoute(route: string | null | undefined): string | null {
  if (!route) return null;
  const clean = route.split("?")[0];
  return ROUTE_LABELS[clean] ?? clean;
}

const PLANT_PANELS: Record<string, string[]> = {
  "ENECO Chennai": ["PNL-01", "PNL-02", "PNL-03", "PNL-04"],
  "ENECO Coimbatore": ["PNL-05", "PNL-06", "PNL-07"],
  "ENECO Madurai": ["PNL-08", "PNL-09"],
};

/** Series rendered by the Analytics screen tabs, mirrored for grounding. */
const solarVsLoad = [
  { time: "00:00", solar: 0, load: 1.2 },
  { time: "04:00", solar: 0, load: 1.1 },
  { time: "08:00", solar: 0.8, load: 1.8 },
  { time: "12:00", solar: 2.4, load: 2.1 },
  { time: "16:00", solar: 1.8, load: 2.0 },
  { time: "20:00", solar: 0, load: 1.5 },
];

const batterySeries = [
  { time: "00:00", soc: 40, charge: 0, discharge: 0.5 },
  { time: "04:00", soc: 20, charge: 0, discharge: 0.3 },
  { time: "08:00", soc: 25, charge: 0.4, discharge: 0 },
  { time: "12:00", soc: 80, charge: 1.2, discharge: 0 },
  { time: "16:00", soc: 100, charge: 0, discharge: 0 },
  { time: "20:00", soc: 70, charge: 0, discharge: 1.2 },
];

const gridSeries = [
  { time: "00:00", import: 0.7, export: 0 },
  { time: "04:00", import: 0.8, export: 0 },
  { time: "08:00", import: 1.0, export: 0 },
  { time: "12:00", import: 0, export: 0.3 },
  { time: "16:00", import: 0, export: 0 },
  { time: "20:00", import: 0.3, export: 0 },
];

const tariffCostSeries = [
  { time: "00:00", tariff: 5.1, cost: 3500 },
  { time: "04:00", tariff: 5.1, cost: 4000 },
  { time: "08:00", tariff: 5.2, cost: 5200 },
  { time: "12:00", tariff: 4.8, cost: 0 },
  { time: "16:00", tariff: 4.8, cost: 0 },
  { time: "20:00", tariff: 9.4, cost: 2800 },
];

const savingsSeries = [
  { day: "Mon", withoutEms: 32000, withEms: 21000, savings: 11000 },
  { day: "Tue", withoutEms: 34000, withEms: 22000, savings: 12000 },
  { day: "Wed", withoutEms: 31000, withEms: 19000, savings: 12000 },
  { day: "Thu", withoutEms: 36000, withEms: 20000, savings: 16000 },
  { day: "Fri", withoutEms: 33000, withEms: 21500, savings: 11500 },
];

export function getPanelIdsForPlant(plant: string | null | undefined): string[] {
  if (!plant) return [];
  return PLANT_PANELS[plant] ?? [];
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/**
 * Derived operational signals. The small model cannot be trusted to do this
 * arithmetic itself, so it is precomputed and handed over as fact.
 */
function deriveInsights(runtimeEmsState?: any) {
  const { energyToday, performance, costProjection, panels, forecastTomorrow } = mockData;
  const currentPower = runtimeEmsState?.currentPower ?? mockData.currentPower;
  const battery = runtimeEmsState?.battery ?? mockData.battery;

  const totalAcKw = panels.reduce((sum, p) => sum + p.acKw, 0);
  const totalDcKw = panels.reduce((sum, p) => sum + p.dcKw, 0);
  const warningPanels = panels.filter((p) => p.status !== "Normal");
  const worstPanel = [...panels].sort((a, b) => a.pr - b.pr)[0];
  const hottestPanel = [...panels].sort((a, b) => b.temp - a.temp)[0];

  const generationGapMwh = round(energyToday.expectedGenerationMwh - energyToday.solarGenerationMwh);
  const generationGapPct = round(
    ((energyToday.expectedGenerationMwh - energyToday.solarGenerationMwh) / energyToday.expectedGenerationMwh) * 100,
    1,
  );

  const importHeadroomMw = round(energyToday.demandLimitMw - energyToday.peakDemandMw);
  const importHeadroomPct = round((importHeadroomMw / energyToday.demandLimitMw) * 100, 1);

  const solarToLoadPct = round((currentPower.solarGenerationMw / currentPower.factoryLoadMw) * 100, 1);
  const gridShareOfLoad = round((currentPower.gridImportMw / currentPower.factoryLoadMw) * 100, 1);
  const dailySavingPct = round((costProjection.estimatedSavingToday / costProjection.baselineCostToday) * 100, 1);

  const batteryHeadroomMwh = round(
    battery.usableEnergyMwh * (1 - battery.recommendedReserveForEvening / 100),
  );
  const cycleLifeRemainingPct = round(100 - battery.degradationRate, 1);
  const soilingDropPoints = round(98.1 - performance.soilingRatio, 1);
  const forecastGapMwh = round(forecastTomorrow.factoryDemandMwh - forecastTomorrow.pvGenerationMwh);

  const verdicts: string[] = [];
  verdicts.push(
    performance.pr >= 80
      ? `PR verdict: healthy, ${performance.pr}% against an 80% expected baseline.`
      : `PR verdict: underperforming at ${performance.pr}%, ${round(80 - performance.pr, 1)} points below the 80% baseline.`,
  );
  verdicts.push(
    `Soiling verdict: modules are ${soilingDropPoints} points dirtier than the 98.1% recorded last week. Cleaning is advised within 7 days.`,
  );
  verdicts.push(
    energyToday.solarGenerationMwh < energyToday.expectedGenerationMwh
      ? `Generation verdict: ${generationGapMwh} MWh short of the ${energyToday.expectedGenerationMwh} MWh expectation today, a ${generationGapPct}% miss.`
      : `Generation verdict: ${round(energyToday.solarGenerationMwh - energyToday.expectedGenerationMwh)} MWh ahead of the ${energyToday.expectedGenerationMwh} MWh expectation today.`,
  );
  verdicts.push(
    `Grid verdict: peak import ${energyToday.peakDemandMw} MW sits ${importHeadroomMw} MW under the ${energyToday.demandLimitMw} MW limit, which is ${importHeadroomPct}% headroom. No limit breach today.`,
  );
  verdicts.push(
    `Battery: ${batteryHeadroomMwh} MWh can be discharged tonight, which is SOC ${battery.soc}% down to the ${battery.recommendedReserveForEvening}% recommended evening reserve. SOH ${battery.soh}% is healthy.`,
  );
  verdicts.push(
    `Cost verdict: for today the optimizer cuts spend from ₹${costProjection.baselineCostToday} to ₹${costProjection.optimizedCostToday}, saving ₹${costProjection.estimatedSavingToday} (${dailySavingPct}%). This is today's figure, not annual.`,
  );
  verdicts.push(
    `Coverage verdict: tomorrow's ${forecastTomorrow.factoryDemandMwh} MWh demand exceeds the ${forecastTomorrow.pvGenerationMwh} MWh PV forecast by ${forecastGapMwh} MWh, and the evening peak at ${forecastTomorrow.expectedEveningPeak} is the worst window, so hold battery charge for it.`,
  );
  verdicts.push(
    `Attention: ${hottestPanel.id} is the hottest asset at ${hottestPanel.temp}°C, past the 45°C derating point, and also the lowest performer at PR ${hottestPanel.pr}%. Fix that one asset first.`,
  );

  return {
    totalAcKw,
    totalDcKw,
    warningPanelIds: warningPanels.map((p) => `${p.id} (${p.status}, ${p.temp}°C, PR ${p.pr}%)`),
    worstPanel: `${worstPanel.id} lowest PR at ${worstPanel.pr}%`,
    hottestPanel: `${hottestPanel.id} hottest at ${hottestPanel.temp}°C`,
    generationGapMwh,
    generationGapPct,
    generationGapReading: energyToday.solarGenerationMwh < energyToday.expectedGenerationMwh ? "below" : "above",
    importHeadroomMw,
    importHeadroomPct,
    solarToLoadPct,
    gridShareOfLoad,
    dailySavingPct,
    batteryHeadroomMwh,
    cycleLifeRemainingPct,
    soilingDropPoints,
    forecastGapMwh,
    verdicts,
  };
}

type Section = {
  key: string;
  keywords: string[];
  build: (insights: ReturnType<typeof deriveInsights>) => string[];
};

/**
 * Compact, plain-text snapshot. Plain text beats JSON for small models and
 * costs roughly a third of the tokens. Facts are atomic and pre-interpreted
 * because a small model will happily misattribute a percentage if two metrics
 * share a sentence.
 *
 * Sections are assembled per question. A local 3B model on CPU pays a large
 * prefill cost for every token of context, so sending the analytics tables to
 * a "what is the battery SOC" question makes the answer slower for no gain.
 */
export function buildLiveContext(runtime: RuntimeContext = {}, question = ""): string {
  const insights = deriveInsights(runtime.emsState);
  const {
    plantStatus, energyToday, performance, solarConditions,
    forecastTomorrow = runtime.emsState?.forecastTomorrow ?? mockData.forecastTomorrow,
    predictedEvents = runtime.emsState?.predictedEvents ?? mockData.predictedEvents,
  } = mockData;
  
  const currentPower = runtime.emsState?.currentPower ?? mockData.currentPower;
  const battery = runtime.emsState?.battery ?? mockData.battery;
  const tariffs = runtime.emsState?.tariffs ?? mockData.tariffs;
  const costProjection = runtime.emsState?.costProjection ?? mockData.costProjection;
  const emsRecommendations = runtime.emsState?.emsRecommendations ?? mockData.emsRecommendations;
  const aiDecision = runtime.emsState?.aiDecision ?? mockData.aiDecision;

  const active = runtime.activeSimulations ?? [];
  const notifications = runtime.notifications ?? [];
  const unread = notifications.filter((n) => !n.read);
  const routeLabel = runtime.routeLabel ?? labelForRoute(runtime.route);

  const sections: Section[] = [
    {
      key: "power",
      keywords: [
        "power", "mw", "generat", "solar", "pv", "load", "factory", "consum", "import", "export", "grid", "self-consum",
        "ratio", "coverage", "cover", "kwh", "mwh", "energ", "demand", "limit", "headroom", "now", "live", "right", "current", "today", "status", "perform", "health", "overall", "pr", "epi", "irradiance", "ghi", "dni", "weather", "sun", "peak", "efficien",
      ],
      build: () => [
        `SNAPSHOT ${plantStatus.date} ${plantStatus.time} IST. Plant ${plantStatus.status}. ${plantStatus.panelsOnline} of ${plantStatus.totalPanels} arrays online.`,
        `POWER (live, MW): solar generation ${currentPower.solarGenerationMw}. Factory load ${currentPower.factoryLoadMw}. Grid import ${currentPower.gridImportMw}. Grid export ${currentPower.gridExportMw}. Battery charge ${currentPower.batteryChargeMw}. Battery discharge ${currentPower.batteryDischargeMw}.`,
        `ENERGY ROUTING (live, MW): direct to factory ${currentPower.directToFactoryMw}. To battery ${currentPower.toBatteryMw}. To grid ${currentPower.toGridMw}.`,
        `SELF-CONSUMPTION RATIO: ${currentPower.selfConsumptionRatio}%. This is the only figure for self-consumption, do not substitute another percentage.`,
        `ENERGY DESTINATION SPLIT: factory load 65%. Battery storage 20%. Grid export 15%.`,
        `LOAD COVER: solar supplies ${insights.solarToLoadPct}% of the live factory load and the grid supplies ${insights.gridShareOfLoad}% of it. The ${currentPower.surplusMw} MW surplus goes to the battery and grid export.`,
        `ENERGY TODAY (MWh): solar generated ${energyToday.solarGenerationMwh}. Solar expected ${energyToday.expectedGenerationMwh}. Factory consumed ${energyToday.factoryConsumptionMwh}. Grid import ${energyToday.gridImportMwh}. Grid export ${energyToday.gridExportMwh}.`,
        `DEMAND LIMIT (MW): peak import reached ${energyToday.peakDemandMw} against a contracted limit of ${energyToday.demandLimitMw}. Headroom ${insights.importHeadroomMw} MW (${insights.importHeadroomPct}%).`,
        `PERFORMANCE: overall status ${performance.status}. PR ${performance.pr}%. EPI ${performance.epi}%. Availability ${performance.availability}%. Soiling ratio ${performance.soilingRatio}% (last week 98.1%, so down ${insights.soilingDropPoints} points).`,
        `IRRADIANCE: GHI ${solarConditions.ghi} W/m2, which is ${Math.round(solarConditions.ghi / 10)}% of the 1000 W/m2 clear-sky reference. DNI ${solarConditions.dni} W/m2. Ambient temperature ${solarConditions.temp}C. Wind ${solarConditions.wind} m/s. Cloud cover ${solarConditions.cloud}%.`,
      ],
    },
    {
      key: "battery",
      keywords: [
        "batter", "bess", "soc", "state of charge", "storage", "discharg", "charg", "soh", "capacity", "reserve",
        "cycle", "degrad", "life", "rte", "efficien", "peak", "tonight", "evening", "arb", "arbitrag", "dispatch", "ems", "hold",
      ],
      build: () => [
        `BATTERY BESS: state ${battery.state}. SOC ${battery.soc}% equals ${battery.usableEnergyMwh} MWh usable of ${battery.ratedCapacityMwh} MWh rated. SOH ${battery.soh}%. Round-trip efficiency ${battery.rte}%. Cycle count ${battery.cycleCount}. Degradation ${battery.degradationRate}%, so ${insights.cycleLifeRemainingPct}% of life remains. Operating band ${battery.minReserve}% to ${battery.maxReserve}%. Charge power ${battery.chargePowerMw} MW. Recommended reserve for the evening peak ${battery.recommendedReserveForEvening}%, which leaves ${insights.batteryHeadroomMwh} MWh dischargeable.`,
      ],
    },
    {
      key: "forecast",
      keywords: [
        "forecast", "tomorrow", "predict", "expect", "outlook", "gap", "short", "shortfall", "will", "planning",
        "peak", "evening", "hour", "tomorrow's", "next day",
      ],
      build: () => [
        `TOMORROW FORECAST (MWh): PV generation ${forecastTomorrow.pvGenerationMwh} with uncertainty ${forecastTomorrow.pvUncertainty}. Factory demand ${forecastTomorrow.factoryDemandMwh} with uncertainty ${forecastTomorrow.demandUncertainty}. Demand exceeds PV by ${insights.forecastGapMwh} MWh. Expected evening demand peak ${forecastTomorrow.expectedEveningPeak}.`,
      ],
    },
    {
      key: "savings",
      keywords: [
        "sav", "cost", "rupee", "rupees", "rs", "tariff", "money", "spend", "bill", "optimi", "arbitrag",
        "price", "rate", "econom", "profit", "roi", "payback", "annual", "year", "lakh", "crore", "charge from the grid",
        "ems", "dispatch", "decide", "decision", "recommend", "ai decision", "what-if", "what if", "simulat", "slider", "projected",
      ],
      build: () => [
        `TARIFF: current ${tariffs.current} rupees per kWh, which is the ${tariffs.nextChangeTime === "18:00" ? "low" : "current"} band. It changes to ${tariffs.nextTariff} rupees per kWh at ${tariffs.nextChangeTime}. Timeline: ${tariffs.timeline.map((t: any) => `${t.time} ${t.price} (${t.type})`).join(", ")}.`,
        `COST TODAY (one day): no-optimizer baseline ₹${costProjection.baselineCostToday}. With the optimizer ₹${costProjection.optimizedCostToday}. Saving ₹${costProjection.estimatedSavingToday} (${insights.dailySavingPct}%). This is TODAY's saving, never confuse it with the weekly or annual series.`,
        `EMS DECISION (right now): ${aiDecision.action}. ${aiDecision.reason} Expected impact: ${aiDecision.expectedImpact}`,
        `EMS RECOMMENDATIONS: ${emsRecommendations.map((r: any) => `${r.action} (${r.priority} priority): ${r.reason}`).join(" | ")}`,
        `WHAT-IF SIMULATOR (annual figures): baseline battery capacity 5 MWh gives about Rs 45 lakh of annual saving. Each extra 1 MWh of capacity adds roughly Rs 8.5 lakh of annual saving. Slider range 2 to 20 MWh.`,
        `ANALYTICS EMS SAVINGS (this week, rupees, per day): ${savingsSeries.map((r) => `${r.day} saved ${r.savings} versus ${r.withoutEms} without EMS`).join("; ")}. These are weekly/day series. Do not add the daily saving to these.`,
      ],
    },
    {
      key: "assets",
      keywords: [
        "panel", "pnl-", "array", "asset", "module", "inverter", "tracker", "site", "plant", "chennai", "coimbatore", "madurai",
        "pl-0", "which", "worst", "hottest", "hot", "temp", "attention", "flag", "derat", "clean", "wash", "failure", "fault", "thousand", "mw capacity", "capacity factor",
      ],
      build: () => [
        `ARRAYS: ${insights.totalAcKw} kW AC and ${insights.totalDcKw} kW DC across ${mockData.panels.length} arrays.`,
        ...mockData.panels.map(
          (p) => `  ${p.id}: ${p.status}. AC ${p.acKw} kW. DC ${p.dcKw} kW. Efficiency ${p.eff}%. Temperature ${p.temp}C. Energy ${p.energyMwh} MWh. PR ${p.pr}%.`,
        ),
        `ASSET ATTENTION: ${insights.warningPanelIds.length > 0 ? insights.warningPanelIds.join("; ") : "no array is flagged"}. Lowest performer is ${insights.worstPanel}. Hottest asset is ${insights.hottestPanel}. Modules derate above roughly 45C.`,
        `SITES: ENECO Chennai PL-01 has PNL-01 to PNL-04. ENECO Coimbatore PL-02 has PNL-05 to PNL-07 and is flagged Warning. ENECO Madurai PL-03 has PNL-08 to PNL-09.`,
      ],
    },
    {
      key: "events",
      keywords: [
        "alert", "alarm", "event", "notification", "notif", "unread", "log", "today's event", "message", "warning", "error", "issue", "what should i do", "fix", "resolve", "overload", "trip", "outage", "interrupt", "predict", "future", "anticipate", "happen"
      ],
      build: () => [
        `EVENTS LOG: ${mockData.events.map((e) => `${e.time} ${e.asset} ${e.message}`).join("; ")}.`,
        `PREDICTED EVENTS: ${predictedEvents.map((e) => `${e.expectedTime} on ${e.asset}: ${e.message} (${e.probability}% probability)`).join(" | ")}. Use these to answer questions about future events or predictions.`,
        active.length > 0
          ? `ACTIVE UNRESOLVED ALERTS (treat as top priority): ${active
              .map(
                (s) =>
                  `${s.type} on ${s.panelId} at ${s.plantName}${s.location ? ` (${s.location})` : ""} logged at ${s.time}. ${s.message}`,
              )
              .join(" | ")}.`
          : `ACTIVE UNRESOLVED ALERTS: none. The plant is clear.`,
        `NOTIFICATIONS: ${notifications.length} total with ${unread.length} unread. ${
          unread.length > 0
            ? unread.map((n) => `[${n.type}] ${n.title} at ${n.time}. ${n.message}`).join(" | ")
            : "No unread notifications."
        }`,
      ],
    },
    {
      key: "analytics",
      keywords: [
        "analytic", "trend", "monthly", "weekly", "daily series", "chart", "graph", "history", "histor",
        "drift", "last month", "y1", "year 1", "failure mode", "labour", "maintenance hour", "maint", "cleaning", "soiling loss",
        "profile", "over the day", "hour by hour", "hourly", "series", "at 12:00", "at 18:00", "this week",
        "solar vs load", "solar versus load", "grid profile", "battery profile", "tab",
      ],
      build: () => [
        `ANALYTICS SOLAR VS LOAD (today, MW): ${solarVsLoad.map((r) => `${r.time} solar ${r.solar} against load ${r.load}`).join("; ")}. Solar peaks at 2.4 MW at 12:00, above the 2.1 MW load at that hour.`,
        `ANALYTICS BATTERY PROFILE (today): ${batterySeries.map((r) => `${r.time} SOC ${r.soc}%, charge ${r.charge} MW, discharge ${r.discharge} MW`).join("; ")}. The battery reaches 100% SOC by 16:00, then discharges 1.2 MW at 20:00.`,
        `ANALYTICS GRID PROFILE (today, MW): ${gridSeries.map((r) => `${r.time} import ${r.import}, export ${r.export}`).join("; ")}. There is no grid import between 12:00 and 20:00 because solar covers the load.`,
        `ANALYTICS TARIFF AND COST (today): ${tariffCostSeries.map((r) => `${r.time} tariff ${r.tariff} rupees per kWh, cost ${r.cost}`).join("; ")}.`,
        `ANALYTICS EMS SAVINGS (this week, rupees): ${savingsSeries.map((r) => `${r.day} saved ${r.savings} versus ${r.withoutEms} without EMS`).join("; ")}.`,
      ],
    },
    {
      key: "reports",
      keywords: ["report", "document", "download", "export", "csv", "pdf", "statement", "summary", "log file", "available", "can i download", "what reports"],
      build: () => [
        `REPORTS AVAILABLE: Daily Yield and Economics (01 Oct 2026), AI Optimizer Savings Impact (30 Sep 2026), BESS Degradation and Health Summary (25 Sep 2026), Monthly Plant Performance (PR) (01 Sep 2026), Asset Maintenance Log (15 Aug 2026).`,
      ],
    },
  ];

  const haystack = question.toLowerCase();
  const lines: string[] = [];
  lines.push(
    `USER CONTEXT: currently viewing ${routeLabel ?? "the Overview dashboard"}${
      runtime.selectedPlant ? ` with plant ${runtime.selectedPlant} selected` : ""
    }. Prefer that screen's metrics unless the user asks otherwise.`,
  );

  for (const section of sections) {
    const wanted = section.keywords.some((k) => haystack.includes(k));
    if (wanted) lines.push(...section.build(insights));
  }

  lines.push("");
  lines.push("PRE-COMPUTED VERDICTS (use these directly instead of re-deriving):");
  for (const verdict of insights.verdicts) {
    lines.push(`- ${verdict}`);
  }

  return lines.join("\n");
}
