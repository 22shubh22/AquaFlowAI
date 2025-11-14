import { storage } from './storage';

async function seedWaterSources() {
  console.log('💧 Seeding water sources...');

  try {
    // Delete all existing water sources first
    await storage.deleteAllWaterSources();
    console.log('✅ Deleted all existing water sources');

    const sourcesData = [
      {
        id: 'source-1',
        name: 'Shivnath River Intake',
        type: 'river' as const,
        location: 'Shivnath River, Durg',
        geoLocation: { lat: 21.1901, lng: 81.2849 },
        capacity: 5000000,
        currentLevel: 78,
        quality: 'good' as const,
      },
      {
        id: 'source-2',
        name: 'Tandula Reservoir',
        type: 'reservoir' as const,
        location: 'Tandula Dam, Balod',
        geoLocation: { lat: 20.9500, lng: 81.1500 },
        capacity: 8500000,
        currentLevel: 65,
        quality: 'excellent' as const,
      },
      {
        id: 'source-3',
        name: 'Kharun River Station',
        type: 'river' as const,
        location: 'Kharun River, Raipur',
        geoLocation: { lat: 21.2514, lng: 81.6296 },
        capacity: 3200000,
        currentLevel: 82,
        quality: 'good' as const,
      },
      {
        id: 'source-4',
        name: 'Civil Lines Borewell',
        type: 'borewell' as const,
        location: 'Civil Lines, Raipur',
        geoLocation: { lat: 21.2379, lng: 81.6337 },
        capacity: 450000,
        currentLevel: 71,
        quality: 'fair' as const,
      },
      {
        id: 'source-5',
        name: 'Mowa Treatment Plant',
        type: 'treatment-plant' as const,
        location: 'Mowa, Raipur',
        geoLocation: { lat: 21.2850, lng: 81.6150 },
        capacity: 6500000,
        currentLevel: 88,
        quality: 'excellent' as const,
      },
      {
        id: 'source-6',
        name: 'Telibandha Groundwater',
        type: 'borewell' as const,
        location: 'Telibandha, Raipur',
        geoLocation: { lat: 21.2167, lng: 81.6500 },
        capacity: 380000,
        currentLevel: 63,
        quality: 'good' as const,
      },
    ];

    for (const sourceData of sourcesData) {
      await storage.createWaterSource({
        id: sourceData.id,
        name: sourceData.name,
        type: sourceData.type,
        location: sourceData.location,
        geoLocation: sourceData.geoLocation,
        capacity: sourceData.capacity,
        currentLevel: sourceData.currentLevel,
        quality: sourceData.quality,
        status: 'active',
      });
      console.log(`  ✓ Created water source: ${sourceData.name}`);
    }

    console.log('\n🎉 Successfully seeded all water sources!');
    // Note: The original code had 'createdSources' which was not populated.
    // For simplicity and to avoid introducing new state, we'll skip logging specific IDs here
    // as the console log inside the loop already confirms creation.
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding water sources:', error);
    process.exit(1);
  }
}

seedWaterSources();