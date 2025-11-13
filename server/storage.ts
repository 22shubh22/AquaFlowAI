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
}

export interface Pump {
  id: string;
  zoneId: string;
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
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Zones
  getZones(): Promise<Zone[]>;
  getZone(id: string): Promise<Zone | undefined>;
  updateZone(id: string, data: Partial<Zone>): Promise<Zone>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private zones: Map<string, Zone>;
  private pumps: Map<string, Pump>;
  private alerts: Map<string, Alert>;
  private reports: Map<string, CitizenReport>;

  constructor() {
    this.users = new Map();
    this.zones = new Map();
    this.pumps = new Map();
    this.alerts = new Map();
    this.reports = new Map();
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Initialize zones
    const zones: Zone[] = [
      { id: "Z1", name: "North Zone", status: "optimal", flowRate: 450, pressure: 48, lastUpdated: new Date() },
      { id: "Z2", name: "East Zone", status: "low-pressure", flowRate: 320, pressure: 35, lastUpdated: new Date() },
      { id: "Z3", name: "South Zone", status: "high-demand", flowRate: 580, pressure: 42, lastUpdated: new Date() },
      { id: "Z4", name: "West Zone", status: "optimal", flowRate: 410, pressure: 46, lastUpdated: new Date() },
      { id: "Z5", name: "Central Zone", status: "optimal", flowRate: 520, pressure: 50, lastUpdated: new Date() },
      { id: "Z6", name: "Industrial", status: "high-demand", flowRate: 720, pressure: 44, lastUpdated: new Date() },
    ];
    zones.forEach(z => this.zones.set(z.id, z));

    // Initialize pumps
    const pumps: Pump[] = [
      { id: "P-001", zoneId: "Z1", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 450 },
      { id: "P-002", zoneId: "Z2", status: "active", schedule: "05:30 - 08:30, 17:30 - 20:30", flowRate: 380 },
      { id: "P-003", zoneId: "Z3", status: "idle", schedule: "07:00 - 10:00, 19:00 - 22:00", flowRate: 0 },
      { id: "P-004", zoneId: "Z4", status: "active", schedule: "06:30 - 09:30, 18:30 - 21:30", flowRate: 420 },
      { id: "P-005", zoneId: "Z5", status: "maintenance", schedule: "Scheduled Maintenance", flowRate: 0 },
      { id: "P-006", zoneId: "Z6", status: "active", schedule: "24/7 Continuous", flowRate: 720 },
    ];
    pumps.forEach(p => this.pumps.set(p.id, p));
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

  async getZones(): Promise<Zone[]> {
    return Array.from(this.zones.values());
  }

  async getZone(id: string): Promise<Zone | undefined> {
    return this.zones.get(id);
  }

  async updateZone(id: string, data: Partial<Zone>): Promise<Zone> {
    const zone = this.zones.get(id);
    if (!zone) throw new Error("Zone not found");
    const updated = { ...zone, ...data, lastUpdated: new Date() };
    this.zones.set(id, updated);
    return updated;
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

  async createReport(report: Omit<CitizenReport, 'id' | 'timestamp'>): Promise<CitizenReport> {
    const id = randomUUID();
    const newReport: CitizenReport = { 
      ...report, 
      id, 
      timestamp: new Date(),
      status: 'pending'
    };
    this.reports.set(id, newReport);
    return newReport;
  }

  async updateReportStatus(id: string, status: CitizenReport['status']): Promise<CitizenReport> {
    const report = this.reports.get(id);
    if (!report) throw new Error("Report not found");
    report.status = status;
    this.reports.set(id, report);
    return report;
  }
}

export const storage = new MemStorage();
