
import { storage } from './storage';

const zones = [
  {
    id: "zone-1",
    name: "Civil Lines",
    status: "optimal" as const,
    flowRate: 12500,
    pressure: 55,
    lat: 21.2379,
    lng: 81.6337,
  },
  {
    id: "zone-2",
    name: "Shankar Nagar",
    status: "optimal" as const,
    flowRate: 15800,
    pressure: 52,
    lat: 21.2514,
    lng: 81.6296,
  },
  {
    id: "zone-3",
    name: "Telibandha",
    status: "low-pressure" as const,
    flowRate: 9200,
    pressure: 38,
    lat: 21.2167,
    lng: 81.6500,
  },
  {
    id: "zone-4",
    name: "Pandri",
    status: "optimal" as const,
    flowRate: 14300,
    pressure: 58,
    lat: 21.2297,
    lng: 81.6644,
  },
  {
    id: "zone-5",
    name: "Mowa",
    status: "high-demand" as const,
    flowRate: 18500,
    pressure: 45,
    lat: 21.2850,
    lng: 81.6150,
  },
  {
    id: "zone-6",
    name: "Kabir Nagar",
    status: "optimal" as const,
    flowRate: 11200,
    pressure: 50,
    lat: 21.2450,
    lng: 81.6200,
  },
];

async function seedZones() {
  console.log('🏘️ Seeding zones...');
  
  try {
    for (const zone of zones) {
      await storage.createZone(zone);
      console.log(`✅ Created: ${zone.name}`);
    }
    
    console.log('\n🎉 Successfully seeded all zones!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding zones:', error);
    process.exit(1);
  }
}

seedZones();
