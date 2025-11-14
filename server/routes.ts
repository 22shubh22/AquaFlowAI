import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiEngine } from "./ai-engine";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication API
  app.post("/api/auth/login", async (req, res) => {
    const { username, password, expectedRole } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Check citizen users first if expected role is citizen
    if (expectedRole === "citizen") {
      const citizenUser = await storage.getCitizenUserByUsername(username);
      if (citizenUser && citizenUser.password === password) {
        return res.json({
          id: citizenUser.id,
          username: citizenUser.username,
          role: "citizen"
        });
      }
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check admin users
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      id: user.id,
      username: user.username,
      role: "admin"
    });
  });

  app.post("/api/auth/citizen/signup", async (req, res) => {
    const { username, password, email, phone } = req.body;

    if (!username || !password || !email || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await storage.getCitizenUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const newUser = await storage.createCitizenUser({
      username,
      password,
      email,
      phone
    });

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      role: "citizen"
    });
  });

  // Citizen Users Management API (Admin only)
  app.get("/api/citizen-users", async (req, res) => {
    const users = await storage.getCitizenUsers();
    res.json(users);
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

  app.post("/api/water-sources", async (req, res) => {
    try {
      const newSource = await storage.createWaterSource(req.body);
      res.status(201).json(newSource);
    } catch (error) {
      res.status(400).json({ error: "Failed to create water source" });
    }
  });

  app.patch("/api/water-sources/:id", async (req, res) => {
    try {
      const updated = await storage.updateWaterSource(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(404).json({ error: "Water source not found" });
    }
  });

  app.delete("/api/water-sources/:id", async (req, res) => {
    try {
      await storage.deleteWaterSource(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Water source not found" });
    }
  });

  // Zones API
  // Get all zones with AI-calculated status and flow rates
  app.get("/api/zones", async (req, res) => {
    const zones = await storage.getZones();
    const historicalData = await storage.getAggregatedZoneData(24); // Last 24 hours
    const currentTime = new Date();

    // Update each zone with AI predictions
    const updatedZones = zones.map(zone => {
      const zoneHistory = historicalData.get(zone.id) || [];

      // Convert aggregated data to sensor data format
      const sensorData = zoneHistory.map(h => ({
        zoneId: zone.id,
        timestamp: new Date(Date.now() - h.hour * 3600000),
        flowRate: h.flowRate,
        pressure: h.pressure,
        consumption: h.flowRate * h.hour
      }));

      // Check if zone was recently manually updated (within last 5 minutes)
      const timeSinceUpdate = currentTime.getTime() - zone.lastUpdated.getTime();
      const useManualStatus = timeSinceUpdate < 5 * 60 * 1000; // 5 minutes

      return {
        ...zone,
        status: useManualStatus ? zone.status : aiEngine.calculateZoneStatus(zone, sensorData, currentTime),
        flowRate: aiEngine.predictFlowRate(zone, sensorData, currentTime)
      };
    });

    res.json(updatedZones);
  });

  app.get("/api/zones/:id", async (req, res) => {
    const zone = await storage.getZone(req.params.id);
    if (!zone) return res.status(404).json({ error: "Zone not found" });
    res.json(zone);
  });

  app.post("/api/zones", async (req, res) => {
    try {
      const newZone = await storage.createZone(req.body);
      res.status(201).json(newZone);
    } catch (error) {
      res.status(400).json({ error: "Failed to create zone" });
    }
  });

  app.patch("/api/zones/:id", async (req, res) => {
    try {
      const updated = await storage.updateZone(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(404).json({ error: "Zone not found" });
    }
  });

  app.delete("/api/zones/:id", async (req, res) => {
    try {
      await storage.deleteZone(req.params.id);
      res.status(204).send();
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

  app.post("/api/pumps", async (req, res) => {
    try {
      const newPump = await storage.createPump(req.body);
      res.status(201).json(newPump);
    } catch (error) {
      res.status(400).json({ error: "Failed to create pump" });
    }
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
      const { status, updatedBy = 'admin', reason } = req.body;
      const updated = await storage.updateReportStatus(req.params.id, status, updatedBy, reason);
      res.json(updated);
    } catch (error) {
      res.status(404).json({ error: "Report not found" });
    }
  });

  // Blockchain verification endpoints
  app.get("/api/blockchain/verify", async (req, res) => {
    const verification = await storage.verifyReportChain();
    res.json(verification);
  });

  app.get("/api/blockchain/stats", async (req, res) => {
    const stats = await storage.getBlockchainStats();
    res.json(stats);
  });

  // Historical Data API
  app.get("/api/historical/zones/:zoneId", async (req, res) => {
    const hours = parseInt(req.query.hours as string) || 24;
    const history = await storage.getZoneHistory(req.params.zoneId, hours);
    res.json(history);
  });

  app.get("/api/historical/zones", async (req, res) => {
    const hours = parseInt(req.query.hours as string) || 168;
    const aggregated = await storage.getAggregatedZoneData(hours);
    const result: any = {};
    aggregated.forEach((data, zoneId) => {
      result[zoneId] = data;
    });
    res.json(result);
  });

  app.get("/api/historical/reservoirs/:sourceId", async (req, res) => {
    const hours = parseInt(req.query.hours as string) || 24;
    const history = await storage.getReservoirHistory(req.params.sourceId, hours);
    res.json(history);
  });

  app.get("/api/historical/pumps/:pumpId", async (req, res) => {
    const hours = parseInt(req.query.hours as string) || 24;
    const history = await storage.getPumpHistory(req.params.pumpId, hours);
    res.json(history);
  });

  // Analytics API for AI insights
  app.get("/api/analytics/demand-prediction", async (req, res) => {
    const zones = await storage.getZones();
    const historicalData = await storage.getAggregatedZoneData(168); // 7 days

    // Enhanced prediction using historical patterns
    const predictions = await Promise.all(zones.map(async zone => {
      const history = historicalData.get(zone.id) || [];

      // Calculate average demand by hour of day
      const currentHour = new Date().getHours();
      const nextHour = (currentHour + 2) % 24;

      const historicalAtHour = history.filter(h => h.hour >= currentHour && h.hour <= nextHour);
      const avgFlow = historicalAtHour.length > 0
        ? historicalAtHour.reduce((sum, h) => sum + h.flowRate, 0) / historicalAtHour.length
        : zone.flowRate;

      const predictedDemand = avgFlow * (1 + Math.random() * 0.1 - 0.05);
      const confidence = Math.min(0.95, 0.6 + (historicalAtHour.length / 100));

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        currentDemand: zone.flowRate,
        predictedDemand: Math.round(predictedDemand),
        confidence: Math.round(confidence * 100) / 100,
        timeWindow: "Next 2 hours",
        trend: predictedDemand > zone.flowRate ? "increasing" : "decreasing"
      };
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

    // Anomaly Detection: Excess Pumping (simulated - actual detection would involve more complex logic)
    for (const zone of zones) {
      const zoneHistory = await storage.getZoneHistory(zone.id, 1); // Last hour
      if (zoneHistory.length > 0 && zoneHistory[0].flowRate > zone.maxFlowRate * 1.1) {
        suggestions.push({
          type: "anomaly-detection",
          priority: "critical",
          zone: zone.name,
          message: `Excessive pumping detected in ${zone.name}. Current flow rate exceeds normal operational limits.`,
          details: {
            currentFlowRate: zoneHistory[0].flowRate,
            maxFlowRate: zone.maxFlowRate,
            exceededBy: (zoneHistory[0].flowRate / zone.maxFlowRate * 100 - 100).toFixed(2) + "%"
          }
        });
      }
    }

    // Anomaly Detection: Leak Detection (simulated - actual detection would involve pressure drop analysis)
    for (const zone of zones) {
      const zoneHistory = await storage.getZoneHistory(zone.id, 1); // Last hour
      if (zoneHistory.length > 0 && zoneHistory[0].pressure < zone.minPressure * 0.9) {
        suggestions.push({
          type: "anomaly-detection",
          priority: "high",
          zone: zone.name,
          message: `Potential leak detected in ${zone.name} due to significant pressure drop.`,
          details: {
            currentPressure: zoneHistory[0].pressure,
            minPressure: zone.minPressure,
            pressureDrop: (zone.minPressure - zoneHistory[0].pressure).toFixed(2)
          }
        });
      }
    }


    res.json(suggestions);
  });

  // Get AI-recommended pump schedules
  app.get('/api/ai/schedules', async (req, res) => {
    try {
      const zones = await storage.getZones();
      const pumps = await storage.getPumps();
      const historicalDataMap = await storage.getAggregatedZoneData(24);

      const schedules = aiEngine.generatePumpSchedules(zones, pumps, historicalDataMap);

      // Ensure we always return an array
      if (!schedules || schedules.length === 0) {
        console.log('No schedules generated, returning empty array');
        return res.json([]);
      }

      console.log(`Generated ${schedules.length} pump schedules`);
      res.json(schedules);
    } catch (error) {
      console.error('Error generating pump schedules:', error);
      res.status(500).json({ error: 'Failed to generate pump schedules' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}