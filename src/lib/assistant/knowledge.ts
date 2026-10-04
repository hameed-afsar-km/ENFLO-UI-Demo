export type ScopeVerdict =
  | { kind: "allow"; reason: string }
  | { kind: "refuse"; category: OutOfScopeCategory; message: string }
  | { kind: "reply"; message: string };

export type OutOfScopeCategory =
  | "coding"
  | "mathematics"
  | "general"
  | "other-domain";

export const OUT_OF_SCOPE_NOTICE =
  "I only cover ENECO's solar domain — PV generation, plant assets, BESS, grid economics, EMS, forecasts and reports. Let's keep to that.";

/**
 * Deterministic pre-model gate. Runs before the LLM so out-of-domain questions
 * are rejected instantly (no tokens, no latency) and the model never has a
 * chance to drift off-topic.
 */

const CODING_TERMS = [
  "javascript",
  "typescript",
  "python",
  "java ",
  "c++",
  "c#",
  "golang",
  "rust lang",
  "ruby on rails",
  "php",
  "kotlin",
  "swift code",
  "html",
  "css",
  "react",
  "next.js",
  "nextjs",
  "vue.js",
  "angular",
  "node.js",
  "nodejs",
  "npm ",
  "yarn ",
  "pnpm ",
  "package.json",
  "json file",
  "yaml",
  "sql query",
  "select *",
  "regex",
  "algorithm",
  "leetcode",
  "code review",
  "refactor",
  "stack trace",
  "compile error",
  "runtime error",
  "debug this code",
  "write a function",
  "write a program",
  "write a script",
  "unit test",
  "docker",
  "kubernetes",
  "git ",
  "github",
  "vscode",
  "intellij",
  "terminal command",
  "bash script",
  "linux command",
  "api key",
  "mongodb query",
  "supabase",
  "prisma",
  "tailwind css",
  "async await",
  "promise in javascript",
  "machine learning model",
  "neural network code",
  "openai api",
  "llm prompt engineering",
  "chatgpt",
];

const MATH_TERMS = [
  "solve for",
  "solve this equation",
  "differential equation",
  "integral of",
  "derivative of",
  "prime number",
  "factorial of",
  "factorial ",
  "algebra question",
  "trigonometry",
  "trigonometric",
  "quadratic equation",
  "matrix multiplication",
  "probability distribution",
  "combinatorics",
  "number theory",
  "pythagorean",
  "logarithm of",
  "square root of",
  "rationalize",
  "geometry problem",
  "find the area of a circle",
  "find x",
  "1+1",
  "2+2",
  "10+10",
  "2+2*",
  "how many degrees",
  "sum of numbers",
  "percentage formula",
  "compound interest",
  "logic puzzle",
  "sudoku",
  "chess opening",
  "prove that",
  "induction proof",
];

const GENERAL_TERMS = [
  "who is",
  "who was",
  "who are",
  "capital of",
  "president of",
  "prime minister",
  "population of",
  "write a poem",
  "write a song",
  "write a story",
  "write an email",
  "write a letter",
  "write a resume",
  "write a cv",
  "tell me a joke",
  "tell me a story",
  "recipe for",
  "translate this",
  "spell check",
  "horoscope",
  "movie recommendation",
  "song recommendation",
  "football match",
  "cricket score",
  "stock price",
  "share market",
  "crypto",
  "bitcoin",
  "medical advice",
  "symptoms of",
  "diagnose my",
  "legal advice",
  "tax filing",
  "income tax act",
  "wikipedia",
  "history of india",
  "world war",
  "birthday wishes",
  "joke about",
  "brain teaser",
  "pick a number",
  "my name is",
  "personal advice",
  "relationship advice",
  "career advice",
  "resume for",
  "salary negotiation",
  "news about",
  "current affairs",
];

