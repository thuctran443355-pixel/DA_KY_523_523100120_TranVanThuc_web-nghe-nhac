/**
 * @file DanhSachTheLoai.tsx
 * @description Trang Danh Sách Thể Loại & Xem Các Bài Hát Theo Thể Loại
 */

import React, { useState, useEffect } from 'react';
import { TheLoai, BaiHat } from '../types/index.ts';
import { TheLoaiAPI, BaiHatAPI } from '../services/api.ts';
import { SongCard } from '../components/SongCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Layers, ArrowLeft, Trash2 } from 'lucide-react';

interface DanhSachTheLoaiProps {
  theLoaiDuocChon?: TheLoai | null;
  onOpenAuth: () => void;
  onOpenAddToPlaylist: (id: string) => void;
  onOpenSongDetail: (id: string) => void;
}

export const DanhSachTheLoai: React.FC<DanhSachTheLoaiProps> = ({
  theLoaiDuocChon,
  onOpenAuth,
  onOpenAddToPlaylist,
  onOpenSongDetail
}) => {
  const { isQuanTriVien } = useAuth();
  const [theLoaiList, setTheLoaiList] = useState<TheLoai[]>([]);
  const [theLoaiHienTai, setTheLoaiHienTai] = useState<TheLoai | null>(theLoaiDuocChon || null);
  const [baiHatList, setBaiHatList] = useState<BaiHat[]>([]);
  const [dangTai, setDangTai] = useState(false);
  const [theLoaiXoa, setTheLoaiXoa] = useState<TheLoai | null>(null);
  const [dangXoa, setDangXoa] = useState(false);
  const [thongBao, setThongBao] = useState('');

  const taiDanhSach = async () => {
    try {
      const data = await TheLoaiAPI.layTatCa();
      setTheLoaiList(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    taiDanhSach();
  }, []);

  const handleXacNhanXoa = async () => {
    if (!theLoaiXoa) return;
    setDangXoa(true);
    try {
      await TheLoaiAPI.adminXoa(theLoaiXoa._id);
      if (theLoaiHienTai?._id === theLoaiXoa._id) {
        setTheLoaiHienTai(null);
      }
      setThongBao(`Đã xóa thể loại "${theLoaiXoa.ten_the_loai}" thành công!`);
      setTheLoaiXoa(null);
      await taiDanhSach();
      setTimeout(() => setThongBao(''), 3000);
    } catch (err: any) {
      setThongBao(err.message || 'Lỗi khi xóa thể loại');
      setTimeout(() => setThongBao(''), 4000);
    } finally {
      setDangXoa(false);
    }
  };

  useEffect(() => {
    setTheLoaiHienTai(theLoaiDuocChon || null);
  }, [theLoaiDuocChon]);

  useEffect(() => {
    if (theLoaiHienTai) {
      setDangTai(true);
      BaiHatAPI.layDanhSach({ the_loai: theLoaiHienTai.ten_the_loai })
        .then(setBaiHatList)
        .catch(console.error)
        .finally(() => setDangTai(false));
    }
  }, [theLoaiHienTai]);

  return (
    <div className="space-y-6 pb-16">
      {theLoaiHienTai ? (
        // Chi tiết một thể loại cụ thể
        <div className="space-y-6">
          <button
            onClick={() => setTheLoaiHienTai(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại tất cả thể loại</span>
          </button>

          <div
            className="p-8 rounded-3xl relative overflow-hidden text-white shadow-xl"
            style={{ backgroundColor: theLoaiHienTai.mau_sac || '#4f46e5' }}
          >
            <img
              src={theLoaiHienTai.anh_the_loai}
              alt={theLoaiHienTai.ten_the_loai}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="relative z-10 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider bg-black/40 px-3 py-1 rounded-full border border-white/20">
                Thể Loại Âm Nhạc
              </span>
              <h1 className="text-3xl sm:text-4xl font-black mt-2">{theLoaiHienTai.ten_the_loai}</h1>
              <p className="text-sm text-white/90 mt-2">{theLoaiHienTai.mo_ta}</p>
              <p className="text-xs text-white/70 mt-3 font-semibold">
                Có {baiHatList.length} bài hát trong thể loại này
              </p>
            </div>
          </div>

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
        </div>
      ) : (
        // Danh sách toàn bộ thể loại
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-purple-600" />
              Tất Cả Thể Loại Âm Nhạc
            </h1>
            <p className="text-xs text-zinc-600 mt-1">Lựa chọn thể loại nhạc yêu thích để khám phá các giai điệu</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {theLoaiList.map((tl) => (
              <div
                key={tl._id}
                onClick={() => setTheLoaiHienTai(tl)}
                className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 p-5 flex flex-col justify-end"
                style={{ backgroundColor: tl.mau_sac || '#4f46e5' }}
              >
                <img
                  src={tl.anh_the_loai}
                  alt={tl.ten_the_loai}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-300"
                />
                {isQuanTriVien && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTheLoaiXoa(tl);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 text-rose-300 hover:text-white hover:bg-rose-600 transition-all cursor-pointer z-20 shadow"
                    title="Xóa thể loại này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="relative z-10">
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow">{tl.ten_the_loai}</h3>
                  <p className="text-white/80 text-xs truncate mt-1">{tl.mo_ta}</p>
                </div>
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

      {/* Modal Xác Nhận Xóa Thể Loại */}
      {theLoaiXoa && (
        <div className="fixed inset-0 z-50 bg-zinc-900/35 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-50 border border-rose-500/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl shadow-rose-200/40">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">Xóa thể loại âm nhạc?</h3>
            <p className="text-xs text-zinc-600 mb-2">Bạn có chắc chắn muốn xóa thể loại:</p>
            <p className="text-sm font-semibold text-rose-700 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 mb-4">
              {theLoaiXoa.ten_the_loai}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                disabled={dangXoa}
                onClick={() => setTheLoaiXoa(null)}
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
