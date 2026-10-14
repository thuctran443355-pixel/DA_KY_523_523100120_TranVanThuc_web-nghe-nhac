/**
 * @file BaiHatController.ts
 * @description Tầng Controller - Tiếp nhận yêu cầu HTTP liên quan đến Bài Hát
 */

import type { Response } from 'express';
import { BaiHatModel } from '../models/BaiHatModel.ts';
import { BaiHatService } from '../services/BaiHatService.ts';
import type { RequestXacThuc } from '../middlewares/xac_thuc_token.ts';

export const BaiHatController = {
  // Lấy danh sách bài hát công khai đã được duyệt
  async layDanhSach(req: RequestXacThuc, res: Response) {
    try {
      const danhSach = await BaiHatService.layDanhSachDaDuyet(req.query);
      return res.json({
        thanh_cong: true,
        tong_so: danhSach.length,
        du_lieu: danhSach
      });
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Tìm kiếm và lọc bài hát
  async timKiem(req: RequestXacThuc, res: Response) {
    try {
      const { q, the_loai, sap_xep } = req.query;
      const ketQua = await BaiHatService.timKiemVaLoc({
        tu_khoa: q as string,
        the_loai: the_loai as string,
        sap_xep: sap_xep as string
      });
      return res.json({
        thanh_cong: true,
        tong_so: ketQua.length,
        du_lieu: ketQua
      });
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Lấy chi tiết bài hát và phát nhạc
  async layChiTiet(req: RequestXacThuc, res: Response) {
    try {
      const { id } = req.params;
      const song = await BaiHatModel.findById(id);
      const currentUser = req.nguoiDungHienTai;
      if (!song || (song.trang_thai !== 'da_duyet' && currentUser?.vai_tro !== 'quan_tri_vien' && currentUser?._id !== song.nguoi_dang_id)) {
        return res.status(404).json({ thanh_cong: false, thong_bao: 'Không tìm thấy bài hát!' });
      }
      const baiHat = await BaiHatService.layChiTietVaTangLuotNghe(id, req.method === 'POST');
      return res.json({
        thanh_cong: true,
        du_lieu: baiHat
      });
    } catch (error: any) {
      return res.status(404).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Người dùng tải lên bài hát -> Chờ quản trị viên phê duyệt
  async nguoiDungUpload(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Vui lòng đăng nhập để tải lên bài hát!' });
      }

      // Xử lý file nếu có upload qua multipart/form-data
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      let file_url = req.body.file_url;
      let anh_bia = req.body.anh_bia;

      if (files?.file_nhac?.[0]) {
        file_url = `/uploads/audio/${files.file_nhac[0].filename}`;
      }
      if (files?.anh_bia?.[0]) {
        anh_bia = `/uploads/images/${files.anh_bia[0].filename}`;
      }

      const ketQua = await BaiHatService.nguoiDungUpload({
        tieu_de: req.body.tieu_de,
        nghe_si: req.body.nghe_si,
        album: req.body.album,
        the_loai: req.body.the_loai,
        file_url: file_url,
        anh_bia: anh_bia,
        thoi_luong: Number(req.body.thoi_luong) || 210,
        loi_bai_hat: req.body.loi_bai_hat,
        nguoi_dang_id: req.nguoiDungHienTai._id
      });

      return res.status(201).json(ketQua);
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Quản trị viên thêm trực tiếp bài hát -> Tự động duyệt ngay
  async adminThem(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Yêu cầu quyền quản trị viên!' });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      let file_url = req.body.file_url;
      let anh_bia = req.body.anh_bia;

      if (files?.file_nhac?.[0]) {
        file_url = `/uploads/audio/${files.file_nhac[0].filename}`;
      }
      if (files?.anh_bia?.[0]) {
        anh_bia = `/uploads/images/${files.anh_bia[0].filename}`;
      }

      const baiHatMoi = await BaiHatService.adminThemBaiHat({
        tieu_de: req.body.tieu_de,
        nghe_si: req.body.nghe_si,
        album: req.body.album,
        the_loai: req.body.the_loai,
        file_url: file_url,
        anh_bia: anh_bia,
        thoi_luong: Number(req.body.thoi_luong) || 220,
        loi_bai_hat: req.body.loi_bai_hat,
        admin_id: req.nguoiDungHienTai._id
      });

      return res.status(201).json({
        thanh_cong: true,
        thong_bao: 'Đã thêm bài hát thành công và được phát hành trực tiếp!',
        du_lieu: baiHatMoi
      });
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Quản trị viên duyệt hoặc từ chối bài hát
  async adminPheDuyet(req: RequestXacThuc, res: Response) {
    try {
      const { id } = req.params;
      const { trang_thai, ly_do_tu_choi } = req.body;

      if (!['da_duyet', 'tu_choi'].includes(trang_thai)) {
        return res.status(400).json({ thanh_cong: false, thong_bao: 'Trạng thái không hợp lệ (da_duyet hoặc tu_choi)!' });
      }

      const capNhat = await BaiHatService.adminPheDuyetBaiHat(id, trang_thai, ly_do_tu_choi);
      return res.json({
        thanh_cong: true,
        thong_bao: trang_thai === 'da_duyet' ? 'Đã phê duyệt bài hát thành công!' : 'Đã từ chối bài hát!',
        du_lieu: capNhat
      });
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Quản trị viên xem tất cả bài hát hệ thống
  async adminLayTatCa(req: RequestXacThuc, res: Response) {
    try {
      const { trang_thai } = req.query;
      const danhSach = await BaiHatService.adminLayTatCaBaiHat(trang_thai as string);
      return res.json({
        thanh_cong: true,
        tong_so: danhSach.length,
        du_lieu: danhSach
      });
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Người dùng xem các bài hát do chính mình đã tải lên
  async layBaiHatCuaToi(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Chưa đăng nhập!' });
      }
      const danhSach = await BaiHatService.layBaiHatCuaToi(req.nguoiDungHienTai._id);
      return res.json({
        thanh_cong: true,
        du_lieu: danhSach
      });
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Quản trị viên cập nhật bài hát
  async adminSua(req: RequestXacThuc, res: Response) {
    try {
      const { id } = req.params;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const data = { ...req.body };
      if (files?.file_nhac?.[0]) data.file_url = '/uploads/audio/' + files.file_nhac[0].filename;
      if (files?.anh_bia?.[0]) data.anh_bia = '/uploads/images/' + files.anh_bia[0].filename;
      if (data.thoi_luong !== undefined) {
        data.thoi_luong = Number(data.thoi_luong);
        if (!Number.isFinite(data.thoi_luong) || data.thoi_luong <= 0) throw new Error('Thời lượng không hợp lệ!');
      }
      delete data._id;
      const capNhat = await BaiHatService.adminSuaBaiHat(id, data);
      return res.json({
        thanh_cong: true,
        thong_bao: 'Cập nhật bài hát thành công!',
        du_lieu: capNhat
      });
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Người dùng xóa bài hát của chính mình
  async nguoiDungXoa(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Vui lòng đăng nhập!' });
      }
      const { id } = req.params;
      const ketQua = await BaiHatService.nguoiDungXoaBaiHat(id, req.nguoiDungHienTai._id);
      return res.json(ketQua);
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Quản trị viên xóa bài hát
  async adminXoa(req: RequestXacThuc, res: Response) {
    try {
      const { id } = req.params;
      const ketQua = await BaiHatService.adminXoaBaiHat(id);
      return res.json(ketQua);
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  }
};