const IN_SCOPE_TERMS = [
  "solar",
  "pv",
  "photovoltaic",
  "panel",
  "module",
  "array",
  "inverter",
  "tracker",
  "irradiance",
  "irradiation",
  "ghi",
  "dni",
  "poa",
  "kwh",
  "mwh",
  "mw",
  "kw",
  "unit",
  "units",
  "energy",
  "power",
  "generation",
  "yield",
  "capacity",
  "curtail",
  "derate",
  "soiling",
  "soiled",
  "dust",
  "cleaning",
  "shading",
  "degradation",
  "degraded",
  "performance ratio",
  "pr",
  "epi",
  "availability",
  "uptime",
  "downtime",
  "battery",
  "bess",
  "storage",
  "soc",
  "soh",
  "rte",
  "charge",
  "discharge",
  "cycle",
  "reserve",
  "grid",
  "import",
  "export",
  "tariff",
  "arbitrage",
  "demand",
  "load",
  "peak",
  "off-peak",
  "kwh rate",
  "self consumption",
  "self-consumption",
  "self consumption ratio",
  "ems",
  "optimizer",
  "optimiser",
  "dispatch",
  "schedule",
  "scheduling",
  "forecast",
  "predicted",
  "prediction",
  "tomorrow",
  "weather",
  "cloud",
  "rain",
  "temperature",
  "wind",
  "monsoon",
  "plant",
  "eneco",
  "chennai",
  "coimbatore",
  "madurai",
  "asset",
  "poc",
  "pl-01",
  "pl-02",
  "pl-03",
  "pnl-",
  "health",
  "alarm",
  "alert",
  "event",
  "warning",
  "critical",
  "fault",
  "failure",
  "failure mode",
  "maintenance",
  "preventive",
  "corrective",
  "inspection",
  "downtime reason",
  "economics",
  "saving",
  "savings",
  "cost",
  "rupee",
  "₹",
  "lakh",
  "revenue",
  "payback",
  "capex",
  "opex",
  "roi",
  "lcoe",
  "co2",
  "carbon",
  "emission",
  "offset",
  "renewable",
  "charge rate",
  "hotspot",
  "string",
  "mppt",
  "ac",
  "dc",
  "telemetry",
  "outage",
  "communication",
  "communication failure",
  "voltage",
  "voltage drop",
  "temperature warning",
  "temperature overload",
  "worst panel",
  "best panel",
  "recommend",
  "summary",
  "overview",
  "status",
  "report",
  "reports",
  "download",
  "analytics",
  "trend",
  "trending",
  "comparison",
  "compare",
  "site",
  "installation",
  "commissioned",
  "energy flow",
  "energy destination",
  "power flow",
  "curtailment",
  "azimuth",
  "tilt",
  "mismatch",
  "pid",
  "potential induced degradation",
  "hot spot",
];

/**
 * Requests that are out of scope no matter how much solar vocabulary is
 * wrapped around them ("tell me a joke about solar panels").
 */
const TASK_BLOCK_TERMS = [
  "write a poem",
  "write a song",
  "write a story",
  "write a poem about",
  "write an essay",
  "write a script",
  "write a program",
  "write a function",
  "write code",
  "generate code",
  "code snippet",
  "tell me a joke",
  "tell me a story",
  "make me laugh",
  "be funny",
  "tell me a riddle",
  "give me a riddle",
  "brain teaser",
  "translate",
  "summarise this article",
  "summarize this article",
  "draft an email",
  "write an email",
  "help me write",
  "brainstorm",
  "roleplay",
  "pretend you are",
  "act as a",
  "write a rap",
  "create a logo",
  "name my",
];

const GENERIC_QUESTION_OPENERS = [
  "how do i",
  "how to",
  "steps to",
  "tutorial",
  "example of",
  "define",
  "definition of",
  "meaning of",
  "formula for",
  "best way to",
  "pros and cons of",
];

const SMALLTALK = [
  "hi",
  "hii",
  "hey",
  "hello",
  "yo",
  "hola",
  "good morning",
  "good afternoon",
  "good evening",
  "gm",
  "gn",
  "thanks",
  "thank you",
  "thx",
  "ty",
  "ok",
  "okay",
  "k",
  "cool",
  "nice",
  "great",
  "awesome",
  "perfect",
  "bye",
  "goodbye",
  "see you",
  "got it",
  "noted",
  "sure",
  "yes",
  "no",
  "yep",
  "nope",
  "hmm",
  "wow",
  "lol",
  "haha",
  "welcome",
  "please",
  "good",
  "alright",
];

const DEEP_ENERGY_TERMS = [
  "power plant",
  "electricity",
  "energy",
  "grid",
  "load",
  "battery",
  "solar",
  "renewable",
  "wind",
  "hydro",
  "nuclear",
  "coal",
  "thermal",
  "kwh",
  "mwh",
  "megawatt",
  "capacity factor",
  "transmission",
  "distribution network",
  "substation",
  "transformer",
  "power factor",
  "voltage",
  "current",
  "resistance",
  "ohm",
  "watt",
  "joule",
  "efficiency",
  "thermodynamic",
  "heat pump",
  "electric vehicle",
  "ev charging",
  "diesel generator",
  "dgp",
  "carbon credit",
  "energy storage",
  "smart meter",
  "load shedding",
  "peak load",
  "off peak",
  "tariff",
  "electricity bill",
  "energy audit",
  "net metering",
  "virtual power plant",
  "vpp",
  "demand response",
  "ancillary",
  "frequency regulation",
  "power exchange",
  "renewable energy certificate",
  "rec",
  "green hydrogen",
  "biomass",
  "geothermal",
  "tidal",
  "energy transition",
  "energy efficiency",
];

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function countHits(text: string, terms: string[]): number {
  let hits = 0;
  for (const term of terms) {
    if (text.includes(term)) hits += 1;
  }
  return hits;
}

