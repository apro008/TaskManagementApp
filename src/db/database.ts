import { open, type DB } from '@op-engineering/op-sqlite';
import { DB_NAME } from '../config/constants';
import { log } from '../utils/logger';
import { migrations } from './schema';

let db: DB | null = null;

export function getDb() {
  if (!db) {
    db = open({ name: DB_NAME });
  }
  return db;
}

export async function initDb() {
  const instance = getDb();
  for (const sql of migrations) {
    await instance.execute(sql);
  }
  log.info('database ready');
}
