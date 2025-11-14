
import { storage } from './storage';

const pumps = [
  {
    id: "pump-1",
    zoneId: "zone-1",
    sourceId: "source-1",
    status: "active" as const,
    schedule: "06:00-22:00",
    flowRate: 6250,
  },
  {
    id: "pump-2",
    zoneId: "zone-1",
    sourceId: "source-1",
    status: "active" as const,
    schedule: "06:00-22:00",
    flowRate: 6250,
  },
  {
    id: "pump-3",
    zoneId: "zone-2",
    sourceId: "source-2",
    status: "active" as const,
    schedule: "05:00-23:00",
    flowRate: 7900,
  },
  {
    id: "pump-4",
    zoneId: "zone-2",
    sourceId: "source-2",
    status: "active" as const,
    schedule: "05:00-23:00",
    flowRate: 7900,
  },
  {
    id: "pump-5",
    zoneId: "zone-3",
    sourceId: "source-3",
    status: "maintenance" as const,
    schedule: "07:00-21:00",
    flowRate: 4600,
  },
  {
    id: "pump-6",
    zoneId: "zone-3",
    sourceId: "source-3",
    status: "active" as const,
    schedule: "07:00-21:00",
    flowRate: 4600,
  },
  {
    id: "pump-7",
    zoneId: "zone-4",
    sourceId: "source-4",
    status: "active" as const,
    schedule: "06:00-22:00",
    flowRate: 7150,
  },
  {
    id: "pump-8",
    zoneId: "zone-4",
    sourceId: "source-4",
    status: "active" as const,
    schedule: "06:00-22:00",
    flowRate: 7150,
  },
  {
    id: "pump-9",
    zoneId: "zone-5",
    sourceId: "source-5",
    status: "active" as const,
    schedule: "05:00-23:00",
    flowRate: 9250,
  },
  {
    id: "pump-10",
    zoneId: "zone-5",
    sourceId: "source-5",
    status: "active" as const,
    schedule: "05:00-23:00",
    flowRate: 9250,
  },
  {
    id: "pump-11",
    zoneId: "zone-6",
    sourceId: "source-6",
    status: "active" as const,
    schedule: "06:00-22:00",
    flowRate: 5600,
  },
  {
    id: "pump-12",
    zoneId: "zone-6",
    sourceId: "source-6",
    status: "idle" as const,
    schedule: "00:00-00:00",
    flowRate: 5600,
  },
];

async function seedPumps() {
  console.log('⚙️ Seeding pumps...');
  
  try {
    for (const pump of pumps) {
      await storage.createPump(pump);
      console.log(`✅ Created: Pump ${pump.id} for ${pump.zoneId}`);
    }
    
    console.log('\n🎉 Successfully seeded all pumps!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pumps:', error);
    process.exit(1);
  }
}

seedPumps();
