/**
 * @file NgheSiController.ts
 * @description Tầng Controller - Tiếp nhận yêu cầu HTTP liên quan đến Nghệ Sĩ
 */

import type { Response } from 'express';
import { NgheSiService } from '../services/NgheSiService.ts';
import type { RequestXacThuc } from '../middlewares/xac_thuc_token.ts';

export const NgheSiController = {
  async layTatCa(req: RequestXacThuc, res: Response) {
    try {
      const danhSach = await NgheSiService.layTatCa();
      return res.json({ thanh_cong: true, du_lieu: danhSach });
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  async layChiTiet(req: RequestXacThuc, res: Response) {
    try {
      const { id } = req.params;
      const ketQua = await NgheSiService.layChiTiet(id);
      return res.json({ thanh_cong: true, du_lieu: ketQua });
    } catch (error: any) {
      return res.status(404).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  async adminThem(req: RequestXacThuc, res: Response) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      let anh_dai_dien = req.body.anh_dai_dien;
      if (files?.anh_dai_dien?.[0]) {
        anh_dai_dien = `/uploads/images/${files.anh_dai_dien[0].filename}`;
      }

      const ngheSiMoi = await NgheSiService.adminThem({
        ...req.body,
        anh_dai_dien: anh_dai_dien || req.body.anh_dai_dien
      });
      return res.status(201).json({
        thanh_cong: true,
        thong_bao: 'Thêm nghệ sĩ mới thành công!',
        du_lieu: ngheSiMoi
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
      if (files?.anh_dai_dien?.[0]) {
        duLieu.anh_dai_dien = `/uploads/images/${files.anh_dai_dien[0].filename}`;
      }

      const capNhat = await NgheSiService.adminCapNhat(id, duLieu);
      return res.json({
        thanh_cong: true,
        thong_bao: 'Cập nhật thông tin nghệ sĩ thành công!',
        du_lieu: capNhat
      });
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  async adminXoa(req: RequestXacThuc, res: Response) {
    try {
      const { id } = req.params;
      const ketQua = await NgheSiService.adminXoa(id);
      return res.json(ketQua);
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  }
};
