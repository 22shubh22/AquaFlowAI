import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface Zone {
  id: string;
  name: string;
  status: "optimal" | "low-pressure" | "high-demand";
  flowRate: number;
  pressure: number;
  lastUpdated: Date;
  lat: number;
  lng: number;
}

export interface WaterSource {
  id: string;
  name: string;
  type: "river" | "lake" | "borewell" | "reservoir";
  location: string;
  geoLocation: { lat: number; lng: number };
  capacity: number; // in liters
  currentLevel: number; // percentage
  quality: "excellent" | "good" | "fair" | "poor";
  lastTested?: Date;
  status: "active" | "inactive" | "maintenance";
}

export interface Pump {
  id: string;
  zoneId: string;
  sourceId: string; // Link to water source
  status: "active" | "idle" | "maintenance";
  schedule: string;
  flowRate: number;
  lastMaintenance?: Date;
}

export interface Alert {
  id: string;
  type: "pressure-drop" | "excess-pumping" | "leak-detected" | "low-reservoir";
  zoneId: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface CitizenUser {
  id: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface CitizenReport {
  id: string;
  type: string;
  location: string;
  geoLocation?: { lat: number; lng: number };
  description: string;
  contact: string;
  status: "pending" | "investigating" | "resolved";
  timestamp: Date;
  images?: string[];
  // Blockchain-inspired immutability fields
  reportHash: string; // Hash of this report's content
  previousHash: string; // Hash of previous report (chain link)
  blockNumber: number; // Sequential block number
  signature: string; // Cryptographic signature
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    updatedBy: string;
    reason?: string;
  }>;
}

export interface ZoneHistoricalData {
  id: string;
  zoneId: string;
  flowRate: number;
  pressure: number;
  timestamp: Date;
  hour: number; // 0-23
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
}

export interface ReservoirHistory {
  id: string;
  sourceId: string;
  level: number; // percentage
  timestamp: Date;
}

export interface PumpHistory {
  id: string;
  pumpId: string;
  status: "active" | "idle" | "maintenance";
  flowRate: number;
  timestamp: Date;
  duration: number; // minutes the pump was in this state
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Citizen Users
  getCitizenUser(id: string): Promise<CitizenUser | undefined>;
  getCitizenUserByUsername(username: string): Promise<CitizenUser | undefined>;
  createCitizenUser(user: Omit<CitizenUser, 'id' | 'createdAt'>): Promise<CitizenUser>;

  // Zones
  getZones(): Promise<Zone[]>;
  getZone(id: string): Promise<Zone | undefined>;
  createZone(zone: Omit<Zone, 'id' | 'lastUpdated'>): Promise<Zone>;
  updateZone(id: string, data: Partial<Zone>): Promise<Zone>;
  deleteZone(id: string): Promise<void>;

  // Water Sources
  getWaterSources(): Promise<WaterSource[]>;
  getWaterSource(id: string): Promise<WaterSource | undefined>;
  createWaterSource(source: Omit<WaterSource, 'id'>): Promise<WaterSource>;
  updateWaterSource(id: string, data: Partial<WaterSource>): Promise<WaterSource>;
  deleteWaterSource(id: string): Promise<void>;

  // Pumps
  getPumps(): Promise<Pump[]>;
  getPump(id: string): Promise<Pump | undefined>;
  updatePump(id: string, data: Partial<Pump>): Promise<Pump>;

  // Alerts
  getAlerts(): Promise<Alert[]>;
  createAlert(alert: Omit<Alert, 'id'>): Promise<Alert>;
  resolveAlert(id: string): Promise<void>;

  // Citizen Reports
  getReports(): Promise<CitizenReport[]>;
  createReport(report: Omit<CitizenReport, 'id' | 'timestamp'>): Promise<CitizenReport>;
  updateReportStatus(id: string, status: CitizenReport['status']): Promise<CitizenReport>;

  // Historical Data
  getZoneHistory(zoneId: string, hours?: number): Promise<ZoneHistoricalData[]>;
  recordZoneData(zoneId: string, flowRate: number, pressure: number): Promise<void>;
  getReservoirHistory(sourceId: string, hours?: number): Promise<ReservoirHistory[]>;
  recordReservoirData(sourceId: string, level: number): Promise<void>;
  getPumpHistory(pumpId: string, hours?: number): Promise<PumpHistory[]>;
  recordPumpData(pumpId: string, status: Pump['status'], flowRate: number, duration: number): Promise<void>;
  getAggregatedZoneData(hours?: number): Promise<Map<string, ZoneHistoricalData[]>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private citizenUsers: Map<string, CitizenUser>;
  private zones: Map<string, Zone>;
  private waterSources: Map<string, WaterSource>;
  private pumps: Map<string, Pump>;
  private alerts: Map<string, Alert>;
  private reports: Map<string, CitizenReport>;
  private zoneHistory: Map<string, ZoneHistoricalData>;
  private reservoirHistory: Map<string, ReservoirHistory>;
  private pumpHistory: Map<string, PumpHistory>;

