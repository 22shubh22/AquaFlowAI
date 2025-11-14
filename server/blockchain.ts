
import crypto from 'crypto';

export class ReportBlockchain {
  /**
   * Generate SHA-256 hash of report data
   */
  static generateHash(data: any): string {
    // Only hash immutable core data, excluding status since it changes during workflow
    const content = JSON.stringify({
      id: data.id,
      type: data.type,
      location: data.location,
      description: data.description,
      timestamp: data.timestamp,
      // status is intentionally excluded - it's part of the workflow, not tampering
      previousHash: data.previousHash || '0',
    });
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Generate cryptographic signature with timestamp
   */
  static generateSignature(reportHash: string, timestamp: Date): string {
    const data = `${reportHash}:${timestamp.toISOString()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Verify the integrity of a report
   */
  static verifyReport(report: any): boolean {
    const calculatedHash = this.generateHash(report);
    return calculatedHash === report.reportHash;
  }

  /**
   * Verify the chain from a report back to genesis
   */
  static verifyChain(reports: any[]): { valid: boolean; invalidBlock?: number } {
    // Sort by block number
    const sortedReports = [...reports].sort((a, b) => a.blockNumber - b.blockNumber);

    for (let i = 0; i < sortedReports.length; i++) {
      const report = sortedReports[i];
      
      // Verify hash integrity
      if (!this.verifyReport(report)) {
        return { valid: false, invalidBlock: report.blockNumber };
      }

      // Verify chain link (except genesis block)
      if (i > 0) {
        const previousReport = sortedReports[i - 1];
        if (report.previousHash !== previousReport.reportHash) {
          return { valid: false, invalidBlock: report.blockNumber };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Get blockchain statistics
   */
  static getChainStats(reports: any[]) {
    const verification = this.verifyChain(reports);
    return {
      totalBlocks: reports.length,
      isValid: verification.valid,
      invalidBlock: verification.invalidBlock,
      genesisHash: reports.length > 0 ? reports[0].reportHash : null,
      latestHash: reports.length > 0 ? reports[reports.length - 1].reportHash : null,
    };
  }
}
