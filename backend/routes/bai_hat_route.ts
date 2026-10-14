/**
 * @file bai_hat_route.ts
 * @description Tầng Route - Định tuyến cho các chức năng liên quan đến Bài Hát
 */

import { Router } from 'express';
import { BaiHatController } from '../controllers/BaiHatController.ts';
import { batBuocDangNhap, tuyChonDangNhap } from '../middlewares/xac_thuc_token.ts';
import { batBuocQuanTriVien } from '../middlewares/phan_quyen.ts';
import { uploadFileMiddleware } from '../middlewares/upload_file.ts';

const router = Router();

// Middleware upload cho phép nhận 1 file nhạc và 1 file ảnh bìa
const uploadSongFields = uploadFileMiddleware.fields([
  { name: 'file_nhac', maxCount: 1 },
  { name: 'anh_bia', maxCount: 1 }
]);

// 1. Chức năng công khai (Dành cho Khách vãng lai và mọi người dùng):
router.get('/', tuyChonDangNhap, BaiHatController.layDanhSach);
router.get('/tim-kiem', tuyChonDangNhap, BaiHatController.timKiem);
router.get('/chi-tiet/:id', tuyChonDangNhap, BaiHatController.layChiTiet);
router.post('/luot-nghe/:id', tuyChonDangNhap, BaiHatController.layChiTiet);

// 2. Chức năng người dùng:
// Xem các bài hát do chính mình tải lên
router.get('/cua-toi', batBuocDangNhap, BaiHatController.layBaiHatCuaToi);
// Tải lên bài hát mới -> Bắt buộc ở trạng thái chờ duyệt!
router.post('/upload', batBuocDangNhap, uploadSongFields, BaiHatController.nguoiDungUpload);
// Người dùng xóa bài hát do mình tải lên
router.delete('/cua-toi/:id', batBuocDangNhap, BaiHatController.nguoiDungXoa);

// 3. Chức năng dành riêng cho Quản trị viên (Admin):
router.get('/admin/tat-ca', batBuocDangNhap, batBuocQuanTriVien, BaiHatController.adminLayTatCa);
router.post('/admin/them', batBuocDangNhap, batBuocQuanTriVien, uploadSongFields, BaiHatController.adminThem);
router.put('/admin/duyet/:id', batBuocDangNhap, batBuocQuanTriVien, BaiHatController.adminPheDuyet);
router.put('/admin/sua/:id', batBuocDangNhap, batBuocQuanTriVien, uploadSongFields, BaiHatController.adminSua);
router.delete('/admin/xoa/:id', batBuocDangNhap, batBuocQuanTriVien, BaiHatController.adminXoa);

export default router;
