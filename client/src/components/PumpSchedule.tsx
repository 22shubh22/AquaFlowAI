
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Circle, Pencil, Save, X } from "lucide-react";
import { useState } from "react";
import type { Zone, WaterSource, Pump } from "../../server/storage";

interface PumpScheduleProps {
  pumps: Array<{
    id: string;
    pumpId: string;
    zone: string;
    zoneId: string;
    status: "active" | "idle" | "maintenance";
    schedule: string;
    flowRate: string;
    flowRateValue: number;
    sourceId: string;
    sourceName: string;
  }>;
  zones: Zone[];
  sources: WaterSource[];
  onUpdate: (id: string, data: Partial<Pump>) => void;
  isReadOnly?: boolean;
}

export function PumpSchedule({ pumps, zones, sources, onUpdate, isReadOnly = false }: PumpScheduleProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const statusConfig = {
    active: { color: "text-chart-2", bgColor: "bg-chart-2/10", label: "Active" },
    idle: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Idle" },
    maintenance: { color: "text-yellow-500", bgColor: "bg-yellow-500/10", label: "Maintenance" },
  };

  const handleEdit = (pump: any) => {
    setEditingId(pump.pumpId);
    setEditData({
      zoneId: pump.zoneId,
      sourceId: pump.sourceId,
      status: pump.status,
      schedule: pump.schedule,
      flowRate: pump.flowRateValue,
    });
  };

  const handleSave = (pumpId: string) => {
    onUpdate(pumpId, editData);
    setEditingId(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <Card className="p-6" data-testid="card-pump-schedule">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pump Schedule</h3>
        
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pump ID</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Water Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Flow Rate</TableHead>
                {!isReadOnly && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pumps.map((pump) => (
                <TableRow key={pump.pumpId} data-testid={`row-pump-${pump.pumpId}`}>
                  <TableCell className="font-medium">{pump.pumpId}</TableCell>
                  
                  {/* Zone */}
                  <TableCell>
                    {editingId === pump.pumpId ? (
                      <Select
                        value={editData.zoneId}
                        onValueChange={(value) => setEditData({ ...editData, zoneId: value })}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.id}>
                              {zone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      pump.zone
                    )}
                  </TableCell>

                  {/* Water Source */}
                  <TableCell>
                    {editingId === pump.pumpId ? (
                      <Select
                        value={editData.sourceId}
                        onValueChange={(value) => setEditData({ ...editData, sourceId: value })}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sources.map((source) => (
                            <SelectItem key={source.id} value={source.id}>
                              {source.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      pump.sourceName
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {editingId === pump.pumpId ? (
                      <Select
                        value={editData.status}
                        onValueChange={(value) => setEditData({ ...editData, status: value })}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="idle">Idle</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Circle className={`h-2 w-2 fill-current ${statusConfig[pump.status].color}`} />
                        <Badge variant="secondary" className={statusConfig[pump.status].bgColor}>
                          {statusConfig[pump.status].label}
                        </Badge>
                      </div>
                    )}
                  </TableCell>

                  {/* Schedule */}
                  <TableCell className="text-sm">
                    {editingId === pump.pumpId ? (
                      <Input
                        value={editData.schedule}
                        onChange={(e) => setEditData({ ...editData, schedule: e.target.value })}
                        placeholder="e.g., 06:00 - 09:00, 18:00 - 21:00"
                        className="w-[220px]"
                      />
                    ) : (
                      pump.schedule
                    )}
                  </TableCell>

                  {/* Flow Rate */}
                  <TableCell className="font-medium">
                    {editingId === pump.pumpId ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={editData.flowRate}
                          onChange={(e) => setEditData({ ...editData, flowRate: parseInt(e.target.value) })}
                          className="w-[100px]"
                        />
                        <span className="text-sm text-muted-foreground">L/h</span>
                      </div>
                    ) : (
                      pump.flowRate
                    )}
                  </TableCell>

                  {/* Actions */}
                  {!isReadOnly && (
                    <TableCell className="text-right">
                      {editingId === pump.pumpId ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSave(pump.pumpId)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(pump)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
