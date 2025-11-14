
import { storage } from './storage';

const waterSources = [
  {
    name: "Shivnath River Intake",
    type: "river" as const,
    location: "Shivnath River, Durg",
    geoLocation: { lat: 21.1901, lng: 81.2849 },
    capacity: 5000000,
    currentLevel: 78,
    quality: "good" as const,
    lastTested: new Date(),
    status: "active" as const,
  },
  {
    name: "Tandula Reservoir",
    type: "reservoir" as const,
    location: "Tandula Dam, Balod",
    geoLocation: { lat: 20.9500, lng: 81.1500 },
    capacity: 8500000,
    currentLevel: 65,
    quality: "excellent" as const,
    lastTested: new Date(),
    status: "active" as const,
  },
  {
    name: "Kharun River Station",
    type: "river" as const,
    location: "Kharun River, Raipur",
    geoLocation: { lat: 21.2514, lng: 81.6296 },
    capacity: 3200000,
    currentLevel: 82,
    quality: "good" as const,
    lastTested: new Date(),
    status: "active" as const,
  },
  {
    name: "Civil Lines Borewell",
    type: "borewell" as const,
    location: "Civil Lines, Raipur",
    geoLocation: { lat: 21.2379, lng: 81.6337 },
    capacity: 450000,
    currentLevel: 71,
    quality: "fair" as const,
    lastTested: new Date(),
    status: "active" as const,
  },
  {
    name: "Mahadev Ghat Lake",
    type: "lake" as const,
    location: "Mahadev Ghat, Bilaspur",
    geoLocation: { lat: 22.0797, lng: 82.1409 },
    capacity: 2100000,
    currentLevel: 55,
    quality: "good" as const,
    lastTested: new Date(),
    status: "maintenance" as const,
  },
  {
    name: "Rajim Borewell Station",
    type: "borewell" as const,
    location: "Rajim, Gariyaband",
    geoLocation: { lat: 20.9667, lng: 81.8833 },
    capacity: 380000,
    currentLevel: 68,
    quality: "excellent" as const,
    lastTested: new Date(),
    status: "active" as const,
  },
];

async function seedWaterSources() {
  console.log('🌊 Seeding water sources...');
  
  try {
    for (const source of waterSources) {
      await storage.createWaterSource(source);
      console.log(`✅ Created: ${source.name}`);
    }
    
    console.log('\n🎉 Successfully seeded all water sources!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding water sources:', error);
    process.exit(1);
  }
}

seedWaterSources();
