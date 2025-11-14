import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
  capacity: number;
  currentLevel: number;
  quality: "excellent" | "good" | "fair" | "poor";
  lastTested?: Date;
  status: "active" | "inactive" | "maintenance";
}

export interface Pump {
  id: string;
  zoneId: string;
  sourceId: string;
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
  reportHash: string;
  previousHash: string;
  blockNumber: number;
  signature: string;
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
  hour: number;
  dayOfWeek: number;
}

export interface ReservoirHistory {
  id: string;
  sourceId: string;
  level: number;
  timestamp: Date;
}

export interface PumpHistory {
  id: string;
  pumpId: string;
  status: "active" | "idle" | "maintenance";
  flowRate: number;
  timestamp: Date;
  duration: number;
}
