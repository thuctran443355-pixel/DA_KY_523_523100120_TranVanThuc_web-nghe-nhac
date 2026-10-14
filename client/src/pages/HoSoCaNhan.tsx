/**
 * @file HoSoCaNhan.tsx
 * @description Trang Quản Lý Hồ Sơ Cá Nhân & Đổi Mật Khẩu
 * Dành cho Người dùng và Quản trị viên
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { AuthAPI } from '../services/api.ts';
import { User, KeyRound, Shield, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';

export const HoSoCaNhan: React.FC = () => {
  const { nguoiDung, capNhatNguoiDung, dangXuat, isQuanTriVien } = useAuth();

  const [hoTen, setHoTen] = useState(nguoiDung?.ho_ten || '');
  const [avatar, setAvatar] = useState(nguoiDung?.avatar || '');
  const [tieuSu, setTieuSu] = useState(nguoiDung?.tieu_su || '');
  const [dangLuu, setDangLuu] = useState(false);
  const [thongBaoHoSo, setThongBaoHoSo] = useState('');
  const [loiHoSo, setLoiHoSo] = useState('');

  // Đổi mật khẩu
  const [matKhauCu, setMatKhauCu] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [dangDoiMatKhau, setDangDoiMatKhau] = useState(false);
  const [thongBaoMK, setThongBaoMK] = useState('');
  const [loiMK, setLoiMK] = useState('');

  const handleCapNhatHoSo = async (e: React.FormEvent) => {
    e.preventDefault();
    setThongBaoHoSo('');
    setLoiHoSo('');
    setDangLuu(true);

    try {
      const nguoiDungMoi = await AuthAPI.capNhatHoSo({
        ho_ten: hoTen,
        avatar,
        tieu_su: tieuSu
      });
      capNhatNguoiDung(nguoiDungMoi);
      setThongBaoHoSo('Cập nhật thông tin hồ sơ thành công!');
    } catch (err: any) {
      setLoiHoSo(err.message || 'Lỗi cập nhật hồ sơ!');
    } finally {
      setDangLuu(false);
    }
  };

  const handleDoiMatKhau = async (e: React.FormEvent) => {
    e.preventDefault();
    setThongBaoMK('');
    setLoiMK('');

    if (matKhauMoi !== xacNhanMatKhau) {
      setLoiMK('Mật khẩu xác nhận không khớp!');
      return;
    }

    setDangDoiMatKhau(true);
    try {
      const res = await AuthAPI.doiMatKhau(matKhauCu, matKhauMoi);
      setThongBaoMK(res.thong_bao || 'Đổi mật khẩu thành công!');
      setMatKhauCu('');
      setMatKhauMoi('');
      setXacNhanMatKhau('');
    } catch (err: any) {
      setLoiMK(err.message || 'Lỗi đổi mật khẩu!');
    } finally {
      setDangDoiMatKhau(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-emerald-600" />
          Hồ Sơ Cá Nhân & Tài Khoản
        </h1>
        <p className="text-xs text-zinc-600 mt-1">Quản lý thông tin hiển thị và bảo mật tài khoản</p>
      </div>

      {/* Thông Tin Tổng Quan */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="relative">
          <img
            src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-zinc-200 shadow"
          />
        </div>
        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-zinc-900 truncate">{nguoiDung?.ho_ten}</h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isQuanTriVien ? 'bg-rose-500/20 text-rose-700' : 'bg-emerald-500/20 text-emerald-700'
            }`}>
              {isQuanTriVien ? 'Quản Trị Viên' : 'Người Dùng'}
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-1">@{nguoiDung?.username} • {nguoiDung?.email}</p>
          <p className="text-xs text-zinc-700 mt-2 max-w-lg italic">
            "{nguoiDung?.tieu_su || 'Chưa cập nhật tiểu sử'}"
          </p>
        </div>
        <button
          onClick={dangXuat}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-semibold border border-red-500/30 transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Cập Nhật Hồ Sơ */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            Cập Nhật Thông Tin
          </h3>

          {thongBaoHoSo && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{thongBaoHoSo}</span>
            </div>
          )}
          {loiHoSo && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loiHoSo}</span>
            </div>
          )}

          <form onSubmit={handleCapNhatHoSo} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Họ và tên hiển thị</label>
              <input
                type="text"
                required
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Link Ảnh Avatar</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Tiểu sử cá nhân</label>
              <textarea
                rows={3}
                value={tieuSu}
                onChange={(e) => setTieuSu(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={dangLuu}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {dangLuu ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </form>
        </div>

        {/* Form Đổi Mật Khẩu */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            Đổi Mật Khẩu
          </h3>

          {thongBaoMK && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{thongBaoMK}</span>
            </div>
          )}
          {loiMK && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loiMK}</span>
            </div>
          )}

          <form onSubmit={handleDoiMatKhau} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                value={matKhauCu}
                onChange={(e) => setMatKhauCu(e.target.value)}
                placeholder="Nhập mật khẩu cũ..."
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                required
                minLength={6}
                value={matKhauMoi}
                onChange={(e) => setMatKhauMoi(e.target.value)}
                placeholder="Ít nhất 6 ký tự..."
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                required
                value={xacNhanMatKhau}
                onChange={(e) => setXacNhanMatKhau(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={dangDoiMatKhau}
              className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {dangDoiMatKhau ? 'Đang đổi...' : 'Cập Nhật Mật Khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
