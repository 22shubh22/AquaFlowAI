
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Download, Upload, Database, Calendar } from "lucide-react";

export default function HistoricalDataPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [uploadData, setUploadData] = useState("");

  const { data: zones } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await api.get("/api/zones");
      return res.json();
    }
  });

  const { data: historicalData, isLoading } = useQuery({
    queryKey: ["zone-history-all", selectedZone],
    queryFn: async () => {
      if (!selectedZone) return [];
      const res = await api.get(`/api/historical/zones/${selectedZone}?hours=8760`); // 1 year
      return res.json();
    },
    enabled: !!selectedZone
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { zoneId: string; data: any[] }) => {
      const res = await api.post("/api/historical/zones/upload", data);
      return res.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Upload Successful",
        description: result.message,
      });
      setUploadData("");
      queryClient.invalidateQueries({ queryKey: ["zone-history-all"] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload historical data",
        variant: "destructive",
      });
    }
  });

  const handleUpload = () => {
    if (!selectedZone) {
      toast({
        title: "No Zone Selected",
        description: "Please select a zone first",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsedData = JSON.parse(uploadData);
      if (!Array.isArray(parsedData)) {
        throw new Error("Data must be an array");
      }
      uploadMutation.mutate({ zoneId: selectedZone, data: parsedData });
    } catch (error: any) {
      toast({
        title: "Invalid JSON",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    if (!historicalData || historicalData.length === 0) return;

    const headers = ["Timestamp", "Flow Rate (L/h)", "Pressure (PSI)", "Hour", "Day of Week"];
    const rows = historicalData.map((record: any) => [
      new Date(record.timestamp).toISOString(),
      record.flowRate,
      record.pressure,
      record.hour,
      record.dayOfWeek
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historical-data-${selectedZone}-${new Date().toISOString()}.csv`;
    a.click();
  };

  const sampleData = [
    {
      timestamp: "2024-01-01T00:00:00Z",
      flowRate: 2500,
      pressure: 45
    },
    {
      timestamp: "2024-01-01T01:00:00Z",
      flowRate: 2200,
      pressure: 46
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historical Data Management</h1>
        <p className="text-muted-foreground mt-1">View and upload historical zone data for AI predictions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Select Zone
          </CardTitle>
          <CardDescription>Choose a zone to view or upload historical data</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a zone" />
            </SelectTrigger>
            <SelectContent>
              {zones?.map((zone: any) => (
                <SelectItem key={zone.id} value={zone.id}>
                  {zone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedZone && (
        <Tabs defaultValue="view" className="space-y-4">
          <TabsList>
            <TabsTrigger value="view">View Data</TabsTrigger>
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Historical Data Records</CardTitle>
                    <CardDescription>
                      {historicalData?.length || 0} records available
                    </CardDescription>
                  </div>
                  <Button onClick={exportToCSV} disabled={!historicalData || historicalData.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : historicalData && historicalData.length > 0 ? (
                  <div className="border rounded-lg overflow-auto max-h-[500px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Flow Rate (L/h)</TableHead>
                          <TableHead>Pressure (PSI)</TableHead>
                          <TableHead>Hour</TableHead>
                          <TableHead>Day of Week</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historicalData.map((record: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs">
                              {new Date(record.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>{Math.round(record.flowRate)}</TableCell>
                            <TableCell>{Math.round(record.pressure)}</TableCell>
                            <TableCell>{record.hour}</TableCell>
                            <TableCell>
                              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][record.dayOfWeek]}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No historical data available for this zone
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Historical Data
                </CardTitle>
                <CardDescription>
                  Upload zone historical data in JSON format for AI predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Format (JSON Array)</label>
                  <Textarea
                    value={uploadData}
                    onChange={(e) => setUploadData(e.target.value)}
                    placeholder={JSON.stringify(sampleData, null, 2)}
                    className="font-mono text-xs min-h-[300px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Each record must include: timestamp (ISO 8601), flowRate (number), pressure (number)
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Sample Format:</p>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(sampleData, null, 2)}
                  </pre>
                </div>

                <Button 
                  onClick={handleUpload} 
                  disabled={!uploadData || uploadMutation.isPending}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadMutation.isPending ? "Uploading..." : "Upload Data"}
                </Button>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Tips for Historical Data
                  </p>
                  <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                    <li>Upload data from multiple time periods for better predictions</li>
                    <li>Include peak and off-peak hours for comprehensive analysis</li>
                    <li>Data should represent typical operational conditions</li>
                    <li>More historical data improves AI prediction accuracy</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
