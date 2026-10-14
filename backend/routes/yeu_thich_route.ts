/**
 * @file yeu_thich_route.ts
 * @description Tầng Route - Định tuyến cho Bài Hát Yêu Thích
 */

import { Router } from 'express';
import { YeuThichController } from '../controllers/YeuThichController.ts';
import { batBuocDangNhap, tuyChonDangNhap } from '../middlewares/xac_thuc_token.ts';

const router = Router();

// Thả tim / Bỏ tim bài hát
router.post('/toggle', batBuocDangNhap, YeuThichController.toggleYeuThich);

// Lấy danh sách ID đã thích (tiện check trạng thái tim đỏ)
router.get('/danh-sach-id', tuyChonDangNhap, YeuThichController.layDanhSachId);

// Lấy danh sách đầy đủ bài hát yêu thích
router.get('/', batBuocDangNhap, YeuThichController.layDanhSachDayDu);

export default router;
