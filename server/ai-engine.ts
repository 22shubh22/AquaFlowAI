
import type { Zone, Pump, WaterSource } from './storage';

interface SensorData {
  zoneId: string;
  timestamp: Date;
  flowRate: number;
  pressure: number;
  consumption: number;
}

interface AnomalyDetection {
  type: 'excess_pumping' | 'leak_detected' | 'pressure_drop' | 'irregular_pattern';
  zoneId: string;
  zoneName: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  confidence: number;
  detectedAt: Date;
}

interface OptimalSchedule {
  pumpId: string;
  zoneId: string;
  startTime: string;
  endTime: string;
  flowRate: number;
  reason: string;
}

export class AIEngine {
  
  // Calculate dynamic zone status based on multiple factors
  calculateZoneStatus(
    zone: Zone, 
    historicalData: SensorData[], 
    currentTime: Date
  ): 'optimal' | 'low-pressure' | 'high-demand' | 'maintenance' {
    const hour = currentTime.getHours();
    const recentData = historicalData.slice(-12); // Last 12 readings
    
    if (recentData.length === 0) return 'optimal';
    
    const avgPressure = recentData.reduce((sum, d) => sum + d.pressure, 0) / recentData.length;
    const avgFlow = recentData.reduce((sum, d) => sum + d.flowRate, 0) / recentData.length;
    
    // Peak hours: 6-9 AM and 6-9 PM
    const isPeakHour = (hour >= 6 && hour <= 9) || (hour >= 18 && hour <= 21);
    
    // Low pressure detection
    if (avgPressure < 38) {
      return 'low-pressure';
    }
    
    // High demand during peak hours
    if (isPeakHour && avgFlow > zone.flowRate * 1.3) {
      return 'high-demand';
    }
    
    // Check for maintenance issues (erratic pressure)
    const pressureVariance = this.calculateVariance(recentData.map(d => d.pressure));
    if (pressureVariance > 100) {
      return 'maintenance';
    }
    
    return 'optimal';
  }
  
  // Predict flow rate based on time, population, and historical patterns
  predictFlowRate(
    zone: Zone,
    historicalData: SensorData[],
    currentTime: Date
  ): number {
    const hour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay();
    
    // Get historical data for same hour
    const sameHourData = historicalData.filter(d => {
      const dataHour = new Date(d.timestamp).getHours();
      return dataHour === hour;
    });
    
    if (sameHourData.length === 0) {
      return zone.flowRate;
    }
    
    // Calculate base flow from historical average
    const avgHistoricalFlow = sameHourData.reduce((sum, d) => sum + d.flowRate, 0) / sameHourData.length;
    
    // Population-based adjustment
    const populationFactor = zone.population / 50000; // Normalize to 50k base
    
    // Peak hour multiplier
    const isPeakHour = (hour >= 6 && hour <= 9) || (hour >= 18 && hour <= 21);
    const peakMultiplier = isPeakHour ? 1.4 : 1.0;
    
    // Weekend adjustment (lower commercial usage)
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.85 : 1.0;
    
    // Calculate predicted flow
    const predictedFlow = avgHistoricalFlow * populationFactor * peakMultiplier * weekendFactor;
    
    // Add some variance for realism
    const variance = (Math.random() - 0.5) * 0.1; // ±5%
    return Math.round(predictedFlow * (1 + variance));
  }
  
  // Detect anomalies using statistical analysis
  detectAnomalies(
    zones: Zone[],
    historicalData: Map<string, SensorData[]>,
    pumps: Pump[]
  ): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const currentTime = new Date();
    
    for (const zone of zones) {
      const zoneData = historicalData.get(zone.id) || [];
      if (zoneData.length < 10) continue;
      
      const recent = zoneData.slice(-20);
      const avgPressure = recent.reduce((sum, d) => sum + d.pressure, 0) / recent.length;
      const avgFlow = recent.reduce((sum, d) => sum + d.flowRate, 0) / recent.length;
      
      // 1. Detect pressure drops (potential leaks)
      const pressureDrop = avgPressure < 35;
      const flowIncreased = avgFlow > zone.flowRate * 1.2;
      
      if (pressureDrop && flowIncreased) {
        anomalies.push({
          type: 'leak_detected',
          zoneId: zone.id,
          zoneName: zone.name,
          severity: 'critical',
          message: `Possible leak detected: Pressure at ${Math.round(avgPressure)} PSI while flow increased ${Math.round((avgFlow / zone.flowRate - 1) * 100)}%`,
          confidence: 0.85,
          detectedAt: currentTime
        });
      }
      
      // 2. Detect excess pumping
      const zonePumps = pumps.filter(p => p.zoneId === zone.id && p.status === 'active');
      const totalPumpCapacity = zonePumps.reduce((sum, p) => sum + p.flowRate, 0);
      
      if (totalPumpCapacity > zone.population * 2) { // Excessive for population
        anomalies.push({
          type: 'excess_pumping',
          zoneId: zone.id,
          zoneName: zone.name,
          severity: 'warning',
          message: `Excess pumping detected: ${zonePumps.length} pumps active with ${totalPumpCapacity} L/h capacity for population of ${zone.population}`,
          confidence: 0.92,
          detectedAt: currentTime
        });
      }
      
      // 3. Detect irregular patterns (statistical outliers)
      const flowVariance = this.calculateVariance(recent.map(d => d.flowRate));
      const flowStdDev = Math.sqrt(flowVariance);
      
      if (flowStdDev > avgFlow * 0.5) { // High variance
        anomalies.push({
          type: 'irregular_pattern',
          zoneId: zone.id,
          zoneName: zone.name,
          severity: 'info',
          message: `Irregular consumption pattern detected. Standard deviation: ${Math.round(flowStdDev)} L/h`,
          confidence: 0.75,
          detectedAt: currentTime
        });
      }
      
      // 4. Low pressure alert
      if (avgPressure < 38 && !pressureDrop) {
        anomalies.push({
          type: 'pressure_drop',
          zoneId: zone.id,
          zoneName: zone.name,
          severity: 'warning',
          message: `Low pressure detected: ${Math.round(avgPressure)} PSI (threshold: 40 PSI)`,
          confidence: 0.88,
          detectedAt: currentTime
        });
      }
    }
    
