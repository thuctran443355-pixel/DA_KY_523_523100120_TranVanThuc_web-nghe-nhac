/**
 * @file TrangQuanTri.tsx
 * @description Trung Tâm Quản Trị Hệ Thống (Dành Riêng Cho Quản Trị Viên)
 * 7 Chức Năng Cốt Lõi:
 * 1. Xem Thống Kê Hệ Thống (Lượt nghe, người dùng, bài hát, thể loại)
 * 2. Phê Duyệt Bài Hát do người dùng tải lên (Duyệt / Từ chối kèm lý do)
 * 3. Quản Lý Bài Hát (Thêm trực tiếp duyệt ngay, sửa, xóa)
 * 4. Quản Lý Nghệ Sĩ (Thêm, sửa, xóa)
 * 5. Quản Lý Album (Thêm, sửa, xóa)
 * 6. Quản Lý Thể Loại (Thêm, đổi màu sắc, sửa, xóa)
 * 7. Quản Lý Người Dùng (Khóa/Mở khóa tài khoản, Phân quyền Admin/User, Xóa)
 */

import React, { useState, useEffect } from 'react';
import {
  ThongKeHeThong,
  BaiHat,
  NguoiDung,
  NgheSi,
  Album,
  TheLoai
} from '../types/index.ts';
import {
  QuanTriAPI,
  BaiHatAPI,
  NgheSiAPI,
  AlbumAPI,
  TheLoaiAPI
} from '../services/api.ts';
import { useAudioPlayer } from '../context/AudioPlayerContext.tsx';
import {
  ShieldAlert,
  BarChart3,
  CheckCircle2,
  XCircle,
  Music,
  Mic2,
  Disc,
  Layers,
  Users,
  Play,
  Trash2,
  Edit2,
  Plus,
  Clock,
  Headphones,
  Check,
  Ban,
  UserCheck,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface TrangQuanTriProps {
  tabKhoiTao?: string;
  onOpenUpload: () => void;
  onCapNhatSoLuongChoDuyet?: (count: number) => void;
  onChuyenTab?: (tab: string) => void;
}

export const TrangQuanTri: React.FC<TrangQuanTriProps> = ({
  tabKhoiTao = 'thong_ke',
  onOpenUpload,
  onCapNhatSoLuongChoDuyet,
  onChuyenTab
}) => {
  const { phatBaiHat } = useAudioPlayer();
  const [tabHienTai, setTabHienTai] = useState(tabKhoiTao);

  // Đồng bộ tab khi người dùng bấm các mục menu ở Sidebar bên trái
  useEffect(() => {
    if (tabKhoiTao) {
      setTabHienTai(tabKhoiTao);
    }
  }, [tabKhoiTao]);

  const handleChonTab = (tabId: string) => {
    setTabHienTai(tabId);
    if (onChuyenTab) onChuyenTab(tabId);
  };

  // Dữ liệu quản trị
  const [thongKe, setThongKe] = useState<ThongKeHeThong | null>(null);
  const [tatCaBaiHat, setTatCaBaiHat] = useState<BaiHat[]>([]);
  const [nguoiDungList, setNguoiDungList] = useState<NguoiDung[]>([]);
  const [ngheSiList, setNgheSiList] = useState<NgheSi[]>([]);
  const [albumList, setAlbumList] = useState<Album[]>([]);
  const [theLoaiList, setTheLoaiList] = useState<TheLoai[]>([]);
  const [dangTai, setDangTai] = useState(false);
  const [thongBao, setThongBao] = useState('');
  const [thongBaoLoi, setThongBaoLoi] = useState('');
  const [dangXoa, setDangXoa] = useState(false);
  const [modalXoa, setModalXoa] = useState<{
    loai: 'bai_hat' | 'nghe_si' | 'album' | 'the_loai' | 'nguoi_dung';
    id: string;
    ten: string;
  } | null>(null);

  type EditKind = 'bai_hat' | 'nghe_si' | 'album' | 'the_loai';
  const [editing, setEditing] = useState<{ kind: EditKind; id: string; values: Record<string, string> } | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editAudio, setEditAudio] = useState<File | null>(null);
  const [editImage, setEditImage] = useState<File | null>(null);
  const editFields: Record<EditKind, [string, string][]> = {
    bai_hat: [['tieu_de', 'Tên bài hát'], ['nghe_si', 'Nghệ sĩ'], ['album', 'Album'], ['the_loai', 'Thể loại'], ['thoi_luong', 'Thời lượng (giây)'], ['file_url', 'URL âm thanh'], ['anh_bia', 'URL ảnh bìa'], ['loi_bai_hat', 'Lời bài hát']],
    nghe_si: [['ten', 'Tên nghệ sĩ'], ['the_loai_chinh', 'Thể loại chính'], ['tieu_su', 'Tiểu sử'], ['anh_dai_dien', 'URL ảnh']],
    album: [['ten_album', 'Tên album'], ['nghe_si', 'Nghệ sĩ'], ['nam_phat_hanh', 'Năm phát hành'], ['mo_ta', 'Mô tả'], ['anh_bia', 'URL ảnh bìa']],
    the_loai: [['ten_the_loai', 'Tên thể loại'], ['mo_ta', 'Mô tả'], ['mau_sac', 'Màu sắc'], ['anh_the_loai', 'URL ảnh']]
  };
  const openEdit = (kind: EditKind, item: any) => {
    const values = Object.fromEntries(editFields[kind].map(([key]) => [key, String(item[key] ?? '')]));
    setEditAudio(null); setEditImage(null); setEditing({ kind, id: item._id, values });
  };
  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setSavingEdit(true); setThongBaoLoi('');
    try {
      const data = new FormData();
      for (const [key, value] of Object.entries(editing.values)) {
        if ((key === 'thoi_luong' || key === 'nam_phat_hanh') && !value) continue;
        data.append(key, value);
      }
      if (editAudio) data.append('file_nhac', editAudio);
      if (editImage) data.append(editing.kind === 'nghe_si' ? 'anh_dai_dien' : editing.kind === 'the_loai' ? 'anh_the_loai' : 'anh_bia', editImage);
      if (editing.kind === 'bai_hat') await BaiHatAPI.adminSua(editing.id, data);
      else if (editing.kind === 'nghe_si') await NgheSiAPI.adminCapNhat(editing.id, data);
      else if (editing.kind === 'album') await AlbumAPI.adminCapNhat(editing.id, data);
      else await TheLoaiAPI.adminCapNhat(editing.id, data);
      setEditing(null); setThongBao('Đã lưu thay đổi!');
      await taiToanBoDuLieu();
    } catch (error: any) { setThongBaoLoi(error.message || 'Không thể lưu thay đổi!'); }
    finally { setSavingEdit(false); }
  };

  // Form Thêm Nghệ Sĩ
  const [tenNgheSiMoi, setTenNgheSiMoi] = useState('');
  const [theLoaiNgheSiMoi, setTheLoaiNgheSiMoi] = useState('V-Pop');
  const [anhNgheSiMoi, setAnhNgheSiMoi] = useState('');
  const [tieuSuNgheSiMoi, setTieuSuNgheSiMoi] = useState('');

  // Form Thêm Album
  const [tenAlbumMoi, setTenAlbumMoi] = useState('');
  const [ngheSiAlbumMoi, setNgheSiAlbumMoi] = useState('');
  const [anhAlbumMoi, setAnhAlbumMoi] = useState('');
  const [namAlbumMoi, setNamAlbumMoi] = useState('2026');

  // Form Thêm Thể Loại
  const [tenTheLoaiMoi, setTenTheLoaiMoi] = useState('');
  const [moTaTheLoaiMoi, setMoTaTheLoaiMoi] = useState('');
  const [mauSacTheLoaiMoi, setMauSacTheLoaiMoi] = useState('#10b981');

  // Modal Từ chối bài hát
  const [baiHatTuChoiId, setBaiHatTuChoiId] = useState<string | null>(null);
  const [lyDoTuChoi, setLyDoTuChoi] = useState('Chất lượng âm thanh chưa đạt tiêu chuẩn');

  // Tải dữ liệu toàn diện
  const taiToanBoDuLieu = async () => {
    setDangTai(true);
    try {
      const [tk, songs, users, artists, albums, genres] = await Promise.all([
        QuanTriAPI.layThongKe(),
        BaiHatAPI.adminLayTatCa(),
        QuanTriAPI.layTatCaNguoiDung(),
        NgheSiAPI.layTatCa(),
        AlbumAPI.layTatCa(),
        TheLoaiAPI.layTatCa()
      ]);

      setThongKe(tk);
      setTatCaBaiHat(songs);
      setNguoiDungList(users);
      setNgheSiList(artists);
      setAlbumList(albums);
      setTheLoaiList(genres);

      const soBaiCho = songs.filter(b => b.trang_thai === 'cho_duyet').length;
      if (onCapNhatSoLuongChoDuyet) onCapNhatSoLuongChoDuyet(soBaiCho);
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu quản trị:', err);
      setThongBaoLoi(err.message || 'Lỗi tải dữ liệu quản trị');
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiToanBoDuLieu();
    const refresh = () => { void taiToanBoDuLieu(); };
    window.addEventListener('soundwave:data-changed', refresh);
    return () => window.removeEventListener('soundwave:data-changed', refresh);
  }, []);

  // Xử lý phê duyệt bài hát
  const handleDuyetBaiHat = async (id: string) => {
    try {
      await BaiHatAPI.adminPheDuyet(id, 'da_duyet');
      setThongBao('Đã phê duyệt và xuất bản bài hát thành công!');
      taiToanBoDuLieu();
      setTimeout(() => setThongBao(''), 3000);
    } catch (err: any) {
      setThongBaoLoi(err.message || 'Lỗi phê duyệt bài hát');
      setTimeout(() => setThongBaoLoi(''), 4000);
    }
  };

  // Xử lý từ chối bài hát
  const handleXacNhanTuChoi = async () => {
    if (!baiHatTuChoiId) return;
    try {
      await BaiHatAPI.adminPheDuyet(baiHatTuChoiId, 'tu_choi', lyDoTuChoi);
      setThongBao('Đã từ chối bài hát!');
      setBaiHatTuChoiId(null);
      taiToanBoDuLieu();
      setTimeout(() => setThongBao(''), 3000);
    } catch (err: any) {
      setThongBaoLoi(err.message || 'Lỗi từ chối bài hát');
      setTimeout(() => setThongBaoLoi(''), 4000);
    }
  };

  // Xử lý xác nhận xóa trung tâm (Bài hát, Nghệ sĩ, Album, Thể loại, Người dùng)
  const handleXacNhanXoa = async () => {
    if (!modalXoa) return;
    setDangXoa(true);
    setThongBaoLoi('');
    try {
      if (modalXoa.loai === 'bai_hat') {
        await BaiHatAPI.adminXoa(modalXoa.id);
        setThongBao(`Đã xóa vĩnh viễn bài hát "${modalXoa.ten}" thành công!`);
      } else if (modalXoa.loai === 'nghe_si') {
        await NgheSiAPI.adminXoa(modalXoa.id);
        setThongBao(`Đã xóa nghệ sĩ "${modalXoa.ten}" thành công!`);
      } else if (modalXoa.loai === 'album') {
        await AlbumAPI.adminXoa(modalXoa.id);
        setThongBao(`Đã xóa album "${modalXoa.ten}" thành công!`);
      } else if (modalXoa.loai === 'the_loai') {
        await TheLoaiAPI.adminXoa(modalXoa.id);
        setThongBao(`Đã xóa thể loại "${modalXoa.ten}" thành công!`);
      } else if (modalXoa.loai === 'nguoi_dung') {
        await QuanTriAPI.xoaNguoiDung(modalXoa.id);
        setThongBao(`Đã xóa tài khoản "${modalXoa.ten}" thành công!`);
      }
      setModalXoa(null);
      await taiToanBoDuLieu();
      setTimeout(() => setThongBao(''), 3000);
    } catch (err: any) {
      setThongBaoLoi(err.message || 'Lỗi khi xóa mục!');
      setTimeout(() => setThongBaoLoi(''), 4000);
    } finally {
      setDangXoa(false);
    }
  };

  // Xử lý khóa / mở khóa tài khoản
  const handleToggleKhoaUser = async (user: NguoiDung) => {
    const trangThaiMoi = user.trang_thai === 'hoat_dong' ? 'bi_khoa' : 'hoat_dong';
    try {
      await QuanTriAPI.khoaHoacMoKhoa(user._id, trangThaiMoi);
      setThongBao(trangThaiMoi === 'bi_khoa' ? 'Đã khóa tài khoản người dùng!' : 'Đã mở khóa tài khoản!');
      taiToanBoDuLieu();
      setTimeout(() => setThongBao(''), 2500);
    } catch (err: any) {
      setThongBaoLoi(err.message || 'Lỗi cập nhật trạng thái');
      setTimeout(() => setThongBaoLoi(''), 4000);
    }
  };

  // Xử lý phân quyền vai trò người dùng
  const handleToggleVaiTro = async (user: NguoiDung) => {
    const vaiTroMoi = user.vai_tro === 'quan_tri_vien' ? 'nguoi_dung' : 'quan_tri_vien';
    try {
      await QuanTriAPI.thayDoiVaiTro(user._id, vaiTroMoi);
      setThongBao(`Đã chuyển vai trò thành: ${vaiTroMoi === 'quan_tri_vien' ? 'Quản trị viên' : 'Người dùng'}!`);
      taiToanBoDuLieu();
      setTimeout(() => setThongBao(''), 2500);
    } catch (err: any) {
      setThongBaoLoi(err.message || 'Lỗi thay đổi vai trò');
      setTimeout(() => setThongBaoLoi(''), 4000);
    }
  };

  // Thêm nghệ sĩ mới
  const handleThemNgheSi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenNgheSiMoi.trim()) return;
    const formData = new FormData();
    formData.append('ten', tenNgheSiMoi.trim());
    formData.append('the_loai_chinh', theLoaiNgheSiMoi);
    formData.append('anh_dai_dien', anhNgheSiMoi || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300');
    formData.append('tieu_su', tieuSuNgheSiMoi);

    try {
      await NgheSiAPI.adminThem(formData);
      setTenNgheSiMoi('');
      setTieuSuNgheSiMoi('');
      setAnhNgheSiMoi('');
      setThongBao('Đã thêm nghệ sĩ mới thành công!');
      taiToanBoDuLieu();
      setTimeout(() => setThongBao(''), 2500);
    } catch (err: any) {
      setThongBaoLoi(err.message || 'Lỗi thêm nghệ sĩ');
      setTimeout(() => setThongBaoLoi(''), 4000);
    }
  };

  // Thêm album mới
  const handleThemAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenAlbumMoi.trim()) return;
    const formData = new FormData();
    formData.append('ten_album', tenAlbumMoi.trim());
    formData.append('nghe_si', ngheSiAlbumMoi || 'Nhiều nghệ sĩ');
    formData.append('nam_phat_hanh', namAlbumMoi);
    formData.append('anh_bia', anhAlbumMoi || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400');

    try {
      await AlbumAPI.adminThem(formData);
      setTenAlbumMoi('');
      setNgheSiAlbumMoi('');
      setAnhAlbumMoi('');
      setThongBao('Đã thêm album mới thành công!');
      taiToanBoDuLieu();
      setTimeout(() => setThongBao(''), 2500);
    } catch (err: any) {
      setThongBaoLoi(err.message || 'Lỗi thêm album');
      setTimeout(() => setThongBaoLoi(''), 4000);
    }
  };

  // Thêm thể loại mới
  const handleThemTheLoai = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenTheLoaiMoi.trim()) return;
    const formData = new FormData();
    formData.append('ten_the_loai', tenTheLoaiMoi.trim());
    formData.append('mo_ta', moTaTheLoaiMoi);
    formData.append('mau_sac', mauSacTheLoaiMoi);

    try {
      await TheLoaiAPI.adminThem(formData);
      setTenTheLoaiMoi('');
      setMoTaTheLoaiMoi('');
      setThongBao('Đã thêm thể loại mới thành công!');
      taiToanBoDuLieu();
      setTimeout(() => setThongBao(''), 2500);
    } catch (err: any) {
      setThongBaoLoi(err.message || 'Lỗi thêm thể loại');
      setTimeout(() => setThongBaoLoi(''), 4000);
    }
  };

  const danhSachChoDuyet = tatCaBaiHat.filter(b => b.trang_thai === 'cho_duyet');

  return (
    <div className="space-y-6 pb-20">
      {/* Banner Tiêu Đề Quản Trị Viên */}
      <div className="bg-gradient-to-r from-rose-50/80 via-zinc-50 to-white border border-rose-200/40 p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-600 shadow-lg shadow-rose-200/60">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Bảng Quản Trị Hệ Thống</h1>
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Admin
              </span>
            </div>
            <p className="text-xs text-zinc-600 mt-0.5">
              Toàn quyền quản lý bài hát, nghệ sĩ, album, thể loại, người dùng và xem thống kê
            </p>
          </div>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-200/60 transition-transform active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Bài Hát Mới (Duyệt Ngay)</span>
        </button>
      </div>

      {thongBao && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{thongBao}</span>
          </div>
          <button onClick={() => setThongBao('')} className="text-emerald-600 hover:text-zinc-900 text-xs cursor-pointer">×</button>
        </div>
      )}

      {thongBaoLoi && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{thongBaoLoi}</span>
          </div>
          <button onClick={() => setThongBaoLoi('')} className="text-rose-600 hover:text-zinc-900 text-xs cursor-pointer">×</button>
        </div>
      )}

      {/* Tabs Menu Quản Trị */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-200">
        {[
          { id: 'thong_ke', label: 'Thống Kê Hệ Thống', icon: BarChart3 },
          { id: 'duyet_bai', label: 'Duyệt Bài Hát', icon: CheckCircle2, badge: danhSachChoDuyet.length },
          { id: 'bai_hat', label: 'Quản Lý Bài Hát', icon: Music },
          { id: 'nghe_si', label: 'Quản Lý Nghệ Sĩ', icon: Mic2 },
          { id: 'album', label: 'Quản Lý Album', icon: Disc },
          { id: 'the_loai', label: 'Quản Lý Thể Loại', icon: Layers },
          { id: 'nguoi_dung', label: 'Quản Lý Người Dùng', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = tabHienTai === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleChonTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200/50'
                  : 'bg-zinc-50/60 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-white text-rose-600 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: THỐNG KÊ HỆ THỐNG ================= */}
      {tabHienTai === 'thong_ke' && thongKe && (
        <div className="space-y-6">
          {/* 6 Thẻ Số Liệu Quan Trọng */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
              <span className="text-[11px] font-semibold text-zinc-600 block mb-1">Tổng Bài Hát</span>
              <p className="text-2xl font-black text-zinc-900">{thongKe.tong_so_bai_hat}</p>
              <span className="text-[10px] text-emerald-600 font-medium mt-1 block">
                {thongKe.so_bai_da_duyet} bài đã duyệt
              </span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
              <span className="text-[11px] font-semibold text-amber-600 block mb-1">Chờ Phê Duyệt</span>
              <p className="text-2xl font-black text-amber-600">{thongKe.so_bai_cho_duyet}</p>
              <span className="text-[10px] text-zinc-500 font-medium mt-1 block">Yêu cầu xử lý</span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
              <span className="text-[11px] font-semibold text-zinc-600 block mb-1">Tổng Lượt Nghe</span>
              <p className="text-2xl font-black text-zinc-900">{thongKe.tong_luot_nghe.toLocaleString()}</p>
              <span className="text-[10px] text-zinc-500 font-medium mt-1 block">Toàn hệ thống</span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
              <span className="text-[11px] font-semibold text-zinc-600 block mb-1">Tổng Tài Khoản</span>
              <p className="text-2xl font-black text-zinc-900">{thongKe.tong_so_nguoi_dung}</p>
              <span className="text-[10px] text-zinc-500 font-medium mt-1 block">
                {thongKe.so_quan_tri_vien} Admin • {thongKe.so_nguoi_dung_thuong} User
              </span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
              <span className="text-[11px] font-semibold text-zinc-600 block mb-1">Nghệ Sĩ & Album</span>
              <p className="text-2xl font-black text-zinc-900">{thongKe.tong_so_nghe_si}</p>
              <span className="text-[10px] text-zinc-500 font-medium mt-1 block">
                {thongKe.tong_so_album} album phát hành
              </span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
              <span className="text-[11px] font-semibold text-zinc-600 block mb-1">Tổng Playlist</span>
              <p className="text-2xl font-black text-zinc-900">{thongKe.tong_so_playlist}</p>
              <span className="text-[10px] text-zinc-500 font-medium mt-1 block">Người dùng tạo</span>
            </div>
          </div>

          {/* Phân Tích Thể Loại & Top Bài Hát */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phân Bố Theo Thể Loại */}
            <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-3xl">
              <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Phân Bố Lượt Nghe Theo Thể Loại
              </h3>
              <div className="space-y-3">
                {thongKe.thong_ke_the_loai.map((tl) => {
                  const tyLe = thongKe.tong_luot_nghe > 0 
                    ? Math.round((tl.luot_nghe / thongKe.tong_luot_nghe) * 100) 
                    : 0;
                  return (
                    <div key={tl.ten_the_loai} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-800 font-semibold">{tl.ten_the_loai} ({tl.so_bai_hat} bài)</span>
                        <span className="text-zinc-600">{tl.luot_nghe.toLocaleString()} lượt ({tyLe}%)</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(tyLe, 5)}%`,
                            backgroundColor: tl.mau_sac || '#10b981'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top 5 Bài Hát Nghe Nhiều Nhất */}
            <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-3xl">
              <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Headphones className="w-4 h-4 text-emerald-600" />
                Top 5 Bản Nhạc Có Lượt Nghe Cao Nhất
              </h3>
              <div className="space-y-2.5">
                {thongKe.top_bai_hat.map((bai, idx) => (
                  <div
                    key={bai._id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 border border-zinc-200/80"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 text-center font-bold text-xs ${
                        idx === 0 ? 'text-amber-600' : idx === 1 ? 'text-zinc-700' : idx === 2 ? 'text-amber-600' : 'text-zinc-500'
                      }`}>
                        #{idx + 1}
                      </span>
                      <img
                        src={bai.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                        alt={bai.tieu_de}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate">{bai.tieu_de}</p>
                        <p className="text-[11px] text-zinc-600 truncate">{bai.nghe_si}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      {bai.luot_nghe?.toLocaleString()} lượt
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PHÊ DUYỆT BÀI HÁT ================= */}
      {tabHienTai === 'duyet_bai' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Danh Sách Bài Hát Chờ Phê Duyệt ({danhSachChoDuyet.length})
            </h2>
            <p className="text-xs text-zinc-600">
              Người dùng đăng tải nhạc phải chờ Quản trị viên duyệt trước khi phát hành
            </p>
          </div>

          {danhSachChoDuyet.length > 0 ? (
            <div className="space-y-3">
              {danhSachChoDuyet.map((bai) => (
                <div
                  key={bai._id}
                  className="p-4 rounded-2xl bg-zinc-50 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <img
                      src={bai.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                      alt={bai.tieu_de}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-zinc-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-900 truncate">{bai.tieu_de}</h4>
                        <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-700 px-2 py-0.5 rounded-full border border-amber-500/30">
                          Chờ duyệt
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 truncate mt-0.5">
                        {bai.nghe_si} • Thể loại: <strong className="text-zinc-700">{bai.the_loai}</strong>
                      </p>
                      {bai.loi_bai_hat && (
                        <p className="text-[11px] text-zinc-500 line-clamp-1 italic mt-1">
                          "{bai.loi_bai_hat}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Các nút xử lý kiểm duyệt */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => phatBaiHat(bai)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium cursor-pointer"
                      title="Nghe thử file âm thanh"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Nghe thử</span>
                    </button>

                    <button
                      onClick={() => handleDuyetBaiHat(bai._id)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-200/50 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Phê Duyệt Ngay</span>
                    </button>

                    <button
                      onClick={() => {
                        setBaiHatTuChoiId(bai._id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30 text-xs font-semibold cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Từ Chối</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-zinc-50/40 rounded-3xl border border-zinc-200 p-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-900">Không có bài hát nào chờ duyệt</h3>
              <p className="text-xs text-zinc-600 max-w-sm mx-auto mt-1">
                Tất cả bài hát do người dùng tải lên đều đã được xem xét và xử lý!
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: QUẢN LÝ BÀI HÁT ================= */}
      {tabHienTai === 'bai_hat' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900">Toàn Bộ Bài Hát Hệ Thống ({tatCaBaiHat.length})</h2>
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Bài Hát</span>
            </button>
          </div>

          <div className="space-y-2">
            {tatCaBaiHat.map((bai) => (
              <div
                key={bai._id}
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={bai.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                    alt={bai.tieu_de}
                    className="w-11 h-11 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">{bai.tieu_de}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        bai.trang_thai === 'da_duyet'
                          ? 'bg-emerald-500/20 text-emerald-700'
                          : bai.trang_thai === 'cho_duyet'
                          ? 'bg-amber-500/20 text-amber-700'
                          : 'bg-rose-500/20 text-rose-700'
                      }`}>
                        {bai.trang_thai === 'da_duyet' ? 'Đã duyệt' : bai.trang_thai === 'cho_duyet' ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 truncate">{bai.nghe_si} • {bai.the_loai}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-zinc-500 hidden sm:inline">
                    {bai.luot_nghe || 0} lượt nghe
                  </span>
                  <button
                    onClick={() => phatBaiHat(bai)}
                    className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 cursor-pointer"
                    title="Phát"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button onClick={() => openEdit('bai_hat', bai)} title="Sửa thông tin" className="p-2 rounded-xl text-zinc-600 hover:text-emerald-600 hover:bg-zinc-100 cursor-pointer">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setModalXoa({ loai: 'bai_hat', id: bai._id, ten: bai.tieu_de })}
                    className="p-2 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer transition-colors"
                    title="Xóa bài hát"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: QUẢN LÝ NGHỆ SĨ ================= */}
      {tabHienTai === 'nghe_si' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form thêm nghệ sĩ */}
          <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-3xl h-fit">
            <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              Thêm Nghệ Sĩ / Ca Sĩ Mới
            </h3>
            <form onSubmit={handleThemNgheSi} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Tên nghệ sĩ</label>
                <input
                  type="text"
                  required
                  value={tenNgheSiMoi}
                  onChange={(e) => setTenNgheSiMoi(e.target.value)}
                  placeholder="VD: Trịnh Thăng Bình..."
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Thể loại chính</label>
                <input
                  type="text"
                  value={theLoaiNgheSiMoi}
                  onChange={(e) => setTheLoaiNgheSiMoi(e.target.value)}
                  placeholder="V-Pop, Ballad..."
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Link ảnh đại diện</label>
                <input
                  type="text"
                  value={anhNgheSiMoi}
                  onChange={(e) => setAnhNgheSiMoi(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Tiểu sử tóm tắt</label>
                <textarea
                  rows={2}
                  value={tieuSuNgheSiMoi}
                  onChange={(e) => setTieuSuNgheSiMoi(e.target.value)}
                  placeholder="Giới thiệu ca sĩ..."
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Thêm Nghệ Sĩ
              </button>
            </form>
          </div>

          {/* Danh sách nghệ sĩ */}
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 mb-2">Danh Sách Nghệ Sĩ ({ngheSiList.length})</h3>
            {ngheSiList.map((ns) => (
              <div
                key={ns._id}
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={ns.anh_dai_dien || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                    alt={ns.ten}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">{ns.ten}</h4>
                    <p className="text-[11px] text-zinc-600">{ns.the_loai_chinh}</p>
                  </div>
                </div>

                <button onClick={() => openEdit('nghe_si', ns)} title="Sửa thông tin" className="p-2 rounded-xl text-zinc-600 hover:text-emerald-600 hover:bg-zinc-100 cursor-pointer">
                    <Edit2 className="w-4 h-4" />
                  </button>

                <button
                  onClick={() => setModalXoa({ loai: 'nghe_si', id: ns._id, ten: ns.ten })}
                  className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-colors"
                  title={`Xóa nghệ sĩ ${ns.ten}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: QUẢN LÝ ALBUM ================= */}
      {tabHienTai === 'album' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form thêm Album */}
          <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-3xl h-fit">
            <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              Thêm Album Mới
            </h3>
            <form onSubmit={handleThemAlbum} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Tên Album</label>
                <input
                  type="text"
                  required
                  value={tenAlbumMoi}
                  onChange={(e) => setTenAlbumMoi(e.target.value)}
                  placeholder="VD: Không Buồn Nữa..."
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nghệ sĩ phát hành</label>
                <input
                  type="text"
                  required
                  value={ngheSiAlbumMoi}
                  onChange={(e) => setNgheSiAlbumMoi(e.target.value)}
                  placeholder="Tên ca sĩ..."
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Năm phát hành</label>
                <input
                  type="number"
                  value={namAlbumMoi}
                  onChange={(e) => setNamAlbumMoi(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Link ảnh bìa Album</label>
                <input
                  type="text"
                  value={anhAlbumMoi}
                  onChange={(e) => setAnhAlbumMoi(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Thêm Album
              </button>
            </form>
          </div>

          {/* Danh sách album */}
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 mb-2">Danh Sách Album ({albumList.length})</h3>
            {albumList.map((ab) => (
              <div
                key={ab._id}
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={ab.anh_bia || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=100'}
                    alt={ab.ten_album}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">{ab.ten_album}</h4>
                    <p className="text-[11px] text-zinc-600">{ab.nghe_si} • Năm {ab.nam_phat_hanh}</p>
                  </div>
                </div>

                <button onClick={() => openEdit('album', ab)} title="Sửa thông tin" className="p-2 rounded-xl text-zinc-600 hover:text-emerald-600 hover:bg-zinc-100 cursor-pointer">
                    <Edit2 className="w-4 h-4" />
                  </button>

                <button
                  onClick={() => setModalXoa({ loai: 'album', id: ab._id, ten: ab.ten_album })}
                  className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-colors"
                  title={`Xóa album ${ab.ten_album}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: QUẢN LÝ THỂ LOẠI ================= */}
      {tabHienTai === 'the_loai' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form thêm thể loại */}
          <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-3xl h-fit">
            <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              Thêm Thể Loại Nhạc Mới
            </h3>
            <form onSubmit={handleThemTheLoai} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Tên thể loại</label>
                <input
                  type="text"
                  required
                  value={tenTheLoaiMoi}
                  onChange={(e) => setTenTheLoaiMoi(e.target.value)}
                  placeholder="VD: Rock, Indie, R&B..."
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Màu sắc chủ đạo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={mauSacTheLoaiMoi}
                    onChange={(e) => setMauSacTheLoaiMoi(e.target.value)}
                    className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-zinc-600">{mauSacTheLoaiMoi}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Mô tả tóm tắt</label>
                <textarea
                  rows={2}
                  value={moTaTheLoaiMoi}
                  onChange={(e) => setMoTaTheLoaiMoi(e.target.value)}
                  placeholder="Mô tả đặc trưng của thể loại..."
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Thêm Thể Loại
              </button>
            </form>
          </div>

          {/* Danh sách thể loại */}
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 mb-2">Danh Sách Thể Loại ({theLoaiList.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {theLoaiList.map((tl) => (
                <div
                  key={tl._id}
                  className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow"
                      style={{ backgroundColor: tl.mau_sac || '#6366f1' }}
                    >
                      #
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">{tl.ten_the_loai}</h4>
                      <p className="text-[10px] text-zinc-600 line-clamp-1">{tl.mo_ta}</p>
                    </div>
                  </div>

                  <button onClick={() => openEdit('the_loai', tl)} title="Sửa thông tin" className="p-2 rounded-xl text-zinc-600 hover:text-emerald-600 hover:bg-zinc-100 cursor-pointer">
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setModalXoa({ loai: 'the_loai', id: tl._id, ten: tl.ten_the_loai })}
                    className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-colors"
                    title={`Xóa thể loại ${tl.ten_the_loai}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 7: QUẢN LÝ NGƯỜI DÙNG ================= */}
      {tabHienTai === 'nguoi_dung' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900">Quản Lý Tài Khoản Thành Viên ({nguoiDungList.length})</h2>
            <p className="text-xs text-zinc-600">Khóa tài khoản vi phạm hoặc phân quyền Quản trị viên</p>
          </div>

          <div className="space-y-2.5">
            {nguoiDungList.map((u) => {
              const isAdmin = u.vai_tro === 'quan_tri_vien';
              const isLocked = u.trang_thai === 'bi_khoa';

              return (
                <div
                  key={u._id}
                  className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={u.ho_ten}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-300"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">{u.ho_ten}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          isAdmin ? 'bg-rose-500/20 text-rose-700' : 'bg-emerald-500/20 text-emerald-700'
                        }`}>
                          {isAdmin ? 'Quản Trị Viên' : 'Người Dùng'}
                        </span>
                        {isLocked && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-red-500/20 text-red-600">
                            Bị khóa
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 truncate mt-0.5">@{u.username} • {u.email}</p>
                    </div>
                  </div>

                  {/* Nút Thao Tác Quyền & Khóa */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleVaiTro(u)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold cursor-pointer"
                      title={isAdmin ? 'Hạ xuống Người dùng thường' : 'Nâng cấp lên Quản trị viên'}
                    >
                      {isAdmin ? 'Hạ quyền User' : 'Nâng quyền Admin'}
                    </button>

                    <button
                      onClick={() => handleToggleKhoaUser(u)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                        isLocked
                          ? 'bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30'
                      }`}
                    >
                      {isLocked ? 'Mở Khóa' : 'Khóa'}
                    </button>

                    <button
                      onClick={() => setModalXoa({ loai: 'nguoi_dung', id: u._id, ten: `${u.ho_ten} (@${u.username})` })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-600 border border-rose-500/30 text-xs font-semibold cursor-pointer transition-colors"
                      title="Xóa tài khoản người dùng này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Nhập Lý Do Từ Chối Bài Hát */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-zinc-900/35 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={saveEdit} className="bg-zinc-50 border border-zinc-200 rounded-3xl max-w-lg w-full p-6 space-y-3 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-zinc-900">Sửa Thông Tin</h3>
            {editFields[editing.kind].map(([key, label]) => (
              <label key={key} className="block text-xs text-zinc-700">
                {label}
                <input value={editing.values[key]} onChange={e => setEditing({ ...editing, values: { ...editing.values, [key]: e.target.value } })}
                  className="mt-1 w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900" />
              </label>
            ))}
            {editing.kind === 'bai_hat' && <label className="block text-xs text-zinc-700">Thay file âm thanh
              <input type="file" accept="audio/*" onChange={e => setEditAudio(e.target.files?.[0] || null)} className="block mt-1" />
            </label>}
            <label className="block text-xs text-zinc-700">Thay ảnh
              <input type="file" accept="image/*" onChange={e => setEditImage(e.target.files?.[0] || null)} className="block mt-1" />
            </label>
            {thongBaoLoi && <p className="text-xs text-rose-600">{thongBaoLoi}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" disabled={savingEdit} onClick={() => setEditing(null)} className="px-4 py-2 text-xs text-zinc-600 cursor-pointer">Hủy</button>
              <button disabled={savingEdit} className="px-4 py-2 bg-emerald-600 rounded-xl text-xs text-white cursor-pointer disabled:opacity-50">{savingEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}</button>
            </div>
          </form>
        </div>
      )}

      {baiHatTuChoiId && (
        <div className="fixed inset-0 z-50 bg-zinc-900/35 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-50 border border-zinc-200 rounded-3xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Lý Do Từ Chối Bài Hát
            </h3>
            <p className="text-xs text-zinc-600 mb-3">
              Lý do này sẽ được thông báo rõ ràng cho tác giả trong danh sách bài hát cá nhân:
            </p>
            <textarea
              rows={3}
              value={lyDoTuChoi}
              onChange={(e) => setLyDoTuChoi(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-rose-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setBaiHatTuChoiId(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleXacNhanTuChoi}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                Xác Nhận Từ Chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Hiện Đại (Không dùng window.confirm) */}
      {modalXoa && (
        <div className="fixed inset-0 z-50 bg-zinc-900/35 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-50 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-rose-200/50">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-600 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-zinc-900 mb-2">
              Xác Nhận Xóa {
                modalXoa.loai === 'bai_hat' ? 'Bài Hát' :
                modalXoa.loai === 'nghe_si' ? 'Nghệ Sĩ' :
                modalXoa.loai === 'album' ? 'Album' :
                modalXoa.loai === 'the_loai' ? 'Thể Loại' : 'Tài Khoản Người Dùng'
              }?
            </h3>

            <p className="text-xs text-zinc-600 leading-relaxed mb-2">
              Bạn có chắc chắn muốn xóa vĩnh viễn:
            </p>
            <div className="text-sm font-semibold text-rose-700 bg-rose-500/10 px-3.5 py-2.5 rounded-xl border border-rose-500/20 mb-3 break-all">
              {modalXoa.ten}
            </div>

            <p className="text-[11px] text-zinc-500 mb-6">
              {modalXoa.loai === 'nguoi_dung' 
                ? 'Lưu ý: Danh sách phát cá nhân, bài hát chưa duyệt và dữ liệu yêu thích của tài khoản này sẽ được dọn dẹp sạch sẽ.' 
                : modalXoa.loai === 'bai_hat'
                ? 'Lưu ý: Bài hát sẽ được xóa khỏi hệ thống và gỡ khỏi tất cả danh sách phát, album liên quan.'
                : 'Lưu ý: Thao tác này sẽ xóa mục khỏi hệ thống ngay lập tức.'}
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={dangXoa}
                onClick={() => setModalXoa(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={dangXoa}
                onClick={handleXacNhanXoa}
                className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-200/60 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {dangXoa ? (
                  <span>Đang xử lý...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Xác Nhận Xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
