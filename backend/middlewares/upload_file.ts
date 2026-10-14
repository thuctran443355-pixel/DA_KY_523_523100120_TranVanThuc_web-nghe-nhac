/**
 * @file upload_file.ts
 * @description Tầng Middleware - Xử lý tải lên file nhạc (.mp3, .wav, .ogg, .m4a) và ảnh bìa (.jpg, .png, .webp)
 * Sử dụng thư viện Multer để lưu trữ an toàn trong thư mục uploads của server
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UPLOAD_ROOT } from '../config.ts';
import { randomUUID } from 'node:crypto';

// Tạo sẵn thư mục uploads nếu chưa tồn tại
const AUDIO_DIR = path.join(UPLOAD_ROOT, 'audio');
const IMAGE_DIR = path.join(UPLOAD_ROOT, 'images');

[UPLOAD_ROOT, AUDIO_DIR, IMAGE_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Cấu hình nơi lưu trữ và tên file sau khi upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isAudio = file.mimetype.startsWith('audio/') || file.originalname.match(/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i);
    if (isAudio) {
      cb(null, AUDIO_DIR);
    } else {
      cb(null, IMAGE_DIR);
    }
  },
  filename: (req, file, cb) => {
    // Đảm bảo đuôi file hợp lệ để trình duyệt phát được âm thanh trực tiếp
    const ext = path.extname(file.originalname) || (file.mimetype.startsWith('audio/') ? '.mp3' : '.jpg');
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${Date.now()}_${randomUUID()}_${baseName}${ext}`);
  }
});

// Bộ lọc định dạng file hợp lệ
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const isAudio = file.mimetype.startsWith('audio/') || file.originalname.match(/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i);
  const isImage = file.mimetype.startsWith('image/') || file.originalname.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);

  const requiresAudio = file.fieldname === 'file_nhac';
  if ((requiresAudio && isAudio) || (!requiresAudio && isImage)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file âm thanh (.mp3, .wav, .ogg, .m4a) hoặc hình ảnh (.jpg, .png, .webp)!'));
  }
};

// Khởi tạo middleware multer cho phép tải lên file dung lượng tối đa 50MB
export const uploadFileMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});
