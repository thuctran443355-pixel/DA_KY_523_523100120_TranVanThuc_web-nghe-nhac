/**
 * @file AuthContext.tsx
 * @description Context Quản Lý Trạng Thái Xác Thực & Phân Quyền 3 Đối Tượng:
 * 1. Khách vãng lai (Chưa đăng nhập)
 * 2. Người dùng đã đăng nhập (Thành viên)
 * 3. Quản trị viên (Admin)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { NguoiDung } from '../types/index.ts';
import { AuthAPI, layToken, xoaToken } from '../services/api.ts';

interface AuthContextType {
  nguoiDung: NguoiDung | null;
  vaiTro: 'khach' | 'nguoi_dung' | 'quan_tri_vien';
  isKhach: boolean;
  isNguoiDung: boolean;
  isQuanTriVien: boolean;
  dangTai: boolean;
  dangNhap: (thongTin: { identifier: string; password: string }) => Promise<NguoiDung>;
  dangKy: (thongTin: { username: string; email: string; password: string; ho_ten?: string }) => Promise<void>;
  dangXuat: () => void;
  capNhatNguoiDung: (nguoiDungMoi: NguoiDung) => void;
  lamMoiHoSo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nguoiDung, setNguoiDung] = useState<NguoiDung | null>(null);
  const [dangTai, setDangTai] = useState<boolean>(true);

  // Khởi động kiểm tra token lưu trong localStorage
  const kiemTraDangNhap = async () => {
    const token = layToken();
    if (!token) {
      setNguoiDung(null);
      setDangTai(false);
      return;
    }

    try {
      const hoSo = await AuthAPI.layHoSo();
      setNguoiDung(hoSo);
    } catch (error) {
      console.warn('Phiên đăng nhập không hợp lệ hoặc đã hết hạn:', error);
      xoaToken();
      setNguoiDung(null);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    kiemTraDangNhap();
  }, []);

  // Hàm xử lý đăng nhập
  const dangNhap = async (thongTin: { identifier: string; password: string }) => {
    setDangTai(true);
    try {
      const res = await AuthAPI.dangNhap(thongTin);
      setNguoiDung(res.nguoiDung);
      return res.nguoiDung;
    } finally {
      setDangTai(false);
    }
  };

  // Hàm xử lý đăng ký
  const dangKy = async (thongTin: { username: string; email: string; password: string; ho_ten?: string }) => {
    setDangTai(true);
    try {
      const res = await AuthAPI.dangKy(thongTin);
      setNguoiDung(res.nguoiDung);
    } finally {
      setDangTai(false);
    }
  };

  // Hàm xử lý đăng xuất
  const dangXuat = () => {
    xoaToken();
    setNguoiDung(null);
  };

  const capNhatNguoiDung = (nguoiDungMoi: NguoiDung) => {
    setNguoiDung(nguoiDungMoi);
  };

  const lamMoiHoSo = async () => {
    try {
      const hoSo = await AuthAPI.layHoSo();
      setNguoiDung(hoSo);
    } catch (e) {
      // Bỏ qua nếu lỗi
    }
  };

  // Xác định vai trò hiện tại
  const vaiTro = nguoiDung ? nguoiDung.vai_tro : 'khach';
  const isKhach = vaiTro === 'khach';
  const isNguoiDung = vaiTro === 'nguoi_dung';
  const isQuanTriVien = vaiTro === 'quan_tri_vien';

  return (
    <AuthContext.Provider
      value={{
        nguoiDung,
        vaiTro,
        isKhach,
        isNguoiDung,
        isQuanTriVien,
        dangTai,
        dangNhap,
        dangKy,
        dangXuat,
        capNhatNguoiDung,
        lamMoiHoSo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider!');
  }
  return context;
};
