import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import dns from 'dns';
import fs from 'fs';
import path from 'path';

// Ensure reliable SRV and TXT record resolution in Windows and restricted Node environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where setServers is restricted
}

function getSanitizedMongoUri(): string | null {
  let raw = process.env.MONGODB_URI;
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/^MONGODB_URI=(.*)$/m);
      if (match && match[1]?.trim()) {
        raw = match[1].trim();
      }
    }
  } catch {
    // Ignore in read-restricted environments
  }
  if (!raw || !raw.trim()) return null;
  // Automatically strip accidental angle brackets <...> from username/password
  return raw.trim().replace(/<([^>]+)>/g, '$1');
}

function getDatabaseName(): string {
  let name = process.env.MONGODB_DB_NAME;
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/^MONGODB_DB_NAME=(.*)$/m);
      if (match && match[1]?.trim()) {
        name = match[1].trim();
      }
    }
  } catch {
    // Ignore
  }
  return name || 'rps_ecommerce';
}

let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Checks whether MONGODB_URI environment variable is explicitly configured.
 */
export function isMongoConfigured(): boolean {
  const uri = getSanitizedMongoUri();
  return Boolean(uri && uri.length > 0);
}

async function resolveMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith('mongodb+srv://')) {
    return uri;
  }
  try {
    const resolver = new dns.promises.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1']);
    const match = uri.match(/^mongodb\+srv:\/\/([^@]+)@([^\/\?]+)(.*)$/);
    if (match) {
      const userinfo = match[1];
      const host = match[2];
      const rest = match[3] || '';
      const srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
      if (srvRecords && srvRecords.length > 0) {
        const hostsList = srvRecords.map((r) => `${r.name}:${r.port}`).join(',');
        let txtParams = '';
        try {
          const txtRecords = await resolver.resolveTxt(host);
          if (txtRecords && txtRecords.length > 0) {
            txtParams = txtRecords.map((t) => t.join('')).join('&');
          }
        } catch {
          // ignore txt lookup failure
        }
        const dbAndQuery = rest.startsWith('/') ? rest : `/${rest}`;
        const delimiter = dbAndQuery.includes('?') ? '&' : '?';
        const queryWithTxt = txtParams ? `${delimiter}${txtParams}&ssl=true` : `${delimiter}ssl=true`;
        return `mongodb://${userinfo}@${hostsList}${dbAndQuery}${queryWithTxt}`;
      }
    }
  } catch (err) {
    console.warn('[MongoDB] Custom SRV resolution fallback skipped:', err);
  }
  return uri;
}

const MONGO_CLIENT_OPTIONS: MongoClientOptions = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  maxPoolSize: 10,
};

async function connectClient(rawUri: string): Promise<MongoClient> {
  try {
    const resolvedUri = await resolveMongoUri(rawUri);
    const clientInstance = new MongoClient(resolvedUri, MONGO_CLIENT_OPTIONS);
    await clientInstance.connect();
    return clientInstance;
  } catch (primaryErr) {
    // If custom resolution failed, retry with direct raw URI
    try {
      const fallbackClient = new MongoClient(rawUri, MONGO_CLIENT_OPTIONS);
      await fallbackClient.connect();
      return fallbackClient;
    } catch {
      throw primaryErr;
    }
  }
}

/**
 * MongoDB client promise getter using the official MongoDB Node.js driver.
 * Returns null if MONGODB_URI is not configured.
 */
export function getMongoClientPromise(): Promise<MongoClient> | null {
  const validUri = getSanitizedMongoUri();
  if (!validUri) {
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = connectClient(validUri).catch((err) => {
        global._mongoClientPromise = undefined;
        throw err;
      });
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      clientPromise = connectClient(validUri).catch((err) => {
        clientPromise = null;
        throw err;
      });
    }
    return clientPromise;
  }
}

type DbInitHook = (db: Db) => Promise<void>;
let _dbInitHook: DbInitHook | null = null;
let _initCompleted = false;

