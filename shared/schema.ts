
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Citizen users table
export const citizenUsers = pgTable("citizen_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zones table
export const zones = pgTable("zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  status: text("status").notNull(),
  flowRate: numeric("flow_rate").notNull(),
  pressure: numeric("pressure").notNull(),
  lat: numeric("lat").notNull(),
  lng: numeric("lng").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  population: integer("population").notNull().default(50000),
});

// Water sources table
export const waterSources = pgTable("water_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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

// Pumps table
export const pumps = pgTable("pumps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  zoneId: varchar("zone_id").notNull(),
  sourceId: varchar("source_id").notNull(),
  status: text("status").notNull(),
  schedule: text("schedule").notNull(),
  flowRate: numeric("flow_rate").notNull(),
  lastMaintenance: timestamp("last_maintenance"),
});

// Alerts table
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  zoneId: varchar("zone_id").notNull(),
  severity: text("severity").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  resolved: boolean("resolved").default(false),
});

// Citizen reports table
export const citizenReports = pgTable("citizen_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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

// Zone history table
export const zoneHistory = pgTable("zone_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  zoneId: varchar("zone_id").notNull(),
  flowRate: numeric("flow_rate").notNull(),
  pressure: numeric("pressure").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  hour: integer("hour").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
});

// Reservoir history table
export const reservoirHistory = pgTable("reservoir_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceId: varchar("source_id").notNull(),
  level: numeric("level").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Pump history table
export const pumpHistory = pgTable("pump_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pumpId: varchar("pump_id").notNull(),
  status: text("status").notNull(),
  flowRate: numeric("flow_rate").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  duration: integer("duration").notNull(),
});

// Population history table
export const populationHistory = pgTable("population_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  zoneId: varchar("zone_id").notNull(),
  population: integer("population").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
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
  population?: number;
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
