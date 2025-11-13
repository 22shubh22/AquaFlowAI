
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication API
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Return user info without password
    res.json({
      id: user.id,
      username: user.username,
      role: "admin" // All authenticated users are admins for now
    });
  });

  // Water Sources API
  app.get("/api/water-sources", async (req, res) => {
    const sources = await storage.getWaterSources();
    res.json(sources);
  });

  app.get("/api/water-sources/:id", async (req, res) => {
    const source = await storage.getWaterSource(req.params.id);
    if (!source) return res.status(404).json({ error: "Water source not found" });
    res.json(source);
  });

  app.patch("/api/water-sources/:id", async (req, res) => {
    try {
      const updated = await storage.updateWaterSource(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(404).json({ error: "Water source not found" });
    }
  });

  // Zones API
  app.get("/api/zones", async (req, res) => {
    const zones = await storage.getZones();
    res.json(zones);
  });

  app.get("/api/zones/:id", async (req, res) => {
    const zone = await storage.getZone(req.params.id);
    if (!zone) return res.status(404).json({ error: "Zone not found" });
    res.json(zone);
  });

  app.patch("/api/zones/:id", async (req, res) => {
    try {
      const updated = await storage.updateZone(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(404).json({ error: "Zone not found" });
    }
  });

  // Pumps API
  app.get("/api/pumps", async (req, res) => {
    const pumps = await storage.getPumps();
    res.json(pumps);
  });

  app.get("/api/pumps/:id", async (req, res) => {
    const pump = await storage.getPump(req.params.id);
    if (!pump) return res.status(404).json({ error: "Pump not found" });
    res.json(pump);
  });

  app.patch("/api/pumps/:id", async (req, res) => {
    try {
      const updated = await storage.updatePump(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(404).json({ error: "Pump not found" });
    }
  });

  // Alerts API
  app.get("/api/alerts", async (req, res) => {
    const alerts = await storage.getAlerts();
    res.json(alerts);
  });

  app.post("/api/alerts", async (req, res) => {
    const alert = await storage.createAlert(req.body);
    res.status(201).json(alert);
  });

  app.post("/api/alerts/:id/resolve", async (req, res) => {
    await storage.resolveAlert(req.params.id);
    res.status(204).send();
  });

  // Citizen Reports API
  app.get("/api/reports", async (req, res) => {
    const reports = await storage.getReports();
    res.json(reports);
  });

  app.post("/api/reports", async (req, res) => {
    const report = await storage.createReport(req.body);
    res.status(201).json(report);
  });

  app.patch("/api/reports/:id/status", async (req, res) => {
    try {
      const updated = await storage.updateReportStatus(req.params.id, req.body.status);
      res.json(updated);
    } catch (error) {
      res.status(404).json({ error: "Report not found" });
    }
  });

  // Analytics API for AI insights
  app.get("/api/analytics/demand-prediction", async (req, res) => {
    const zones = await storage.getZones();
    
    // Simple prediction based on current patterns
    const predictions = zones.map(zone => ({
      zoneId: zone.id,
      zoneName: zone.name,
      predictedDemand: zone.flowRate * (1 + Math.random() * 0.4 - 0.2),
      confidence: 0.75 + Math.random() * 0.2,
      timeWindow: "Next 2 hours"
    }));
    
    res.json(predictions);
  });

  app.get("/api/analytics/optimization-suggestions", async (req, res) => {
    const pumps = await storage.getPumps();
    const zones = await storage.getZones();
    
    const suggestions = [];
    
    // Find zones with low pressure and suggest pump adjustments
    for (const zone of zones) {
      if (zone.pressure < 40) {
        const zonePumps = pumps.filter(p => p.zoneId === zone.id);
        suggestions.push({
          type: "schedule-adjustment",
          priority: "high",
          zone: zone.name,
          message: `Increase pumping capacity in ${zone.name} by 20% to address low pressure`,
          affectedPumps: zonePumps.map(p => p.id)
        });
      }
    }
    
    res.json(suggestions);
  });

  const httpServer = createServer(app);
  return httpServer;
}
