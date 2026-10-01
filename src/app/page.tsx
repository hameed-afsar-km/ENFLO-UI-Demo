import { PlantStatusHeader } from "@/components/PlantStatusHeader";
import { CurrentPowerCard } from "@/components/CurrentPowerCard";
import { EnergyFlowCard } from "@/components/EnergyFlowCard";
import { PerformanceCard } from "@/components/PerformanceCard";
import { WeatherCard } from "@/components/WeatherCard";
import { EventsCard } from "@/components/EventsCard";
import { ForecastCard } from "@/components/ForecastCard";
import { YieldBarChartCard } from "@/components/YieldBarChartCard";
import { DistributionPieChartCard } from "@/components/DistributionPieChartCard";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <PlantStatusHeader />
      
      {/* Asymmetrical Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Row 1: Left - Power Overview (Wide), Right - Energy Flow (Narrower) */}
        <div className="md:col-span-7 lg:col-span-7 flex flex-col">
          <CurrentPowerCard />
        </div>
        
        <div className="md:col-span-5 lg:col-span-5 flex flex-col">
          <EnergyFlowCard />
        </div>

        {/* Row 2: Charts (Visualizations) */}
        <div className="md:col-span-12 lg:col-span-7 flex flex-col">
          <YieldBarChartCard />
        </div>
        
        <div className="md:col-span-12 lg:col-span-5 flex flex-col">
          <DistributionPieChartCard />
        </div>
        
        {/* Row 3: Performance, Weather, Events */}
        <div className="md:col-span-6 lg:col-span-4 flex flex-col">
          <PerformanceCard />
        </div>
        
        <div className="md:col-span-6 lg:col-span-3 flex flex-col">
          <WeatherCard />
        </div>
        
        <div className="md:col-span-12 lg:col-span-5 flex flex-col max-h-[400px]">
          <EventsCard />
        </div>
        
        {/* Row 4: Forecast (Full width) */}
        <div className="md:col-span-12 flex flex-col">
          <ForecastCard />
        </div>

      </div>
    </div>
  );
}
