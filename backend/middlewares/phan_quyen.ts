/**
 * @file phan_quyen.ts
 * @description Tầng Middleware - Phân Quyền Vai Trò
 * Kiểm tra xem người dùng hiện tại có vai trò Quản trị viên (quan_tri_vien) hay không
 */

import type { Response, NextFunction } from 'express';
import type { RequestXacThuc } from './xac_thuc_token.ts';

/**
 * Middleware bắt buộc vai trò Quản trị viên
 */
export function batBuocQuanTriVien(req: RequestXacThuc, res: Response, next: NextFunction) {
  if (!req.nguoiDungHienTai) {
    return res.status(401).json({
      thanh_cong: false,
      thong_bao: 'Vui lòng đăng nhập với tài khoản Quản trị viên!'
    });
  }

  if (req.nguoiDungHienTai.vai_tro !== 'quan_tri_vien') {
    return res.status(403).json({
      thanh_cong: false,
      thong_bao: 'Bạn không có quyền thực hiện thao tác quản trị này!'
    });
  }

  next();
}
