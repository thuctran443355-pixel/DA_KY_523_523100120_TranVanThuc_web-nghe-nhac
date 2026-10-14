/**
 * @file DanhSachAlbum.tsx
 * @description Trang Danh Sách Album & Chi Tiết Album Phát Hành
 */

import React, { useState, useEffect } from 'react';
import { Album, BaiHat } from '../types/index.ts';
import { AlbumAPI } from '../services/api.ts';
import { SongCard } from '../components/SongCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Disc, ArrowLeft, Calendar, Music, Trash2 } from 'lucide-react';

interface DanhSachAlbumProps {
  albumDuocChon?: Album | null;
  onOpenAuth: () => void;
  onOpenAddToPlaylist: (id: string) => void;
  onOpenSongDetail: (id: string) => void;
}

export const DanhSachAlbum: React.FC<DanhSachAlbumProps> = ({
  albumDuocChon,
  onOpenAuth,
  onOpenAddToPlaylist,
  onOpenSongDetail
}) => {
  const { isQuanTriVien } = useAuth();
  const [danhSachAlbum, setDanhSachAlbum] = useState<Album[]>([]);
  const [albumHienTai, setAlbumHienTai] = useState<Album | null>(albumDuocChon || null);
  const [baiHatList, setBaiHatList] = useState<BaiHat[]>([]);
  const [dangTai, setDangTai] = useState(false);
  const [albumXoa, setAlbumXoa] = useState<Album | null>(null);
  const [dangXoa, setDangXoa] = useState(false);
  const [thongBao, setThongBao] = useState('');

  const taiDanhSach = async () => {
    try {
      const data = await AlbumAPI.layTatCa();
      setDanhSachAlbum(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    taiDanhSach();
  }, []);

  const handleXacNhanXoa = async () => {
    if (!albumXoa) return;
    setDangXoa(true);
    try {
      await AlbumAPI.adminXoa(albumXoa._id);
      if (albumHienTai?._id === albumXoa._id) {
        setAlbumHienTai(null);
      }
      setThongBao(`Đã xóa album "${albumXoa.ten_album}" thành công!`);
      setAlbumXoa(null);
      await taiDanhSach();
      setTimeout(() => setThongBao(''), 3000);
    } catch (err: any) {
      setThongBao(err.message || 'Lỗi khi xóa album');
      setTimeout(() => setThongBao(''), 4000);
    } finally {
      setDangXoa(false);
    }
  };

  useEffect(() => {
    setAlbumHienTai(albumDuocChon || null);
  }, [albumDuocChon]);

  useEffect(() => {
    if (albumHienTai) {
      setDangTai(true);
      AlbumAPI.layChiTiet(albumHienTai._id)
        .then(res => setBaiHatList(res.bai_hat))
        .catch(console.error)
        .finally(() => setDangTai(false));
    }
  }, [albumHienTai]);

  return (
    <div className="space-y-6 pb-16">
      {albumHienTai ? (
        <div className="space-y-6">
          <button
            onClick={() => setAlbumHienTai(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách album</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-6 bg-zinc-50/80 border border-zinc-200 p-6 rounded-3xl">
            <img
              src={albumHienTai.anh_bia || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400'}
              alt={albumHienTai.ten_album}
              className="w-40 h-40 rounded-2xl object-cover shadow-2xl shrink-0 border border-zinc-300"
            />
            <div className="text-center sm:text-left flex-1 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Album Phòng Thu
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-2 truncate">{albumHienTai.ten_album}</h1>
              <p className="text-sm font-semibold text-emerald-600 mt-1">{albumHienTai.nghe_si}</p>
              <p className="text-xs text-zinc-600 mt-2 max-w-xl leading-relaxed">{albumHienTai.mo_ta}</p>
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Năm {albumHienTai.nam_phat_hanh}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Music className="w-3.5 h-3.5" /> {baiHatList.length} bài hát</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-900 mb-4">Các Bài Hát Trong Album</h3>
            {baiHatList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {baiHatList.map((bai) => (
                  <SongCard
                    key={bai._id}
                    baiHat={bai}
                    danhSach={baiHatList}
                    onOpenAuth={onOpenAuth}
                    onOpenAddToPlaylist={onOpenAddToPlaylist}
                    onOpenSongDetail={onOpenSongDetail}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic py-6 text-center">Chưa có bài hát nào trong album này.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <Disc className="w-6 h-6 text-amber-600" />
              Album Âm Nhạc Nổi Bật
            </h1>
            <p className="text-xs text-zinc-600 mt-1">Khám phá các album được phát hành trọn vẹn</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {danhSachAlbum.map((ab) => (
              <div
                key={ab._id}
                onClick={() => setAlbumHienTai(ab)}
                className="group bg-zinc-50/60 hover:bg-zinc-100/80 p-3.5 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-white shadow-inner relative">
                  <img
                    src={ab.anh_bia || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400'}
                    alt={ab.ten_album}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isQuanTriVien && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAlbumXoa(ab);
                      }}
                      className="absolute top-2 right-2 p-2 rounded-xl bg-black/70 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-white hover:bg-rose-600 transition-all cursor-pointer shadow"
                      title="Xóa album này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <h3 className="text-sm font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors truncate">
                  {ab.ten_album}
                </h3>
                <p className="text-xs text-zinc-600 truncate mt-0.5">{ab.nghe_si}</p>
                <span className="text-[11px] text-zinc-500 block mt-1">Năm phát hành: {ab.nam_phat_hanh}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thông báo thao tác */}
      {thongBao && (
        <div className="fixed bottom-24 right-6 z-50 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 text-xs font-semibold shadow-xl">
          {thongBao}
        </div>
      )}

      {/* Modal Xác Nhận Xóa Album */}
      {albumXoa && (
        <div className="fixed inset-0 z-50 bg-zinc-900/35 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-50 border border-rose-500/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl shadow-rose-200/40">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">Xóa album khỏi hệ thống?</h3>
            <p className="text-xs text-zinc-600 mb-2">Bạn có chắc chắn muốn xóa album:</p>
            <p className="text-sm font-semibold text-rose-700 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 mb-4">
              {albumXoa.ten_album}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                disabled={dangXoa}
                onClick={() => setAlbumXoa(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                disabled={dangXoa}
                onClick={handleXacNhanXoa}
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
