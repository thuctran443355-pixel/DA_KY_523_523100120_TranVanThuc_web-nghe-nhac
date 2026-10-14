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

const root = fileURLToPath(new URL('../', import.meta.url));
const baseline = process.argv.includes('--baseline');
const source = path.join(root, 'backend/database/data/du_lieu_nhac.json');
const hash = () => createHash('sha256').update(fs.readFileSync(source)).digest('hex');
const originalHash = hash();
const scratch = fs.mkdtempSync(path.join(root, '.soundwave-backups/browser-'));
const dataDir = path.join(scratch, 'data'), uploadDir = path.join(scratch, 'uploads');
fs.mkdirSync(dataDir); fs.mkdirSync(path.join(uploadDir, 'audio'), { recursive: true });
const mp3 = fs.readdirSync(path.join(root, 'uploads/audio')).find(name => name.endsWith('.mp3'));
assert.ok(mp3, 'An uploaded MP3 is required');
fs.copyFileSync(path.join(root, 'uploads/audio', mp3), path.join(uploadDir, 'audio/test.mp3'));
const db = JSON.parse(fs.readFileSync(source, 'utf8'));
const password = randomBytes(20).toString('hex');
db.nguoi_dung.push({ _id: 'browser_user', username: 'browser_user', email: 'browser@test.invalid',
  password: await bcrypt.hash(password, 10), ho_ten: 'Browser User', vai_tro: 'nguoi_dung', trang_thai: 'hoat_dong' });
db.bai_hat.push({ _id: 'browser_song', tieu_de: 'Bản nhạc kiểm thử', nghe_si: 'Browser Test', the_loai: 'V-Pop',
  file_url: '/uploads/audio/test.mp3', anh_bia: '', trang_thai: 'da_duyet', nguoi_dang_id: 'browser_user', luot_nghe: 0 });
fs.writeFileSync(path.join(dataDir, 'du_lieu_nhac.json'), JSON.stringify(db));
async function freePort() {
  const s = net.createServer(); await new Promise(r => s.listen(0, '127.0.0.1', r));
  const p = s.address().port; await new Promise(r => s.close(r)); return p;
}
const port = await freePort(), debugPort = await freePort(), base = 'http://127.0.0.1:' + port;
const delay = ms => new Promise(r => setTimeout(r, ms));
let server, chrome, socket, serverLogs = '', checks = 0;
const consoleMessages = [], errors = [];
async function until(fn, label, timeout = 90000) {
  const start = Date.now(); let last;
  while (Date.now() - start < timeout) {
    try { const value = await fn(); if (value) return value; } catch (e) { if (/SyntaxError/.test(e.message)) throw e; last = e; }
    await delay(150);
  }
  throw new Error('Timeout: ' + label + (last ? ' ' + last.message : ''));
}
let serial = 0; const pending = new Map();
function cdp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++serial;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 20000);
    pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const r = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
