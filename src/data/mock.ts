export const mockData = {
  plantStatus: {
    status: "Operational",
    panelsOnline: 39,
    totalPanels: 39,
    date: "01 OCT 2026",
    time: "14:30",
  },
  currentPower: {
    solarGenerationMw: 1.82,
    factoryLoadMw: 1.25,
    gridImportMw: 0.0,
    gridExportMw: 0.15,
    batteryChargeMw: 0.42,
    batteryDischargeMw: 0.0,
    directToFactoryMw: 1.25,
    toBatteryMw: 0.42,
    toGridMw: 0.15,
    selfConsumptionRatio: 91.7,
    surplusMw: 0.57, // solar - load
  },
  energyToday: {
    solarGenerationMwh: 9.6,
    factoryConsumptionMwh: 18.7,
    expectedGenerationMwh: 10.2,
    peakDemandMw: 2.63,
    demandLimitMw: 3.0,
    gridImportMwh: 9.2,
    gridExportMwh: 1.1,
  },
  performance: {
    status: "Healthy",
    pr: 82.6,
    epi: 101.4,
    availability: 98.7,
    soilingRatio: 96.8,
  },
  solarConditions: {
    ghi: 742,
    dni: 618,
    temp: 31.4,
    wind: 4.8,
    cloud: 18,
  },
  battery: {
    soc: 68,
    state: "Charging", // Charging, Discharging, Idle, Reserve, Full
    usableEnergyMwh: 1.36,
    ratedCapacityMwh: 2.0,
    minReserve: 25,
    maxReserve: 90,
    soh: 91,
    rte: 89,
    cycleCount: 642,
    degradationRate: 4.8,
    recommendedReserveForEvening: 42,
    chargePowerMw: 0.42,
    dischargePowerMw: 0.0,
  },
  forecastTomorrow: {
    pvGenerationMwh: 14.8,
    pvUncertainty: 1.6,
    factoryDemandMwh: 19.5,
    demandUncertainty: 1.1,
    expectedEveningPeak: "18:00–20:00",
  },
  tariffs: {
    current: 4.80,
    nextChangeTime: "18:00",
    nextTariff: 9.40,
    timeline: [
      { time: "10:00", price: 5.20, type: "normal" },
      { time: "14:00", price: 4.80, type: "low" },
      { time: "18:00", price: 9.40, type: "high" },
      { time: "20:00", price: 9.40, type: "high" },
      { time: "23:00", price: 5.10, type: "normal" }
    ]
  },
  costProjection: {
    baselineCostToday: 34200,
    optimizedCostToday: 21750,
    estimatedSavingToday: 12450,
    avoidedGridKwh: 1450,
    shiftedBatteryKwh: 680,
    peakDemandReductionMw: 0.8
  },
  emsRecommendations: [
    {
      action: "Charge Battery",
      reason: "570 kW solar surplus available. Storing energy before evening peak.",
      priority: "high"
    },
    {
      action: "Avoid Grid Export",
      reason: "Current grid export tariff is negligible. Prioritize battery charging.",
      priority: "medium"
    }
  ],
  aiDecision: {
    action: "Charging Battery from Surplus",
    reason: "Grid tariff is currently low (₹4.80/kWh) and solar generation exceeds demand by 570 kW. AI predicts a load peak at 18:00 when tariff reaches ₹9.40/kWh. Pre-charging to maximize arbitrage savings.",
    expectedImpact: "Peak demand reduced by 0.8 MW. Estimated evening savings: ₹2,400."
  },
  events: [
    {
      id: 1,
      asset: "PNL-04",
      message: "Communication restored",
      type: "info",
      time: "14:12",
    },
    {
      id: 2,
      asset: "PNL-02",
      message: "Temperature warning cleared",
      type: "info",
      time: "13:45",
    },
    {
      id: 3,
      asset: "Plant",
      message: "Scheduled maintenance tomorrow",
      type: "maintenance",
      time: "09:00",
    }
  ],
  predictedEvents: [
    {
      id: 1,
      asset: "PNL-08",
      message: "Likely thermal runaway or inverter trip if temp exceeds 50°C",
      probability: 85,
      expectedTime: "Tomorrow 14:00"
    },
    {
      id: 2,
      asset: "Grid Connection",
      message: "High risk of grid instability due to incoming storm",
      probability: 60,
      expectedTime: "Tomorrow 22:00"
    },
    {
      id: 3,
      asset: "Plant",
      message: "Soiling losses expected to exceed 5% without cleaning",
      probability: 95,
      expectedTime: "Next Week"
    }
  ],
  notifications: [
    {
      id: 1,
      title: "Panel PNL-08 temperature warning",
      message: "Internal temperature reached 48.5°C. Output is derated until it falls below 45°C.",
      type: "warning",
      time: "14:22",
      read: false,
    },
    {
      id: 2,
      title: "Grid import near limit",
      message: "Import peaked at 2.63 MW against the 3.00 MW demand limit. Recommend deferring non-essential load.",
      type: "critical",
      time: "11:55",
      read: true,
    }
  ],
  panels: [
    { id: "PNL-01", status: "Normal", acKw: 225, dcKw: 236, eff: 95.3, temp: 42.1, energyMwh: 1.18, pr: 82.1 },
    { id: "PNL-02", status: "Normal", acKw: 228, dcKw: 240, eff: 95.0, temp: 43.5, energyMwh: 1.19, pr: 82.4 },
    { id: "PNL-03", status: "Normal", acKw: 226, dcKw: 237, eff: 95.4, temp: 41.8, energyMwh: 1.20, pr: 82.5 },
    { id: "PNL-04", status: "Normal", acKw: 168, dcKw: 176, eff: 95.4, temp: 43.2, energyMwh: 1.21, pr: 84.1 },
    { id: "PNL-05", status: "Normal", acKw: 220, dcKw: 231, eff: 95.2, temp: 42.6, energyMwh: 1.16, pr: 81.9 },
    { id: "PNL-06", status: "Normal", acKw: 230, dcKw: 241, eff: 95.4, temp: 41.9, energyMwh: 1.22, pr: 83.0 },
    { id: "PNL-07", status: "Normal", acKw: 224, dcKw: 235, eff: 95.3, temp: 42.0, energyMwh: 1.17, pr: 82.2 },
    { id: "PNL-08", status: "Warning", acKw: 200, dcKw: 212, eff: 94.3, temp: 48.5, energyMwh: 1.07, pr: 79.5 },
    { id: "PNL-09", status: "Normal", acKw: 225, dcKw: 236, eff: 95.3, temp: 42.1, energyMwh: 1.18, pr: 82.1 },
    { id: "PNL-10", status: "Normal", acKw: 226, dcKw: 238, eff: 95.1, temp: 42.3, energyMwh: 1.19, pr: 82.2 },
    { id: "PNL-11", status: "Normal", acKw: 227, dcKw: 239, eff: 95.2, temp: 42.4, energyMwh: 1.20, pr: 82.3 },
    { id: "PNL-12", status: "Normal", acKw: 224, dcKw: 235, eff: 95.0, temp: 42.2, energyMwh: 1.17, pr: 82.0 },
    { id: "PNL-13", status: "Normal", acKw: 229, dcKw: 241, eff: 95.4, temp: 42.6, energyMwh: 1.21, pr: 82.5 },
    { id: "PNL-14", status: "Normal", acKw: 223, dcKw: 234, eff: 95.1, temp: 42.1, energyMwh: 1.16, pr: 81.9 },
    { id: "PNL-15", status: "Normal", acKw: 228, dcKw: 240, eff: 95.3, temp: 42.5, energyMwh: 1.19, pr: 82.4 },
    { id: "PNL-16", status: "Normal", acKw: 225, dcKw: 237, eff: 95.2, temp: 42.2, energyMwh: 1.18, pr: 82.1 },
    { id: "PNL-17", status: "Normal", acKw: 226, dcKw: 238, eff: 95.1, temp: 42.3, energyMwh: 1.19, pr: 82.2 },
    { id: "PNL-18", status: "Normal", acKw: 227, dcKw: 239, eff: 95.2, temp: 42.4, energyMwh: 1.20, pr: 82.3 },
    { id: "PNL-19", status: "Normal", acKw: 224, dcKw: 235, eff: 95.0, temp: 42.2, energyMwh: 1.17, pr: 82.0 },
    { id: "PNL-20", status: "Normal", acKw: 229, dcKw: 241, eff: 95.4, temp: 42.6, energyMwh: 1.21, pr: 82.5 },
    { id: "PNL-21", status: "Normal", acKw: 223, dcKw: 234, eff: 95.1, temp: 42.1, energyMwh: 1.16, pr: 81.9 },
    { id: "PNL-22", status: "Normal", acKw: 228, dcKw: 240, eff: 95.3, temp: 42.5, energyMwh: 1.19, pr: 82.4 },
    { id: "PNL-23", status: "Normal", acKw: 225, dcKw: 237, eff: 95.2, temp: 42.2, energyMwh: 1.18, pr: 82.1 },
    { id: "PNL-24", status: "Normal", acKw: 226, dcKw: 238, eff: 95.1, temp: 42.3, energyMwh: 1.19, pr: 82.2 },
    { id: "PNL-25", status: "Normal", acKw: 227, dcKw: 239, eff: 95.2, temp: 42.4, energyMwh: 1.20, pr: 82.3 },
    { id: "PNL-26", status: "Normal", acKw: 224, dcKw: 235, eff: 95.0, temp: 42.2, energyMwh: 1.17, pr: 82.0 },
    { id: "PNL-27", status: "Normal", acKw: 229, dcKw: 241, eff: 95.4, temp: 42.6, energyMwh: 1.21, pr: 82.5 },
    { id: "PNL-28", status: "Normal", acKw: 223, dcKw: 234, eff: 95.1, temp: 42.1, energyMwh: 1.16, pr: 81.9 },
    { id: "PNL-29", status: "Normal", acKw: 228, dcKw: 240, eff: 95.3, temp: 42.5, energyMwh: 1.19, pr: 82.4 },
    { id: "PNL-30", status: "Normal", acKw: 225, dcKw: 237, eff: 95.2, temp: 42.2, energyMwh: 1.18, pr: 82.1 },
    { id: "PNL-31", status: "Normal", acKw: 226, dcKw: 238, eff: 95.1, temp: 42.3, energyMwh: 1.19, pr: 82.2 },
    { id: "PNL-32", status: "Normal", acKw: 227, dcKw: 239, eff: 95.2, temp: 42.4, energyMwh: 1.20, pr: 82.3 },
    { id: "PNL-33", status: "Normal", acKw: 224, dcKw: 235, eff: 95.0, temp: 42.2, energyMwh: 1.17, pr: 82.0 },
    { id: "PNL-34", status: "Normal", acKw: 229, dcKw: 241, eff: 95.4, temp: 42.6, energyMwh: 1.21, pr: 82.5 },
    { id: "PNL-35", status: "Normal", acKw: 223, dcKw: 234, eff: 95.1, temp: 42.1, energyMwh: 1.16, pr: 81.9 },
    { id: "PNL-36", status: "Normal", acKw: 228, dcKw: 240, eff: 95.3, temp: 42.5, energyMwh: 1.19, pr: 82.4 },
    { id: "PNL-37", status: "Normal", acKw: 225, dcKw: 237, eff: 95.2, temp: 42.2, energyMwh: 1.18, pr: 82.1 },
    { id: "PNL-38", status: "Normal", acKw: 226, dcKw: 238, eff: 95.1, temp: 42.3, energyMwh: 1.19, pr: 82.2 },
    { id: "PNL-39", status: "Normal", acKw: 227, dcKw: 239, eff: 95.2, temp: 42.4, energyMwh: 1.20, pr: 82.3 },
  ],
  hourlyForecast: [
    { hour: '00:00', pv: 0, load: 0.8 },
    { hour: '04:00', pv: 0, load: 0.9 },
    { hour: '08:00', pv: 0.5, load: 1.8 },
    { hour: '12:00', pv: 1.8, load: 2.2 },
    { hour: '16:00', pv: 1.2, load: 2.1 },
    { hour: '20:00', pv: 0, load: 1.4 },
    { hour: '23:59', pv: 0, load: 0.8 },
  ]
};