export function registerDatabaseInitHook(hook: DbInitHook): void {
  _dbInitHook = hook;
}

/**
 * Helper to obtain the database instance.
 * Throws a clean error if MONGODB_URI is missing or if connection fails.
 */
export async function getDatabase(): Promise<Db> {
  const promise = getMongoClientPromise();
  if (!promise) {
    throw new Error(
      'MongoDB is not configured. Please define MONGODB_URI and MONGODB_DB_NAME in environment configuration.'
    );
  }
  const connectedClient = await promise;
  const db = connectedClient.db(getDatabaseName());

  if (!_initCompleted) {
    _initCompleted = true;
    try {
      await initMongoIndexes(db);
      if (_dbInitHook) {
        await _dbInitHook(db);
      }
    } catch (err) {
      _initCompleted = false; // allow retry if failed
      throw err;
    }
  }

  return db;
}

/**
 * Idempotent index initialization for all persistence collections.
 * Safe to run multiple times without data modification or downtime.
 */
export async function initMongoIndexes(db: Db): Promise<{ created: string[]; errors: string[] }> {
  const created: string[] = [];
  const errors: string[] = [];

  const safeCreateIndex = async (collection: string, indexSpec: Record<string, 1 | -1 | 'text'>, options: Record<string, unknown> = {}) => {
    try {
      await db.collection(collection).createIndex(indexSpec, options);
      created.push(`${collection}: ${JSON.stringify(indexSpec)}`);
    } catch (err) {
      errors.push(`${collection}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // 1. Users collection
  await safeCreateIndex('users', { email: 1 }, { unique: true, background: true });
  await safeCreateIndex('users', { role: 1 }, { background: true });
  await safeCreateIndex('users', { vendorId: 1 }, { background: true });

  // 2. Vendors collection
  await safeCreateIndex('vendors', { id: 1 }, { unique: true, background: true });
  await safeCreateIndex('vendors', { status: 1 }, { background: true });

  // 3. Products collection
  await safeCreateIndex('products', { id: 1 }, { unique: true, background: true });
  await safeCreateIndex('products', { vendorId: 1, isPublished: 1 }, { background: true });
  await safeCreateIndex('products', { category: 1 }, { background: true });

  // 4. Orders collection
  await safeCreateIndex('orders', { id: 1 }, { unique: true, background: true });
  await safeCreateIndex('orders', { orderNumber: 1 }, { unique: true, background: true });
  await safeCreateIndex('orders', { vendorIds: 1 }, { background: true });
  await safeCreateIndex('orders', { orderStatus: 1 }, { background: true });
  await safeCreateIndex('orders', { createdAt: -1 }, { background: true });

  // 5. Quotations collection
  await safeCreateIndex('quotations', { id: 1 }, { unique: true, background: true });
  await safeCreateIndex('quotations', { quotationNumber: 1 }, { unique: true, background: true });
  await safeCreateIndex('quotations', { vendorId: 1 }, { background: true });
  await safeCreateIndex('quotations', { status: 1 }, { background: true });

  // 6. Certifications collection
  await safeCreateIndex('certifications', { id: 1 }, { unique: true, background: true });
  await safeCreateIndex('certifications', { status: 1 }, { background: true });
  await safeCreateIndex('certifications', { vendorId: 1 }, { background: true });

  // 7. Payments collection
  await safeCreateIndex('payments', { id: 1 }, { unique: true, background: true });
  await safeCreateIndex('payments', { orderId: 1 }, { background: true });
  await safeCreateIndex('payments', { idempotencyKey: 1 }, { sparse: true, background: true });

  // 8. Order Notifications collection
  await safeCreateIndex('order_notifications', { id: 1 }, { unique: true, background: true });
  await safeCreateIndex('order_notifications', { orderId: 1 }, { background: true });
  await safeCreateIndex('order_notifications', { recipientType: 1, recipientId: 1 }, { background: true });

  return { created, errors };
}