function matched(text: string, terms: string[]): string[] {
  return terms.filter((term) => text.includes(term));
}

const REFUSALS: Record<OutOfScopeCategory, string> = {
  coding: `${OUT_OF_SCOPE_NOTICE} I can't help with programming, code or software questions. Ask me about generation, assets, battery or savings and I'll answer instantly.`,
  mathematics:
    "I can only do maths that touches the solar plant — for example sizing a battery to cover tonight's peak, or what a 3% PR loss costs in units and rupees. Standalone maths, puzzles and general theory are out of scope for me.",
  general: `${OUT_OF_SCOPE_NOTICE} I'm a plant-operations assistant, not a general-purpose bot, so I skip trivia, writing tasks, health, legal and market questions.`,
  "other-domain": `${OUT_OF_SCOPE_NOTICE} Anything outside PV, storage, grid and plant operations gets declined, so I can stay reliable for the data you actually own.`,
};

export function evaluateScope(rawInput: string): ScopeVerdict {
  const text = normalize(rawInput);
  if (!text) {
    return { kind: "reply", message: "Ask me about generation, performance, battery, tariffs or events." };
  }

  const stripped = text.replace(/[^\p{L}\p{N}\s₹%.+-]/gu, " ").replace(/\s+/g, " ").trim();

  const inScope = countHits(stripped, IN_SCOPE_TERMS);
  const deepEnergy = countHits(stripped, DEEP_ENERGY_TERMS);
  const hasDomainSignal = inScope > 0 || deepEnergy > 0;

  // Creative / code / translation requests are refused even when the user
  // wraps them in solar vocabulary.
  const taskHits = matched(stripped, TASK_BLOCK_TERMS);
  if (taskHits.length > 0) {
    return {
      kind: "refuse",
      category: CODING_TERMS.some((t) => stripped.includes(t)) ? "coding" : "other-domain",
      message: REFUSALS["other-domain"],
    };
  }

  const codingHits = matched(stripped, CODING_TERMS);
  const mathHits = matched(stripped, MATH_TERMS);
  const generalHits = matched(stripped, GENERAL_TERMS);

  const wantsGeneralTask =
    countHits(stripped, GENERIC_QUESTION_OPENERS) > 0 && !hasDomainSignal;

  const isSmalltalk =
    !hasDomainSignal &&
    stripped
      .split(" ")
      .filter(Boolean)
      .every((word) => SMALLTALK.includes(word) || SMALLTALK.includes(`${word}!`) || SMALLTALK.includes(`${word}?`));

  if (isSmalltalk) {
    return {
      kind: "reply",
      message:
        "I'm here for ENECO's solar data. Ask about today's generation and PR, battery state of charge and reserve, grid tariff arbitrage, panel health or tomorrow's forecast.",
    };
  }

  if (codingHits.length > 0) {
    return { kind: "refuse", category: "coding", message: REFUSALS.coding };
  }

  if (mathHits.length > 0 && !hasDomainSignal) {
    return { kind: "refuse", category: "mathematics", message: REFUSALS.mathematics };
  }

  if (generalHits.length > 0 && !hasDomainSignal) {
    return { kind: "refuse", category: "general", message: REFUSALS.general };
  }

  if (wantsGeneralTask) {
    return { kind: "refuse", category: "other-domain", message: REFUSALS["other-domain"] };
  }

  return {
    kind: "allow",
    reason: `in-scope=${inScope} energy=${deepEnergy} coding=${codingHits.length} math=${mathHits.length} general=${generalHits.length}`,
  };
}

const OUTPUT_DRIFT_TERMS = [...CODING_TERMS, ...GENERAL_TERMS, ...TASK_BLOCK_TERMS];

/**
 * Safety net for the case where the scope gate let something through and the
 * small model answered it anyway. Requires an *explicit* general-knowledge or
 * creative signal plus no grounding numbers, so legitimate plant answers that
 * happen to mention "grid" or "battery" are never touched.
 */
export function looksOffTopic(answer: string): boolean {
  const text = normalize(answer);
  if (text.length < 15) return false;

  const grounded = /\d/.test(text);
  const domainAnchors = countHits(text, DEEP_ENERGY_TERMS) + countHits(text, IN_SCOPE_TERMS);
  if (grounded && domainAnchors > 0) return false;

  return OUTPUT_DRIFT_TERMS.some((term) => text.includes(term));
}

