import type { Zone, Pump, Alert, CitizenReport, WaterSource } from "../../server/storage";

const API_BASE = "/api";

export const api = {
  // Water Sources
  getWaterSources: () => fetch(`${API_BASE}/water-sources`).then(r => r.json()),
  getWaterSource: (id: string) => fetch(`${API_BASE}/water-sources/${id}`).then(r => r.json()),
  updateWaterSource: (id: string, data: Partial<WaterSource>) =>
    fetch(`${API_BASE}/water-sources/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Zones
  getZones: async () => {
    const res = await fetch(`${API_BASE}/zones`);
    return res.json();
  },

  updateZone: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/zones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Pumps
  getPumps: async () => {
    const res = await fetch(`${API_BASE}/pumps`);
    return res.json();
  },

  updatePump: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/pumps/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Alerts
  getAlerts: async () => {
    const res = await fetch(`${API_BASE}/alerts`);
    return res.json();
  },

  createAlert: async (alert: any) => {
    const res = await fetch(`${API_BASE}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
    return res.json();
  },

  resolveAlert: async (id: string) => {
    await fetch(`${API_BASE}/alerts/${id}/resolve`, { method: 'POST' });
  },

  // Reports
  getReports: async () => {
    const res = await fetch(`${API_BASE}/reports`);
    return res.json();
  },

  createReport: async (report: any) => {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    return res.json();
  },

  updateReportStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_BASE}/reports/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Analytics
  getDemandPrediction: async () => {
    const res = await fetch(`${API_BASE}/analytics/demand-prediction`);
    return res.json();
  },

  getOptimizationSuggestions: async () => {
    const res = await fetch(`${API_BASE}/analytics/optimization-suggestions`);
    return res.json();
  }
};