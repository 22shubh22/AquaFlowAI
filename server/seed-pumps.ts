
import { storage } from './storage';

async function seedPumps() {
  console.log('⚙️ Seeding pumps...');
  
  try {
    // First, get all zones and sources to map them correctly
    const zones = await storage.getZones();
    const sources = await storage.getWaterSources();
    
    console.log('Available zones:', zones.map(z => ({ name: z.name, id: z.id })));
    console.log('Available sources:', sources.map(s => ({ name: s.name, id: s.id })));
    
    // Map zones by name for easier lookup
    const zoneMap: Record<string, string> = {};
    zones.forEach(z => {
      zoneMap[z.name] = z.id;
    });
    
    // Map sources by name
    const sourceMap: Record<string, string> = {};
    sources.forEach(s => {
      sourceMap[s.name] = s.id;
    });
    
    const pumps = [
      {
        id: "pump-1",
        zoneName: "Civil Lines",
        sourceName: "Shivnath River Intake",
        status: "active" as const,
        schedule: "06:00-22:00",
        flowRate: 6250,
      },
      {
        id: "pump-2",
        zoneName: "Civil Lines",
        sourceName: "Shivnath River Intake",
        status: "active" as const,
        schedule: "06:00-22:00",
        flowRate: 6250,
      },
      {
        id: "pump-3",
        zoneName: "Shankar Nagar",
        sourceName: "Tandula Reservoir",
        status: "active" as const,
        schedule: "05:00-23:00",
        flowRate: 7900,
      },
      {
        id: "pump-4",
        zoneName: "Shankar Nagar",
        sourceName: "Tandula Reservoir",
        status: "active" as const,
        schedule: "05:00-23:00",
        flowRate: 7900,
      },
      {
        id: "pump-5",
        zoneName: "Telibandha",
        sourceName: "Kharun River Station",
        status: "maintenance" as const,
        schedule: "07:00-21:00",
        flowRate: 4600,
      },
      {
        id: "pump-6",
        zoneName: "Telibandha",
        sourceName: "Kharun River Station",
        status: "active" as const,
        schedule: "07:00-21:00",
        flowRate: 4600,
      },
      {
        id: "pump-7",
        zoneName: "Pandri",
        sourceName: "Civil Lines Borewell",
        status: "active" as const,
        schedule: "06:00-22:00",
        flowRate: 7150,
      },
      {
        id: "pump-8",
        zoneName: "Pandri",
        sourceName: "Civil Lines Borewell",
        status: "active" as const,
        schedule: "06:00-22:00",
        flowRate: 7150,
      },
      {
        id: "pump-9",
        zoneName: "Mowa",
        sourceName: "Mahadev Ghat Lake",
        status: "active" as const,
        schedule: "05:00-23:00",
        flowRate: 9250,
      },
      {
        id: "pump-10",
        zoneName: "Mowa",
        sourceName: "Mahadev Ghat Lake",
        status: "active" as const,
        schedule: "05:00-23:00",
        flowRate: 9250,
      },
      {
        id: "pump-11",
        zoneName: "Kabir Nagar",
        sourceName: "Rajim Borewell Station",
        status: "active" as const,
        schedule: "06:00-22:00",
        flowRate: 5600,
      },
      {
        id: "pump-12",
        zoneName: "Kabir Nagar",
        sourceName: "Rajim Borewell Station",
        status: "idle" as const,
        schedule: "00:00-00:00",
        flowRate: 5600,
      },
    ];
    
    for (const pump of pumps) {
      const zoneId = zoneMap[pump.zoneName];
      const sourceId = sourceMap[pump.sourceName];
      
      if (!zoneId || !sourceId) {
        console.warn(`⚠️ Skipping ${pump.id}: Zone or Source not found`);
        continue;
      }
      
      await storage.createPump({
        id: pump.id,
        zoneId,
        sourceId,
        status: pump.status,
        schedule: pump.schedule,
        flowRate: pump.flowRate,
      });
      console.log(`✅ Created: Pump ${pump.id} for ${pump.zoneName} from ${pump.sourceName}`);
    }
    
    console.log('\n🎉 Successfully seeded all pumps!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pumps:', error);
    process.exit(1);
  }
}

seedPumps();
