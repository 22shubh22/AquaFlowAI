
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, desc, and, gte } from 'drizzle-orm';
import * as schema from '../shared/schema';
import type { 
  Zone, 
  WaterSource, 
  Pump, 
  Alert, 
  CitizenUser,
  CitizenReport,
  ZoneHistoricalData,
  ReservoirHistory,
  PumpHistory,
  InsertZone,
  InsertWaterSource,
  InsertCitizenUser,
  InsertCitizenReport,
  User,
  InsertUser
} from '../shared/schema';
import { ReportBlockchain } from './blockchain';

// Database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Define database tables
import { pgTable, text, varchar, numeric, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { sql as sqlOperator } from "drizzle-orm";

const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sqlOperator`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

const citizenUsers = pgTable("citizen_users", {
  id: varchar("id").primaryKey().default(sqlOperator`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

const zones = pgTable("zones", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(),
  flowRate: numeric("flow_rate").notNull(),
  pressure: numeric("pressure").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  lat: numeric("lat").notNull(),
  lng: numeric("lng").notNull(),
});

const waterSources = pgTable("water_sources", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  location: text("location").notNull(),
  geoLat: numeric("geo_lat").notNull(),
  geoLng: numeric("geo_lng").notNull(),
  capacity: numeric("capacity").notNull(),
  currentLevel: numeric("current_level").notNull(),
  quality: text("quality").notNull(),
  lastTested: timestamp("last_tested"),
  status: text("status").notNull(),
});

const pumps = pgTable("pumps", {
  id: varchar("id").primaryKey(),
  zoneId: varchar("zone_id").notNull(),
  sourceId: varchar("source_id").notNull(),
  status: text("status").notNull(),
  schedule: text("schedule").notNull(),
  flowRate: numeric("flow_rate").notNull(),
  lastMaintenance: timestamp("last_maintenance"),
});

const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sqlOperator`gen_random_uuid()`),
  type: text("type").notNull(),
  zoneId: varchar("zone_id").notNull(),
  severity: text("severity").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  resolved: boolean("resolved").default(false),
});

const citizenReports = pgTable("citizen_reports", {
  id: varchar("id").primaryKey().default(sqlOperator`gen_random_uuid()`),
  type: text("type").notNull(),
  location: text("location").notNull(),
  geoLat: numeric("geo_lat"),
  geoLng: numeric("geo_lng"),
  description: text("description").notNull(),
  userId: varchar("user_id").notNull(),
  status: text("status").notNull().default('pending'),
  timestamp: timestamp("timestamp").defaultNow(),
  images: jsonb("images"),
  reportHash: text("report_hash").notNull(),
  previousHash: text("previous_hash").notNull(),
  blockNumber: integer("block_number").notNull(),
  signature: text("signature").notNull(),
  statusHistory: jsonb("status_history").notNull(),
});

const zoneHistory = pgTable("zone_history", {
  id: varchar("id").primaryKey().default(sqlOperator`gen_random_uuid()`),
  zoneId: varchar("zone_id").notNull(),
  flowRate: numeric("flow_rate").notNull(),
  pressure: numeric("pressure").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  hour: integer("hour").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
});

