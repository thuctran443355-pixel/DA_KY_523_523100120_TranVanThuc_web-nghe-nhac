/**
 * @file album_route.ts
 * @description Tầng Route - Định tuyến cho Album
 */

import { Router } from 'express';
import { AlbumController } from '../controllers/AlbumController.ts';
import { batBuocDangNhap } from '../middlewares/xac_thuc_token.ts';
import { batBuocQuanTriVien } from '../middlewares/phan_quyen.ts';
import { uploadFileMiddleware } from '../middlewares/upload_file.ts';

const router = Router();
const uploadCover = uploadFileMiddleware.fields([{ name: 'anh_bia', maxCount: 1 }]);

// Công khai
router.get('/', AlbumController.layTatCa);
router.get('/:id', AlbumController.layChiTiet);

// Quản trị viên
router.post('/', batBuocDangNhap, batBuocQuanTriVien, uploadCover, AlbumController.adminThem);
router.put('/:id', batBuocDangNhap, batBuocQuanTriVien, uploadCover, AlbumController.adminCapNhat);
router.delete('/:id', batBuocDangNhap, batBuocQuanTriVien, AlbumController.adminXoa);

export default router;
