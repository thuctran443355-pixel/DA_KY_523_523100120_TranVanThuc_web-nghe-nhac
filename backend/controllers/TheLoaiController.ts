/**
 * @file TheLoaiController.ts
 * @description Tầng Controller - Tiếp nhận yêu cầu HTTP liên quan đến Thể Loại
 */

import type { Response } from 'express';
import { TheLoaiService } from '../services/TheLoaiService.ts';
import type { RequestXacThuc } from '../middlewares/xac_thuc_token.ts';

export const TheLoaiController = {
  async layTatCa(req: RequestXacThuc, res: Response) {
    try {
      const danhSach = await TheLoaiService.layTatCa();
      return res.json({ thanh_cong: true, du_lieu: danhSach });
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  async layChiTiet(req: RequestXacThuc, res: Response) {
    try {
      const { id } = req.params;
      const ketQua = await TheLoaiService.layChiTiet(id);
      return res.json({ thanh_cong: true, du_lieu: ketQua });
    } catch (error: any) {
      return res.status(404).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  async adminThem(req: RequestXacThuc, res: Response) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      let anh_the_loai = req.body.anh_the_loai;
      if (files?.anh_the_loai?.[0]) {
        anh_the_loai = `/uploads/images/${files.anh_the_loai[0].filename}`;
      }

      const theLoaiMoi = await TheLoaiService.adminThem({
        ...req.body,
        anh_the_loai: anh_the_loai || req.body.anh_the_loai
      });

      return res.status(201).json({
        thanh_cong: true,
        thong_bao: 'Thêm thể loại mới thành công!',
        du_lieu: theLoaiMoi
      });
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  async adminCapNhat(req: RequestXacThuc, res: Response) {
    try {
      const { id } = req.params;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      let duLieu = { ...req.body };
      if (files?.anh_the_loai?.[0]) {
        duLieu.anh_the_loai = `/uploads/images/${files.anh_the_loai[0].filename}`;
      }

      const capNhat = await TheLoaiService.adminCapNhat(id, duLieu);
      return res.json({
        thanh_cong: true,
        thong_bao: 'Cập nhật thể loại thành công!',
        du_lieu: capNhat
      });
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  async adminXoa(req: RequestXacThuc, res: Response) {
    try {
      const { id } = req.params;
      const ketQua = await TheLoaiService.adminXoa(id);
      return res.json(ketQua);
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  }
};
