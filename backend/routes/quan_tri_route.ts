/**
 * @file quan_tri_route.ts
 * @description Tầng Route - Định tuyến cho Quản Trị Viên (Thống kê hệ thống, Quản lý tài khoản)
 */

import { Router } from 'express';
import { QuanTriController } from '../controllers/QuanTriController.ts';
import { batBuocDangNhap } from '../middlewares/xac_thuc_token.ts';
import { batBuocQuanTriVien } from '../middlewares/phan_quyen.ts';

const router = Router();

// Tất cả các route bên dưới bắt buộc phải là Quản Trị Viên
router.use(batBuocDangNhap, batBuocQuanTriVien);

// Xem thống kê hệ thống
router.get('/thong-ke', QuanTriController.layThongKe);

// Quản lý người dùng
router.get('/nguoi-dung', QuanTriController.layTatCaNguoiDung);
router.put('/nguoi-dung/:id/khoa', QuanTriController.khoaHoacMoKhoa);
router.put('/nguoi-dung/:id/vai-tro', QuanTriController.thayDoiVaiTro);
router.delete('/nguoi-dung/:id', QuanTriController.xoaNguoiDung);

export default router;
