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
      { id: "RAI-1", name: "Civil Lines", status: "optimal", flowRate: 520, pressure: 50, lastUpdated: new Date() },
      { id: "RAI-2", name: "Shankar Nagar", status: "optimal", flowRate: 480, pressure: 48, lastUpdated: new Date() },
      { id: "RAI-3", name: "Devendra Nagar", status: "low-pressure", flowRate: 320, pressure: 35, lastUpdated: new Date() },
      { id: "RAI-4", name: "Pandri", status: "optimal", flowRate: 450, pressure: 46, lastUpdated: new Date() },
      { id: "RAI-5", name: "Mowa", status: "high-demand", flowRate: 580, pressure: 42, lastUpdated: new Date() },
      { id: "RAI-6", name: "Tatibandh", status: "optimal", flowRate: 410, pressure: 47, lastUpdated: new Date() },
      { id: "RAI-7", name: "Gudhiyari", status: "low-pressure", flowRate: 340, pressure: 36, lastUpdated: new Date() },
      { id: "RAI-8", name: "Kota", status: "high-demand", flowRate: 620, pressure: 40, lastUpdated: new Date() },
      { id: "RAI-9", name: "Sunder Nagar", status: "optimal", flowRate: 490, pressure: 49, lastUpdated: new Date() },
      { id: "RAI-10", name: "Urla", status: "high-demand", flowRate: 720, pressure: 38, lastUpdated: new Date() },
      { id: "RAI-11", name: "Amanaka", status: "optimal", flowRate: 460, pressure: 47, lastUpdated: new Date() },
      { id: "RAI-12", name: "Telibandha", status: "optimal", flowRate: 500, pressure: 48, lastUpdated: new Date() },
    ];
    zones.forEach(z => this.zones.set(z.id, z));

    // Initialize pumps
    const pumps: Pump[] = [
      { id: "P1", zoneId: "RAI-1", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 180 },
      { id: "P2", zoneId: "RAI-1", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 170 },
      { id: "P3", zoneId: "RAI-2", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 160 },
      { id: "P4", zoneId: "RAI-3", status: "idle", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 0 },
      { id: "P5", zoneId: "RAI-3", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 160 },
      { id: "P6", zoneId: "RAI-4", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 150 },
      { id: "P7", zoneId: "RAI-5", status: "active", schedule: "05:30 - 09:30, 17:30 - 21:30", flowRate: 190 },
      { id: "P8", zoneId: "RAI-5", status: "active", schedule: "05:30 - 09:30, 17:30 - 21:30", flowRate: 200 },
      { id: "P9", zoneId: "RAI-6", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 140 },
      { id: "P10", zoneId: "RAI-7", status: "maintenance", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 0 },
      { id: "P11", zoneId: "RAI-7", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 170 },
      { id: "P12", zoneId: "RAI-8", status: "active", schedule: "05:30 - 09:30, 17:30 - 21:30", flowRate: 210 },
      { id: "P13", zoneId: "RAI-9", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 165 },
      { id: "P14", zoneId: "RAI-10", status: "active", schedule: "00:00 - 24:00", flowRate: 240 },
      { id: "P15", zoneId: "RAI-10", status: "active", schedule: "00:00 - 24:00", flowRate: 240 },
      { id: "P16", zoneId: "RAI-11", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 155 },
      { id: "P17", zoneId: "RAI-12", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 170 },
      { id: "P18", zoneId: "RAI-12", status: "active", schedule: "06:00 - 09:00, 18:00 - 21:00", flowRate: 165 },
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