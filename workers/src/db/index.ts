/**
 * D1 Database Service for Cloudflare Workers
 * Provides type-safe async query methods for Cloudflare D1 database
 *
 * D1 Binding: DB
 * Configuration: wrangler.toml [[d1_databases]]
 *
 * Key patterns:
 * - All queries are async (must use await)
 * - Use .bind() for parameterized queries (SQL injection prevention)
 * - Use .all() for multiple rows, .first() for single row
 * - Use .batch() instead of transactions
 * - 1MB row size limit
 *
 * Usage in route handlers:
 * ```typescript
 * import { createDatabaseService } from '../db';
 *
 * // Simple queries
 * const db = createDatabaseService(c.env);
 * const users = await db.query<User>('SELECT * FROM users');
 * const user = await db.queryFirst<User>('SELECT * FROM users WHERE id = ?', [1]);
 *
 * // Insert/Update/Delete
 * const result = await db.execute('INSERT INTO users (name) VALUES (?)', ['John']);
 *
 * // Batch operations (replaces transactions)
 * const results = await db.batch([
 *   db.prepareStatement('UPDATE users SET active = 0 WHERE id = ?', [1]),
 *   db.prepareStatement('INSERT INTO logs (action) VALUES (?)', ['deactivated']),
 * ]);
 * ```
 *
 * Direct D1 binding usage (for reference):
 * - Query:   const { results } = await c.env.DB.prepare('SELECT * FROM users').all();
 * - First:   const row = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(1).first();
 * - Execute: await c.env.DB.prepare('INSERT INTO users...').bind(name, email).run();
 * - Batch:   await c.env.DB.batch([stmt1, stmt2]);
 */

import type { Env } from '../types/bindings';

/**
 * Query result interface for SELECT operations
 */
export interface QueryResult<T> {
  results: T[];
  success: boolean;
  meta: D1Meta;
}

/**
 * Execute result interface for INSERT/UPDATE/DELETE operations
 */
export interface ExecuteResult {
  success: boolean;
  meta: D1Meta;
  lastRowId?: number;
  changes?: number;
}

/**
 * D1 metadata returned with query results
 */
export interface D1Meta {
  duration: number;
  rows_read: number;
  rows_written: number;
  last_row_id?: number;
  changes?: number;
}

/**
 * Batch result interface for multiple statements
 */
export interface BatchResult {
  success: boolean;
  results: Array<QueryResult<unknown> | ExecuteResult>;
}

/**
 * Common pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated query result
 */
export interface PaginatedResult<T> {
  results: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Default pagination settings
 */
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  maxLimit: 100,
};

/**
 * Database Service class for Cloudflare Workers
 * Uses D1 database binding for query operations
 */
export class DatabaseService {
  private db: D1Database;

  constructor(env: Env) {
    this.db = env.DB;
  }

  /**
   * Get the raw D1 database instance for direct access
   * Use for complex queries or when you need full control
   */
  getDatabase(): D1Database {
    return this.db;
  }

  /**
   * Prepare a statement with bound parameters
   * Returns a prepared statement ready for execution
   */
  prepare(sql: string): D1PreparedStatement {
    return this.db.prepare(sql);
  }

