/**
 * @file nghe_si_route.ts
 * @description Tầng Route - Định tuyến cho Nghệ Sĩ / Ca Sĩ
 */

import { Router } from 'express';
import { NgheSiController } from '../controllers/NgheSiController.ts';
import { batBuocDangNhap } from '../middlewares/xac_thuc_token.ts';
import { batBuocQuanTriVien } from '../middlewares/phan_quyen.ts';
import { uploadFileMiddleware } from '../middlewares/upload_file.ts';

const router = Router();
const uploadAvatar = uploadFileMiddleware.fields([{ name: 'anh_dai_dien', maxCount: 1 }]);

// Công khai cho khách và người dùng
router.get('/', NgheSiController.layTatCa);
router.get('/:id', NgheSiController.layChiTiet);

// Quản trị viên
router.post('/', batBuocDangNhap, batBuocQuanTriVien, uploadAvatar, NgheSiController.adminThem);
router.put('/:id', batBuocDangNhap, batBuocQuanTriVien, uploadAvatar, NgheSiController.adminCapNhat);
router.delete('/:id', batBuocDangNhap, batBuocQuanTriVien, NgheSiController.adminXoa);

export default router;
