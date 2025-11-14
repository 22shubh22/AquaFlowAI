
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
  console.log('📊 Seeding population history for zones...');

  try {
    const zones = await storage.getZones();
    
    if (zones.length === 0) {
      console.log('❌ No zones found. Please run seed-zones.ts first.');
      process.exit(1);
    }

    // Generate data for last 30 days (daily snapshots)
    const now = new Date();
    const dataPoints: any[] = [];

    for (const zone of zones) {
      const basePopulation = zone.population || 50000;
      
      // Generate 30 days of historical data
      for (let day = 30; day >= 0; day--) {
        const timestamp = new Date(now.getTime() - day * 24 * 3600000);
        
        // Simulate gradual population changes (0.5% to 1.5% growth per month)
        const growthFactor = 1 + (30 - day) / 30 * (Math.random() * 0.01 + 0.005);
        const dailyVariation = (Math.random() - 0.5) * 0.002; // ±0.2% daily variation
        const population = Math.round(basePopulation * growthFactor * (1 + dailyVariation));
        
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
    console.log(`  Time range: Last 30 days (daily snapshots)`);
    
    // Show sample data for verification
    console.log('\n📈 Sample data points:');
    for (const zone of zones.slice(0, 2)) {
      const zoneSample = dataPoints.filter(d => d.zoneId === zone.id).slice(0, 3);
      console.log(`\n  ${zone.name}:`);
      zoneSample.forEach((d, idx) => {
        console.log(`    ${idx + 1}. Population: ${d.population.toLocaleString()} at ${d.timestamp.toLocaleDateString()}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding population history:', error);
    process.exit(1);
  }
}

seedPopulationHistory();
