/**
 * @file lich_su_route.ts
 * @description Tầng Route - Định tuyến cho Lịch Sử Nghe Nhạc
 */

import { Router } from 'express';
import { LichSuController } from '../controllers/LichSuController.ts';
import { batBuocDangNhap, tuyChonDangNhap } from '../middlewares/xac_thuc_token.ts';

const router = Router();

// Ghi nhận khi phát nhạc (Nếu có token thì lưu lịch sử)
router.post('/ghi-nhan', tuyChonDangNhap, LichSuController.ghiNhan);

// Lấy danh sách lịch sử nghe của người dùng
router.get('/', batBuocDangNhap, LichSuController.layDanhSach);

// Xóa một bài khỏi lịch sử nghe


// Xóa toàn bộ lịch sử nghe
router.delete('/xoa-tat-ca', batBuocDangNhap, LichSuController.xoaTatCa);
router.delete('/:id', batBuocDangNhap, LichSuController.xoaMot);

export default router;
