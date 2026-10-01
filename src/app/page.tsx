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
      
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        
        {/* Row 1: Left - Current Power (Large), Right - Energy Flow */}
        <div className="lg:col-span-2 row-span-1">
          <CurrentPowerCard />
        </div>
        
        <div className="lg:col-span-1 row-span-1">
          <EnergyFlowCard />
        </div>
        
        {/* Row 2: Performance, Weather, Events */}
        <div className="lg:col-span-1">
          <PerformanceCard />
        </div>
        
        <div className="lg:col-span-1">
          <WeatherCard />
        </div>
        
        <div className="lg:col-span-1 h-80 lg:h-auto">
          <EventsCard />
        </div>
        
        {/* Row 3: Yield Bar Chart, Distribution Pie Chart */}
        <div className="lg:col-span-2">
          <YieldBarChartCard />
        </div>
        
        <div className="lg:col-span-1">
          <DistributionPieChartCard />
        </div>
        
        {/* Row 4: Forecast (Large span) */}
        <div className="lg:col-span-3">
          <ForecastCard />
        </div>

      </div>
    </div>
  );
}
