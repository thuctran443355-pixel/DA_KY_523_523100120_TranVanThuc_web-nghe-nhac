/**
 * @file the_loai_route.ts
 * @description Tầng Route - Định tuyến cho Thể Loại Âm Nhạc
 */

import { Router } from 'express';
import { TheLoaiController } from '../controllers/TheLoaiController.ts';
import { batBuocDangNhap } from '../middlewares/xac_thuc_token.ts';
import { batBuocQuanTriVien } from '../middlewares/phan_quyen.ts';
import { uploadFileMiddleware } from '../middlewares/upload_file.ts';

const router = Router();
const uploadGenreImage = uploadFileMiddleware.fields([{ name: 'anh_the_loai', maxCount: 1 }]);

// Công khai
router.get('/', TheLoaiController.layTatCa);
router.get('/:id', TheLoaiController.layChiTiet);

// Quản trị viên
router.post('/', batBuocDangNhap, batBuocQuanTriVien, uploadGenreImage, TheLoaiController.adminThem);
router.put('/:id', batBuocDangNhap, batBuocQuanTriVien, uploadGenreImage, TheLoaiController.adminCapNhat);
router.delete('/:id', batBuocDangNhap, batBuocQuanTriVien, TheLoaiController.adminXoa);

export default router;
