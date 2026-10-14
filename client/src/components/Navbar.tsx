/**
 * @file Navbar.tsx
 * @description Thanh Điều Hướng Trên Cùng
 * Hiển thị tìm kiếm, trạng thái phân quyền (Khách, Người dùng, Quản trị viên), nút upload bài hát và menu cá nhân
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Menu,
  Search, 
  Upload, 
  ShieldCheck, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Music2, 
  Sparkles,
  Heart,
  History,
  ListMusic
} from 'lucide-react';

interface NavbarProps {
  onToggleMenu: () => void;
  menuOpen: boolean;
  onOpenAuth: (mode?: 'dang_nhap' | 'dang_ky' | 'dang_nhap_admin') => void;
  onOpenUpload: () => void;
  onChuyenTrang: (trang: string) => void;
  trangHienTai: string;
  tuKhoaTimKiem: string;
  setTuKhoaTimKiem: (val: string) => void;
  soBaiChoDuyet?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenUpload,
  onChuyenTrang,
  trangHienTai,
  tuKhoaTimKiem,
  setTuKhoaTimKiem,
  soBaiChoDuyet = 0,
  onToggleMenu,
  menuOpen
}) => {
  const { nguoiDung, vaiTro, isKhach, isNguoiDung, isQuanTriVien, dangXuat } = useAuth();
  const [hienMenuUser, setHienMenuUser] = useState(false);

  const xuLyTimKiem = (e: React.FormEvent) => {
    e.preventDefault();
    if (trangHienTai !== 'kham_pha') {
      onChuyenTrang('kham_pha');
    }
  };

  const handleDangXuat = () => {
    setHienMenuUser(false);
    dangXuat();
    onChuyenTrang('trang_chu');
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md px-4 lg:px-8 py-3.5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 border-b ${
      isQuanTriVien 
        ? 'bg-white/90 border-rose-200/50' 
        : 'bg-white/80 border-zinc-200/80'
    }`}>
      <button type="button" onClick={onToggleMenu} aria-label="Mở menu điều hướng" aria-expanded={menuOpen}
        className="shrink-0 p-2 rounded-xl text-zinc-800 hover:bg-zinc-100 lg:hidden">
        <Menu className="w-5 h-5" />
      </button>
      {/* Ô Tìm Kiếm Nhanh */}
      <form onSubmit={xuLyTimKiem} className="relative order-2 w-full lg:order-none lg:flex-1 lg:max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
        <input
          type="text"
          value={tuKhoaTimKiem}
          onChange={(e) => {
            setTuKhoaTimKiem(e.target.value);
            if (trangHienTai !== 'kham_pha' && e.target.value.trim().length > 0) {
              onChuyenTrang('kham_pha');
            }
          }}
          placeholder="Tìm bài hát, ca sĩ, thể loại, album..."
          className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 focus:border-emerald-500 rounded-full pl-10 pr-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
        />
      </form>

      {/* Khu Vực Nút Thao Tác & Trạng Thái 3 Nhóm Đối Tượng Riêng Biệt */}
      <div className="flex items-center gap-3">
        {/* ================= ĐỐI TƯỢNG 1: KHÁCH VÃNG LAI ================= */}
        {isKhach && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth('dang_nhap')}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 px-4 py-2 rounded-full hover:bg-zinc-50 border border-zinc-200 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đăng nhập</span>
            </button>

            <button
              onClick={() => onOpenAuth('dang_ky')}
              className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full transition-all shadow-sm cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng ký</span>
            </button>
          </div>
        )}

        {/* ================= ĐỐI TƯỢNG 2: NGƯỜI DÙNG THÀNH VIÊN ================= */}
        {isNguoiDung && (
          <div className="flex items-center gap-3">
            {/* Nút Upload Nhạc Người Dùng (Gửi chờ phê duyệt) */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-3.5 py-2 rounded-full transition-all shadow-md shadow-emerald-200/50 cursor-pointer active:scale-95"
              title="Tải lên bài hát .mp3 - Cần Quản trị viên phê duyệt"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng Tải Nhạc (Chờ duyệt)</span>
            </button>

            {/* Menu Cá Nhân Người Dùng */}
            <div className="relative">
              <button
                onClick={() => setHienMenuUser(!hienMenuUser)}
                className="flex items-center gap-2 bg-zinc-50 hover:bg-zinc-100 border border-emerald-500/30 rounded-full p-1 pr-3 transition-all cursor-pointer"
              >
                <img
                  src={nguoiDung?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={nguoiDung?.ho_ten}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-zinc-800 leading-tight max-w-[110px] truncate">
                    {nguoiDung?.ho_ten}
                  </p>
                  <span className="text-[10px] font-medium leading-none text-emerald-600">
                    Thành viên
                  </span>
                </div>
              </button>

              {hienMenuUser && (
                <div 
                  className="absolute right-0 mt-2 w-60 bg-zinc-50 border border-zinc-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setHienMenuUser(false)}
                >
                  <div className="px-4 py-2 border-b border-zinc-200">
                    <p className="text-sm font-bold text-zinc-900 truncate">{nguoiDung?.ho_ten}</p>
                    <p className="text-xs text-zinc-600 truncate">@{nguoiDung?.username}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700">
                      Tài Khoản Người Dùng
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => onChuyenTrang('ho_so')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 transition-colors text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Hồ sơ cá nhân & Mật khẩu</span>
                    </button>

                    <button
                      onClick={() => onChuyenTrang('yeu_thich')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 transition-colors text-left cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-rose-600" />
                      <span>Bài hát yêu thích</span>
                    </button>

                    <button
                      onClick={() => onChuyenTrang('playlist')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 transition-colors text-left cursor-pointer"
                    >
                      <ListMusic className="w-4 h-4 text-sky-400" />
                      <span>Danh sách phát của tôi</span>
                    </button>

                    <button
                      onClick={() => onChuyenTrang('lich_su')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 transition-colors text-left cursor-pointer"
                    >
                      <History className="w-4 h-4 text-amber-600" />
                      <span>Lịch sử nghe nhạc</span>
                    </button>

                    <button
                      onClick={() => onChuyenTrang('bai_hat_cua_toi')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 transition-colors text-left cursor-pointer"
                    >
                      <Music2 className="w-4 h-4 text-purple-600" />
                      <span>Bài hát tôi đã đăng tải</span>
                    </button>
                  </div>

                  <div className="border-t border-zinc-200 pt-1 mt-1">
                    <button
                      onClick={handleDangXuat}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50/30 transition-colors text-left cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= ĐỐI TƯỢNG 3: QUẢN TRỊ VIÊN ================= */}
        {isQuanTriVien && (
          <div className="flex items-center gap-3">
            {/* Nút Thêm Bài Hát Trực Tiếp (Admin duyệt ngay) */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold px-3.5 py-2 rounded-full transition-all shadow-md shadow-rose-200/50 cursor-pointer active:scale-95"
              title="Thêm bài hát trực tiếp - Được duyệt và phát hành ngay"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thêm Bài Mới (Duyệt Ngay)</span>
            </button>

            {/* Nút Bảng Quản Trị */}
            <button
              onClick={() => onChuyenTrang('quan_tri')}
              className={`relative flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full border transition-all cursor-pointer ${
                trangHienTai.startsWith('quan_tri')
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-200/50'
                  : 'bg-rose-50/40 text-rose-700 border-rose-800 hover:border-rose-600 hover:bg-rose-100/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-rose-700" />
              <span>Bảng Quản Trị</span>
              {soBaiChoDuyet > 0 && (
                <span className="flex items-center justify-center bg-white text-rose-600 text-[10px] font-black h-4.5 min-w-4.5 px-1.5 rounded-full animate-bounce shadow">
                  {soBaiChoDuyet}
                </span>
              )}
            </button>

            {/* Menu Quản Trị Viên */}
            <div className="relative">
              <button
                onClick={() => setHienMenuUser(!hienMenuUser)}
                className="flex items-center gap-2 bg-zinc-50 hover:bg-zinc-100 border border-rose-500/50 rounded-full p-1 pr-3 transition-all cursor-pointer"
              >
                <img
                  src={nguoiDung?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={nguoiDung?.ho_ten}
                  className="w-7 h-7 rounded-full object-cover border border-rose-500/60"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-zinc-900 leading-tight max-w-[120px] truncate">
                    {nguoiDung?.ho_ten}
                  </p>
                  <span className="text-[10px] font-bold leading-none text-rose-600 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 inline" /> Admin
                  </span>
                </div>
              </button>

              {hienMenuUser && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-zinc-50 border border-rose-200/60 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setHienMenuUser(false)}
                >
                  <div className="px-4 py-2 border-b border-zinc-200 bg-rose-50/20">
                    <p className="text-sm font-black text-rose-800 truncate">{nguoiDung?.ho_ten}</p>
                    <p className="text-xs text-zinc-600 truncate">@{nguoiDung?.username}</p>
                    <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-800 border border-rose-500/40">
                      🛡️ Quản Trị Viên Hệ Thống
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => onChuyenTrang('quan_tri')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-800 hover:bg-rose-50/50 transition-colors text-left cursor-pointer font-semibold"
                    >
                      <ShieldCheck className="w-4 h-4 text-rose-600" />
                      <span>Trung Tâm Quản Trị Hệ Thống</span>
                    </button>

                    <button
                      onClick={() => onChuyenTrang('quan_tri_duyet')}
                      className="w-full flex items-center justify-between px-4 py-2 text-xs text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Upload className="w-4 h-4 text-amber-600" />
                        <span>Phê Duyệt Bài Hát</span>
                      </div>
                      {soBaiChoDuyet > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                          {soBaiChoDuyet}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => onChuyenTrang('ho_so')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 transition-colors text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Đổi Mật Khẩu & Thông Tin</span>
                    </button>
                  </div>

                  <div className="border-t border-zinc-200 pt-1 mt-1">
                    <button
                      onClick={handleDangXuat}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50/30 transition-colors text-left cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất Quản Trị Viên</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
