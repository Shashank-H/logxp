import { Database } from "bun:sqlite";
import type { LogEntry } from "../../types/log";
import type { Filter } from "../../types/state";

export class LogDatabase {
  private db: Database;
  private dbPath: string;
  private insertStmt: any;
  private cleanupRegistered = false;

  constructor() {
    // Create database in temp directory with unique name per process
    const tmpDir = process.env.TMPDIR || process.env.TMP || "/tmp";
    this.dbPath = `${tmpDir}/logxp-${process.pid}.db`;

    this.db = new Database(this.dbPath);
    this.initSchema();
    this.prepareStatements();
    this.registerCleanup();
  }

  private initSchema(): void {
    // Create logs table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        raw TEXT NOT NULL,
        format TEXT NOT NULL,
        level TEXT NOT NULL,
        timestamp INTEGER,
        message TEXT,
        metadata TEXT,
        line_number INTEGER NOT NULL
      )
    `);

    // Create indexes for common queries
    this.db.run("CREATE INDEX IF NOT EXISTS idx_level ON logs(level)");
    this.db.run("CREATE INDEX IF NOT EXISTS idx_timestamp ON logs(timestamp)");
    this.db.run(
      "CREATE INDEX IF NOT EXISTS idx_line_number ON logs(line_number)"
    );
  }

  private prepareStatements(): void {
    // Prepare insert statement for reuse
    this.insertStmt = this.db.prepare(`
      INSERT INTO logs (id, raw, format, level, timestamp, message, metadata, line_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
  }

  private registerCleanup(): void {
    if (this.cleanupRegistered) return;

    const cleanup = () => {
      try {
        this.close();
      } catch (err) {
        // Ignore errors during cleanup
      }
    };

    // Register cleanup handlers
    process.on("beforeExit", cleanup);
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    this.cleanupRegistered = true;
  }

  /**
   * Insert multiple logs in a single transaction
   */
  insertLogs(logs: LogEntry[]): void {
    if (logs.length === 0) return;

    const transaction = this.db.transaction((entries: LogEntry[]) => {
      for (const log of entries) {
        this.insertStmt.run(
          log.id,
          log.raw,
          log.format,
          log.level,
          log.timestamp ? log.timestamp.getTime() : null,
          log.message || null,
          log.metadata ? JSON.stringify(log.metadata) : null,
          log.lineNumber
        );
      }
    });

    transaction(logs);
  }

  /**
   * Get total count of logs with optional filters
   */
  getLogCount(filters?: Filter[]): number {
    const { query, params } = this.buildQuery("COUNT(*) as count", filters);
    const result = this.db.query(query).get(...params) as { count: number };
    return result.count;
  }

  /**
   * Get logs with pagination and optional filters/sorting
   */
  getLogs(
    offset: number,
    limit: number,
    filters?: Filter[],
    sortBy?: string
  ): LogEntry[] {
    const { query, params } = this.buildQuery(
      "*",
      filters,
      sortBy,
      limit,
      offset
    );
    const rows = this.db.query(query).all(...params) as any[];

    return rows.map((row) => this.rowToLogEntry(row));
  }

  /**
   * Search logs and return matching indices
   */
  searchLogs(term: string, filters?: Filter[]): number[] {
    const lowerTerm = term.toLowerCase();
    const { query: baseQuery, params: baseParams } = this.buildQuery(
      "id, raw, message",
      filters
    );

    // We need to filter in-memory since SQLite LIKE is case-insensitive by default
    // but we want to search both raw and message fields
    const rows = this.db.query(baseQuery).all(...baseParams) as any[];

    const matchingIds: number[] = [];
    rows.forEach((row, index) => {
      const searchText = (row.raw + (row.message || "")).toLowerCase();
      if (searchText.includes(lowerTerm)) {
        matchingIds.push(index);
      }
    });

    return matchingIds;
  }

  /**
   * Clear all logs from the database
   */
  clear(): void {
    this.db.run("DELETE FROM logs");
  }

  /**
   * Close database and delete file
   */
  close(): void {
    try {
      this.db.close();
      // Delete the database file
      const fs = require("fs");
      if (fs.existsSync(this.dbPath)) {
        fs.unlinkSync(this.dbPath);
      }
    } catch (err) {
      // Ignore errors during cleanup
    }
  }

  /**
   * Build SQL query with filters, sorting, and pagination
   */
  private buildQuery(
    select: string,
    filters?: Filter[],
    sortBy?: string,
    limit?: number,
    offset?: number
  ): { query: string; params: any[] } {
    let query = `SELECT ${select} FROM logs`;
    const params: any[] = [];
    const whereClauses: string[] = [];

    // Add filter conditions
    if (filters && filters.length > 0) {
      for (const filter of filters) {
        if (filter.type === "level") {
          whereClauses.push("level = ?");
          params.push(filter.levelValue);
        } else if (filter.type === "search") {
          // Search filter - search in raw and message
          whereClauses.push("(LOWER(raw) LIKE ? OR LOWER(message) LIKE ?)");
          const searchTerm = `%${filter.value.toLowerCase()}%`;
          params.push(searchTerm, searchTerm);
        } else {
          // Text filter - search in raw and message
          whereClauses.push("(LOWER(raw) LIKE ? OR LOWER(message) LIKE ?)");
          const searchTerm = `%${filter.value.toLowerCase()}%`;
          params.push(searchTerm, searchTerm);
        }
      }
    }

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    // Add sorting
    if (sortBy === "timestamp") {
      query += " ORDER BY timestamp ASC";
    } else if (sortBy === "level") {
      query +=
        ' ORDER BY CASE level WHEN "error" THEN 0 WHEN "warn" THEN 1 WHEN "info" THEN 2 WHEN "debug" THEN 3 WHEN "trace" THEN 4 ELSE 5 END';
    } else {
      // Default: order by id (insertion order)
      query += " ORDER BY id ASC";
    }

    // Add pagination
    if (limit !== undefined) {
      query += " LIMIT ?";
      params.push(limit);
    }
    if (offset !== undefined && offset > 0) {
      query += " OFFSET ?";
      params.push(offset);
    }

    return { query, params };
  }

  /**
   * Convert database row to LogEntry
   */
  private rowToLogEntry(row: any): LogEntry {
    return {
      id: row.id,
      raw: row.raw,
      format: row.format as "json" | "text",
      level: row.level,
      timestamp: row.timestamp ? new Date(row.timestamp) : undefined,
      message: row.message || undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      lineNumber: row.line_number,
    };
  }
}
