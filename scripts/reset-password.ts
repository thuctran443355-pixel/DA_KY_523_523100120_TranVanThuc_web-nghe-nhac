import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { NguoiDungModel } from '../backend/models/NguoiDungModel.ts';
import { DATA_DIR } from '../backend/config.ts';

async function readPassword(label: string): Promise<string> {
  if (!process.stdin.isTTY) throw new Error('Chạy trong terminal VS Code hoặc cung cấp SOUNDWAVE_RESET_PASSWORD.');
  process.stdout.write(label);
  return new Promise((resolve, reject) => {
    let value = '';
    const previousRaw = process.stdin.isRaw;
    process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.setEncoding('utf8');
    const finish = () => {
      process.stdin.off('data', onData); process.stdin.setRawMode(previousRaw);
      process.stdin.pause(); process.stdout.write('\n');
    };
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') { finish(); resolve(value); return; }
        if (char === '\u0003') { finish(); reject(new Error('Đã hủy.')); return; }
        if (char === '\u007f' || char === '\b') { value = value.slice(0, -1); continue; }
        if (char >= ' ') value += char;
      }
    };
    process.stdin.on('data', onData);
  });
}
const username = process.argv[2];
if (!username) throw new Error('Chạy: npm run reset-password -- <username>');
const user = await NguoiDungModel.findOne({ username });
if (!user) throw new Error('Tài khoản không tồn tại.');
const password = process.env.SOUNDWAVE_RESET_PASSWORD || await readPassword('Nhập mật khẩu mới (ẩn): ');
if (password.length < 6) throw new Error('Mật khẩu cần ít nhất 6 ký tự.');
if (!process.env.SOUNDWAVE_RESET_PASSWORD && password !== await readPassword('Nhập lại mật khẩu (ẩn): ')) throw new Error('Hai mật khẩu không khớp.');
const dbFile = path.join(DATA_DIR, 'du_lieu_nhac.json');
fs.copyFileSync(dbFile, dbFile + '.backup-' + Date.now());
await NguoiDungModel.findByIdAndUpdate(user._id!, { password: await bcrypt.hash(password, 10) });
console.log('Đã đặt lại mật khẩu cho ' + username + '. Các phiên cũ của tài khoản đã hết hiệu lực.');
