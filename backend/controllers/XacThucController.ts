/**
 * @file XacThucController.ts
 * @description Tầng Controller - Tiếp nhận các yêu cầu HTTP xác thực tài khoản
 */

import type { Response } from 'express';
import { XacThucService } from '../services/XacThucService.ts';
import type { RequestXacThuc } from '../middlewares/xac_thuc_token.ts';

export const XacThucController = {
  // Xử lý đăng ký tài khoản
  async dangKy(req: RequestXacThuc, res: Response) {
    try {
      const ketQua = await XacThucService.dangKy(req.body);
      return res.status(201).json({
        thanh_cong: true,
        thong_bao: 'Đăng ký tài khoản thành công!',
        du_lieu: ketQua
      });
    } catch (error: any) {
      return res.status(400).json({
        thanh_cong: false,
        thong_bao: error.message
      });
    }
  },

  // Xử lý đăng nhập tài khoản
  async dangNhap(req: RequestXacThuc, res: Response) {
    try {
      const ketQua = await XacThucService.dangNhap(req.body);
      return res.json({
        thanh_cong: true,
        thong_bao: 'Đăng nhập thành công!',
        du_lieu: ketQua
      });
    } catch (error: any) {
      return res.status(400).json({
        thanh_cong: false,
        thong_bao: error.message
      });
    }
  },

  // Lấy thông tin tài khoản hiện tại
  async layThongTinHienTai(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Chưa đăng nhập!' });
      }
      const nguoiDung = await XacThucService.layHoSo(req.nguoiDungHienTai._id);
      return res.json({
        thanh_cong: true,
        du_lieu: nguoiDung
      });
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Cập nhật thông tin hồ sơ
  async capNhatHoSo(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Chưa đăng nhập!' });
      }
      const ketQua = await XacThucService.capNhatHoSo(req.nguoiDungHienTai._id, req.body);
      return res.json({
        thanh_cong: true,
        thong_bao: 'Cập nhật hồ sơ thành công!',
        du_lieu: ketQua
      });
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Đổi mật khẩu
  async doiMatKhau(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Chưa đăng nhập!' });
      }
      const { mat_khau_cu, mat_khau_moi } = req.body;
      const ketQua = await XacThucService.doiMatKhau(req.nguoiDungHienTai._id, mat_khau_cu, mat_khau_moi);
      return res.json({ thanh_cong: true, ...ketQua });
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  }
};
