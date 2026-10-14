/**
 * @file AlbumController.ts
 * @description Tầng Controller - Tiếp nhận yêu cầu HTTP liên quan đến Album
 */

import type { Response } from 'express';
import { AlbumService } from '../services/AlbumService.ts';
import type { RequestXacThuc } from '../middlewares/xac_thuc_token.ts';

export const AlbumController = {
  async layTatCa(req: RequestXacThuc, res: Response) {
    try {
      const danhSach = await AlbumService.layTatCa();
      return res.json({ thanh_cong: true, du_lieu: danhSach });
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  async layChiTiet(req: RequestXacThuc, res: Response) {
    try {
      const { id } = req.params;
      const ketQua = await AlbumService.layChiTiet(id);
      return res.json({ thanh_cong: true, du_lieu: ketQua });
    } catch (error: any) {
      return res.status(404).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  async adminThem(req: RequestXacThuc, res: Response) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      let anh_bia = req.body.anh_bia;
      if (files?.anh_bia?.[0]) {
        anh_bia = `/uploads/images/${files.anh_bia[0].filename}`;
      }

      const albumMoi = await AlbumService.adminThem({
        ...req.body,
        anh_bia: anh_bia || req.body.anh_bia,
        nam_phat_hanh: req.body.nam_phat_hanh ? Number(req.body.nam_phat_hanh) : undefined
      });

      return res.status(201).json({
        thanh_cong: true,
        thong_bao: 'Thêm album mới thành công!',
        du_lieu: albumMoi
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
      if (files?.anh_bia?.[0]) {
        duLieu.anh_bia = `/uploads/images/${files.anh_bia[0].filename}`;
      }
      if (duLieu.nam_phat_hanh) {
        duLieu.nam_phat_hanh = Number(duLieu.nam_phat_hanh);
      }

      const capNhat = await AlbumService.adminCapNhat(id, duLieu);
      return res.json({
        thanh_cong: true,
        thong_bao: 'Cập nhật album thành công!',
        du_lieu: capNhat
      });
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  async adminXoa(req: RequestXacThuc, res: Response) {
    try {
      const { id } = req.params;
      const ketQua = await AlbumService.adminXoa(id);
      return res.json(ketQua);
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  }
};