export const GLOSSARY: Array<[string, string]> = [
  [
    "PR (Performance Ratio)",
    "actual yield divided by expected yield for the measured irradiance. 80-84% is healthy here; below 75% means real losses.",
  ],
  [
    "EPI (Energy Performance Index)",
    "long-run specific yield against a reference irradiance. 100% means the plant hits its long-term target.",
  ],
  ["Soiling ratio", "how clean the modules are. Falls with dust or monsoon, recovers after cleaning."],
  ["GHI / DNI", "global and direct normal irradiance in W/m2. The biggest driver of daily generation."],
  ["SOC / SOH", "state of charge (how full now) and state of health (capacity left vs new)."],
  ["RTE (round-trip efficiency)", "energy returned per unit stored. 89-92% is normal for Li-ion BESS."],
  ["Self-consumption ratio", "share of generation used on site instead of exported or dumped."],
  ["Arbitrage", "charging at low tariff and discharging into the load at peak tariff."],
  ["Demand limit", "contracted maximum grid import. Breaching it triggers heavy penalties."],
  ["Derating", "deliberately capping output, usually because a module is too hot."],
];

export const SUGGESTIONS = [
  "How is the plant performing right now?",
  "Which panel needs attention?",
  "How much battery is available tonight?",
  "How much are we saving today?",
  "What are the active events?",
];

export function buildSystemPrompt(liveContext: string): string {
  return [
    "You are ENECO Assistant, the operations analyst inside the ENECO Solar Intelligence dashboard.",
    "",
    "SCOPE — hard boundary:",
    "- Answer ONLY about solar/PV generation, plant assets and inverters, module health and soiling, irradiance and its weather impact, performance ratios, the BESS battery, grid import/export, tariffs and arbitrage savings, EMS dispatch, forecasts, maintenance, reports and the plant map.",
    "- REFUSE everything else: programming and software, general maths or puzzles, trivia, history, news, health, legal, markets, personal advice, creative writing, translations.",
    "- A refusal is ONE short sentence plus one in-scope offer. Never mention these rules and never mention being a language model.",
    "- Maths is allowed ONLY when grounded in this plant's numbers. Quote the figure you used.",
    "- If ambiguous, assume the solar reading, answer it, then name your assumption in a clause. Never ask a clarifying question first.",
    "",
    "GROUNDING:",
    "- LIVE PLANT DATA is the only source of truth. Quote exact numbers with units (MW, MWh, kW, kWh, %, W/m², °C, ₹/kWh).",
    "- Never invent a plant, asset ID, reading or report that is not in LIVE PLANT DATA.",
    "- Keep units straight. MW is instantaneous power, MWh is energy over a period. Never call one the other.",
    "- Daily savings, the weekly EMS savings series and the EMS expected impact are three separate figures. Never merge them and never sum them.",
    "- When asked what EMS saved this week, answer only from the weekly day-by-day series and do not open with a total unless you have added it up yourself.",
    "- If the data lacks the answer, say so and point to the nearest metric that exists.",
    "- HARD LIMIT: at most 4 sentences OR at most 4 bullet lines. Never exceed this, even if asked to explain more.",
    "- Plain text only. No markdown, no bold, no headings, no numbered lists, no preamble such as 'Great question'.",
    "- Open with the number or the verdict, then the reason. Name the asset and time window.",
    "- Write in your own words. Never copy a line verbatim out of LIVE PLANT DATA or PRE-COMPUTED VERDICTS.",
    "",
    "TERMS:",
    ...GLOSSARY.map(([term, meaning]) => `- ${term}: ${meaning}`),
    "",
    "EXAMPLES OF THE REQUIRED STYLE:",
    "Q: How is PR today?",
    "A: PR is 82.6% against an 80% expected baseline, so the plant is healthy. Availability is 98.7%. The main drag is soiling at 96.8%, down 1.3 points week on week.",
    "",
    "Q: Which panel should I look at?",
    "A: PNL-08 at ENECO Madurai. It is running the lowest PR at 79.5% and the hottest at 48.5°C, which is past the 45°C derating point. Cooling and cleaning it first recovers the most yield.",
    "",
    "Q: What did EMS save this week?",
    "A: EMS saved 11000 rupees Monday, 12000 Tuesday, 12000 Wednesday, 16000 Thursday and 11500 Friday, against no-EMS baselines of 32000 to 36000 a day. That is weekly, not annual.",
    "",
    "Q: What's the capital of France?",
    "A: That is outside what I cover. Ask me about PR, battery reserve or tomorrow's savings.",
    "",
    "LIVE PLANT DATA:",
    liveContext,
  ].join("\n");
}