  constructor() {
    this.users = new Map();
    this.citizenUsers = new Map();
    this.zones = new Map();
    this.waterSources = new Map();
    this.pumps = new Map();
    this.alerts = new Map();
    this.reports = new Map();
    this.zoneHistory = new Map();
    this.reservoirHistory = new Map();
    this.pumpHistory = new Map();
    this.initializeDemoData();
    this.initializeDefaultUsers();
    this.startHistoricalDataCollection();
  }

  private initializeDefaultUsers() {
    // Create default admin user
    const adminUser: User = {
      id: "admin-1",
      username: "admin",
      password: "admin123" // In production, this should be hashed
    };
    this.users.set(adminUser.id, adminUser);
  }

  private initializeDemoData() {
    // Initialize water sources for Raipur
    const waterSources: WaterSource[] = [
      { id: "SRC-1", name: "Mahanadi River", type: "river", location: "North Raipur", geoLocation: { lat: 21.2700, lng: 81.6300 }, capacity: 5000000, currentLevel: 78, quality: "good", lastTested: new Date(), status: "active" },
      { id: "SRC-2", name: "Kharun River", type: "river", location: "East Raipur", geoLocation: { lat: 21.2200, lng: 81.6900 }, capacity: 3000000, currentLevel: 65, quality: "good", lastTested: new Date(), status: "active" },
      { id: "SRC-3", name: "Telibandha Lake", type: "lake", location: "Central Raipur", geoLocation: { lat: 21.2500, lng: 81.6450 }, capacity: 800000, currentLevel: 85, quality: "excellent", lastTested: new Date(), status: "active" },
      { id: "SRC-4", name: "Budha Talab", type: "lake", location: "South Raipur", geoLocation: { lat: 21.2100, lng: 81.6350 }, capacity: 500000, currentLevel: 72, quality: "good", lastTested: new Date(), status: "active" },
      { id: "SRC-5", name: "Borewell Cluster A", type: "borewell", location: "Devendra Nagar", geoLocation: { lat: 21.2280, lng: 81.6050 }, capacity: 200000, currentLevel: 58, quality: "fair", lastTested: new Date(), status: "active" },
      { id: "SRC-6", name: "Borewell Cluster B", type: "borewell", location: "Gudhiyari", geoLocation: { lat: 21.2000, lng: 81.6420 }, capacity: 180000, currentLevel: 45, quality: "fair", lastTested: new Date(), status: "active" },
      { id: "SRC-7", name: "Kharora Reservoir", type: "reservoir", location: "West Raipur", geoLocation: { lat: 21.2400, lng: 81.5800 }, capacity: 1200000, currentLevel: 82, quality: "excellent", lastTested: new Date(), status: "active" },
      { id: "SRC-8", name: "Urla Borewell Complex", type: "borewell", location: "Urla Industrial", geoLocation: { lat: 21.1920, lng: 81.7020 }, capacity: 300000, currentLevel: 62, quality: "good", lastTested: new Date(), status: "active" },
    ];
    waterSources.forEach(s => this.waterSources.set(s.id, s));

    // Initialize zones with actual Raipur coordinates
    const zones: Zone[] = [
      { id: "RAI-1", name: "Civil Lines", status: "optimal", flowRate: 520, pressure: 50, lastUpdated: new Date(), lat: 21.2447, lng: 81.6340 },
      { id: "RAI-2", name: "Shankar Nagar", status: "optimal", flowRate: 480, pressure: 48, lastUpdated: new Date(), lat: 21.2380, lng: 81.6180 },
      { id: "RAI-3", name: "Devendra Nagar", status: "low-pressure", flowRate: 320, pressure: 35, lastUpdated: new Date(), lat: 21.2280, lng: 81.6050 },
      { id: "RAI-4", name: "Pandri", status: "optimal", flowRate: 450, pressure: 46, lastUpdated: new Date(), lat: 21.2334, lng: 81.6520 },
      { id: "RAI-5", name: "Mowa", status: "high-demand", flowRate: 580, pressure: 42, lastUpdated: new Date(), lat: 21.2580, lng: 81.6580 },
      { id: "RAI-6", name: "Tatibandh", status: "optimal", flowRate: 410, pressure: 47, lastUpdated: new Date(), lat: 21.2160, lng: 81.6680 },
      { id: "RAI-7", name: "Gudhiyari", status: "low-pressure", flowRate: 340, pressure: 36, lastUpdated: new Date(), lat: 21.2000, lng: 81.6420 },
      { id: "RAI-8", name: "Kota", status: "high-demand", flowRate: 620, pressure: 40, lastUpdated: new Date(), lat: 21.2100, lng: 81.6850 },
      { id: "RAI-9", name: "Sunder Nagar", status: "optimal", flowRate: 490, pressure: 49, lastUpdated: new Date(), lat: 21.2420, lng: 81.6080 },
      { id: "RAI-10", name: "Urla", status: "high-demand", flowRate: 720, pressure: 38, lastUpdated: new Date(), lat: 21.1920, lng: 81.7020 },
      { id: "RAI-11", name: "Amanaka", status: "optimal", flowRate: 460, pressure: 47, lastUpdated: new Date(), lat: 21.1850, lng: 81.6750 },
      { id: "RAI-12", name: "Telibandha", status: "optimal", flowRate: 500, pressure: 48, lastUpdated: new Date(), lat: 21.2500, lng: 81.6450 },
    ];
    zones.forEach(z => this.zones.set(z.id, z));

    // Initialize pumps with water source references
    const pumps: Pump[] = [
      { id: "P1", zoneId: "RAI-1", sourceId: "SRC-1", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 180 },
      { id: "P2", zoneId: "RAI-1", sourceId: "SRC-7", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 170 },
      { id: "P3", zoneId: "RAI-2", sourceId: "SRC-1", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 160 },
      { id: "P4", zoneId: "RAI-3", sourceId: "SRC-5", status: "idle", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 0 },
      { id: "P5", zoneId: "RAI-3", sourceId: "SRC-5", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 160 },
      { id: "P6", zoneId: "RAI-4", sourceId: "SRC-2", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 150 },
      { id: "P7", zoneId: "RAI-5", sourceId: "SRC-1", status: "active", schedule: "05:30 - 09:30, 17:30 - 21:30", flowRate: 190 },
      { id: "P8", zoneId: "RAI-5", sourceId: "SRC-2", status: "active", schedule: "05:30 - 09:30, 17:30 - 21:30", flowRate: 200 },
      { id: "P9", zoneId: "RAI-6", sourceId: "SRC-2", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 140 },
      { id: "P10", zoneId: "RAI-7", sourceId: "SRC-6", status: "maintenance", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 0 },
      { id: "P11", zoneId: "RAI-7", sourceId: "SRC-6", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 170 },
      { id: "P12", zoneId: "RAI-8", sourceId: "SRC-2", status: "active", schedule: "05:30 - 09:30, 17:30 - 21:30", flowRate: 210 },
      { id: "P13", zoneId: "RAI-9", sourceId: "SRC-7", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 165 },
      { id: "P14", zoneId: "RAI-10", sourceId: "SRC-8", status: "active", schedule: "00:00 - 24:00", flowRate: 240 },
      { id: "P15", zoneId: "RAI-10", sourceId: "SRC-8", status: "active", schedule: "00:00 - 24:00", flowRate: 240 },
      { id: "P16", zoneId: "RAI-11", sourceId: "SRC-2", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 155 },
      { id: "P17", zoneId: "RAI-12", sourceId: "SRC-3", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 170 },
      { id: "P18", zoneId: "RAI-12", sourceId: "SRC-3", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 165 },
    ];
    pumps.forEach(p => this.pumps.set(p.id, p));

    // Initialize alerts
    const alerts: Alert[] = [
      { id: "A1", type: "pressure-drop", zoneId: "RAI-3", severity: "warning", message: "Pressure drop detected in Devendra Nagar area", timestamp: new Date(), resolved: false },
      { id: "A2", type: "excess-pumping", zoneId: "RAI-10", severity: "critical", message: "Excess pumping detected in Urla Industrial area", timestamp: new Date(), resolved: false },
      { id: "A3", type: "leak-detected", zoneId: "RAI-7", severity: "warning", message: "Potential leak detected near Gudhiyari", timestamp: new Date(), resolved: false },
    ];
    alerts.forEach(a => this.alerts.set(a.id, a));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCitizenUser(id: string): Promise<CitizenUser | undefined> {
    return this.citizenUsers.get(id);
  }

  async getCitizenUserByUsername(username: string): Promise<CitizenUser | undefined> {
    return Array.from(this.citizenUsers.values()).find(
      (user) => user.username === username,
    );
  }

  async createCitizenUser(insertUser: Omit<CitizenUser, 'id' | 'createdAt'>): Promise<CitizenUser> {
    const id = randomUUID();
    const user: CitizenUser = { ...insertUser, id, createdAt: new Date() };
    this.citizenUsers.set(id, user);
    return user;
  }

  async getZones(): Promise<Zone[]> {
    return Array.from(this.zones.values());
  }

  async getZone(id: string): Promise<Zone | undefined> {
    return this.zones.get(id);
  }

  async createZone(zone: Omit<Zone, 'id' | 'lastUpdated'>): Promise<Zone> {
    const zoneCount = this.zones.size + 1;
    const id = `RAI-${zoneCount}`;
    const newZone: Zone = { 
      ...zone, 
      id,
      lastUpdated: new Date() 
    };
    this.zones.set(id, newZone);
    return newZone;
  }

  async updateZone(id: string, data: Partial<Zone>): Promise<Zone> {
    const zone = this.zones.get(id);
    if (!zone) throw new Error("Zone not found");
    const updated = { ...zone, ...data, lastUpdated: new Date() };
    this.zones.set(id, updated);
    return updated;
  }

  async deleteZone(id: string): Promise<void> {
    const zone = this.zones.get(id);
    if (!zone) throw new Error("Zone not found");
    this.zones.delete(id);
  }

  async getWaterSources(): Promise<WaterSource[]> {
    return Array.from(this.waterSources.values());
  }

  async getWaterSource(id: string): Promise<WaterSource | undefined> {
    return this.waterSources.get(id);
  }

  async createWaterSource(source: Omit<WaterSource, 'id'>): Promise<WaterSource> {
    const id = `SRC-${randomUUID().substring(0, 8).toUpperCase()}`;
    const newSource: WaterSource = { ...source, id };
    this.waterSources.set(id, newSource);
    return newSource;
  }

  async updateWaterSource(id: string, data: Partial<WaterSource>): Promise<WaterSource> {
    const source = this.waterSources.get(id);
    if (!source) throw new Error("Water source not found");
    const updated = { ...source, ...data };
    this.waterSources.set(id, updated);
    return updated;
  }

  async deleteWaterSource(id: string): Promise<void> {
    const source = this.waterSources.get(id);
    if (!source) throw new Error("Water source not found");
    this.waterSources.delete(id);
  }

  async getPumps(): Promise<Pump[]> {
    return Array.from(this.pumps.values());
  }

  async getPump(id: string): Promise<Pump | undefined> {
    return this.pumps.get(id);
  }

  async updatePump(id: string, data: Partial<Pump>): Promise<Pump> {
    const pump = this.pumps.get(id);
    if (!pump) throw new Error("Pump not found");
    const updated = { ...pump, ...data };
    this.pumps.set(id, updated);
    return updated;
  }

  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(a => !a.resolved);
  }

