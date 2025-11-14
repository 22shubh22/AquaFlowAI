import { storage } from './storage';

async function seedWaterSources() {
  console.log('💧 Seeding water sources...');

  // Delete all existing water sources first
  await storage.deleteAllWaterSources();
  console.log('✅ Deleted all existing water sources');

  const sources = [
    {
      id: 'source-1',
      name: "Shivnath River Intake",
      type: "river" as const,
      location: "Shivnath River, Durg",
      geoLocation: { lat: 21.1901, lng: 81.2849 },
      capacity: 5000000,
      currentLevel: 78,
      quality: "good" as const,
      lastTested: new Date('2024-01-15'),
      status: "active" as const,
    },
    {
      id: 'source-2',
      name: "Tandula Reservoir",
      type: "reservoir" as const,
      location: "Tandula Dam, Balod",
      geoLocation: { lat: 20.9500, lng: 81.1500 },
      capacity: 8500000,
      currentLevel: 65,
      quality: "excellent" as const,
      lastTested: new Date('2024-01-15'),
      status: "active" as const,
    },
    {
      id: 'source-3',
      name: "Kharun River Station",
      type: "river" as const,
      location: "Kharun River, Raipur",
      geoLocation: { lat: 21.2514, lng: 81.6296 },
      capacity: 3200000,
      currentLevel: 82,
      quality: "good" as const,
      lastTested: new Date('2024-01-15'),
      status: "active" as const,
    },
    {
      id: 'source-4',
      name: "Civil Lines Borewell",
      type: "borewell" as const,
      location: "Civil Lines, Raipur",
      geoLocation: { lat: 21.2379, lng: 81.6337 },
      capacity: 450000,
      currentLevel: 71,
      quality: "fair" as const,
      lastTested: new Date('2024-01-15'),
      status: "active" as const,
    },
    {
      id: 'source-5',
      name: "Mahadev Ghat Lake",
      type: "lake" as const,
      location: "Mahadev Ghat, Raipur",
      geoLocation: { lat: 21.2297, lng: 81.6644 },
      capacity: 6200000,
      currentLevel: 88,
      quality: "excellent" as const,
      lastTested: new Date('2024-01-15'),
      status: "active" as const,
    },
    {
      id: 'source-6',
      name: "Rajim Borewell Station",
      type: "borewell" as const,
      location: "Rajim, Raipur",
      geoLocation: { lat: 20.9620, lng: 81.8850 },
      capacity: 380000,
      currentLevel: 62,
      quality: "good" as const,
      lastTested: new Date('2024-01-15'),
      status: "active" as const,
    },
  ];

  try {
    const createdSources = [];
    for (const source of sources) {
      await storage.createWaterSource(source as any);
      console.log(`✅ Created: ${source.name} (${source.id})`);
    }

    console.log('\n🎉 Successfully seeded all water sources!');
    console.log('Source IDs:', createdSources.map(s => ({ name: s.name, id: s.id })));
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding water sources:', error);
    process.exit(1);
  }
}

seedWaterSources();