    return anomalies;
  }
  
  // Generate optimal pump schedules using AI
  generateOptimalSchedules(
    zones: Zone[],
    pumps: Pump[],
    sources: WaterSource[],
    historicalData: Map<string, SensorData[]>
  ): OptimalSchedule[] {
    const schedules: OptimalSchedule[] = [];
    const currentTime = new Date();
    
    // Analyze each zone's needs
    for (const zone of zones) {
      const zoneHistory = historicalData.get(zone.id) || [];
      const zonePumps = pumps.filter(p => p.zoneId === zone.id);
      
      // Calculate demand curve for next 24 hours
      const demandCurve = this.predictDemandCurve(zone, zoneHistory);
      
      // Find peak demand periods
      const peakPeriods = demandCurve.filter(d => d.demand > zone.flowRate * 1.2);
      
      for (const pump of zonePumps) {
        // Schedule pumps to run during peak demand
        if (peakPeriods.length > 0) {
          const earliestPeak = peakPeriods[0];
          const latestPeak = peakPeriods[peakPeriods.length - 1];
          
          // Distribute pumps across peak hours
          const startHour = earliestPeak.hour;
          const endHour = latestPeak.hour;
          
          schedules.push({
            pumpId: pump.id,
            zoneId: zone.id,
            startTime: `${String(startHour).padStart(2, '0')}:00`,
            endTime: `${String(endHour).padStart(2, '0')}:00`,
            flowRate: Math.round(earliestPeak.demand / zonePumps.length),
            reason: `Peak demand predicted: ${earliestPeak.demand} L/h for ${zone.name} (Population: ${zone.population})`
          });
        } else {
          // Standard schedule for normal demand
          schedules.push({
            pumpId: pump.id,
            zoneId: zone.id,
            startTime: '06:00',
            endTime: '09:00',
            flowRate: pump.flowRate,
            reason: `Standard morning supply for ${zone.name}`
          });
          
          schedules.push({
            pumpId: pump.id,
            zoneId: zone.id,
            startTime: '18:00',
            endTime: '21:00',
            flowRate: pump.flowRate,
            reason: `Standard evening supply for ${zone.name}`
          });
        }
      }
    }
    
    return schedules;
  }
  
  // Predict demand curve for next 24 hours
  private predictDemandCurve(
    zone: Zone,
    historicalData: SensorData[]
  ): Array<{ hour: number; demand: number }> {
    const curve = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const hourData = historicalData.filter(d => 
        new Date(d.timestamp).getHours() === hour
      );
      
      const avgDemand = hourData.length > 0
        ? hourData.reduce((sum, d) => sum + d.flowRate, 0) / hourData.length
        : zone.flowRate;
      
      // Apply population factor
      const populationFactor = zone.population / 50000;
      const predictedDemand = avgDemand * populationFactor;
      
      curve.push({ hour, demand: Math.round(predictedDemand) });
    }
    
    return curve;
  }
  
  // Calculate variance for anomaly detection
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  // Equity score calculation (how fair is distribution)
  calculateEquityScore(zones: Zone[]): number {
    if (zones.length === 0) return 100;
    
    // Calculate per-capita flow rate for each zone
    const perCapitaFlows = zones.map(z => z.flowRate / (z.population / 1000));
    
    // Calculate coefficient of variation (lower is more equitable)
    const mean = perCapitaFlows.reduce((sum, val) => sum + val, 0) / perCapitaFlows.length;
    const variance = this.calculateVariance(perCapitaFlows);
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;
    
    // Convert to 0-100 score (lower CV = higher score)
    const equityScore = Math.max(0, 100 - (coefficientOfVariation * 100));
    
    return Math.round(equityScore);
  }
}

export const aiEngine = new AIEngine();
