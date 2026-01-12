/**
 * Integration tests for D1 Database Operations
 *
 * Tests the DatabaseService class and helper functions for Cloudflare D1.
 * Covers query, execute, batch, insert, update, delete operations
 * with proper D1Database prepare/bind patterns.
 *
 * Uses vitest with @cloudflare/vitest-pool-workers for Cloudflare Workers testing.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Env } from '../types/bindings';
import {
  DatabaseService,
  createDatabaseService,
  escapeIdentifier,
  buildInClause,
  buildOrderByClause,
  sqlTemplate,
} from '../db';

/**
 * Mock D1PreparedStatement interface
 */
interface MockD1PreparedStatement {
  bind: ReturnType<typeof vi.fn>;
  first: ReturnType<typeof vi.fn>;
  all: ReturnType<typeof vi.fn>;
  run: ReturnType<typeof vi.fn>;
}

/**
 * Mock D1Database interface
 */
interface MockD1Database {
  prepare: ReturnType<typeof vi.fn>;
  batch: ReturnType<typeof vi.fn>;
  exec: ReturnType<typeof vi.fn>;
}

/**
 * Helper to create a mock D1PreparedStatement
 */
function createMockPreparedStatement(): MockD1PreparedStatement {
  const stmt: MockD1PreparedStatement = {
    bind: vi.fn(() => stmt),
    first: vi.fn(),
    all: vi.fn(),
    run: vi.fn(),
  };
  return stmt;
}

/**
 * Helper to create a mock D1Database
 */
function createMockD1(): MockD1Database {
  return {
    prepare: vi.fn(() => createMockPreparedStatement()),
    batch: vi.fn(),
    exec: vi.fn(),
  };
}

/**
 * Helper to create mock environment
 */
function createMockEnv(db: MockD1Database): Env {
  return {
    DB: db as unknown as D1Database,
    CACHE: {} as KVNamespace,
    UPLOADS: {} as R2Bucket,
    ENVIRONMENT: 'test',
    ALLOWED_ORIGINS: 'http://localhost:3000',
    LOG_LEVEL: 'debug',
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX_REQUESTS: '1000',
    JWT_SECRET: 'test-jwt-secret',
    EMAIL_API_KEY: 'test-email-key',
    ADMIN_EMAIL: 'test@example.com',
    SETUP_SECRET_TOKEN: 'test-setup-token',
  };
}

