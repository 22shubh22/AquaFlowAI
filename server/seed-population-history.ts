
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { sql as sqlOperator } from "drizzle-orm";
import { storage } from './storage';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const populationHistory = pgTable("population_history", {
  id: varchar("id").primaryKey().default(sqlOperator`gen_random_uuid()`),
  zoneId: varchar("zone_id").notNull(),
  population: integer("population").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

async function seedPopulationHistory() {
  console.log('📊 Seeding population history for zones (30 years of yearly data)...');

  try {
    const zones = await storage.getZones();
    
    if (zones.length === 0) {
      console.log('❌ No zones found. Please run seed-zones.ts first.');
      process.exit(1);
    }

    // Clear existing population history
    console.log('  Clearing existing population history...');
    await db.delete(populationHistory);

    // Generate data for last 30 years (yearly snapshots)
    const now = new Date();
    const currentYear = now.getFullYear();
    const dataPoints: any[] = [];

    for (const zone of zones) {
      const currentPopulation = zone.population || 50000;
      
      // Generate 30 years of historical data (yearly snapshots)
      // Use a consistent growth rate for this zone
      const annualGrowthRate = 0.015 + Math.random() * 0.015; // 1.5% to 3% annual growth
      
      for (let yearOffset = 30; yearOffset >= 0; yearOffset--) {
        const year = currentYear - yearOffset;
        // Set timestamp to January 1st of each year at midnight
        const timestamp = new Date(year, 0, 1, 0, 0, 0);
        
        // Calculate population for this year
        // Start from a base population 30 years ago and grow forward
        const yearsFromStart = 30 - yearOffset; // How many years have passed since 30 years ago
        
        // Calculate what the population was 30 years ago
        const populationThirtyYearsAgo = Math.round(currentPopulation / Math.pow(1 + annualGrowthRate, 30));
        
        // Now calculate population for this specific year by growing from that base
        const growthFactor = Math.pow(1 + annualGrowthRate, yearsFromStart);
        
        // Add some random variation (±2% for historical fluctuations)
        const variation = 1 + (Math.random() - 0.5) * 0.04;
        const population = Math.round(populationThirtyYearsAgo * growthFactor * variation);
        
        dataPoints.push({
          zoneId: zone.id,
          population,
          timestamp,
        });
      }
    }

    // Insert all data points
    console.log(`  Inserting ${dataPoints.length} population history data points...`);
    
    // Batch insert in chunks of 100
    for (let i = 0; i < dataPoints.length; i += 100) {
      const chunk = dataPoints.slice(i, i + 100);
      await db.insert(populationHistory).values(chunk);
    }

    console.log('\n🎉 Successfully seeded population history!');
    console.log(`  Total data points: ${dataPoints.length}`);
    console.log(`  Zones covered: ${zones.length}`);
    console.log(`  Time range: Last 30 years (yearly snapshots from ${currentYear - 30} to ${currentYear})`);
    
    // Show sample data for verification
    console.log('\n📈 Sample data points:');
    for (const zone of zones.slice(0, 2)) {
      const zoneSample = dataPoints.filter(d => d.zoneId === zone.id).slice(0, 5);
      console.log(`\n  ${zone.name}:`);
      zoneSample.forEach((d, idx) => {
        const year = d.timestamp.getFullYear();
        console.log(`    ${year}: Population ${d.population.toLocaleString()}`);
      });
      
      // Show growth trend
      const zoneData = dataPoints.filter(d => d.zoneId === zone.id);
      const oldestPop = zoneData[0].population;
      const newestPop = zoneData[zoneData.length - 1].population;
      const totalGrowth = ((newestPop - oldestPop) / oldestPop * 100).toFixed(1);
      console.log(`    Total growth over 30 years: ${totalGrowth}%`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding population history:', error);
    process.exit(1);
  }
}

seedPopulationHistory();
