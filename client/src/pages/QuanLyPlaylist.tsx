/**
 * @file QuanLyPlaylist.tsx
 * @description Trang Tạo & Quản Lý Danh Sách Phát (Playlist)
 * Phục vụ người dùng: Tạo playlist, xóa playlist, xem bài hát bên trong, xóa bài hát khỏi playlist
 */

import React, { useState, useEffect } from 'react';
import { Playlist, BaiHat } from '../types/index.ts';
import { PlaylistAPI } from '../services/api.ts';
import { useAudioPlayer } from '../context/AudioPlayerContext.tsx';
import {
  ListMusic,
  Plus,
  Play,
  Trash2,
  Music2,
  ArrowLeft,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface QuanLyPlaylistProps {
  onOpenSongDetail: (id: string) => void;
}

export const QuanLyPlaylist: React.FC<QuanLyPlaylistProps> = ({ onOpenSongDetail }) => {
  const { phatBaiHat } = useAudioPlayer();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistHienTai, setPlaylistHienTai] = useState<Playlist | null>(null);
  const [baiHatTrongPlaylist, setBaiHatTrongPlaylist] = useState<BaiHat[]>([]);
  const [dangTai, setDangTai] = useState(false);

  // Form tạo mới
  const [hienFormTao, setHienFormTao] = useState(false);
  const [playlistSua, setPlaylistSua] = useState<Playlist | null>(null);
  const [tenPlaylist, setTenPlaylist] = useState('');
  const [moTa, setMoTa] = useState('');
  const [thongBao, setThongBao] = useState('');
  const [thongBaoLoi, setThongBaoLoi] = useState('');
  const [playlistXoa, setPlaylistXoa] = useState<Playlist | null>(null);
  const [baiHatXoaId, setBaiHatXoaId] = useState<string | null>(null);
  const [dangXoa, setDangXoa] = useState(false);

  const taiDanhSach = async () => {
    try {
      const data = await PlaylistAPI.layCuaToi();
      setPlaylists(data);
    } catch (err: any) {
      console.error(err);
      setThongBaoLoi(err.message || 'Lỗi tải danh sách playlist');
    }
  };

  useEffect(() => {
    taiDanhSach();
    const refresh = () => { void taiDanhSach(); };
    window.addEventListener('soundwave:data-changed', refresh);
    return () => window.removeEventListener('soundwave:data-changed', refresh);
  }, []);

  const handleXemChiTiet = async (pl: Playlist) => {
    setPlaylistHienTai(pl);
    setDangTai(true);
    try {
      const res = await PlaylistAPI.layChiTiet(pl._id);
      setPlaylistHienTai(res.playlist);
      setBaiHatTrongPlaylist(res.bai_hat);
    } catch (err: any) {
      console.error(err);
      setThongBaoLoi(err.message || 'Lỗi tải chi tiết playlist');
    } finally {
      setDangTai(false);
    }
  };

  const handleTaoMoi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenPlaylist.trim()) return;

    try {
      if (playlistSua) {
        const updated = await PlaylistAPI.capNhat(playlistSua._id, { ten_playlist: tenPlaylist, mo_ta: moTa });
        if (playlistHienTai?._id === updated._id) setPlaylistHienTai(updated);
      } else {
        await PlaylistAPI.taoMoi({ ten_playlist: tenPlaylist, mo_ta: moTa });
      }
      setTenPlaylist('');
      setMoTa('');
      setHienFormTao(false);
      setThongBao(playlistSua ? 'Đã cập nhật playlist!' : 'Đã tạo danh sách phát mới thành công!');
      setPlaylistSua(null);
      taiDanhSach();
      setTimeout(() => setThongBao(''), 2500);
    } catch (err: any) {
      setThongBaoLoi(err.message || 'Lỗi tạo playlist');
      setTimeout(() => setThongBaoLoi(''), 4000);
    }
  };

  const handleXacNhanXoaPlaylist = async () => {
    if (!playlistXoa) return;
    setDangXoa(true);
    try {
      await PlaylistAPI.xoaPlaylist(playlistXoa._id);
      if (playlistHienTai?._id === playlistXoa._id) {
        setPlaylistHienTai(null);
      }
      setThongBao(`Đã xóa playlist "${playlistXoa.ten_playlist}" thành công!`);
      setPlaylistXoa(null);
      taiDanhSach();
      setTimeout(() => setThongBao(''), 3000);
    } catch (err: any) {
      setThongBaoLoi(err.message || 'Lỗi xóa playlist');
      setTimeout(() => setThongBaoLoi(''), 4000);
    } finally {
      setDangXoa(false);
    }
  };

  const handleXoaBaiHat = async (baiHatId: string) => {
    if (!playlistHienTai) return;
    try {
      await PlaylistAPI.xoaBaiHat(playlistHienTai._id, baiHatId);
      setThongBao('Đã xóa bài hát khỏi playlist!');
      handleXemChiTiet(playlistHienTai);
      taiDanhSach();
      setTimeout(() => setThongBao(''), 2500);
    } catch (err: any) {
      setThongBaoLoi(err.message || 'Lỗi xóa bài hát khỏi playlist');
      setTimeout(() => setThongBaoLoi(''), 4000);
    }
  };

  const handlePhatToanBo = () => {
    if (baiHatTrongPlaylist.length > 0) {
      phatBaiHat(baiHatTrongPlaylist[0], baiHatTrongPlaylist);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Trang Playlist */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50 border border-zinc-200 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-950/50">
            <ListMusic className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Playlist Của Tôi</h1>
            <p className="text-xs text-zinc-600 mt-0.5">
              Tạo và quản lý các danh sách bài hát theo sở thích của riêng bạn
            </p>
          </div>
        </div>

        <button
          onClick={() => { setPlaylistSua(null); setTenPlaylist(''); setMoTa(''); setHienFormTao(!hienFormTao); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-200/50 transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Playlist Mới</span>
        </button>
      </div>

      {thongBao && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{thongBao}</span>
          </div>
          <button onClick={() => setThongBao('')} className="text-emerald-600 hover:text-zinc-900 text-xs cursor-pointer">×</button>
        </div>
      )}

      {thongBaoLoi && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <span>{thongBaoLoi}</span>
          <button onClick={() => setThongBaoLoi('')} className="text-rose-600 hover:text-zinc-900 text-xs cursor-pointer">×</button>
        </div>
      )}

      {/* Form Tạo Playlist Mới */}
      {hienFormTao && (
        <form onSubmit={handleTaoMoi} className="bg-zinc-50/90 border border-zinc-200 p-5 rounded-2xl space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-zinc-900">{playlistSua ? 'Sửa thông tin playlist:' : 'Nhập thông tin Playlist mới:'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={tenPlaylist}
              onChange={(e) => setTenPlaylist(e.target.value)}
              placeholder="Tên danh sách phát (VD: Nhạc làm việc, Chill đêm...)"
              className="bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Mô tả ngắn gọn (Tùy chọn)..."
              className="bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setHienFormTao(false)}
              className="px-4 py-1.5 rounded-xl text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer shadow"
            >
              {playlistSua ? 'Lưu Thay Đổi' : 'Xác Nhận Tạo'}
            </button>
          </div>
        </form>
      )}

      {playlistHienTai ? (
        /* Xem Chi Tiết Playlist */
        <div className="space-y-6">
          <button
            onClick={() => setPlaylistHienTai(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại tất cả playlist</span>
          </button>

          <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-6">
            <img
              src={playlistHienTai.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
              alt={playlistHienTai.ten_playlist}
              className="w-36 h-36 rounded-2xl object-cover shadow-2xl shrink-0 border border-zinc-300"
            />
            <div className="text-center sm:text-left flex-1 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
                Danh Sách Phát
              </span>
              <h2 className="text-2xl font-black text-zinc-900 mt-2 truncate">{playlistHienTai.ten_playlist}</h2>
              <p className="text-xs text-zinc-600 mt-1">{playlistHienTai.mo_ta || 'Không có mô tả'}</p>
              <p className="text-xs text-zinc-500 mt-2">{baiHatTrongPlaylist.length} bài hát trong danh sách</p>

              <button onClick={() => {
                setPlaylistSua(playlistHienTai); setTenPlaylist(playlistHienTai.ten_playlist);
                setMoTa(playlistHienTai.mo_ta || ''); setHienFormTao(true);
              }} className="mt-3 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold cursor-pointer">
                Sửa Playlist
              </button>
              {baiHatTrongPlaylist.length > 0 && (
                <button
                  onClick={handlePhatToanBo}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Phát Ngay Toàn Bộ Playlist</span>
                </button>
              )}
            </div>
          </div>

          {/* Danh Sách Bài Hát Trong Playlist */}
          <div className="space-y-2">
            {baiHatTrongPlaylist.length > 0 ? (
              baiHatTrongPlaylist.map((bai, index) => (
                <div
                  key={bai._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50/60 hover:bg-zinc-100/80 border border-zinc-200/60 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-mono text-zinc-500 w-5 text-center">{index + 1}</span>
                    <img
                      src={bai.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                      alt={bai.tieu_de}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h4
                        onClick={() => onOpenSongDetail(bai._id)}
                        className="text-xs sm:text-sm font-bold text-zinc-900 hover:text-emerald-600 truncate cursor-pointer transition-colors"
                      >
                        {bai.tieu_de}
                      </h4>
                      <p className="text-[11px] text-zinc-600 truncate">{bai.nghe_si}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => phatBaiHat(bai, baiHatTrongPlaylist)}
                      className="p-2 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors cursor-pointer"
                      title="Phát bài này"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                    <button
                      onClick={() => handleXoaBaiHat(bai._id)}
                      className="p-2 rounded-full text-zinc-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Xóa khỏi playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500 italic bg-zinc-50/40 rounded-2xl border border-zinc-200">
                Playlist này hiện chưa có bài hát nào. Bạn có thể duyệt bài hát và nhấn nút '+' để thêm vào đây!
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Danh Sách Toàn Bộ Playlist */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl._id}
              onClick={() => handleXemChiTiet(pl)}
              className="group bg-zinc-50/60 hover:bg-zinc-100/80 p-3.5 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 relative"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-white shadow-inner">
                <img
                  src={pl.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
                  alt={pl.ten_playlist}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors truncate">
                    {pl.ten_playlist}
                  </h3>
                  <span className="text-[11px] text-zinc-600 block mt-0.5">
                    {pl.danh_sach_bai_hat?.length || 0} bài hát
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlaylistXoa(pl);
                  }}
                  className="p-1.5 text-zinc-500 hover:text-rose-600 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                  title="Xóa playlist này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Xác Nhận Xóa Playlist */}
      {playlistXoa && (
        <div className="fixed inset-0 z-50 bg-zinc-900/35 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-50 border border-rose-500/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl shadow-rose-200/40">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">Xóa danh sách phát?</h3>
            <p className="text-xs text-zinc-600 mb-2">Bạn có chắc chắn muốn xóa playlist:</p>
            <p className="text-sm font-semibold text-rose-700 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 mb-4">
              {playlistXoa.ten_playlist}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                disabled={dangXoa}
                onClick={() => setPlaylistXoa(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                disabled={dangXoa}
                onClick={handleXacNhanXoaPlaylist}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer disabled:opacity-50"
              >
                {dangXoa ? 'Đang xóa...' : 'Xác Nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