  /**
   * Prepare a statement with parameters already bound
   * Useful for batch operations
   */
  prepareStatement(sql: string, params: unknown[] = []): D1PreparedStatement {
    let stmt = this.db.prepare(sql);
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }
    return stmt;
  }

  /**
   * Execute a SELECT query and return all results
   * Use for queries that return multiple rows
   */
  async query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<T[]> {
    let stmt = this.db.prepare(sql);
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }
    const result = await stmt.all<T>();
    return result.results || [];
  }

  /**
   * Execute a SELECT query and return the first result
   * Use for queries that should return a single row
   */
  async queryFirst<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<T | null> {
    let stmt = this.db.prepare(sql);
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }
    const result = await stmt.first<T>();
    return result || null;
  }

  /**
   * Execute a SELECT query with full result metadata
   * Returns results along with execution statistics
   */
  async queryWithMeta<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    let stmt = this.db.prepare(sql);
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }
    const result = await stmt.all<T>();
    return {
      results: result.results || [],
      success: result.success,
      meta: {
        duration: result.meta?.duration || 0,
        rows_read: result.meta?.rows_read || 0,
        rows_written: result.meta?.rows_written || 0,
        last_row_id: result.meta?.last_row_id,
        changes: result.meta?.changes,
      },
    };
  }

  /**
   * Execute an INSERT/UPDATE/DELETE statement
   * Returns success status and metadata
   */
  async execute(sql: string, params: unknown[] = []): Promise<ExecuteResult> {
    let stmt = this.db.prepare(sql);
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }
    const result = await stmt.run();
    return {
      success: result.success,
      lastRowId: result.meta?.last_row_id,
      changes: result.meta?.changes,
      meta: {
        duration: result.meta?.duration || 0,
        rows_read: result.meta?.rows_read || 0,
        rows_written: result.meta?.rows_written || 0,
        last_row_id: result.meta?.last_row_id,
        changes: result.meta?.changes,
      },
    };
  }

  /**
   * Execute a raw SQL statement (for DDL operations like CREATE TABLE)
   * Use with caution - no parameter binding
   */
  async executeRaw(sql: string): Promise<ExecuteResult> {
    const result = await this.db.exec(sql);
    return {
      success: true,
      meta: {
        duration: 0,
        rows_read: result.count || 0,
        rows_written: 0,
      },
    };
  }

  /**
   * Execute multiple statements in a batch (replaces transactions)
   * All statements are executed atomically
   */
  async batch(statements: D1PreparedStatement[]): Promise<BatchResult> {
    if (statements.length === 0) {
      return { success: true, results: [] };
    }

    const results = await this.db.batch(statements);

    return {
      success: results.every(r => r.success),
      results: results.map(r => ({
        success: r.success,
        results: r.results || [],
        meta: {
          duration: r.meta?.duration || 0,
          rows_read: r.meta?.rows_read || 0,
          rows_written: r.meta?.rows_written || 0,
          last_row_id: r.meta?.last_row_id,
          changes: r.meta?.changes,
        },
      })),
    };
  }

  /**
   * Execute multiple SQL statements in a batch with parameters
   * Convenience method that builds prepared statements internally
   */
  async batchExecute(
    statements: Array<{ sql: string; params?: unknown[] }>
  ): Promise<BatchResult> {
    const preparedStatements = statements.map(({ sql, params }) =>
      this.prepareStatement(sql, params)
    );
    return this.batch(preparedStatements);
  }

  /**
   * Execute a paginated SELECT query
   * Automatically handles page/offset calculation and counts
   */
  async queryPaginated<T = Record<string, unknown>>(
    sql: string,
    countSql: string,
    params: unknown[] = [],
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, pagination.page || DEFAULT_PAGINATION.page);
    const limit = Math.min(
      Math.max(1, pagination.limit || DEFAULT_PAGINATION.limit),
      DEFAULT_PAGINATION.maxLimit
    );
    const offset = pagination.offset ?? (page - 1) * limit;

    // Build paginated query
    const paginatedSql = `${sql} LIMIT ? OFFSET ?`;
    const paginatedParams = [...params, limit, offset];

    // Execute both queries
    const [results, countResult] = await Promise.all([
      this.query<T>(paginatedSql, paginatedParams),
      this.queryFirst<{ count: number }>(countSql, params),
    ]);

    const total = countResult?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  /**
   * Insert a single row and return the inserted ID
   */
  async insert(
    table: string,
    data: Record<string, unknown>
  ): Promise<number | null> {
    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(data);

    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    const result = await this.execute(sql, values);

    return result.lastRowId || null;
  }

  /**
   * Update rows matching a condition
   */
  async update(
    table: string,
    data: Record<string, unknown>,
    where: string,
    whereParams: unknown[] = []
  ): Promise<number> {
    const columns = Object.keys(data);
    const setClause = columns.map(col => `${col} = ?`).join(', ');
    const values = [...Object.values(data), ...whereParams];

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
    const result = await this.execute(sql, values);

    return result.changes || 0;
  }

  /**
   * Delete rows matching a condition
   */
  async delete(
    table: string,
    where: string,
    whereParams: unknown[] = []
  ): Promise<number> {
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    const result = await this.execute(sql, whereParams);

    return result.changes || 0;
  }

  /**
   * Check if a row exists
   */
  async exists(
    table: string,
    where: string,
    whereParams: unknown[] = []
  ): Promise<boolean> {
    const sql = `SELECT 1 FROM ${table} WHERE ${where} LIMIT 1`;
    const result = await this.queryFirst<{ '1': number }>(sql, whereParams);
    return result !== null;
  }

  /**
   * Get row count for a table with optional condition
   */
  async count(
    table: string,
    where?: string,
    whereParams: unknown[] = []
  ): Promise<number> {
    const sql = where
      ? `SELECT COUNT(*) as count FROM ${table} WHERE ${where}`
      : `SELECT COUNT(*) as count FROM ${table}`;
    const result = await this.queryFirst<{ count: number }>(sql, whereParams);
    return result?.count || 0;
  }

  /**
   * Find a single row by ID
   */
  async findById<T = Record<string, unknown>>(
    table: string,
    id: number | string,
    idColumn: string = 'id'
  ): Promise<T | null> {
    const sql = `SELECT * FROM ${table} WHERE ${idColumn} = ?`;
    return this.queryFirst<T>(sql, [id]);
  }

  /**
   * Find all rows with optional ordering
   */
  async findAll<T = Record<string, unknown>>(
    table: string,
    orderBy?: string,
    direction: 'ASC' | 'DESC' = 'ASC'
  ): Promise<T[]> {
    let sql = `SELECT * FROM ${table}`;
    if (orderBy) {
      sql += ` ORDER BY ${orderBy} ${direction}`;
    }
    return this.query<T>(sql);
  }

  /**
   * Find rows matching a simple WHERE clause
   */
  async findWhere<T = Record<string, unknown>>(
    table: string,
    where: Record<string, unknown>,
    orderBy?: string,
    direction: 'ASC' | 'DESC' = 'ASC'
  ): Promise<T[]> {
    const columns = Object.keys(where);
    const whereClause = columns.map(col => `${col} = ?`).join(' AND ');
    const values = Object.values(where);

    let sql = `SELECT * FROM ${table} WHERE ${whereClause}`;
    if (orderBy) {
      sql += ` ORDER BY ${orderBy} ${direction}`;
    }
    return this.query<T>(sql, values);
  }

  /**
   * Upsert (insert or update on conflict)
   * Requires table to have a UNIQUE constraint on conflictColumns
   */
  async upsert(
    table: string,
    data: Record<string, unknown>,
    conflictColumns: string[],
    updateColumns?: string[]
  ): Promise<ExecuteResult> {
    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(data);

    // Columns to update on conflict (default to all except conflict columns)
    const updateCols = updateColumns || columns.filter(col => !conflictColumns.includes(col));
    const updateClause = updateCols.map(col => `${col} = excluded.${col}`).join(', ');

    const sql = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (${conflictColumns.join(', ')})
      DO UPDATE SET ${updateClause}
    `;

    return this.execute(sql, values);
  }
}

/**
 * Create database service instance from environment
 * Use this in route handlers: const db = createDatabaseService(c.env)
 */
export function createDatabaseService(env: Env): DatabaseService {
  return new DatabaseService(env);
}

/**
 * Helper to safely escape identifiers (table/column names)
 * Use for dynamic queries where identifiers come from user input
 * NOTE: Prefer hardcoded identifiers when possible
 */
export function escapeIdentifier(identifier: string): string {
  // Remove any existing quotes and escape internal quotes
  const cleaned = identifier.replace(/"/g, '""');
  // Only allow alphanumeric, underscore
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(cleaned)) {
    throw new Error(`Invalid identifier: ${identifier}`);
  }
  return `"${cleaned}"`;
}

/**
 * Helper to build a WHERE IN clause with proper placeholders
 */
export function buildInClause(
  column: string,
  values: unknown[]
): { clause: string; params: unknown[] } {
  if (values.length === 0) {
    return { clause: '1 = 0', params: [] }; // Always false
  }
  const placeholders = values.map(() => '?').join(', ');
  return {
    clause: `${column} IN (${placeholders})`,
    params: values,
  };
}

/**
 * Helper to build dynamic ORDER BY clause
 */
export function buildOrderByClause(
  orderBy: string | undefined,
  allowedColumns: string[],
  defaultColumn: string = 'id',
  defaultDirection: 'ASC' | 'DESC' = 'DESC'
): string {
  if (!orderBy) {
    return `ORDER BY ${defaultColumn} ${defaultDirection}`;
  }

  // Parse orderBy format: "column" or "column:direction"
  const [column, direction = defaultDirection] = orderBy.split(':');

  // Validate column is allowed
  if (!allowedColumns.includes(column)) {
    return `ORDER BY ${defaultColumn} ${defaultDirection}`;
  }

  // Validate direction
  const normalizedDirection = direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  return `ORDER BY ${column} ${normalizedDirection}`;
}

/**
 * SQL template tag for safer query building
 * Automatically separates SQL from parameters
 *
 * @example
 * const { sql, params } = sqlTemplate`SELECT * FROM users WHERE id = ${userId} AND status = ${status}`;
 * const results = await db.query(sql, params);
 */
export function sqlTemplate(
  strings: TemplateStringsArray,
  ...values: unknown[]
): { sql: string; params: unknown[] } {
  const sql = strings.reduce((acc, str, i) => {
    return acc + str + (i < values.length ? '?' : '');
  }, '');

  return { sql, params: values };
}
