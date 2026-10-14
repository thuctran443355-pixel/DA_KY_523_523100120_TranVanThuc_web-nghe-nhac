/**
 * @file YeuThichController.ts
 * @description Tầng Controller - Tiếp nhận yêu cầu HTTP liên quan đến Bài Hát Yêu Thích
 */

import type { Response } from 'express';
import { YeuThichService } from '../services/YeuThichService.ts';
import type { RequestXacThuc } from '../middlewares/xac_thuc_token.ts';

export const YeuThichController = {
  // Thả tim / Bỏ tim bài hát
  async toggleYeuThich(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Vui lòng đăng nhập để lưu bài hát yêu thích!' });
      }
      const { bai_hat_id } = req.body;
      const ketQua = await YeuThichService.toggleYeuThich(req.nguoiDungHienTai._id, bai_hat_id);
      return res.json({ thanh_cong: true, ...ketQua });
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Lấy danh sách ID các bài hát đã thích (để hiển thị icon tim đỏ ở giao diện)
  async layDanhSachId(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.json({ thanh_cong: true, du_lieu: [] });
      }
      const listId = await YeuThichService.layDanhSachId(req.nguoiDungHienTai._id);
      return res.json({ thanh_cong: true, du_lieu: listId });
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Lấy danh sách đầy đủ các bài hát yêu thích
  async layDanhSachDayDu(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Vui lòng đăng nhập!' });
      }
      const list = await YeuThichService.layDanhSachDayDu(req.nguoiDungHienTai._id);
      return res.json({ thanh_cong: true, tong_so: list.length, du_lieu: list });
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  }
};