  async createAlert(alert: Omit<Alert, 'id'>): Promise<Alert> {
    const id = randomUUID();
    const newAlert: Alert = { ...alert, id };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async resolveAlert(id: string): Promise<void> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.resolved = true;
      this.alerts.set(id, alert);
    }
  }

  async getReports(): Promise<CitizenReport[]> {
    return Array.from(this.reports.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async createReport(report: Omit<CitizenReport, 'id' | 'timestamp' | 'reportHash' | 'previousHash' | 'blockNumber' | 'signature' | 'statusHistory'>): Promise<CitizenReport> {
    try {
      const id = randomUUID(); // Use randomUUID for IDs
      const timestamp = new Date();

      // Get all reports to determine block number and previous hash
      const allReports = Array.from(this.reports.values())
        .sort((a, b) => a.blockNumber - b.blockNumber);

      const blockNumber = allReports.length;
      const previousHash = allReports.length > 0 
        ? allReports[allReports.length - 1].reportHash 
        : '0'; // Genesis block

      // Create preliminary report for hashing
      const preliminaryReport = {
        id,
        type: report.type || "Other",
        location: report.location || "Unknown",
        geoLocation: report.geoLocation || { lat: 21.25, lng: 81.63 }, // Default location if not provided
        description: report.description || "",
        contact: report.contact || "",
        status: 'pending' as const,
        timestamp,
        images: report.images,
        previousHash,
        blockNumber,
      };

      // Generate hash and signature
      const reportHash = this.generateReportHash(preliminaryReport);
      const signature = this.generateSignature(reportHash, timestamp);

      const newReport: CitizenReport = { 
        ...preliminaryReport,
        reportHash,
        signature,
        statusHistory: [{
          status: 'pending',
          timestamp,
          updatedBy: 'citizen',
        }],
      };

      this.reports.set(id, newReport);
      console.log(`📦 Block #${blockNumber} created: ${reportHash.substring(0, 16)}...`);
      return newReport;
    } catch (error) {
      console.error("Error creating report:", error);
      throw new Error("Failed to create report");
    }
  }

  private generateReportHash(data: any): string {
    const crypto = require('crypto');
    const content = JSON.stringify({
      id: data.id,
      type: data.type,
      location: data.location,
      description: data.description,
      timestamp: data.timestamp.toISOString(), // Ensure timestamp is stringified
      status: data.status,
      previousHash: data.previousHash || '0',
      geoLocation: data.geoLocation // Include geoLocation in hash
    });
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private generateSignature(reportHash: string, timestamp: Date): string {
    const crypto = require('crypto');
    const data = `${reportHash}:${timestamp.toISOString()}`; // Ensure timestamp is stringified
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async updateReportStatus(id: string, status: CitizenReport['status'], updatedBy: string = 'admin', reason?: string): Promise<CitizenReport> {
    const report = this.reports.get(id);
    if (!report) throw new Error("Report not found");

    // Add to immutable status history (never delete, only append)
    report.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy,
      reason,
    });

    report.status = status;
    this.reports.set(id, report);

    console.log(`🔗 Report ${id} status updated: ${status} (immutable record preserved)`);
    return report;
  }

  // Historical Data Methods
  async getZoneHistory(zoneId: string, hours: number = 24): Promise<ZoneHistoricalData[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.zoneHistory.values())
      .filter(h => h.zoneId === zoneId && h.timestamp >= cutoff)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async recordZoneData(zoneId: string, flowRate: number, pressure: number): Promise<void> {
    const now = new Date();
    const id = randomUUID();
    const record: ZoneHistoricalData = {
      id,
      zoneId,
      flowRate,
      pressure,
      timestamp: now,
      hour: now.getHours(),
      dayOfWeek: now.getDay()
    };
    this.zoneHistory.set(id, record);
  }

  async getReservoirHistory(sourceId: string, hours: number = 24): Promise<ReservoirHistory[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.reservoirHistory.values())
      .filter(h => h.sourceId === sourceId && h.timestamp >= cutoff)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async recordReservoirData(sourceId: string, level: number): Promise<void> {
    const id = randomUUID();
    const record: ReservoirHistory = {
      id,
      sourceId,
      level,
      timestamp: new Date()
    };
    this.reservoirHistory.set(id, record);
  }

  async getPumpHistory(pumpId: string, hours: number = 24): Promise<PumpHistory[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.pumpHistory.values())
      .filter(h => h.pumpId === pumpId && h.timestamp >= cutoff)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async recordPumpData(pumpId: string, status: Pump['status'], flowRate: number, duration: number): Promise<void> {
    const id = randomUUID();
    const record: PumpHistory = {
      id,
      pumpId,
      status,
      flowRate,
      timestamp: new Date(),
      duration
    };
    this.pumpHistory.set(id, record);
  }

  async getAggregatedZoneData(hours: number = 168): Promise<Map<string, ZoneHistoricalData[]>> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const aggregated = new Map<string, ZoneHistoricalData[]>();

    for (const record of this.zoneHistory.values()) {
      if (record.timestamp >= cutoff) {
        const existing = aggregated.get(record.zoneId) || [];
        existing.push(record);
        aggregated.set(record.zoneId, existing);
      }
    }

    return aggregated;
  }

  // Blockchain verification methods
  async verifyReportChain(): Promise<{ valid: boolean; invalidBlock?: number; totalBlocks: number }> {
    const allReports = Array.from(this.reports.values())
      .sort((a, b) => a.blockNumber - b.blockNumber);

    for (let i = 0; i < allReports.length; i++) {
      const report = allReports[i];

      // Verify hash integrity
      const calculatedHash = this.generateReportHash(report);
      if (calculatedHash !== report.reportHash) {
        return { valid: false, invalidBlock: report.blockNumber, totalBlocks: allReports.length };
      }

      // Verify chain link (except genesis block)
      if (i > 0) {
        const previousReport = allReports[i - 1];
        if (report.previousHash !== previousReport.reportHash) {
          return { valid: false, invalidBlock: report.blockNumber, totalBlocks: allReports.length };
        }
      }
    }

    return { valid: true, totalBlocks: allReports.length };
  }

  async getBlockchainStats(): Promise<any> {
    const reports = Array.from(this.reports.values())
      .sort((a, b) => a.blockNumber - b.blockNumber);

    const verification = await this.verifyReportChain();

    return {
      totalBlocks: reports.length,
      isValid: verification.valid,
      invalidBlock: verification.invalidBlock,
      genesisBlock: reports.length > 0 ? {
        number: reports[0].blockNumber,
        hash: reports[0].reportHash.substring(0, 16) + '...',
        timestamp: reports[0].timestamp,
      } : null,
      latestBlock: reports.length > 0 ? {
        number: reports[reports.length - 1].blockNumber,
        hash: reports[reports.length - 1].reportHash.substring(0, 16) + '...',
        timestamp: reports[reports.length - 1].timestamp,
      } : null,
    };
  }

  private startHistoricalDataCollection() {
    // Generate historical data for the past 7 days
    this.generateHistoricalData();

    // Record current data every 15 minutes
    setInterval(() => {
      this.recordCurrentState();
    }, 15 * 60 * 1000);
  }

  private generateHistoricalData() {
    const now = new Date();
    const zones = Array.from(this.zones.values());
    const sources = Array.from(this.waterSources.values());
    const pumps = Array.from(this.pumps.values());

    // Generate 7 days of historical data
    for (let day = 7; day >= 0; day--) {
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const timestamp = new Date(now.getTime() - (day * 24 * 60 * 60 * 1000) - ((23 - hour) * 60 * 60 * 1000) - ((60 - minute) * 60 * 1000));

          // Record zone data with patterns (higher demand morning 6-9 and evening 18-21)
          zones.forEach(zone => {
            const baseFlow = zone.flowRate;
            const basePressure = zone.pressure;
            const isPeakHour = (hour >= 6 && hour <= 9) || (hour >= 18 && hour <= 21);
            const variation = Math.random() * 0.2 - 0.1; // ±10% variation

            const flowRate = baseFlow * (isPeakHour ? 1.3 : 0.7) * (1 + variation);
            const pressure = basePressure * (isPeakHour ? 0.9 : 1.1) * (1 + variation);

            const id = randomUUID();
            this.zoneHistory.set(id, {
              id,
              zoneId: zone.id,
              flowRate,
              pressure,
              timestamp,
              hour: timestamp.getHours(),
              dayOfWeek: timestamp.getDay()
            });
          });

          // Record reservoir levels (gradually decreasing during peak hours)
          sources.forEach(source => {
            const baseLevel = source.currentLevel;
            const isPeakHour = (hour >= 6 && hour <= 9) || (hour >= 18 && hour <= 21);
            const level = baseLevel + (Math.random() * 10 - 5) - (isPeakHour ? 2 : -1);

            const id = randomUUID();
            this.reservoirHistory.set(id, {
              id,
              sourceId: source.id,
              level: Math.max(0, Math.min(100, level)),
              timestamp
            });
          });

          // Record pump activity
          pumps.forEach(pump => {
            const id = randomUUID();
            this.pumpHistory.set(id, {
              id,
              pumpId: pump.id,
              status: pump.status,
              flowRate: pump.flowRate * (Math.random() * 0.2 + 0.9),
              timestamp,
              duration: 15
            });
          });
        }
      }
    }
  }

  private recordCurrentState() {
    const zones = Array.from(this.zones.values());
    const sources = Array.from(this.waterSources.values());
    const pumps = Array.from(this.pumps.values());

    zones.forEach(zone => {
      this.recordZoneData(zone.id, zone.flowRate, zone.pressure);
    });

    sources.forEach(source => {
      this.recordReservoirData(source.id, source.currentLevel);
    });

    pumps.forEach(pump => {
      this.recordPumpData(pump.id, pump.status, pump.flowRate, 15);
    });
  }
}

export const storage = new MemStorage();