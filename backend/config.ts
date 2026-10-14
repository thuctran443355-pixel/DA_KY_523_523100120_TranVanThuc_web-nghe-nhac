import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const PROJECT_ROOT = fileURLToPath(new URL('../', import.meta.url));
// Shell variables take priority, followed by .env.local, then .env.
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), quiet: true });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env'), quiet: true });
export const DATA_DIR = process.env.SOUNDWAVE_DATA_DIR ? path.resolve(process.env.SOUNDWAVE_DATA_DIR) : path.join(PROJECT_ROOT, 'backend/database/data');
export const UPLOAD_ROOT = process.env.SOUNDWAVE_UPLOAD_DIR ? path.resolve(process.env.SOUNDWAVE_UPLOAD_DIR) : path.join(PROJECT_ROOT, 'uploads');