describe('DatabaseService', () => {
  let mockDb: MockD1Database;
  let mockEnv: Env;
  let dbService: DatabaseService;

  beforeEach(() => {
    mockDb = createMockD1();
    mockEnv = createMockEnv(mockDb);
    dbService = new DatabaseService(mockEnv);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor and getDatabase', () => {
    it('should create a DatabaseService instance', () => {
      expect(dbService).toBeInstanceOf(DatabaseService);
    });

    it('should return the raw D1Database instance', () => {
      const rawDb = dbService.getDatabase();
      expect(rawDb).toBe(mockEnv.DB);
    });
  });

  describe('prepare()', () => {
    it('should prepare a SQL statement using D1Database.prepare()', () => {
      const sql = 'SELECT * FROM users WHERE id = ?';
      dbService.prepare(sql);

      expect(mockDb.prepare).toHaveBeenCalledWith(sql);
      expect(mockDb.prepare).toHaveBeenCalledTimes(1);
    });

    it('should return a D1PreparedStatement', () => {
      const sql = 'SELECT * FROM users';
      const stmt = dbService.prepare(sql);

      expect(stmt).toHaveProperty('bind');
      expect(stmt).toHaveProperty('first');
      expect(stmt).toHaveProperty('all');
      expect(stmt).toHaveProperty('run');
    });
  });

  describe('prepareStatement()', () => {
    it('should prepare a statement without parameters', () => {
      const sql = 'SELECT * FROM users';
      dbService.prepareStatement(sql);

      expect(mockDb.prepare).toHaveBeenCalledWith(sql);
    });

    it('should prepare a statement with bound parameters using bind()', () => {
      const sql = 'SELECT * FROM users WHERE id = ? AND status = ?';
      const params = [1, 'active'];

      const mockStmt = createMockPreparedStatement();
      mockDb.prepare.mockReturnValue(mockStmt);

      dbService.prepareStatement(sql, params);

      expect(mockDb.prepare).toHaveBeenCalledWith(sql);
      expect(mockStmt.bind).toHaveBeenCalledWith(1, 'active');
    });

    it('should not call bind() when params array is empty', () => {
      const sql = 'SELECT * FROM users';
      const mockStmt = createMockPreparedStatement();
      mockDb.prepare.mockReturnValue(mockStmt);

      dbService.prepareStatement(sql, []);

      expect(mockStmt.bind).not.toHaveBeenCalled();
    });
  });

  describe('query()', () => {
    it('should execute a SELECT query and return results using D1Database.prepare().all()', async () => {
      const sql = 'SELECT * FROM users';
      const mockUsers = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' },
      ];

      const mockStmt = createMockPreparedStatement();
      mockStmt.all.mockResolvedValue({
        results: mockUsers,
        success: true,
        meta: { duration: 1.5 },
      });
      mockDb.prepare.mockReturnValue(mockStmt);

      const results = await dbService.query(sql);

      expect(mockDb.prepare).toHaveBeenCalledWith(sql);
      expect(mockStmt.all).toHaveBeenCalled();
      expect(results).toEqual(mockUsers);
    });

    it('should execute a query with parameters using bind()', async () => {
      const sql = 'SELECT * FROM users WHERE status = ?';
      const params = ['active'];
      const mockUsers = [{ id: 1, name: 'John' }];

      const mockStmt = createMockPreparedStatement();
      mockStmt.all.mockResolvedValue({ results: mockUsers, success: true });
      mockDb.prepare.mockReturnValue(mockStmt);

      const results = await dbService.query(sql, params);

      expect(mockDb.prepare).toHaveBeenCalledWith(sql);
      expect(mockStmt.bind).toHaveBeenCalledWith('active');
      expect(mockStmt.all).toHaveBeenCalled();
      expect(results).toEqual(mockUsers);
    });

    it('should return empty array when no results', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.all.mockResolvedValue({ results: [], success: true });
      mockDb.prepare.mockReturnValue(mockStmt);

      const results = await dbService.query('SELECT * FROM users');

      expect(results).toEqual([]);
    });

    it('should return empty array when results is undefined', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.all.mockResolvedValue({ success: true });
      mockDb.prepare.mockReturnValue(mockStmt);

      const results = await dbService.query('SELECT * FROM users');

      expect(results).toEqual([]);
    });
  });

  describe('queryFirst()', () => {
    it('should execute a query and return first result using D1Database.prepare().first()', async () => {
      const sql = 'SELECT * FROM users WHERE id = ?';
      const params = [1];
      const mockUser = { id: 1, name: 'John', email: 'john@example.com' };

      const mockStmt = createMockPreparedStatement();
      mockStmt.first.mockResolvedValue(mockUser);
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.queryFirst(sql, params);

      expect(mockDb.prepare).toHaveBeenCalledWith(sql);
      expect(mockStmt.bind).toHaveBeenCalledWith(1);
      expect(mockStmt.first).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null when no result found', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.first.mockResolvedValue(null);
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.queryFirst('SELECT * FROM users WHERE id = ?', [999]);

      expect(result).toBeNull();
    });

    it('should return null when result is undefined', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.first.mockResolvedValue(undefined);
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.queryFirst('SELECT * FROM users WHERE id = ?', [999]);

      expect(result).toBeNull();
    });
  });

  describe('queryWithMeta()', () => {
    it('should return results with full metadata', async () => {
      const sql = 'SELECT * FROM users';
      const mockUsers = [{ id: 1, name: 'John' }];
      const mockMeta = { duration: 1.5, rows_read: 1, rows_written: 0 };

      const mockStmt = createMockPreparedStatement();
      mockStmt.all.mockResolvedValue({
        results: mockUsers,
        success: true,
        meta: mockMeta,
      });
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.queryWithMeta(sql);

      expect(result.success).toBe(true);
      expect(result.results).toEqual(mockUsers);
      expect(result.meta.duration).toBe(1.5);
      expect(result.meta.rows_read).toBe(1);
    });

    it('should handle missing metadata gracefully', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.all.mockResolvedValue({
        results: [],
        success: true,
        meta: undefined,
      });
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.queryWithMeta('SELECT * FROM users');

      expect(result.meta.duration).toBe(0);
      expect(result.meta.rows_read).toBe(0);
      expect(result.meta.rows_written).toBe(0);
    });
  });

  describe('execute()', () => {
    it('should execute INSERT statement using D1Database.prepare().run()', async () => {
      const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
      const params = ['John', 'john@example.com'];

      const mockStmt = createMockPreparedStatement();
      mockStmt.run.mockResolvedValue({
        success: true,
        meta: { last_row_id: 1, changes: 1, duration: 0.5 },
      });
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.execute(sql, params);

      expect(mockDb.prepare).toHaveBeenCalledWith(sql);
      expect(mockStmt.bind).toHaveBeenCalledWith('John', 'john@example.com');
      expect(mockStmt.run).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.lastRowId).toBe(1);
      expect(result.changes).toBe(1);
    });

    it('should execute UPDATE statement', async () => {
      const sql = 'UPDATE users SET name = ? WHERE id = ?';
      const params = ['Jane', 1];

      const mockStmt = createMockPreparedStatement();
      mockStmt.run.mockResolvedValue({
        success: true,
        meta: { changes: 1, duration: 0.3 },
      });
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.execute(sql, params);

      expect(mockStmt.bind).toHaveBeenCalledWith('Jane', 1);
      expect(result.success).toBe(true);
      expect(result.changes).toBe(1);
    });

    it('should execute DELETE statement', async () => {
      const sql = 'DELETE FROM users WHERE id = ?';
      const params = [1];

      const mockStmt = createMockPreparedStatement();
      mockStmt.run.mockResolvedValue({
        success: true,
        meta: { changes: 1 },
      });
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.execute(sql, params);

      expect(result.success).toBe(true);
      expect(result.changes).toBe(1);
    });

    it('should handle missing metadata gracefully', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.run.mockResolvedValue({
        success: true,
        meta: undefined,
      });
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.execute('DELETE FROM users WHERE id = ?', [1]);

      expect(result.meta.duration).toBe(0);
      expect(result.meta.rows_read).toBe(0);
    });
  });

  describe('executeRaw()', () => {
    it('should execute raw SQL using D1Database.exec()', async () => {
      const sql = 'CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY)';

      mockDb.exec.mockResolvedValue({ count: 1 });

      const result = await dbService.executeRaw(sql);

      expect(mockDb.exec).toHaveBeenCalledWith(sql);
      expect(result.success).toBe(true);
      expect(result.meta.rows_read).toBe(1);
    });

    it('should handle exec with no count', async () => {
      mockDb.exec.mockResolvedValue({});

      const result = await dbService.executeRaw('DROP TABLE IF EXISTS test');

      expect(result.meta.rows_read).toBe(0);
    });
  });

  describe('batch()', () => {
    it('should execute multiple statements atomically using D1Database.batch()', async () => {
      const stmt1 = createMockPreparedStatement();
      const stmt2 = createMockPreparedStatement();

      mockDb.batch.mockResolvedValue([
        { success: true, results: [], meta: { changes: 1 } },
        { success: true, results: [], meta: { changes: 1 } },
      ]);

      const result = await dbService.batch([
        stmt1 as unknown as D1PreparedStatement,
        stmt2 as unknown as D1PreparedStatement,
      ]);

      expect(mockDb.batch).toHaveBeenCalledWith([stmt1, stmt2]);
      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
    });

    it('should return success: false when any statement fails', async () => {
      mockDb.batch.mockResolvedValue([
        { success: true, results: [], meta: {} },
        { success: false, results: [], meta: {} },
      ]);

      const result = await dbService.batch([
        createMockPreparedStatement() as unknown as D1PreparedStatement,
        createMockPreparedStatement() as unknown as D1PreparedStatement,
      ]);

      expect(result.success).toBe(false);
    });

    it('should return empty results for empty batch', async () => {
      const result = await dbService.batch([]);

      expect(result.success).toBe(true);
      expect(result.results).toEqual([]);
      expect(mockDb.batch).not.toHaveBeenCalled();
    });
  });

  describe('batchExecute()', () => {
    it('should build prepared statements and execute batch', async () => {
      mockDb.batch.mockResolvedValue([
        { success: true, results: [], meta: {} },
        { success: true, results: [], meta: {} },
      ]);

      const result = await dbService.batchExecute([
        { sql: 'UPDATE users SET active = 0 WHERE id = ?', params: [1] },
        { sql: 'INSERT INTO logs (action) VALUES (?)', params: ['deactivated'] },
      ]);

      expect(mockDb.prepare).toHaveBeenCalledTimes(2);
      expect(mockDb.batch).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('queryPaginated()', () => {
    it('should return paginated results with metadata', async () => {
      const sql = 'SELECT * FROM users';
      const countSql = 'SELECT COUNT(*) as count FROM users';
      const mockUsers = [{ id: 1, name: 'John' }];

      const mockStmt = createMockPreparedStatement();
      mockStmt.all.mockResolvedValue({ results: mockUsers, success: true });
      mockStmt.first.mockResolvedValue({ count: 50 });
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.queryPaginated(sql, countSql, [], { page: 2, limit: 10 });

      expect(result.results).toEqual(mockUsers);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(50);
      expect(result.pagination.totalPages).toBe(5);
      expect(result.pagination.hasMore).toBe(true);
    });

    it('should use default pagination values', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.all.mockResolvedValue({ results: [], success: true });
      mockStmt.first.mockResolvedValue({ count: 0 });
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.queryPaginated('SELECT * FROM users', 'SELECT COUNT(*) as count FROM users');

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
    });

    it('should cap limit at maxLimit (100)', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.all.mockResolvedValue({ results: [], success: true });
      mockStmt.first.mockResolvedValue({ count: 0 });
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.queryPaginated(
        'SELECT * FROM users',
        'SELECT COUNT(*) as count FROM users',
        [],
        { limit: 500 }
      );

      expect(result.pagination.limit).toBe(100);
    });
  });

  describe('insert()', () => {
    it('should insert a row and return the ID', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.run.mockResolvedValue({
        success: true,
        meta: { last_row_id: 42, changes: 1 },
      });
      mockDb.prepare.mockReturnValue(mockStmt);

      const id = await dbService.insert('users', {
        name: 'John',
        email: 'john@example.com',
        status: 'active',
      });

      expect(mockDb.prepare).toHaveBeenCalledWith(
        'INSERT INTO users (name, email, status) VALUES (?, ?, ?)'
      );
      expect(mockStmt.bind).toHaveBeenCalledWith('John', 'john@example.com', 'active');
      expect(id).toBe(42);
    });

    it('should return null when insert fails', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.run.mockResolvedValue({
        success: true,
        meta: {},
      });
      mockDb.prepare.mockReturnValue(mockStmt);

      const id = await dbService.insert('users', { name: 'John' });

      expect(id).toBeNull();
    });
  });

  describe('update()', () => {
    it('should update rows and return number of changes', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.run.mockResolvedValue({
        success: true,
        meta: { changes: 3 },
      });
      mockDb.prepare.mockReturnValue(mockStmt);

      const changes = await dbService.update(
        'users',
        { status: 'inactive' },
        'created_at < ?',
        ['2024-01-01']
      );

      expect(mockDb.prepare).toHaveBeenCalledWith(
        'UPDATE users SET status = ? WHERE created_at < ?'
      );
      expect(mockStmt.bind).toHaveBeenCalledWith('inactive', '2024-01-01');
      expect(changes).toBe(3);
    });

    it('should return 0 when no rows updated', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.run.mockResolvedValue({
        success: true,
        meta: {},
      });
      mockDb.prepare.mockReturnValue(mockStmt);

      const changes = await dbService.update('users', { status: 'active' }, 'id = ?', [999]);

      expect(changes).toBe(0);
    });
  });

  describe('delete()', () => {
    it('should delete rows and return number of changes', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.run.mockResolvedValue({
        success: true,
        meta: { changes: 5 },
      });
      mockDb.prepare.mockReturnValue(mockStmt);

      const changes = await dbService.delete('users', 'status = ?', ['deleted']);

      expect(mockDb.prepare).toHaveBeenCalledWith('DELETE FROM users WHERE status = ?');
      expect(mockStmt.bind).toHaveBeenCalledWith('deleted');
      expect(changes).toBe(5);
    });
  });

  describe('exists()', () => {
    it('should return true when row exists', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.first.mockResolvedValue({ '1': 1 });
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.exists('users', 'id = ?', [1]);

      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT 1 FROM users WHERE id = ? LIMIT 1');
      expect(result).toBe(true);
    });

    it('should return false when row does not exist', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.first.mockResolvedValue(null);
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.exists('users', 'id = ?', [999]);

      expect(result).toBe(false);
    });
  });

  describe('count()', () => {
    it('should return count without condition', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.first.mockResolvedValue({ count: 100 });
      mockDb.prepare.mockReturnValue(mockStmt);

      const count = await dbService.count('users');

      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM users');
      expect(count).toBe(100);
    });

    it('should return count with condition', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.first.mockResolvedValue({ count: 25 });
      mockDb.prepare.mockReturnValue(mockStmt);

      const count = await dbService.count('users', 'status = ?', ['active']);

      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM users WHERE status = ?'
      );
      expect(count).toBe(25);
    });

    it('should return 0 when no results', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.first.mockResolvedValue(null);
      mockDb.prepare.mockReturnValue(mockStmt);

      const count = await dbService.count('users');

      expect(count).toBe(0);
    });
  });

  describe('findById()', () => {
    it('should find a row by ID', async () => {
      const mockUser = { id: 1, name: 'John' };
      const mockStmt = createMockPreparedStatement();
      mockStmt.first.mockResolvedValue(mockUser);
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.findById('users', 1);

      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?');
      expect(result).toEqual(mockUser);
    });

    it('should support custom ID column', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.first.mockResolvedValue({ uuid: 'abc-123', name: 'John' });
      mockDb.prepare.mockReturnValue(mockStmt);

      await dbService.findById('users', 'abc-123', 'uuid');

      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM users WHERE uuid = ?');
    });
  });

  describe('findAll()', () => {
    it('should find all rows', async () => {
      const mockUsers = [{ id: 1 }, { id: 2 }];
      const mockStmt = createMockPreparedStatement();
      mockStmt.all.mockResolvedValue({ results: mockUsers, success: true });
      mockDb.prepare.mockReturnValue(mockStmt);

      const results = await dbService.findAll('users');

      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM users');
      expect(results).toEqual(mockUsers);
    });

    it('should find all rows with ordering', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.all.mockResolvedValue({ results: [], success: true });
      mockDb.prepare.mockReturnValue(mockStmt);

      await dbService.findAll('users', 'created_at', 'DESC');

      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT * FROM users ORDER BY created_at DESC'
      );
    });
  });

  describe('findWhere()', () => {
    it('should find rows matching conditions', async () => {
      const mockUsers = [{ id: 1, status: 'active', role: 'admin' }];
      const mockStmt = createMockPreparedStatement();
      mockStmt.all.mockResolvedValue({ results: mockUsers, success: true });
      mockDb.prepare.mockReturnValue(mockStmt);

      const results = await dbService.findWhere('users', {
        status: 'active',
        role: 'admin',
      });

      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE status = ? AND role = ?'
      );
      expect(mockStmt.bind).toHaveBeenCalledWith('active', 'admin');
      expect(results).toEqual(mockUsers);
    });

    it('should support ordering', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.all.mockResolvedValue({ results: [], success: true });
      mockDb.prepare.mockReturnValue(mockStmt);

      await dbService.findWhere('users', { status: 'active' }, 'name', 'ASC');

      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE status = ? ORDER BY name ASC'
      );
    });
  });

  describe('upsert()', () => {
    it('should upsert a row with ON CONFLICT', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.run.mockResolvedValue({ success: true, meta: { changes: 1 } });
      mockDb.prepare.mockReturnValue(mockStmt);

      const result = await dbService.upsert(
        'users',
        { email: 'john@example.com', name: 'John', updated_at: '2026-01-01' },
        ['email'],
        ['name', 'updated_at']
      );

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('ON CONFLICT (email)'));
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at')
      );
      expect(result.success).toBe(true);
    });

    it('should auto-detect update columns when not specified', async () => {
      const mockStmt = createMockPreparedStatement();
      mockStmt.run.mockResolvedValue({ success: true, meta: {} });
      mockDb.prepare.mockReturnValue(mockStmt);

      await dbService.upsert(
        'users',
        { id: 1, name: 'John', email: 'john@example.com' },
        ['id']
      );

      // Should update name and email (all columns except id)
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('name = excluded.name, email = excluded.email')
      );
    });
  });
});

