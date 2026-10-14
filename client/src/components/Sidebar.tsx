/**
 * @file Sidebar.tsx
 * @description Thanh Menu Dọc Bên Trái Ứng Dụng
 * Cung cấp điều hướng trực quan cho cả 3 đối tượng người dùng
 */

import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Home,
  Compass,
  Layers,
  Mic2,
  Disc,
  Heart,
  ListMusic,
  History,
  UploadCloud,
  ShieldAlert,
  BarChart3,
  CheckCircle2,
  Music,
  Users
} from 'lucide-react';

interface SidebarProps {
  trangHienTai: string;
  onChuyenTrang: (trang: string) => void;
  onOpenUpload: () => void;
  onOpenAuth: (mode?: 'dang_nhap' | 'dang_ky' | 'dang_nhap_admin') => void;
  soBaiChoDuyet?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  trangHienTai,
  onChuyenTrang,
  onOpenUpload,
  onOpenAuth,
  soBaiChoDuyet = 0
}) => {
  const { isKhach, isNguoiDung, isQuanTriVien, nguoiDung } = useAuth();

  const menuKhamPha = [
    { id: 'trang_chu', ten: 'Trang Chủ', icon: Home },
    { id: 'kham_pha', ten: 'Khám Phá & Lọc', icon: Compass },
    { id: 'the_loai', ten: 'Thể Loại Nhạc', icon: Layers },
    { id: 'nghe_si', ten: 'Nghệ Sĩ / Ca Sĩ', icon: Mic2 },
    { id: 'album', ten: 'Album Nổi Bật', icon: Disc },
  ];

  const menuCaNhan = [
    { id: 'yeu_thich', ten: 'Bài Hát Yêu Thích', icon: Heart },
    { id: 'playlist', ten: 'Playlist Của Tôi', icon: ListMusic },
    { id: 'lich_su', ten: 'Lịch Sử Nghe', icon: History },
    { id: 'bai_hat_cua_toi', ten: 'Bài Tôi Đã Đăng', icon: UploadCloud },
  ];

  const menuQuanTri = [
    { id: 'quan_tri_thong_ke', ten: 'Thống Kê Hệ Thống', icon: BarChart3 },
    { id: 'quan_tri_duyet', ten: 'Phê Duyệt Bài Hát', icon: CheckCircle2, badge: soBaiChoDuyet },
    { id: 'quan_tri_bai_hat', ten: 'Quản Lý Bài Hát', icon: Music },
    { id: 'quan_tri_nghe_si', ten: 'Quản Lý Nghệ Sĩ', icon: Mic2 },
    { id: 'quan_tri_album', ten: 'Quản Lý Album', icon: Disc },
    { id: 'quan_tri_the_loai', ten: 'Quản Lý Thể Loại', icon: Layers },
    { id: 'quan_tri_nguoi_dung', ten: 'Quản Lý Người Dùng', icon: Users },
  ];

  return (
    <aside className={`w-64 flex flex-col h-dvh shrink-0 select-none border-r ${
      isQuanTriVien 
        ? 'bg-white border-rose-200/60' 
        : 'bg-white border-zinc-200/80'
    }`}>
      {/* Logo SoundWave với hiệu ứng sóng âm thanh đồng bộ màu giao diện */}
      <div 
        onClick={() => onChuyenTrang(isQuanTriVien ? 'quan_tri' : 'trang_chu')}
        className="px-6 py-5 flex items-center gap-3 cursor-pointer group border-b border-zinc-200/50"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform ${
          isQuanTriVien 
            ? 'bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 shadow-rose-200/60' 
            : 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 shadow-emerald-200/60'
        }`}>
          <div className="flex items-end gap-0.5 h-5">
            <span className="w-1 bg-white rounded-full h-3 animate-pulse"></span>
            <span className="w-1 bg-white rounded-full h-5 animate-pulse delay-75"></span>
            <span className="w-1 bg-white rounded-full h-2 animate-pulse delay-150"></span>
            <span className="w-1 bg-white rounded-full h-4 animate-pulse"></span>
          </div>
        </div>
        <div>
          <span className="text-lg font-black tracking-tight text-zinc-900 flex items-center gap-0.5">
            Sound<span className={isQuanTriVien ? 'text-rose-400' : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent'}>Wave</span>
          </span>
          <span className="text-[10px] text-zinc-600 block tracking-wider uppercase font-medium">
            {isQuanTriVien ? '🛡️ Quản Trị Hệ Thống' : isNguoiDung ? '🌟 Thành Viên SoundWave' : 'Âm Nhạc Cho Mọi Nhà'}
          </span>
        </div>
      </div>

      {/* Danh Sách Mục Điều Hướng Cuộn Dọc */}
      <div className="flex-1 overflow-y-auto px-3 pt-4 pb-28 space-y-6 scrollbar-thin scrollbar-thumb-zinc-300">

        {/* ================= GIAO DIỆN QUẢN TRỊ VIÊN: MENU QUẢN TRỊ TRÊN CÙNG ================= */}
        {isQuanTriVien && (
          <div>
            <div className="px-3 flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-rose-600 tracking-wider uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Quản Trị Hệ Thống
              </p>
              <span className="text-[9px] font-bold bg-rose-500/20 text-rose-700 px-1.5 py-0.5 rounded border border-rose-500/30">
                Admin Portal
              </span>
            </div>
            <div className="space-y-1">
              {menuQuanTri.map((item) => {
                const Icon = item.icon;
                const isActive = trangHienTai === item.id || (trangHienTai === 'quan_tri' && item.id === 'quan_tri_thong_ke');
                return (
                  <button
                    key={item.id}
                    onClick={() => onChuyenTrang(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-200/40'
                        : 'text-zinc-600 hover:text-rose-800 hover:bg-rose-50/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-rose-400/80'}`} />
                      <span>{item.ten}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white text-rose-600' : 'bg-rose-500 text-white animate-bounce'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= KHÁM PHÁ (DÀNH CHO TẤT CẢ, HOẶC CHẾ ĐỘ NGHE CỦA ADMIN) ================= */}
        <div>
          <p className="px-3 text-[11px] font-bold text-zinc-600 tracking-wider uppercase mb-2">
            {isQuanTriVien ? 'Giao Diện Người Nghe' : 'Khám Phá'}
          </p>
          <div className="space-y-1">
            {menuKhamPha.map((item) => {
              const Icon = item.icon;
              const isActive = trangHienTai === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onChuyenTrang(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? isQuanTriVien 
                        ? 'bg-rose-500/15 text-rose-600 font-semibold' 
                        : 'bg-emerald-500/15 text-emerald-600 font-semibold shadow-inner'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? (isQuanTriVien ? 'text-rose-600' : 'text-emerald-600') : 'text-zinc-600'}`} />
                  <span>{item.ten}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= THƯ VIỆN CÁ NHÂN (CHỈ HIỂN THỊ ĐẦY ĐỦ CHO NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP) ================= */}
        {isNguoiDung && (
          <div>
            <div className="px-3 flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-zinc-600 tracking-wider uppercase">
                Thư Viện Của Bạn
              </p>
            </div>
            <div className="space-y-1">
              {menuCaNhan.map((item) => {
                const Icon = item.icon;
                const isActive = trangHienTai === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onChuyenTrang(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-600 font-semibold shadow-inner'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-zinc-600'}`} />
                      <span>{item.ten}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= GIAO DIỆN KHÁCH: THƯ VIỆN CÁ NHÂN BỊ KHÓA & BẢO VỆ ================= */}
        {isKhach && (
          <div>
            <div className="px-3 flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase">
                Thư Viện Cá Nhân
              </p>
              <span className="text-[10px] text-amber-600/90 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                Cần đăng nhập
              </span>
            </div>
            <div className="space-y-1">
              {menuCaNhan.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onOpenAuth('dang_nhap')}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50/40 transition-colors cursor-pointer group"
                    title="Vui lòng đăng nhập để sử dụng tính năng này"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
                      <span>{item.ten}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 group-hover:text-amber-600">🔒</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ================= HỘP THÔNG TIN CUỐI SIDEBAR CHO TỪNG ĐỐI TƯỢNG ================= */}
      <div className="p-3 border-t border-zinc-200/80">
        {isKhach && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-50 to-white border border-zinc-200/80">
            <p className="text-xs font-bold text-zinc-800 mb-1 flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
              Khách Vãng Lai
            </p>
            <p className="text-[11px] text-zinc-600 mb-3 leading-relaxed">
              Đăng nhập tài khoản để lưu bài hát yêu thích, tạo playlist và đăng tải nhạc.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenAuth('dang_nhap')}
                className="py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center shadow-sm"
              >
                Đăng Nhập
              </button>
              <button
                onClick={() => onOpenAuth('dang_ky')}
                className="py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
              >
                Đăng Ký
              </button>
            </div>
          </div>
        )}

        {isNguoiDung && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50/40 via-zinc-50 to-white border border-emerald-200/40">
            <p className="text-xs font-bold text-emerald-700 mb-1 flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
              Đăng Tải Nhạc (.mp3)
            </p>
            <p className="text-[11px] text-zinc-600 mb-2 leading-relaxed">
              Tải lên bài hát yêu thích của bạn. Bài hát sẽ ở trạng thái chờ Quản trị viên duyệt.
            </p>
            <button
              onClick={onOpenUpload}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Tải Lên Bài Hát Mới
            </button>
          </div>
        )}

        {isQuanTriVien && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-50/40 via-zinc-50 to-white border border-rose-200/40">
            <p className="text-xs font-bold text-rose-700 mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Quản Trị Viên Hệ Thống
            </p>
            <p className="text-[11px] text-zinc-600 mb-2 leading-relaxed">
              Toàn quyền quản lý âm nhạc, phê duyệt và người dùng.
            </p>
            <button
              onClick={() => onChuyenTrang('quan_tri')}
              className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Mở Bảng Quản Trị
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