const reservoirHistory = pgTable("reservoir_history", {
  id: varchar("id").primaryKey().default(sqlOperator`gen_random_uuid()`),
  sourceId: varchar("source_id").notNull(),
  level: numeric("level").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

const pumpHistory = pgTable("pump_history", {
  id: varchar("id").primaryKey().default(sqlOperator`gen_random_uuid()`),
  pumpId: varchar("pump_id").notNull(),
  status: text("status").notNull(),
  flowRate: numeric("flow_rate").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  duration: integer("duration").notNull(),
});

class DbStorage {
  private blockchain: typeof ReportBlockchain;

  constructor() {
    this.blockchain = ReportBlockchain;
    this.initializeDefaultAdmin();
  }

  private async initializeDefaultAdmin() {
    try {
      // Check if admin user exists
      const adminExists = await db
        .select()
        .from(users)
        .where(eq(users.username, 'admin'))
        .limit(1);

      if (adminExists.length === 0) {
        // Create default admin user
        await db.insert(users).values({
          id: crypto.randomUUID(),
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          createdAt: new Date(),
        });
        console.log('Default admin user created (username: admin, password: admin123)');
      }
    } catch (error) {
      console.error('Error initializing default admin:', error);
    }
  }

  // User methods
  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0] || null;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Citizen User methods
  async getCitizenUsers(): Promise<CitizenUser[]> {
    const result = await db.select().from(citizenUsers);
    
    // Count reports for each user
    const usersWithReportCount = await Promise.all(
      result.map(async (row) => {
        const reports = await db.select().from(citizenReports).where(eq(citizenReports.userId, row.id!));
        return {
          id: row.id!,
          username: row.username,
          password: row.password,
          email: row.email,
          phone: row.phone,
          createdAt: row.createdAt!,
          reportCount: reports.length,
        };
      })
    );
    
    return usersWithReportCount;
  }

  async getCitizenUserByUsername(username: string): Promise<CitizenUser | null> {
    const result = await db.select().from(citizenUsers).where(eq(citizenUsers.username, username)).limit(1);
    if (!result[0]) return null;
    return {
      id: result[0].id!,
      username: result[0].username,
      password: result[0].password,
      email: result[0].email,
      phone: result[0].phone,
      createdAt: result[0].createdAt!,
    };
  }

  async createCitizenUser(user: InsertCitizenUser): Promise<CitizenUser> {
    const result = await db.insert(citizenUsers).values(user).returning();
    return {
      id: result[0].id!,
      username: result[0].username,
      password: result[0].password,
      email: result[0].email,
      phone: result[0].phone,
      createdAt: result[0].createdAt!,
    };
  }

  // Zone methods
  async getZones(): Promise<Zone[]> {
    const result = await db.select().from(zones);
    return result.map(row => ({
      id: row.id,
      name: row.name,
      status: row.status as any,
      flowRate: parseFloat(row.flowRate),
      pressure: parseFloat(row.pressure),
      lastUpdated: row.lastUpdated!,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
    }));
  }

  async getZone(id: string): Promise<Zone | null> {
    const result = await db.select().from(zones).where(eq(zones.id, id)).limit(1);
    if (!result[0]) return null;
    const row = result[0];
    return {
      id: row.id,
      name: row.name,
      status: row.status as any,
      flowRate: parseFloat(row.flowRate),
      pressure: parseFloat(row.pressure),
      lastUpdated: row.lastUpdated!,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
    };
  }

  async createZone(zone: InsertZone): Promise<Zone> {
    const id = `Z${Date.now()}`;
    const result = await db.insert(zones).values({
      id,
      name: zone.name,
      status: zone.status,
      flowRate: zone.flowRate.toString(),
      pressure: zone.pressure.toString(),
      lat: zone.lat.toString(),
      lng: zone.lng.toString(),
    }).returning();
    const row = result[0];
    return {
      id: row.id,
      name: row.name,
      status: row.status as any,
      flowRate: parseFloat(row.flowRate),
      pressure: parseFloat(row.pressure),
      lastUpdated: row.lastUpdated!,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
    };
  }

  async updateZone(id: string, updates: Partial<Zone>): Promise<Zone> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.status) updateData.status = updates.status;
    if (updates.flowRate !== undefined) updateData.flowRate = updates.flowRate.toString();
    if (updates.pressure !== undefined) updateData.pressure = updates.pressure.toString();
    if (updates.lat !== undefined) updateData.lat = updates.lat.toString();
    if (updates.lng !== undefined) updateData.lng = updates.lng.toString();
    updateData.lastUpdated = new Date();

    const result = await db.update(zones).set(updateData).where(eq(zones.id, id)).returning();
    const row = result[0];
    return {
      id: row.id,
      name: row.name,
      status: row.status as any,
      flowRate: parseFloat(row.flowRate),
      pressure: parseFloat(row.pressure),
      lastUpdated: row.lastUpdated!,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
    };
  }

  async deleteZone(id: string): Promise<void> {
    await db.delete(zones).where(eq(zones.id, id));
  }

  // Water Source methods
  async getWaterSources(): Promise<WaterSource[]> {
    const result = await db.select().from(waterSources);
    return result.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type as any,
      location: row.location,
      geoLocation: { lat: parseFloat(row.geoLat), lng: parseFloat(row.geoLng) },
      capacity: parseFloat(row.capacity),
      currentLevel: parseFloat(row.currentLevel),
      quality: row.quality as any,
      lastTested: row.lastTested || undefined,
      status: row.status as any,
    }));
  }

  async getWaterSource(id: string): Promise<WaterSource | null> {
    const result = await db.select().from(waterSources).where(eq(waterSources.id, id)).limit(1);
    if (!result[0]) return null;
    const row = result[0];
    return {
      id: row.id,
      name: row.name,
      type: row.type as any,
      location: row.location,
      geoLocation: { lat: parseFloat(row.geoLat), lng: parseFloat(row.geoLng) },
      capacity: parseFloat(row.capacity),
      currentLevel: parseFloat(row.currentLevel),
      quality: row.quality as any,
      lastTested: row.lastTested || undefined,
      status: row.status as any,
    };
  }

  async createWaterSource(source: InsertWaterSource): Promise<WaterSource> {
    const id = `S${Date.now()}`;
    const result = await db.insert(waterSources).values({
      id,
      name: source.name,
      type: source.type,
      location: source.location,
      geoLat: source.geoLocation.lat.toString(),
      geoLng: source.geoLocation.lng.toString(),
      capacity: source.capacity.toString(),
      currentLevel: source.currentLevel.toString(),
      quality: source.quality,
      lastTested: source.lastTested,
      status: source.status,
    }).returning();
    const row = result[0];
    return {
      id: row.id,
      name: row.name,
      type: row.type as any,
      location: row.location,
      geoLocation: { lat: parseFloat(row.geoLat), lng: parseFloat(row.geoLng) },
      capacity: parseFloat(row.capacity),
      currentLevel: parseFloat(row.currentLevel),
      quality: row.quality as any,
      lastTested: row.lastTested || undefined,
      status: row.status as any,
    };
  }

  async updateWaterSource(id: string, updates: Partial<WaterSource>): Promise<WaterSource> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.type) updateData.type = updates.type;
    if (updates.location) updateData.location = updates.location;
    if (updates.geoLocation) {
      updateData.geoLat = updates.geoLocation.lat.toString();
      updateData.geoLng = updates.geoLocation.lng.toString();
    }
    if (updates.capacity !== undefined) updateData.capacity = updates.capacity.toString();
    if (updates.currentLevel !== undefined) updateData.currentLevel = updates.currentLevel.toString();
    if (updates.quality) updateData.quality = updates.quality;
    if (updates.lastTested !== undefined) updateData.lastTested = updates.lastTested;
    if (updates.status) updateData.status = updates.status;

    const result = await db.update(waterSources).set(updateData).where(eq(waterSources.id, id)).returning();
    const row = result[0];
    return {
      id: row.id,
      name: row.name,
      type: row.type as any,
      location: row.location,
      geoLocation: { lat: parseFloat(row.geoLat), lng: parseFloat(row.geoLng) },
      capacity: parseFloat(row.capacity),
      currentLevel: parseFloat(row.currentLevel),
      quality: row.quality as any,
      lastTested: row.lastTested || undefined,
      status: row.status as any,
    };
  }

  async deleteWaterSource(id: string): Promise<void> {
    await db.delete(waterSources).where(eq(waterSources.id, id));
  }

  // Pump methods
  async getPumps(): Promise<Pump[]> {
    const result = await db.select().from(pumps);
    return result.map(row => ({
      id: row.id,
      zoneId: row.zoneId,
      sourceId: row.sourceId,
      status: row.status as any,
      schedule: row.schedule,
      flowRate: parseFloat(row.flowRate),
      lastMaintenance: row.lastMaintenance || undefined,
    }));
  }

  async getPump(id: string): Promise<Pump | null> {
    const result = await db.select().from(pumps).where(eq(pumps.id, id)).limit(1);
    if (!result[0]) return null;
    const row = result[0];
    return {
      id: row.id,
      zoneId: row.zoneId,
      sourceId: row.sourceId,
      status: row.status as any,
      schedule: row.schedule,
      flowRate: parseFloat(row.flowRate),
      lastMaintenance: row.lastMaintenance || undefined,
    };
  }

  async createPump(pump: Omit<Pump, 'lastMaintenance'> & { lastMaintenance?: Date }): Promise<Pump> {
    const result = await db.insert(pumps).values({
      id: pump.id,
      zoneId: pump.zoneId,
      sourceId: pump.sourceId,
      status: pump.status,
      schedule: pump.schedule,
      flowRate: pump.flowRate.toString(),
      lastMaintenance: pump.lastMaintenance,
    }).returning();
    const row = result[0];
    return {
      id: row.id,
      zoneId: row.zoneId,
      sourceId: row.sourceId,
      status: row.status as any,
      schedule: row.schedule,
      flowRate: parseFloat(row.flowRate),
      lastMaintenance: row.lastMaintenance || undefined,
    };
  }

  async updatePump(id: string, updates: Partial<Pump>): Promise<Pump> {
    const updateData: any = {};
    if (updates.status) updateData.status = updates.status;
    if (updates.schedule) updateData.schedule = updates.schedule;
    if (updates.flowRate !== undefined) updateData.flowRate = updates.flowRate.toString();
    if (updates.lastMaintenance !== undefined) updateData.lastMaintenance = updates.lastMaintenance;

    const result = await db.update(pumps).set(updateData).where(eq(pumps.id, id)).returning();
    const row = result[0];
    return {
      id: row.id,
      zoneId: row.zoneId,
      sourceId: row.sourceId,
      status: row.status as any,
      schedule: row.schedule,
      flowRate: parseFloat(row.flowRate),
      lastMaintenance: row.lastMaintenance || undefined,
    };
  }

  async deletePump(id: string): Promise<void> {
    await db.delete(pumps).where(eq(pumps.id, id));
  }

  // Alert methods
  async getAlerts(): Promise<Alert[]> {
    const result = await db.select().from(alerts).orderBy(desc(alerts.timestamp));
    return result.map(row => ({
      id: row.id!,
      type: row.type as any,
      zoneId: row.zoneId,
      severity: row.severity as any,
      message: row.message,
      timestamp: row.timestamp!,
      resolved: row.resolved!,
    }));
  }

  async createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): Promise<Alert> {
    const result = await db.insert(alerts).values({
      type: alert.type,
      zoneId: alert.zoneId,
      severity: alert.severity,
      message: alert.message,
    }).returning();
    return {
      id: result[0].id!,
      type: result[0].type as any,
      zoneId: result[0].zoneId,
      severity: result[0].severity as any,
      message: result[0].message,
      timestamp: result[0].timestamp!,
      resolved: result[0].resolved!,
    };
  }

  async resolveAlert(id: string): Promise<void> {
    await db.update(alerts).set({ resolved: true }).where(eq(alerts.id, id));
  }

  // Citizen Report methods
  async getReports(): Promise<CitizenReport[]> {
    const result = await db.select().from(citizenReports).orderBy(desc(citizenReports.timestamp));
    return result.map(row => ({
      id: row.id!,
      type: row.type,
      location: row.location,
      geoLocation: row.geoLat && row.geoLng ? { lat: parseFloat(row.geoLat), lng: parseFloat(row.geoLng) } : undefined,
      description: row.description,
      userId: row.userId,
      status: row.status as any,
      timestamp: row.timestamp!,
      images: (row.images as string[]) || undefined,
      reportHash: row.reportHash,
      previousHash: row.previousHash,
      blockNumber: row.blockNumber,
      signature: row.signature,
      statusHistory: row.statusHistory as any,
    }));
  }

  async createReport(report: InsertCitizenReport): Promise<CitizenReport> {
    const reports = await this.getReports();
    const previousHash = reports.length > 0 ? reports[0].reportHash : '0';
    const blockNumber = reports.length;

    const reportData = {
      ...report,
      status: 'pending' as const,
      timestamp: new Date(),
      previousHash,
      blockNumber,
    };

    const reportHash = ReportBlockchain.generateHash({
      id: '', // Will be set after insert
      ...reportData,
    });
    const signature = ReportBlockchain.generateSignature(reportHash, reportData.timestamp);

    const result = await db.insert(citizenReports).values({
      type: report.type,
      location: report.location,
      geoLat: report.geoLocation?.lat.toString(),
      geoLng: report.geoLocation?.lng.toString(),
      description: report.description,
      userId: report.userId,
      status: 'pending',
      images: report.images as any,
      reportHash: reportHash,
      previousHash: previousHash,
      blockNumber: blockNumber,
      signature: signature,
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        updatedBy: 'system',
      }] as any,
    }).returning();

    const row = result[0];
    return {
      id: row.id!,
      type: row.type,
      location: row.location,
      geoLocation: row.geoLat && row.geoLng ? { lat: parseFloat(row.geoLat), lng: parseFloat(row.geoLng) } : undefined,
      description: row.description,
      userId: row.userId,
      status: row.status as any,
      timestamp: row.timestamp!,
      images: (row.images as string[]) || undefined,
      reportHash: row.reportHash,
      previousHash: row.previousHash,
      blockNumber: row.blockNumber,
      signature: row.signature,
      statusHistory: row.statusHistory as any,
    };
  }

  async updateReportStatus(id: string, status: string, updatedBy: string, reason?: string): Promise<CitizenReport> {
    const currentReport = await db.select().from(citizenReports).where(eq(citizenReports.id, id)).limit(1);
    if (!currentReport[0]) throw new Error('Report not found');

    const statusHistory = currentReport[0].statusHistory as any[];
    statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy,
      reason,
    });

    const result = await db.update(citizenReports).set({
      status,
      statusHistory: statusHistory as any,
    }).where(eq(citizenReports.id, id)).returning();

    const row = result[0];
    return {
      id: row.id!,
      type: row.type,
      location: row.location,
      geoLocation: row.geoLat && row.geoLng ? { lat: parseFloat(row.geoLat), lng: parseFloat(row.geoLng) } : undefined,
      description: row.description,
      userId: row.userId,
      status: row.status as any,
      timestamp: row.timestamp!,
      images: (row.images as string[]) || undefined,
      reportHash: row.reportHash,
      previousHash: row.previousHash,
      blockNumber: row.blockNumber,
      signature: row.signature,
      statusHistory: row.statusHistory as any,
    };
  }

  async verifyReportChain(): Promise<{ isValid: boolean; invalidBlocks: number[] }> {
    const reports = await this.getReports();
    const verification = ReportBlockchain.verifyChain(reports.reverse());
    return {
      isValid: verification.valid,
      invalidBlocks: verification.invalidBlock ? [verification.invalidBlock] : [],
    };
  }

  async getBlockchainStats(): Promise<any> {
    const reports = await this.getReports();
    return ReportBlockchain.getChainStats(reports.reverse());
  }

  // Historical Data methods
  async getZoneHistory(zoneId: string, hours: number): Promise<ZoneHistoricalData[]> {
    const cutoffTime = new Date(Date.now() - hours * 3600000);
    const result = await db.select().from(zoneHistory)
      .where(and(eq(zoneHistory.zoneId, zoneId), gte(zoneHistory.timestamp, cutoffTime)))
      .orderBy(desc(zoneHistory.timestamp));
    
    return result.map(row => ({
      id: row.id!,
      zoneId: row.zoneId,
      flowRate: parseFloat(row.flowRate),
      pressure: parseFloat(row.pressure),
      timestamp: row.timestamp!,
      hour: row.hour,
      dayOfWeek: row.dayOfWeek,
    }));
  }

  async getAggregatedZoneData(hours: number): Promise<Map<string, ZoneHistoricalData[]>> {
    const cutoffTime = new Date(Date.now() - hours * 3600000);
    const result = await db.select().from(zoneHistory)
      .where(gte(zoneHistory.timestamp, cutoffTime))
      .orderBy(desc(zoneHistory.timestamp));
    
    const dataMap = new Map<string, ZoneHistoricalData[]>();
    result.forEach(row => {
      const data: ZoneHistoricalData = {
        id: row.id!,
        zoneId: row.zoneId,
        flowRate: parseFloat(row.flowRate),
        pressure: parseFloat(row.pressure),
        timestamp: row.timestamp!,
        hour: row.hour,
        dayOfWeek: row.dayOfWeek,
      };
      if (!dataMap.has(row.zoneId)) {
        dataMap.set(row.zoneId, []);
      }
      dataMap.get(row.zoneId)!.push(data);
    });
    
    return dataMap;
  }

  async getReservoirHistory(sourceId: string, hours: number): Promise<ReservoirHistory[]> {
    const cutoffTime = new Date(Date.now() - hours * 3600000);
    const result = await db.select().from(reservoirHistory)
      .where(and(eq(reservoirHistory.sourceId, sourceId), gte(reservoirHistory.timestamp, cutoffTime)))
      .orderBy(desc(reservoirHistory.timestamp));
    
    return result.map(row => ({
      id: row.id!,
      sourceId: row.sourceId,
      level: parseFloat(row.level),
      timestamp: row.timestamp!,
    }));
  }

  async getPumpHistory(pumpId: string, hours: number): Promise<PumpHistory[]> {
    const cutoffTime = new Date(Date.now() - hours * 3600000);
    const result = await db.select().from(pumpHistory)
      .where(and(eq(pumpHistory.pumpId, pumpId), gte(pumpHistory.timestamp, cutoffTime)))
      .orderBy(desc(pumpHistory.timestamp));
    
    return result.map(row => ({
      id: row.id!,
      pumpId: row.pumpId,
      status: row.status as any,
      flowRate: parseFloat(row.flowRate),
      timestamp: row.timestamp!,
      duration: row.duration,
    }));
  }
}

export const storage = new DbStorage();
