import { storage } from './storage';

const zones = [
  {
    id: 'zone-1',
    name: "Civil Lines",
    status: "optimal" as const,
    flowRate: 12500,
    pressure: 55,
    lat: 21.2379,
    lng: 81.6337,
  },
  {
    id: 'zone-2',
    name: "Shankar Nagar",
    status: "optimal" as const,
    flowRate: 15800,
    pressure: 52,
    lat: 21.2514,
    lng: 81.6296,
  },
  {
    id: 'zone-3',
    name: "Telibandha",
    status: "low-pressure" as const,
    flowRate: 9200,
    pressure: 38,
    lat: 21.2167,
    lng: 81.6500,
  },
  {
    id: 'zone-4',
    name: "Pandri",
    status: "optimal" as const,
    flowRate: 14300,
    pressure: 58,
    lat: 21.2297,
    lng: 81.6644,
  },
  {
    id: 'zone-5',
    name: "Mowa",
    status: "high-demand" as const,
    flowRate: 18500,
    pressure: 45,
    lat: 21.2850,
    lng: 81.6150,
  },
  {
    id: 'zone-6',
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
    // Delete all existing zones first
    await storage.deleteAllZones();
    console.log('✅ Deleted all existing zones');

    const zonesData = [
      { id: 'zone-1', name: 'Civil Lines', flowRate: 12500, pressure: 55, lat: 21.2379, lng: 81.6337 },
      { id: 'zone-2', name: 'Shankar Nagar', flowRate: 15800, pressure: 52, lat: 21.2514, lng: 81.6296 },
      { id: 'zone-3', name: 'Telibandha', flowRate: 9200, pressure: 38, lat: 21.2167, lng: 81.6500 },
      { id: 'zone-4', name: 'Pandri', flowRate: 14300, pressure: 58, lat: 21.2297, lng: 81.6644 },
      { id: 'zone-5', name: 'Mowa', flowRate: 18500, pressure: 45, lat: 21.2850, lng: 81.6150 },
      { id: 'zone-6', name: 'Kabir Nagar', flowRate: 11200, pressure: 50, lat: 21.2450, lng: 81.6200 },
    ];

    for (const zoneData of zonesData) {
      await storage.createZone({
        id: zoneData.id,
        name: zoneData.name,
        status: 'optimal',
        flowRate: zoneData.flowRate,
        pressure: zoneData.pressure,
        lat: zoneData.lat,
        lng: zoneData.lng,
      });
      console.log(`  ✓ Created zone: ${zoneData.name}`);
    }

    console.log('\n🎉 Successfully seeded all zones!');
    // This part is from the original code and remains unchanged.
    // It's important to log the created zones' IDs for verification.
    const createdZones = await storage.getAllZones(); // Assuming getAllZones exists and returns created zones
    console.log('Zone IDs:', createdZones.map(z => ({ name: z.name, id: z.id })));
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding zones:', error);
    process.exit(1);
  }
}

seedZones();