import fs from 'node:fs';
import path from 'node:path';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { DATA_DIR } from '../config.ts';
const keyFile = path.join(DATA_DIR, '.session-key');
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!process.env.SOUNDWAVE_SESSION_SECRET && !fs.existsSync(keyFile)) {
  fs.writeFileSync(keyFile, randomBytes(48).toString('hex'), { flag: 'wx', mode: 0o600 });
}
const secret = process.env.SOUNDWAVE_SESSION_SECRET || fs.readFileSync(keyFile, 'utf8').trim();
const signature = (payload: string) => createHmac('sha256', secret).update(payload).digest('base64url');
export function taoToken(id: string, passwordHash: string) {
  const payload = Buffer.from(JSON.stringify({ id, expires: Date.now() + 7 * 86400000, version: signature(passwordHash) })).toString('base64url');
  return payload + '.' + signature(payload);
}
export function docToken(token: string): { id: string; version: string } | null {
  try {
    const [payload, sig, extra] = token.split('.');
    if (!payload || !sig || extra) return null;
    const actual = Buffer.from(sig), expected = Buffer.from(signature(payload));
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.id !== 'string' || !Number.isFinite(data.expires) || data.expires <= Date.now()) return null;
    return data;
  } catch { return null; }
}
export function tokenConHopLe(token: string, passwordHash: string) {
  return docToken(token)?.version === signature(passwordHash);
}
