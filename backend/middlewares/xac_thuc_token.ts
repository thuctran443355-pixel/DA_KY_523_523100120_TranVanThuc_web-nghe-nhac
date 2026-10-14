/**
 * @file xac_thuc_token.ts
 * @description Tầng Middleware - Xác thực phiên đăng nhập người dùng từ Header Authorization
 * Đảm bảo phân quyền chính xác giữa: Khách vãng lai, Người dùng, Quản trị viên
 */

import type { Request, Response, NextFunction } from 'express';
import { docToken, tokenConHopLe } from '../services/token.ts';
import { NguoiDungModel, type INguoiDung } from '../models/NguoiDungModel.ts';

// Mở rộng kiểu dữ liệu Request của Express để chứa thông tin người dùng đã xác thực
export interface RequestXacThuc extends Request {
  nguoiDungHienTai?: INguoiDung;
}

// Hàm trích xuất chính xác User ID từ Token
export function giaiMaToken(token: string): string {
  return docToken(token)?.id || '';
}

/**
 * Middleware bắt buộc phải đăng nhập (Người dùng hoặc Quản trị viên)
 */
export async function batBuocDangNhap(req: RequestXacThuc, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        thanh_cong: false,
        thong_bao: 'Vui lòng đăng nhập để thực hiện chức năng này!'
      });
    }

    const token = authHeader.split(' ')[1];
    const userId = giaiMaToken(token);

    const nguoiDung = await NguoiDungModel.findById(userId);
    if (!nguoiDung || !tokenConHopLe(token, nguoiDung.password)) {
      return res.status(401).json({
        thanh_cong: false,
        thong_bao: 'Tài khoản không tồn tại hoặc phiên đăng nhập đã hết hạn!'
      });
    }

    if (nguoiDung.trang_thai === 'bi_khoa') {
      return res.status(403).json({
        thanh_cong: false,
        thong_bao: 'Tài khoản của bạn đã bị quản trị viên khóa tạm thời!'
      });
    }

    req.nguoiDungHienTai = nguoiDung;
    next();
  } catch (error: any) {
    return res.status(500).json({
      thanh_cong: false,
      thong_bao: 'Lỗi xác thực: ' + error.message
    });
  }
}

/**
 * Middleware tùy chọn đăng nhập: Khách vãng lai vẫn được đi tiếp, nhưng nếu có gửi kèm token thì giải mã lấy thông tin
 */
export async function tuyChonDangNhap(req: RequestXacThuc, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const userId = giaiMaToken(token);
      const nguoiDung = await NguoiDungModel.findById(userId);
      if (nguoiDung && tokenConHopLe(token, nguoiDung.password) && nguoiDung.trang_thai !== 'bi_khoa') {
        req.nguoiDungHienTai = nguoiDung;
      }
    }
  } catch (error) {
    // Không làm gián đoạn khách vãng lai
  }
  next();
}
