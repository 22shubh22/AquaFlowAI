
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, Link as LinkIcon, Hash } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function BlockchainVerificationPage() {
  const { data: stats } = useQuery({
    queryKey: ['/api/blockchain/stats'],
    refetchInterval: 5000,
  });

  const { data: reports } = useQuery<any[]>({
    queryKey: ['/api/reports'],
    refetchInterval: 5000,
  });

  const sortedReports = reports?.sort((a, b) => a.blockNumber - b.blockNumber) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🔐 Blockchain Verification</h1>
        <p className="text-muted-foreground">
          Cryptographic proof of data integrity using SHA-256 hashing
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-300">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Chain Status</span>
              </div>
              <div className="text-3xl font-bold">
                {stats.isValid ? (
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-8 w-8" />
                    VALID
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-2">
                    <XCircle className="h-8 w-8" />
                    INVALID
                  </span>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-300">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <LinkIcon className="h-5 w-5" />
                <span className="font-semibold">Total Blocks</span>
              </div>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {stats.totalBlocks}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-300">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Hash className="h-5 w-5" />
                <span className="font-semibold">Hash Algorithm</span>
              </div>
              <div className="text-xl font-bold text-green-900 dark:text-green-100">
                SHA-256
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Blockchain Structure</h2>
        <div className="space-y-3">
          {sortedReports.map((report, index) => (
            <div key={report.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-muted/30 rounded-r">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Block #{report.blockNumber}</Badge>
                  <Badge variant="secondary">{report.type}</Badge>
                </div>
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Location:</span>{' '}
                  {report.location}
                </div>
                
                <div className="bg-black/5 dark:bg-white/5 p-2 rounded space-y-1">
                  <div className="font-mono text-xs">
                    <span className="font-bold text-blue-600">Block Hash:</span>
                    <div className="break-all mt-1">{report.reportHash}</div>
                  </div>
                  
                  {index > 0 && (
                    <div className="font-mono text-xs pt-2 border-t border-border">
                      <span className="font-bold text-purple-600">Previous Hash:</span>
                      <div className="break-all mt-1">{report.previousHash}</div>
                      <div className="flex items-center gap-1 mt-1 text-green-600">
                        <LinkIcon className="h-3 w-3" />
                        <span>Linked to Block #{report.blockNumber - 1}</span>
                      </div>
                    </div>
                  )}
                  
                  {index === 0 && (
                    <div className="font-mono text-xs pt-2 border-t border-border">
                      <span className="font-bold text-yellow-600">Genesis Block</span>
                      <div className="text-muted-foreground">No previous hash (chain origin)</div>
                    </div>
                  )}
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded text-xs">
                  <div className="font-mono">
                    <span className="font-bold text-green-700 dark:text-green-400">Signature:</span>
                    <div className="break-all mt-1">{report.signature}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-700">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          How Blockchain Ensures Data Integrity
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <span><strong>Cryptographic Hashing:</strong> Each report is converted into a unique SHA-256 hash (64-character hexadecimal string)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <span><strong>Chain Linking:</strong> Each block contains the hash of the previous block, creating an unbreakable chain</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <span><strong>Tamper Detection:</strong> Modifying any report changes its hash, breaking the chain and making tampering instantly detectable</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <span><strong>Immutability:</strong> Reports cannot be deleted or altered without leaving cryptographic evidence</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