describe('createDatabaseService()', () => {
  it('should create a DatabaseService instance from environment', () => {
    const mockDb = createMockD1();
    const mockEnv = createMockEnv(mockDb);

    const dbService = createDatabaseService(mockEnv);

    expect(dbService).toBeInstanceOf(DatabaseService);
    expect(dbService.getDatabase()).toBe(mockEnv.DB);
  });
});

describe('Helper Functions', () => {
  describe('escapeIdentifier()', () => {
    it('should escape valid identifiers', () => {
      expect(escapeIdentifier('users')).toBe('"users"');
      expect(escapeIdentifier('user_id')).toBe('"user_id"');
      expect(escapeIdentifier('_private')).toBe('"_private"');
    });

    it('should throw for invalid identifiers', () => {
      expect(() => escapeIdentifier('123invalid')).toThrow('Invalid identifier');
      expect(() => escapeIdentifier('user-id')).toThrow('Invalid identifier');
      expect(() => escapeIdentifier('table.column')).toThrow('Invalid identifier');
      expect(() => escapeIdentifier('')).toThrow('Invalid identifier');
    });
  });

  describe('buildInClause()', () => {
    it('should build IN clause with values', () => {
      const result = buildInClause('id', [1, 2, 3]);

      expect(result.clause).toBe('id IN (?, ?, ?)');
      expect(result.params).toEqual([1, 2, 3]);
    });

    it('should return always-false clause for empty values', () => {
      const result = buildInClause('id', []);

      expect(result.clause).toBe('1 = 0');
      expect(result.params).toEqual([]);
    });

    it('should handle single value', () => {
      const result = buildInClause('status', ['active']);

      expect(result.clause).toBe('status IN (?)');
      expect(result.params).toEqual(['active']);
    });
  });

  describe('buildOrderByClause()', () => {
    const allowedColumns = ['id', 'name', 'created_at', 'email'];

    it('should return default ordering when no orderBy specified', () => {
      const result = buildOrderByClause(undefined, allowedColumns);

      expect(result).toBe('ORDER BY id DESC');
    });

    it('should build order clause for allowed column', () => {
      const result = buildOrderByClause('name', allowedColumns);

      expect(result).toBe('ORDER BY name DESC');
    });

    it('should parse column:direction format', () => {
      const result = buildOrderByClause('created_at:ASC', allowedColumns);

      expect(result).toBe('ORDER BY created_at ASC');
    });

    it('should return default for disallowed column', () => {
      const result = buildOrderByClause('password', allowedColumns);

      expect(result).toBe('ORDER BY id DESC');
    });

    it('should normalize direction to ASC or DESC', () => {
      const result1 = buildOrderByClause('name:asc', allowedColumns);
      const result2 = buildOrderByClause('name:invalid', allowedColumns);

      expect(result1).toBe('ORDER BY name ASC');
      expect(result2).toBe('ORDER BY name DESC');
    });

    it('should use custom default column and direction', () => {
      const result = buildOrderByClause(undefined, allowedColumns, 'created_at', 'ASC');

      expect(result).toBe('ORDER BY created_at ASC');
    });
  });

  describe('sqlTemplate()', () => {
    it('should separate SQL from parameters', () => {
      const userId = 1;
      const status = 'active';

      const { sql, params } = sqlTemplate`SELECT * FROM users WHERE id = ${userId} AND status = ${status}`;

      expect(sql).toBe('SELECT * FROM users WHERE id = ? AND status = ?');
      expect(params).toEqual([1, 'active']);
    });

    it('should handle query with no parameters', () => {
      const { sql, params } = sqlTemplate`SELECT * FROM users`;

      expect(sql).toBe('SELECT * FROM users');
      expect(params).toEqual([]);
    });

    it('should handle single parameter', () => {
      const id = 42;
      const { sql, params } = sqlTemplate`SELECT * FROM users WHERE id = ${id}`;

      expect(sql).toBe('SELECT * FROM users WHERE id = ?');
      expect(params).toEqual([42]);
    });

    it('should handle various parameter types', () => {
      const id = 1;
      const name = 'John';
      const active = true;
      const score = 99.5;

      const { sql, params } = sqlTemplate`INSERT INTO users (id, name, active, score) VALUES (${id}, ${name}, ${active}, ${score})`;

      expect(sql).toBe('INSERT INTO users (id, name, active, score) VALUES (?, ?, ?, ?)');
      expect(params).toEqual([1, 'John', true, 99.5]);
    });
  });
});

