import { storage } from './storage';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { pgTable, varchar, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { sql as sqlOperator } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const zoneHistory = pgTable("zone_history", {
  id: varchar("id").primaryKey().default(sqlOperator`gen_random_uuid()`),
  zoneId: varchar("zone_id").notNull(),
  flowRate: numeric("flow_rate").notNull(),
  pressure: numeric("pressure").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  hour: integer("hour").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
});

async function seedHistoricalData() {
  console.log('📊 Seeding historical data for zones...');

  try {
    const zones = await storage.getZones();

    if (zones.length === 0) {
      console.log('❌ No zones found. Please run seed-zones.ts first.');
      process.exit(1);
    }

    // Generate data for last 24 hours (every 15 minutes = 96 data points per zone)
    const now = new Date();
    const dataPoints: any[] = [];

    for (const zone of zones) {
      console.log(`  Processing ${zone.name}...`);

      for (let i = 0; i < 96; i++) {
        const currentTime = new Date(now.getTime() - (i * 15 * 60 * 1000)); // 15 minutes intervals
        const hour = currentTime.getHours();
        const dayOfWeek = currentTime.getDay();

        // Calculate flow rate based on time of day patterns
        let flowMultiplier = 1.0;

        // Night (10 PM - 5 AM) - very low consumption (sleeping hours)
        if (hour >= 22 || hour < 5) {
          flowMultiplier = 0.3 + (Math.random() * 0.15);
        }
        // Early morning (5-6 AM) - starting to wake up
        else if (hour >= 5 && hour < 6) {
          flowMultiplier = 0.5 + (Math.random() * 0.2);
        }
        // Morning peak (6-9 AM) - breakfast, bathing, getting ready
        else if (hour >= 6 && hour < 9) {
          flowMultiplier = 1.3 + (Math.random() * 0.2);
        }
        // Late morning (9 AM - 12 PM) - moderate usage
        else if (hour >= 9 && hour < 12) {
          flowMultiplier = 0.7 + (Math.random() * 0.2);
        }
        // Afternoon (12 PM - 5 PM) - lunch time spike, then moderate
        else if (hour >= 12 && hour < 17) {
          flowMultiplier = 0.8 + (Math.random() * 0.25);
        }
        // Early evening (5-6 PM) - people returning home
        else if (hour >= 17 && hour < 18) {
          flowMultiplier = 1.1 + (Math.random() * 0.2);
        }
        // Evening peak (6-9 PM) - dinner, bathing, highest usage
        else if (hour >= 18 && hour < 21) {
          flowMultiplier = 1.5 + (Math.random() * 0.3);
        }
        // Late evening (9-10 PM) - winding down
        else {
          flowMultiplier = 0.6 + (Math.random() * 0.2);
        }

        // Weekend adjustment (slightly lower)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          flowMultiplier *= 0.9;
        }

        // Calculate pressure (inversely proportional to flow rate)
        const baseFlowRate = zone.flowRate * flowMultiplier;
        const basePressure = zone.pressure - (flowMultiplier - 1) * 15;

        // Add some random variance
        const flowRate = baseFlowRate * (0.95 + Math.random() * 0.1);
        const pressure = basePressure * (0.95 + Math.random() * 0.1);

        dataPoints.push({
          zoneId: zone.id,
          flowRate: flowRate.toString(),
          pressure: Math.max(35, pressure).toString(), // Minimum 35 PSI
          timestamp: currentTime,
        });
      }
    }

    // Insert all data points
    console.log(`  Inserting ${dataPoints.length} historical data points...`);

    // Batch insert in chunks of 100
    for (let i = 0; i < dataPoints.length; i += 100) {
      const chunk = dataPoints.slice(i, i + 100);
      await db.insert(zoneHistory).values(chunk);
    }

    console.log('\n🎉 Successfully seeded historical data!');
    console.log(`  Total data points: ${dataPoints.length}`);
    console.log(`  Zones covered: ${zones.length}`);
    console.log(`  Time range: Last 24 hours (15-minute intervals)`);

    // Show sample data for verification
    console.log('\n📈 Sample data points:');
    for (const zone of zones.slice(0, 2)) {
      const zoneSample = dataPoints.filter(d => d.zoneId === zone.id).slice(0, 3);
      console.log(`\n  ${zone.name}:`);
      zoneSample.forEach((d, idx) => {
        console.log(`    ${idx + 1}. Flow: ${Math.round(parseFloat(d.flowRate))} L/h, Pressure: ${Math.round(parseFloat(d.pressure))} PSI at ${d.timestamp.toLocaleTimeString()}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding historical data:', error);
    process.exit(1);
  }
}

seedHistoricalData();