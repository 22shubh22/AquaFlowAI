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
  reportCount?: number;
}

export interface CitizenReport {
  id: string;
  type: string;
  location: string;
  geoLocation?: { lat: number; lng: number };
  description: string;
  userId: string;
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

export interface PopulationHistory {
  id: string;
  zoneId: string;
  population: number;
  timestamp: Date;
}

export const insertZoneSchema = z.object({
  name: z.string().min(1),
  status: z.enum(["optimal", "low-pressure", "high-demand"]),
  flowRate: z.number().positive(),
  pressure: z.number().positive(),
  lat: z.number(),
  lng: z.number(),
  population: z.number().positive(),
});

export const insertWaterSourceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["river", "lake", "borewell", "reservoir"]),
  location: z.string().min(1),
  geoLocation: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  capacity: z.number().positive(),
  currentLevel: z.number().min(0).max(100),
  quality: z.enum(["excellent", "good", "fair", "poor"]),
  lastTested: z.date().optional(),
  status: z.enum(["active", "inactive", "maintenance"]),
});

export const insertCitizenUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  email: z.string().email(),
  phone: z.string().min(10),
});

export const insertCitizenReportSchema = z.object({
  type: z.string().min(1),
  location: z.string().min(1),
  geoLocation: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  description: z.string().min(10),
  userId: z.string().min(1),
  images: z.array(z.string()).optional(),
});

export type InsertZone = z.infer<typeof insertZoneSchema>;
export type InsertWaterSource = z.infer<typeof insertWaterSourceSchema>;
export type InsertCitizenUser = z.infer<typeof insertCitizenUserSchema>;
export type InsertCitizenReport = z.infer<typeof insertCitizenReportSchema>;
