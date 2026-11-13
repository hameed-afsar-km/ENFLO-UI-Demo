export const PLANTS = ["ENERCO Chennai", "ENERCO Coimbatore", "ENERCO Madurai"] as const;

export type PlantName = (typeof PLANTS)[number];

export const PLANT_PANELS: Record<string, string[]> = {
  "ENERCO Chennai": ['PNL-01', 'PNL-02', 'PNL-03', 'PNL-04', 'PNL-10', 'PNL-11', 'PNL-12', 'PNL-13', 'PNL-14', 'PNL-15', 'PNL-16', 'PNL-17', 'PNL-18', 'PNL-19'],
  "ENERCO Coimbatore": ['PNL-05', 'PNL-06', 'PNL-07', 'PNL-20', 'PNL-21', 'PNL-22', 'PNL-23', 'PNL-24', 'PNL-25', 'PNL-26', 'PNL-27', 'PNL-28', 'PNL-29'],
  "ENERCO Madurai": ['PNL-08', 'PNL-09', 'PNL-30', 'PNL-31', 'PNL-32', 'PNL-33', 'PNL-34', 'PNL-35', 'PNL-36', 'PNL-37', 'PNL-38', 'PNL-39'],
};

const PLANT_ALIASES: Array<[PlantName, RegExp]> = [
  ["ENERCO Chennai", /chennai|pl-0?1\b/i],
  ["ENERCO Coimbatore", /coimbatore|kovai|pl-0?2\b/i],
  ["ENERCO Madurai", /madurai|pl-0?3\b/i],
];

export function getPanelIdsForPlant(plant: string | null | undefined): string[] {
  if (!plant) return [];
  return PLANT_PANELS[plant] ?? [];
}

export function detectPlantName(text: string, selectedPlant?: string | null): string | null {
  for (const [plant, pattern] of PLANT_ALIASES) {
    if (pattern.test(text)) return plant;
  }
  if (selectedPlant && PLANTS.includes(selectedPlant as PlantName)) return selectedPlant;
  return null;
}

export function panelIdsFromText(text: string): string[] {
  const ids = new Set<string>();
  const matches = text.matchAll(/pnl[\s-]?0?(\d{1,2})/gi);
  for (const match of matches) {
    const n = Number(match[1]);
    if (Number.isFinite(n) && n >= 1 && n <= 39) {
      ids.add(`PNL-${String(n).padStart(2, "0")}`);
    }
  }
  return [...ids];
}
