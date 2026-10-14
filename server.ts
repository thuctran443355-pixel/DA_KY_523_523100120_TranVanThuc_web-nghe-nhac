/**
 * @file server.ts (hoặc server.js)
 * @description Máy Chủ NodeJS + Express cho Website Nghe Nhạc ZingSound
 * - Tích hợp đầy đủ kiến trúc Layered MVC: Model, Service, Controller, Route, Middleware
 * - Chạy đồng thời cả Backend API và Frontend React trên cùng Port 3000
 * - Hỗ trợ upload file nhạc mp3 và ảnh bìa
 * - Hỗ trợ cả chế độ Development (Vite Middleware Mode) và Production (phục vụ client/dist)
 */

import './backend/config.ts';
import { UPLOAD_ROOT, PROJECT_ROOT } from './backend/config.ts';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRouter from './backend/routes/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Cấu hình nhận dữ liệu JSON và Form data
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Tạo và phục vụ thư mục lưu trữ file nhạc/ảnh đã upload công khai với hỗ trợ CORS và Range Streaming
  const uploadDir = UPLOAD_ROOT;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Range, Content-Type, Authorization');
    res.header('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  }, express.static(uploadDir, {
    setHeaders: (res, filePath) => {
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }));

  // Gắn tầng định tuyến API Backend (/api/...)
  app.use('/api', apiRouter);
  app.use('/api', (req, res) => res.status(404).json({ thanh_cong: false, thong_bao: 'API không tồn tại!' }));
  app.use('/uploads', (req, res) => res.status(404).json({ thanh_cong: false, thong_bao: 'Không tìm thấy tệp tải lên!' }));

  // Xử lý lỗi tập trung (bao gồm Multer và lỗi upload)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Lỗi xử lý yêu cầu:', err.message || err);
    if (res.headersSent) return next(err);
    return res.status(err.status || 400).json({
      thanh_cong: false,
      thong_bao: err.message || 'Lỗi khi xử lý dữ liệu tải lên hoặc máy chủ!'
    });
  });

  // Phục vụ Frontend React:
  // Nếu đang ở chế độ Development và không phải build tĩnh hoàn toàn -> Dùng Vite Middleware Mode
  if (!isProd) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        root: PROJECT_ROOT,
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR !== 'true'
        },
        appType: 'spa'
      });

      app.use(vite.middlewares);
      console.log('⚡ Chế độ Development: Đã tích hợp Vite Middleware vào Express!');
    } catch (err) {
      throw new Error('Không thể khởi động Vite. Kiểm tra phiên bản Node và dependencies.', { cause: err });
    }
  } else {
    // Chế độ Production: Phục vụ thư mục build client/dist
    serveStaticClient(app);
  }

  // Khởi động server lắng nghe trên port 3000
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`\n=================================================`);
    console.log(`🎵 ZingSound Music App đang chạy tại: http://localhost:${PORT}`);
    console.log(`🚀 Cổng (Port): ${PORT}`);
    console.log(`🌐 Khách vãng lai: Nghe nhạc, tìm kiếm không cần đăng nhập`);
    console.log(`=================================================\n`);
  });
}

// Hàm phục vụ file tĩnh của Frontend khi build ra client/dist hoặc dist
function serveStaticClient(app: express.Express) {
  const clientDistDir = path.resolve(__dirname, 'client', 'dist');
  const rootDistDir = path.resolve(__dirname, 'dist');
  const distDir = fs.existsSync(clientDistDir) ? clientDistDir : rootDistDir;

  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
    console.log(`📦 Đang phục vụ Frontend từ thư mục: ${distDir}`);
  } else {
    console.log(`ℹ️ Thư mục dist chưa được tạo. Hãy chạy 'npm run build' để tạo bản dựng.`);
  }
}

startServer().catch((error) => {
  console.error('❌ Lỗi khởi động máy chủ:', error);
  process.exitCode = 1;
});
