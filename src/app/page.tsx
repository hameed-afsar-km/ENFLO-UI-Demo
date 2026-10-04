import { PlantStatusHeader } from "@/components/PlantStatusHeader";
import { CurrentPowerCard } from "@/components/CurrentPowerCard";
import { EnergyFlowCard } from "@/components/EnergyFlowCard";
import { PerformanceCard } from "@/components/PerformanceCard";
import { WeatherCard } from "@/components/WeatherCard";
import { EventsCard } from "@/components/EventsCard";
import { ForecastCard } from "@/components/ForecastCard";
import { YieldBarChartCard } from "@/components/YieldBarChartCard";
import { DistributionPieChartCard } from "@/components/DistributionPieChartCard";
import { EmsOptimizerCard } from "@/components/EmsOptimizerCard";
import { BatteryDetailCard } from "@/components/BatteryDetailCard";
import { WhatIfSimulationCard } from "@/components/WhatIfSimulationCard";
import { TariffTimelineCard } from "@/components/TariffTimelineCard";
import { CostAnalysisCard } from "@/components/CostAnalysisCard";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <PlantStatusHeader />
      
      {/* Asymmetrical Bento Grid Layout for EMS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* ROW 1: Flow and KPIs */}
        <div className="md:col-span-12 lg:col-span-7 flex flex-col">
          <EnergyFlowCard />
        </div>
        
        <div className="md:col-span-12 lg:col-span-5 flex flex-col">
          <CurrentPowerCard />
        </div>

        {/* ROW 2: AI Optimization, Battery, Tariffs, Costs */}
        <div className="md:col-span-12 flex flex-col">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4">Intelligent Optimization</h3>
        </div>

        <div className="md:col-span-12 lg:col-span-6 flex flex-col">
          <EmsOptimizerCard />
        </div>
        
        <div className="md:col-span-6 lg:col-span-3 flex flex-col">
          <BatteryDetailCard />
        </div>
        
        <div className="md:col-span-6 lg:col-span-3 flex flex-col gap-6">
          <div className="flex-1">
             <TariffTimelineCard />
          </div>
          <div className="flex-1">
             <CostAnalysisCard />
          </div>
        </div>

        {/* ROW 3: Charts and Analytics */}
        <div className="md:col-span-12 flex flex-col">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4">Analytics & Metrics</h3>
        </div>

        <div className="md:col-span-12 lg:col-span-7 flex flex-col">
          <YieldBarChartCard />
        </div>
        
        <div className="md:col-span-12 lg:col-span-5 flex flex-col">
          <DistributionPieChartCard />
        </div>
        
        {/* ROW 4: Operations & Environment */}
        <div className="md:col-span-6 lg:col-span-4 flex flex-col">
          <PerformanceCard />
        </div>
        
        <div className="md:col-span-6 lg:col-span-3 flex flex-col">
          <WeatherCard />
        </div>
        
        <div className="md:col-span-12 lg:col-span-5 flex flex-col max-h-[400px]">
          <EventsCard />
        </div>
        
        {/* ROW 5: Forecast */}
        <div className="md:col-span-12 flex flex-col">
          <ForecastCard />
        </div>

      </div>
    </div>
  );
}
