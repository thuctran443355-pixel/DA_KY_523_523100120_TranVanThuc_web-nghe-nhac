/**
 * @file PlaylistController.ts
 * @description Tầng Controller - Tiếp nhận yêu cầu HTTP liên quan đến Playlist
 */

import type { Response } from 'express';
import { PlaylistService } from '../services/PlaylistService.ts';
import type { RequestXacThuc } from '../middlewares/xac_thuc_token.ts';

export const PlaylistController = {
  // Lấy playlist của người dùng đang đăng nhập
  async layDanhSachCuaToi(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Vui lòng đăng nhập!' });
      }
      const list = await PlaylistService.layTheoNguoiDung(req.nguoiDungHienTai._id);
      return res.json({ thanh_cong: true, du_lieu: list });
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Chi tiết playlist kèm bài hát
  async layChiTiet(req: RequestXacThuc, res: Response) {
    try {
      const { id } = req.params;
      const ketQua = await PlaylistService.layChiTiet(id);
      return res.json({ thanh_cong: true, du_lieu: ketQua });
    } catch (error: any) {
      return res.status(404).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Tạo playlist mới
  async taoMoi(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Vui lòng đăng nhập!' });
      }
      const playlistMoi = await PlaylistService.taoMoi({
        ten_playlist: req.body.ten_playlist,
        mo_ta: req.body.mo_ta,
        anh_bia: req.body.anh_bia,
        nguoi_dung_id: req.nguoiDungHienTai._id
      });
      return res.status(201).json({
        thanh_cong: true,
        thong_bao: 'Tạo danh sách phát mới thành công!',
        du_lieu: playlistMoi
      });
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Thêm bài hát vào playlist
  async themBaiHat(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Vui lòng đăng nhập!' });
      }
      const { id } = req.params; // playlistId
      const { bai_hat_id } = req.body;
      const ketQua = await PlaylistService.themBaiHatVaoPlaylist(id, bai_hat_id, req.nguoiDungHienTai._id);
      return res.json(ketQua);
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Xóa bài hát khỏi playlist
  async xoaBaiHat(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Vui lòng đăng nhập!' });
      }
      const { id, baiHatId } = req.params;
      const ketQua = await PlaylistService.xoaBaiHatKhoiPlaylist(id, baiHatId, req.nguoiDungHienTai._id);
      return res.json(ketQua);
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  async capNhat(req: RequestXacThuc, res: Response) {
    try {
      const data = await PlaylistService.capNhat(req.params.id, req.nguoiDungHienTai!._id!, req.body);
      return res.json({ thanh_cong: true, du_lieu: data });
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Xóa playlist
  async xoa(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Vui lòng đăng nhập!' });
      }
      const { id } = req.params;
      const ketQua = await PlaylistService.xoa(id, req.nguoiDungHienTai._id);
      return res.json(ketQua);
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  }
};