describe('D1 Pattern Verification', () => {
  it('should demonstrate prepare/bind pattern for D1Database', async () => {
    const mockDb = createMockD1();
    const mockEnv = createMockEnv(mockDb);
    const dbService = new DatabaseService(mockEnv);

    const mockStmt = createMockPreparedStatement();
    mockStmt.all.mockResolvedValue({ results: [], success: true });
    mockDb.prepare.mockReturnValue(mockStmt);

    // This is the D1 pattern: prepare() -> bind() -> all()/first()/run()
    await dbService.query('SELECT * FROM users WHERE status = ?', ['active']);

    // Verify the D1 pattern was followed
    expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM users WHERE status = ?');
    expect(mockStmt.bind).toHaveBeenCalledWith('active');
    expect(mockStmt.all).toHaveBeenCalled();
  });

  it('should demonstrate batch pattern for D1Database', async () => {
    const mockDb = createMockD1();
    const mockEnv = createMockEnv(mockDb);
    const dbService = new DatabaseService(mockEnv);

    mockDb.batch.mockResolvedValue([
      { success: true, results: [], meta: {} },
    ]);

    const stmt = dbService.prepareStatement('UPDATE users SET active = ? WHERE id = ?', [false, 1]);

    await dbService.batch([stmt]);

    // Verify batch was called with prepared statements
    expect(mockDb.batch).toHaveBeenCalledWith([stmt]);
  });
});
