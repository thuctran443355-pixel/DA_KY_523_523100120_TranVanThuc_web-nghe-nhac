/**
 * @file playlist_route.ts
 * @description Tầng Route - Định tuyến cho Danh Sách Phát (Playlist)
 */

import { Router } from 'express';
import { PlaylistController } from '../controllers/PlaylistController.ts';
import { batBuocDangNhap } from '../middlewares/xac_thuc_token.ts';

const router = Router();

// Xem chi tiết playlist (công khai)
router.get('/chi-tiet/:id', PlaylistController.layChiTiet);

// Các chức năng yêu cầu đăng nhập của người dùng
router.get('/cua-toi', batBuocDangNhap, PlaylistController.layDanhSachCuaToi);
router.post('/tao-moi', batBuocDangNhap, PlaylistController.taoMoi);
router.post('/:id/them-bai-hat', batBuocDangNhap, PlaylistController.themBaiHat);
router.delete('/:id/xoa-bai-hat/:baiHatId', batBuocDangNhap, PlaylistController.xoaBaiHat);
router.put('/:id', batBuocDangNhap, PlaylistController.capNhat);
router.delete('/:id', batBuocDangNhap, PlaylistController.xoa);

export default router;
