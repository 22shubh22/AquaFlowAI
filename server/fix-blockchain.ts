
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { ReportBlockchain } from './blockchain';
import { pgTable, varchar, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { sql as sqlOperator } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const citizenReports = pgTable("citizen_reports", {
  id: varchar("id").primaryKey().default(sqlOperator`gen_random_uuid()`),
  type: text("type").notNull(),
  location: text("location").notNull(),
  geoLocation: jsonb("geo_location"),
  description: text("description").notNull(),
  contact: text("contact").notNull(),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  reportHash: text("report_hash"),
  previousHash: text("previous_hash"),
  blockNumber: integer("block_number"),
  signature: text("signature"),
  statusHistory: jsonb("status_history"),
});

async function diagnoseAndFix() {
  console.log('🔍 Diagnosing blockchain...\n');
  
  const reports = await db.select().from(citizenReports);
  const sortedReports = reports.sort((a, b) => (a.blockNumber || 0) - (b.blockNumber || 0));
  
  console.log(`Found ${reports.length} reports\n`);
  
  for (const report of sortedReports) {
    console.log(`Block #${report.blockNumber}:`);
    console.log(`  ID: ${report.id}`);
    console.log(`  Stored hash: ${report.reportHash}`);
    
    // Recalculate hash
    const calculatedHash = ReportBlockchain.generateHash(report);
    console.log(`  Calculated hash: ${calculatedHash}`);
    console.log(`  Match: ${calculatedHash === report.reportHash ? '✅' : '❌'}`);
    
    if (report.blockNumber && report.blockNumber > 0) {
      const expectedPrevious = sortedReports[report.blockNumber - 1]?.reportHash;
      console.log(`  Previous hash: ${report.previousHash}`);
      console.log(`  Expected previous: ${expectedPrevious}`);
      console.log(`  Chain link: ${report.previousHash === expectedPrevious ? '✅' : '❌'}`);
    }
    console.log('');
  }
  
  const verification = ReportBlockchain.verifyChain(sortedReports);
  console.log(`\n📊 Chain verification: ${verification.valid ? '✅ VALID' : '❌ INVALID'}`);
  if (!verification.valid) {
    console.log(`   Invalid at block: ${verification.invalidBlock}`);
  }
}

diagnoseAndFix().catch(console.error);
