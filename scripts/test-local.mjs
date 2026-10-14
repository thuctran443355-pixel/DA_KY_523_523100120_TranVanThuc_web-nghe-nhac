import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { randomBytes, createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

process.on('uncaughtException', error => { console.error(error); process.exitCode = 1; });
console.log('Starting isolated API checks...');
const root = fileURLToPath(new URL('../', import.meta.url));
const sourceDb = path.join(root, 'backend/database/data/du_lieu_nhac.json');
const originalHash = createHash('sha256').update(fs.readFileSync(sourceDb)).digest('hex');
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'soundwave-test-'));
const dataDir = path.join(scratch, 'data'), uploadsDir = path.join(scratch, 'uploads');
fs.mkdirSync(dataDir);
fs.mkdirSync(uploadsDir);
fs.mkdirSync(path.join(uploadsDir, 'audio'));
fs.mkdirSync(path.join(uploadsDir, 'images'));
console.log('Test setup: ' + scratch);
const dbFile = path.join(dataDir, 'du_lieu_nhac.json');
const db = JSON.parse(fs.readFileSync(sourceDb, 'utf8'));
const password = randomBytes(24).toString('hex');
db.nguoi_dung.push({
  _id: 'test_admin', username: 'test_admin', email: 'admin@test.invalid',
  password: await bcrypt.hash(password, 10), ho_ten: 'Test Admin',
  vai_tro: 'quan_tri_vien', trang_thai: 'hoat_dong'
});
fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
let child, logs = '', checks = 0;
async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}
const port = await freePort(), base = 'http://127.0.0.1:' + port;
async function start(mode) {
  logs = '';
  child = spawn(process.execPath, ['--import', 'tsx', path.join(root, 'server.ts')], {
    cwd: root, windowsHide: true, env: { ...process.env, NODE_ENV: mode, PORT: String(port),
      SOUNDWAVE_DATA_DIR: dataDir, SOUNDWAVE_UPLOAD_DIR: uploadsDir, SOUNDWAVE_SESSION_SECRET: '',
      DISABLE_HMR: 'true' }, stdio: ['ignore', 'pipe', 'pipe']
  });
  child.stdout.on('data', chunk => { logs += chunk; });
  child.stderr.on('data', chunk => { logs += chunk; });
  for (let i = 0; i < 450; i++) {
    if (child.exitCode !== null) throw new Error('Server stopped: ' + logs);
    try { if ((await fetch(base + '/api/the-loai')).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error('Server timeout: ' + logs);
}
async function stop() {
  if (!child || child.exitCode !== null) return;
  const done = once(child, 'exit'); child.kill(); await done;
}
async function api(endpoint, { method = 'GET', token, body, status = 200 } = {}) {
  const headers = {};
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body && !(body instanceof FormData)) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(body); }
  const response = await fetch(base + '/api' + endpoint, { method, headers, body });
  assert.equal(response.status, status, method + ' ' + endpoint + ': ' + await response.clone().text());
  assert.match(response.headers.get('content-type') || '', /application\/json/);
  checks++;
  return response.json();
}
function form(fields, audio = false) {
  const f = new FormData();
  for (const [key, value] of Object.entries(fields)) f.append(key, String(value));
  if (audio) f.append('file_nhac', new Blob([fs.readFileSync(path.join(root, 'uploads/audio', fs.readdirSync(path.join(root, 'uploads/audio'))[0]))], { type: 'audio/mpeg' }), 'sample.mp3');
  return f;
}
try {
  await start('production');
  const html = await fetch(base + '/'); assert.equal(html.status, 200); assert.match(await html.text(), /SoundWave/); checks++;
  await api('/missing', { status: 404 });
  const missing = await fetch(base + '/uploads/missing.mp3'); assert.equal(missing.status, 404); checks++;
  await api('/xac-thuc/ho-so', { status: 401 });
  await api('/quan-tri/thong-ke', { token: 'token_nd_admin_01_123', status: 401 });
  await api('/quan-tri/thong-ke', { token: 'nd_admin_01', status: 401 });
  const admin = (await api('/xac-thuc/dang-nhap', { method: 'POST', body: { identifier: 'test_admin', password } })).du_lieu.token;
  const register = username => api('/xac-thuc/dang-ky', { method: 'POST', status: 201, body: { username, email: username + '@test.invalid', password } });
  const user = (await register('test_user')).du_lieu;
  const other = (await register('test_other')).du_lieu;
  await api('/xac-thuc/dang-ky', { method: 'POST', status: 400, body: { username: ' test_user ', email: 'new@test.invalid', password } });
  await api('/xac-thuc/dang-nhap', { method: 'POST', status: 400, body: { identifier: 'test_user', password: randomBytes(16).toString('hex') } });
  await api('/quan-tri/thong-ke', { token: user.token, status: 403 });
  await api('/quan-tri/thong-ke', { token: admin });
  await api('/quan-tri/nguoi-dung', { token: admin });
  const profile = await api('/xac-thuc/ho-so', { method: 'PUT', token: user.token, body: { ho_ten: 'Updated Profile', vai_tro: 'quan_tri_vien' } });
  assert.equal(profile.du_lieu.vai_tro, 'nguoi_dung'); assert.equal(profile.du_lieu.ho_ten, 'Updated Profile');
  assert.ok(!('password' in profile.du_lieu)); checks++;
  const songs = (await api('/bai-hat')).du_lieu; assert.ok(songs.length);
  const song = songs[0];
  const before = (await api('/bai-hat/chi-tiet/' + song._id)).du_lieu.luot_nghe;
  assert.equal((await api('/bai-hat/chi-tiet/' + song._id)).du_lieu.luot_nghe, before); checks++;
  assert.equal((await api('/bai-hat/luot-nghe/' + song._id, { method: 'POST' })).du_lieu.luot_nghe, before + 1); checks++;

  assert.ok((await api('/bai-hat/tim-kiem?q=' + encodeURIComponent(song.tieu_de))).du_lieu.some(s => s._id === song._id)); checks++;
  for (const endpoint of ['/the-loai', '/nghe-si', '/album']) {
    const list = (await api(endpoint)).du_lieu;
    if (list.length) await api(endpoint + '/' + list[0]._id);
  }
  const playlist = (await api('/playlist/tao-moi', { method: 'POST', status: 201, token: user.token, body: { ten_playlist: 'Test Playlist' } })).du_lieu;
  await api('/playlist/' + playlist._id, { method: 'PUT', token: user.token, body: { ten_playlist: 'Renamed Playlist', nguoi_dung_id: other.nguoiDung._id } });
  await api('/playlist/' + playlist._id, { method: 'PUT', token: other.token, status: 400, body: { ten_playlist: 'Illegal' } });
  await api('/playlist/' + playlist._id + '/them-bai-hat', { method: 'POST', token: user.token, body: { bai_hat_id: song._id } });
  const detail = (await api('/playlist/chi-tiet/' + playlist._id)).du_lieu;
  assert.equal(detail.playlist.ten_playlist, 'Renamed Playlist'); assert.equal(detail.bai_hat.length, 1); checks++;
  await api('/playlist/' + playlist._id + '/xoa-bai-hat/' + song._id, { method: 'DELETE', token: user.token });
  await api('/playlist/cua-toi', { token: user.token });
  assert.equal((await api('/yeu-thich/toggle', { method: 'POST', token: user.token, body: { bai_hat_id: song._id } })).da_thich, true);
  await api('/yeu-thich/danh-sach-id', { token: user.token });
  await api('/yeu-thich', { token: user.token });
  assert.equal((await api('/yeu-thich/toggle', { method: 'POST', token: user.token, body: { bai_hat_id: song._id } })).da_thich, false);
  await api('/lich-su/ghi-nhan', { method: 'POST', token: user.token, body: { bai_hat_id: song._id } });
  const history = (await api('/lich-su', { token: user.token })).du_lieu;
  await api('/lich-su/' + history[0]._id, { method: 'DELETE', token: user.token });
  await api('/lich-su/ghi-nhan', { method: 'POST', token: user.token, body: { bai_hat_id: song._id } });
  await api('/lich-su/ghi-nhan', { method: 'POST', token: other.token, body: { bai_hat_id: song._id } });
  await api('/lich-su/xoa-tat-ca', { method: 'DELETE', token: user.token });
  assert.equal((await api('/lich-su', { token: user.token })).du_lieu.length, 0);
  assert.equal((await api('/lich-su', { token: other.token })).du_lieu.length, 1); checks++;
  await api('/yeu-thich/toggle', { method: 'POST', token: user.token, body: { bai_hat_id: 'missing' }, status: 400 });
  await api('/playlist/' + playlist._id + '/them-bai-hat', { method: 'POST', token: user.token, body: { bai_hat_id: 'missing' }, status: 400 });
  const uploaded = (await api('/bai-hat/upload', { method: 'POST', status: 201, token: user.token, body: form({ tieu_de: 'Uploaded Test', nghe_si: 'Test Artist', the_loai: 'V-Pop' }, true) })).bai_hat;
  assert.equal(uploaded.trang_thai, 'cho_duyet'); checks++;
  await api('/bai-hat/chi-tiet/' + uploaded._id, { status: 404 });
  await api('/bai-hat/chi-tiet/' + uploaded._id, { token: user.token });

  await api('/bai-hat/cua-toi', { token: user.token });
  await api('/bai-hat/admin/duyet/' + uploaded._id, { method: 'PUT', token: admin, body: { trang_thai: 'da_duyet' } });
  const edited = (await api('/bai-hat/admin/sua/' + uploaded._id, { method: 'PUT', token: admin, body: form({ tieu_de: 'Updated Upload' }, true) })).du_lieu;
  assert.notEqual(edited.file_url, uploaded.file_url); checks++;
  const range = await fetch(base + edited.file_url, { headers: { Range: 'bytes=0-127' } });
  assert.equal(range.status, 206); assert.equal((await range.arrayBuffer()).byteLength, 128); checks++;
  const added = (await api('/bai-hat/admin/them', { method: 'POST', status: 201, token: admin, body: form({ tieu_de: 'Admin Test', nghe_si: 'Test Artist', the_loai: 'V-Pop' }, true) })).du_lieu;
  await api('/bai-hat/admin/tat-ca', { token: admin });
  const invalid = form({ tieu_de: 'Bad', nghe_si: 'Bad', the_loai: 'V-Pop' });
  invalid.append('file_nhac', new Blob(['image'], { type: 'image/png' }), 'cover.png');
  await api('/bai-hat/upload', { method: 'POST', token: user.token, body: invalid, status: 400 });
  for (const [endpoint, fields, title] of [
    ['/nghe-si', { ten: 'Test Artist', the_loai_chinh: 'V-Pop' }, 'ten'],
    ['/album', { ten_album: 'Test Album', nghe_si: 'Test Artist', nam_phat_hanh: 2026 }, 'ten_album'],
    ['/the-loai', { ten_the_loai: 'Test Genre', mau_sac: '#123456' }, 'ten_the_loai']
  ]) {
    const item = (await api(endpoint, { method: 'POST', status: 201, token: admin, body: form(fields) })).du_lieu;
    const imageField = endpoint === '/nghe-si' ? 'anh_dai_dien' : endpoint === '/album' ? 'anh_bia' : 'anh_the_loai';
    const update = form({ [title]: 'Updated ' + fields[title] });
    update.append(imageField, new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64')], { type: 'image/png' }), 'cover.png');
    const result = (await api(endpoint + '/' + item._id, { method: 'PUT', token: admin, body: update })).du_lieu;
    assert.equal(result[title], 'Updated ' + fields[title]);
    assert.equal((await fetch(base + result[imageField])).status, 200); checks++;
    const linkedSongs = JSON.parse(fs.readFileSync(dbFile, 'utf8')).bai_hat;
    if (endpoint === '/nghe-si') {
      assert.ok(linkedSongs.some(song => song.nghe_si === 'Updated Test Artist')); checks++;
    }
    await api(endpoint + '/' + item._id);
    await api(endpoint + '/' + item._id, { method: 'DELETE', token: admin });
  }
  const userId = user.nguoiDung._id;
  await api('/quan-tri/nguoi-dung/' + userId + '/vai-tro', { method: 'PUT', token: admin, status: 400, body: { vai_tro: 'invalid' } });
  await api('/quan-tri/nguoi-dung/' + userId + '/khoa', { method: 'PUT', token: admin, status: 400, body: { trang_thai: 'invalid' } });

  await api('/quan-tri/nguoi-dung/' + userId + '/khoa', { method: 'PUT', token: admin, body: { trang_thai: 'bi_khoa' } });
  await api('/xac-thuc/ho-so', { token: user.token, status: 403 });
  await api('/quan-tri/nguoi-dung/' + userId + '/khoa', { method: 'PUT', token: admin, body: { trang_thai: 'hoat_dong' } });
  await api('/quan-tri/nguoi-dung/' + userId + '/vai-tro', { method: 'PUT', token: admin, body: { vai_tro: 'quan_tri_vien' } });
  await api('/quan-tri/thong-ke', { token: user.token });
  await api('/quan-tri/nguoi-dung/' + userId + '/vai-tro', { method: 'PUT', token: admin, body: { vai_tro: 'nguoi_dung' } });
  await stop(); await start('production');
  assert.equal((await api('/xac-thuc/ho-so', { token: user.token })).du_lieu.ho_ten, 'Updated Profile'); checks++;
  assert.equal((await api('/playlist/cua-toi', { token: user.token })).du_lieu.find(p => p._id === playlist._id).ten_playlist, 'Renamed Playlist'); checks++;
  await api('/xac-thuc/doi-mat-khau', { method: 'PUT', token: user.token, status: 400, body: { mat_khau_cu: randomBytes(24).toString('hex'), mat_khau_moi: password } });
  const newPassword = randomBytes(24).toString('hex');
  await api('/xac-thuc/doi-mat-khau', { method: 'PUT', token: user.token, body: { mat_khau_cu: password, mat_khau_moi: newPassword } });
  await api('/xac-thuc/ho-so', { token: user.token, status: 401 });
  const newLogin = (await api('/xac-thuc/dang-nhap', { method: 'POST', body: { identifier: 'test_user', password: newPassword } })).du_lieu.token;
  await api('/playlist/' + playlist._id, { method: 'DELETE', token: newLogin });
  await api('/bai-hat/cua-toi/' + uploaded._id, { method: 'DELETE', token: newLogin });
  await api('/bai-hat/admin/xoa/' + added._id, { method: 'DELETE', token: admin });
  await api('/quan-tri/nguoi-dung/' + other.nguoiDung._id, { method: 'DELETE', token: admin });
  await stop(); await start('development');
  const devPage = await fetch(base + '/'); assert.match(await devPage.text(), /\/@vite\/client/); checks++;
  const entry = await fetch(base + '/src/main.tsx'); assert.equal(entry.status, 200); checks++;
  await api('/bai-hat'); await api('/xac-thuc/ho-so', { token: admin });
  const goodData = fs.readFileSync(dbFile, 'utf8');
  fs.mkdirSync(dbFile + '.tmp');
  await api('/xac-thuc/ho-so', { method: 'PUT', token: admin, status: 400, body: { ho_ten: 'Must Not Persist' } });
  assert.equal(fs.readFileSync(dbFile, 'utf8'), goodData); checks++;
  fs.rmdirSync(dbFile + '.tmp');
  fs.writeFileSync(dbFile, '{ invalid json');
  await api('/bai-hat', { status: 500 });
  assert.equal(fs.readFileSync(dbFile, 'utf8'), '{ invalid json'); checks++;
  fs.writeFileSync(dbFile, goodData);
  const finalDb = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  assert.ok(finalDb.nguoi_dung.some(u => u.username === 'test_user')); checks++;
  const resetPassword = randomBytes(24).toString('hex');
  const reset = spawn(process.execPath, ['--import', 'tsx', path.join(root, 'scripts/reset-password.ts'), 'test_admin'], {
    cwd: root, windowsHide: true, env: { ...process.env, SOUNDWAVE_DATA_DIR: dataDir, SOUNDWAVE_UPLOAD_DIR: uploadsDir, SOUNDWAVE_SESSION_SECRET: '', SOUNDWAVE_RESET_PASSWORD: resetPassword },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let resetLogs = '';
  reset.stdout.on('data', chunk => { resetLogs += chunk; });
  reset.stderr.on('data', chunk => { resetLogs += chunk; });
  assert.equal((await once(reset, 'exit'))[0], 0, resetLogs); checks++;
  await api('/xac-thuc/ho-so', { token: admin, status: 401 });
  await api('/xac-thuc/dang-nhap', { method: 'POST', body: { identifier: 'test_admin', password: resetPassword } });
  assert.ok(fs.readdirSync(dataDir).some(name => name.startsWith('du_lieu_nhac.json.backup-'))); checks++;
  console.log('PASS: ' + checks + ' API/static/persistence checks; production and development.');
  console.log('Browser audio playback and UI clicks require manual verification.');
} catch (error) {
  console.error(error); console.error(logs); process.exitCode = 1;
} finally {
  await stop();
  assert.equal(createHash('sha256').update(fs.readFileSync(sourceDb)).digest('hex'), originalHash, 'Original database must remain unchanged');
  console.log('Original database unchanged. Isolated test files: ' + scratch);
}