async function click(text, selector = 'button') {
  await until(() => evaluate('Boolean([...document.querySelectorAll(' + JSON.stringify(selector) + ')].find(e => e.textContent.trim().includes(' + JSON.stringify(text) + ')))'), text);
  await evaluate('[...document.querySelectorAll(' + JSON.stringify(selector) + ')].find(e => e.textContent.trim().includes(' + JSON.stringify(text) + ')).click()');
}
async function input(selector, value) {
  await evaluate('(() => { const el = document.querySelector(' + JSON.stringify(selector) + '); if (!el) throw Error("Missing input"); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(el,' + JSON.stringify(value) + '); el.dispatchEvent(new Event("input",{bubbles:true})); })()');
}
async function screenshot(name) {
  const r = await cdp('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(scratch, name + '.png'), Buffer.from(r.data, 'base64'));
}
function check(value, label) { assert.ok(value, label); checks++; console.log('PASS: ' + label); }
try {
  console.log('Browser artifacts: ' + scratch);
  server = spawn(process.execPath, ['--import', 'tsx', path.join(root, 'server.ts')], { cwd: root, windowsHide: true,
    env: { ...process.env, NODE_ENV: 'development', PORT: String(port), SOUNDWAVE_DATA_DIR: dataDir,
      SOUNDWAVE_UPLOAD_DIR: uploadDir, SOUNDWAVE_SESSION_SECRET: randomBytes(48).toString('hex'), DISABLE_HMR: 'false' },
    stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', d => serverLogs += d); server.stderr.on('data', d => serverLogs += d);
  await until(async () => (await fetch(base + '/api/the-loai')).ok, 'server');
  const browser = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p));
  assert.ok(browser, 'Chrome or Edge installed');
  chrome = spawn(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=' + debugPort, '--user-data-dir=' + path.join(os.tmpdir(), 'soundwave-browser-' + randomBytes(8).toString('hex')),
    '--window-size=1440,1000', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  const targets = await until(async () => (await fetch('http://127.0.0.1:' + debugPort + '/json')).json(), 'browser');
  socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await once(socket, 'open');
  socket.addEventListener('message', event => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id); pending.delete(msg.id); clearTimeout(p.timer);
      if (msg.error) p.reject(new Error(msg.error.message)); else p.resolve(msg.result);
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      consoleMessages.push(msg.params.args.map(a => a.value || a.description || '').join(' '));
    } else if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
  });
  await cdp('Runtime.enable'); await cdp('Page.enable');
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__boot = crypto.randomUUID(); window.__audios = []; const OriginalAudio = window.Audio; window.Audio = class extends OriginalAudio { constructor(...args) { super(...args); window.__audios.push(this); } };' });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: base });
  await until(() => evaluate('Boolean(document.querySelector("aside button"))'), 'React');
  await click('Khám Phá & Lọc', 'aside button');
  const loginBoot = await evaluate('window.__boot');
  await click('Đăng nhập', 'header button');
  await input('input[placeholder="Nhập tên đăng nhập hoặc email..."]', 'browser_user');
  await input('input[placeholder="Nhập mật khẩu..."]', password);
  await evaluate('document.querySelector(\'input[placeholder="Nhập mật khẩu..."]\').closest("form").requestSubmit()');
  await until(() => evaluate('document.body.innerText.includes("Browser User")'), 'admin session');
  if (!baseline) {
    check(await evaluate('document.querySelector("main h1")?.textContent.includes("Khám Phá")'), 'Sign in preserves current page');
    check(await evaluate('window.__boot === ' + JSON.stringify(loginBoot)), 'Sign in does not reload');
  } else {
    console.log('Sign-in heading: ' + await evaluate('document.querySelector("main h1")?.textContent'));
    await click('Khám Phá & Lọc', 'aside button');
  }
  await until(() => evaluate('Boolean([...document.querySelectorAll("h4")].find(e => e.textContent==="Bản nhạc kiểm thử"))'), 'test song');
  const boot = await evaluate('window.__boot');
  await evaluate('[...document.querySelectorAll("h4")].find(e => e.textContent==="Bản nhạc kiểm thử").closest(".group.relative").querySelector(\'button[title="Phát bài này"]\').click()');
  await until(() => evaluate('window.__audios.some(a => a.src && a.currentTime > 1 && !a.paused)'), 'MP3 playback progress', 60000);
  await until(() => evaluate('document.querySelector(\'[data-player] button[title="Tạm dừng"]\') !== null'), 'playing UI');
  await delay(1000);
  const snapshot = await evaluate('({sameBoot: window.__boot === ' + JSON.stringify(boot) + ', heading: document.querySelector("main h1")?.textContent, audio: window.__audios.map(a => ({src:a.src, paused:a.paused, time:a.currentTime, error:a.error?.code}))})');
  console.log('Playback snapshot: ' + JSON.stringify(snapshot));
  await screenshot(baseline ? 'baseline-desktop' : 'desktop');
  if (baseline) {
    await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await screenshot('baseline-mobile');
    console.log('HMR: ' + JSON.stringify(consoleMessages.filter(s => /vite|reload/i.test(s))));
  } else {
    check(snapshot.sameBoot, 'Playing does not reload the document');
    check(snapshot.heading.includes('Khám Phá'), 'Playing preserves current page');
    check(snapshot.audio.some(a => !a.paused && a.time > 1 && !a.error), 'Uploaded MP3 decodes and plays in Chrome');
    await evaluate('document.querySelector(\'[data-player] button[title="Tạm dừng"]\').click()');
    check(await evaluate('window.__audios.some(a => a.src && a.paused)'), 'Pause');
    await evaluate('document.querySelector(\'[data-player] button[title="Phát nhạc"]\').click()');
    await until(() => evaluate('window.__audios.some(a => a.src && !a.paused)'), 'resume'); checks++;
    await evaluate('document.querySelector(\'[data-player] button[title="Lặp lại bài hát này"]\').click()');
    check(await evaluate('window.__audios.some(a => a.src && a.loop)'), 'Repeat retains Audio instance');
    await evaluate('document.querySelector(\'[data-player] button[title="Tắt lặp lại"]\').click()');
    const time = await evaluate('window.__audios.find(a => a.src).currentTime');
    await click('Playlist Của Tôi', 'aside button');
    await delay(400);
    check(await evaluate('window.__audios.find(a => a.src).currentTime > ' + time), 'Audio continues across pages');
    await click('Tạo Playlist');
    await input('input[placeholder^="Tên danh sách phát"]', 'Playlist kiểm thử');
    await click('Xác Nhận Tạo');
    await until(() => evaluate('document.querySelector("main").innerText.includes("Playlist kiểm thử")'), 'playlist create');
    await delay(1200);
    check(await evaluate('window.__boot === ' + JSON.stringify(boot)), 'Creating playlist does not reload');
    check(await evaluate('location.hash.includes("playlist")'), 'Playlist route persists in URL');
    await cdp('Page.reload');
    await until(() => evaluate('document.querySelector("main h1")?.textContent.includes("Playlist")'), 'reload route'); checks++;
    await click('Khám Phá & Lọc', 'aside button');
    await until(() => evaluate('Boolean([...document.querySelectorAll("h4")].find(e => e.textContent==="Bản nhạc kiểm thử"))'), 'song after reload');
    await evaluate('[...document.querySelectorAll("h4")].find(e => e.textContent==="Bản nhạc kiểm thử").closest(".group.relative").querySelector(\'button[title="Thích bài hát"]\').click()');
    await delay(1200);
    check(await evaluate('document.querySelector("main h1").textContent.includes("Khám Phá")'), 'Favorite preserves page');
    await evaluate('[...document.querySelectorAll("h4")].find(e => e.textContent==="Bản nhạc kiểm thử").closest(".group.relative").click()');
    await until(() => evaluate('Boolean([...document.querySelectorAll(".fixed button")].find(e=>e.title==="Thêm vào Playlist"))'), 'song detail');
    await evaluate('[...document.querySelectorAll(".fixed button")].find(e=>e.title==="Thêm vào Playlist").click()');
    await until(() => evaluate('[...document.querySelectorAll("h3")].some(e => e.textContent.includes("Thêm Vào Playlist"))'), 'playlist modal');
    check(await evaluate('(() => { const h=[...document.querySelectorAll("h3")].find(e=>e.textContent.includes("Thêm Vào Playlist")); const overlay=h.closest(".fixed"); const r=h.getBoundingClientRect();return overlay.contains(document.elementFromPoint(r.x+5,r.y+5)); })()'), 'Playlist modal appears above song detail');
    await click('Playlist kiểm thử', '.fixed button');
    await until(() => evaluate('![...document.querySelectorAll("h3")].some(e => e.textContent.includes("Thêm Vào Playlist"))'), 'add song to playlist');
    await evaluate('document.querySelector(\'[role="dialog"][aria-label="Chi tiết bài hát"]\').querySelector("button").click()');
    await click('Playlist Của Tôi', 'aside button');
    await until(() => evaluate('Boolean([...document.querySelectorAll("main h3")].find(e=>e.textContent==="Playlist kiểm thử"))'), 'playlist list');
    await evaluate('[...document.querySelectorAll("main h3")].find(e=>e.textContent==="Playlist kiểm thử").closest(".group").click()');
    await until(() => evaluate('document.querySelector("main").innerText.includes("Bản nhạc kiểm thử")'), 'playlist contents');
    check(await evaluate('document.querySelector("main").innerText.includes("Bản nhạc kiểm thử")'), 'Song added to playlist');
    await click('Sửa Playlist', 'main button');
    await input('input[placeholder^="Tên danh sách phát"]', 'Playlist đã sửa');
    await click('Lưu Thay Đổi', 'main button');
    await until(() => evaluate('document.querySelector("main h2")?.textContent==="Playlist đã sửa"'), 'edit playlist'); checks++;
    await click('Khám Phá & Lọc', 'aside button');
    await until(() => evaluate('Boolean([...document.querySelectorAll("h4")].find(e => e.textContent==="Bản nhạc kiểm thử"))'), 'songs');
    await evaluate('[...document.querySelectorAll("h4")].find(e => e.textContent==="Bản nhạc kiểm thử").closest(".group.relative").querySelector(\'button[title="Phát bài này"]\').click()');
    await until(() => evaluate('window.__audios.some(a => a.src && a.currentTime > 1 && !a.paused)'), 'play before mobile', 60000);
    await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await delay(300);
    check(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Mobile has no document overflow');
    check(await evaluate('!document.querySelector("aside").checkVisibility()'), 'Mobile navigation drawer starts closed');
    await evaluate('document.querySelector(\'button[aria-label="Mở menu điều hướng"]\').click()');
    check(await evaluate('document.querySelector("aside").checkVisibility()'), 'Mobile drawer opens');
    await click('Playlist Của Tôi', 'aside button');
    check(await evaluate('!document.querySelector("aside").checkVisibility()'), 'Mobile navigation closes drawer');
    check(await evaluate('document.querySelector("[data-player]").getBoundingClientRect().width <= innerWidth'), 'Mobile player fits viewport');
    await screenshot('mobile');
    await evaluate('history.back()');
    await until(() => evaluate('document.querySelector("main h1")?.textContent.includes("Khám Phá")'), 'browser Back'); checks++;
    const remote = await evaluate('(async () => { const a = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"); const start=Date.now(); a.play().catch(()=>{}); while(Date.now()-start<15000 && a.currentTime===0 && !a.error) await new Promise(r=>setTimeout(r,200)); const result={played:a.currentTime>0,error:a.error?.code||null}; a.pause();a.removeAttribute("src");a.load();return result;})()');
    console.log('SoundHelix network probe: ' + JSON.stringify(remote));
    check(errors.length === 0, 'No uncaught browser exceptions: ' + errors.join(' | '));
    console.log('PASS: ' + checks + ' browser checks');
  }
} catch (error) {
  if (socket?.readyState === WebSocket.OPEN) { try { await screenshot('failure'); } catch {} }
  console.error(error); console.error('Server log tail: ' + serverLogs.slice(-1500)); process.exitCode = 1;
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await cdp('Browser.close'); } catch {} socket.close(); }
  for (const child of [chrome, server]) { if (child && child.exitCode === null) { const ended = once(child, 'exit'); child.kill(); await Promise.race([ended, delay(5000)]); } }
  assert.equal(hash(), originalHash, 'Original database must remain unchanged');
  console.log('Original database unchanged.');
}
