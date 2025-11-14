
import { storage } from './storage';

const zones = [
  {
    name: "Civil Lines",
    status: "optimal" as const,
    flowRate: 12500,
    pressure: 55,
    lat: 21.2379,
    lng: 81.6337,
  },
  {
    name: "Shankar Nagar",
    status: "optimal" as const,
    flowRate: 15800,
    pressure: 52,
    lat: 21.2514,
    lng: 81.6296,
  },
  {
    name: "Telibandha",
    status: "low-pressure" as const,
    flowRate: 9200,
    pressure: 38,
    lat: 21.2167,
    lng: 81.6500,
  },
  {
    name: "Pandri",
    status: "optimal" as const,
    flowRate: 14300,
    pressure: 58,
    lat: 21.2297,
    lng: 81.6644,
  },
  {
    name: "Mowa",
    status: "high-demand" as const,
    flowRate: 18500,
    pressure: 45,
    lat: 21.2850,
    lng: 81.6150,
  },
  {
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
    const createdZones = [];
    for (const zone of zones) {
      const created = await storage.createZone(zone);
      createdZones.push(created);
      console.log(`✅ Created: ${zone.name} with ID: ${created.id}`);
    }
    
    console.log('\n🎉 Successfully seeded all zones!');
    console.log('Zone IDs:', createdZones.map(z => ({ name: z.name, id: z.id })));
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding zones:', error);
    process.exit(1);
  }
}

seedZones();
