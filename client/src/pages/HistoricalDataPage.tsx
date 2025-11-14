
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Download, Upload, Database, Calendar, FileText } from "lucide-react";

export default function HistoricalDataPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        description: `Successfully uploaded ${result.insertedCount} records`,
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error("CSV file is empty or has no data rows");
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Validate required columns
    const requiredColumns = ['timestamp', 'flowrate', 'pressure'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      // Validate and transform
      if (!row.timestamp || !row.flowrate || !row.pressure) {
        throw new Error(`Invalid data at row ${i + 1}: missing required fields`);
      }

      data.push({
        timestamp: row.timestamp,
        flowRate: parseFloat(row.flowrate),
        pressure: parseFloat(row.pressure)
      });
    }

    return data;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast({
          title: "Invalid File",
          description: "Please select a CSV file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedZone) {
      toast({
        title: "No Zone Selected",
        description: "Please select a zone first",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await selectedFile.text();
      const parsedData = parseCSV(text);
      
      if (parsedData.length === 0) {
        throw new Error("No valid data found in CSV file");
      }

      uploadMutation.mutate({ zoneId: selectedZone, data: parsedData });
    } catch (error: any) {
      toast({
        title: "Invalid CSV",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    const template = `timestamp,flowRate,pressure
2024-01-01T00:00:00Z,2500,45
2024-01-01T01:00:00Z,2200,46
2024-01-01T02:00:00Z,1800,47
2024-01-01T03:00:00Z,1500,48`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historical-data-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (!historicalData || historicalData.length === 0) return;

    const headers = ["Timestamp", "Flow Rate (L/h)", "Pressure (PSI)"];
    const rows = historicalData.map((record: any) => [
      new Date(record.timestamp).toISOString(),
      record.flowRate,
      record.pressure
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

  const sampleCSV = `timestamp,flowRate,pressure
2024-01-01T00:00:00Z,2500,45
2024-01-01T01:00:00Z,2200,46
2024-01-01T02:00:00Z,1800,47`;

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
                  Upload zone historical data in CSV format for AI predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">CSV File Upload</label>
                  <div className="flex gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={downloadTemplate}
                      className="shrink-0"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    CSV must include columns: timestamp, flowRate, pressure
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Sample CSV Format:</p>
                  <pre className="text-xs overflow-auto bg-background p-2 rounded border">
{sampleCSV}
                  </pre>
                </div>

                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || uploadMutation.isPending}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadMutation.isPending ? "Uploading..." : "Upload CSV"}
                </Button>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    CSV Format Requirements
                  </p>
                  <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                    <li>First row must contain headers: timestamp, flowRate, pressure</li>
                    <li>Timestamp must be in ISO 8601 format (e.g., 2024-01-01T00:00:00Z)</li>
                    <li>flowRate and pressure must be numeric values</li>
                    <li>Include data from multiple time periods for better predictions</li>
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
