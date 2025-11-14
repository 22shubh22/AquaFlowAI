
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Shield, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Report {
  id: string;
  type: string;
  location: string;
  description: string;
  status: "pending" | "investigating" | "resolved";
  timestamp: string | Date;
}

import { useAuth } from "@/contexts/AuthContext";

interface CitizenReportsProps {
  reports: Report[];
  onStatusChange?: (reportId: string, newStatus: string) => void;
  loading?: boolean;
}

export function CitizenReports({ reports, onStatusChange, loading }: CitizenReportsProps) {
  const { role } = useAuth();
  const statusConfig = {
    pending: { variant: "secondary" as const, label: "Pending", color: "bg-yellow-500" },
    investigating: { variant: "secondary" as const, label: "Investigating", color: "bg-blue-500" },
    resolved: { variant: "secondary" as const, label: "Resolved", color: "bg-green-500" },
  };

  const [blockchainStats, setBlockchainStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/blockchain/stats')
      .then(res => res.json())
      .then(setBlockchainStats)
      .catch(console.error);
  }, [reports]);

  const formatTimestamp = (timestamp: string | Date) => {
    if (typeof timestamp === 'string') return timestamp;
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <Card className="p-6" data-testid="card-citizen-reports">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Citizen Reports</h3>
          <div className="text-center py-8 text-muted-foreground">
            Loading reports...
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6" data-testid="card-citizen-reports">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Citizen Reports</h3>
          <div className="flex items-center gap-3">
            {blockchainStats?.isValid && (
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3 text-green-600" />
                Blockchain Verified
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {reports.length} report{reports.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        {blockchainStats && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-blue-900 dark:text-blue-100">🔐 Blockchain-Secured Ledger</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                <div className="text-muted-foreground font-medium">Total Blocks</div>
                <div className="font-mono font-bold text-lg">{blockchainStats.totalBlocks}</div>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                <div className="text-muted-foreground font-medium">Chain Status</div>
                <div className="font-bold text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {blockchainStats.isValid ? 'VALID' : 'INVALID'}
                </div>
              </div>
            </div>
            {blockchainStats.genesisBlock && (
              <div className="space-y-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                  <div className="text-muted-foreground text-xs font-medium mb-1">Genesis Block Hash</div>
                  <div className="font-mono text-xs bg-black/5 dark:bg-white/5 p-1 rounded break-all">
                    {blockchainStats.genesisBlock.hash}
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                  <div className="text-muted-foreground text-xs font-medium mb-1">Latest Block Hash</div>
                  <div className="font-mono text-xs bg-black/5 dark:bg-white/5 p-1 rounded break-all">
                    {blockchainStats.latestBlock.hash}
                  </div>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground pt-2 border-t border-blue-200 dark:border-blue-800">
              <strong>SHA-256 Cryptography:</strong> Each report is hashed and chained to the previous block. 
              Any tampering breaks the chain and is instantly detectable.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              No reports submitted yet
            </div>
          ) : (
            reports.map((report: any) => (
              <Card key={report.id} className="p-4 hover-elevate border-l-4 border-l-blue-500" data-testid={`report-${report.id}`}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusConfig[report.status].color}`} />
                      <Badge variant={statusConfig[report.status].variant}>
                        {statusConfig[report.status].label}
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Shield className="h-3 w-3" />
                        Block #{report.blockNumber}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {report.type}
                    </span>
                  </div>
                  
                  {report.reportHash && (
                    <div className="bg-muted/30 rounded p-2 text-xs space-y-1">
                      <div className="font-medium text-muted-foreground">Report Hash (SHA-256)</div>
                      <div className="font-mono text-[10px] break-all bg-black/5 dark:bg-white/5 p-1 rounded">
                        {report.reportHash}
                      </div>
                      {report.previousHash && report.previousHash !== '0' && (
                        <>
                          <div className="font-medium text-muted-foreground pt-1">Previous Hash</div>
                          <div className="font-mono text-[10px] break-all bg-black/5 dark:bg-white/5 p-1 rounded">
                            {report.previousHash}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm line-clamp-2">{report.description}</p>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {report.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(report.timestamp)}
                    </div>
                  </div>

                  {onStatusChange && role === "admin" && (
                    <div className="pt-2 border-t">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            Change Status
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => onStatusChange(report.id, "pending")}
                            disabled={report.status === "pending"}
                          >
                            Mark as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onStatusChange(report.id, "investigating")}
                            disabled={report.status === "investigating"}
                          >
                            Mark as Investigating
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onStatusChange(report.id, "resolved")}
                            disabled={report.status === "resolved"}
                          >
                            Mark as Resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
