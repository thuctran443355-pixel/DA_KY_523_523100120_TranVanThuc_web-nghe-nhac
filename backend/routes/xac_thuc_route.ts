/**
 * @file xac_thuc_route.ts
 * @description Tầng Route - Định tuyến cho các chức năng Xác thực & Quản lý hồ sơ
 */

import { Router } from 'express';
import { XacThucController } from '../controllers/XacThucController.ts';
import { batBuocDangNhap } from '../middlewares/xac_thuc_token.ts';

const router = Router();

// Khách vãng lai: Đăng ký & Đăng nhập
router.post('/dang-ky', XacThucController.dangKy);
router.post('/dang-nhap', XacThucController.dangNhap);

// Người dùng đã đăng nhập: Hồ sơ cá nhân & Đổi mật khẩu
router.get('/ho-so', batBuocDangNhap, XacThucController.layThongTinHienTai);
router.put('/ho-so', batBuocDangNhap, XacThucController.capNhatHoSo);
router.put('/doi-mat-khau', batBuocDangNhap, XacThucController.doiMatKhau);

export default router;
