/**
 * @file KhamPha.tsx
 * @description Trang Khám Phá & Tìm Kiếm / Lọc Bài Hát Nâng Cao
 * Phục vụ cả Khách vãng lai và Người dùng: Tìm kiếm từ khóa, Lọc thể loại, Sắp xếp thứ tự
 */

import React, { useState, useEffect } from 'react';
import { BaiHat, TheLoai } from '../types/index.ts';
import { BaiHatAPI, TheLoaiAPI } from '../services/api.ts';
import { SongCard } from '../components/SongCard.tsx';
import { Search, Filter, SlidersHorizontal, Music2, RefreshCw } from 'lucide-react';

interface KhamPhaProps {
  tuKhoaKhoiTao: string;
  onOpenAuth: () => void;
  onOpenAddToPlaylist: (id: string) => void;
  onOpenSongDetail: (id: string) => void;
}

export const KhamPha: React.FC<KhamPhaProps> = ({
  tuKhoaKhoiTao,
  onOpenAuth,
  onOpenAddToPlaylist,
  onOpenSongDetail
}) => {
  const [tuKhoa, setTuKhoa] = useState(tuKhoaKhoiTao || '');
  const [theLoaiChon, setTheLoaiChon] = useState('tat_ca');
  const [sapXep, setSapXep] = useState('luot_nghe');
  const [danhSachBaiHat, setDanhSachBaiHat] = useState<BaiHat[]>([]);
  const [theLoaiList, setTheLoaiList] = useState<TheLoai[]>([]);
  const [dangTai, setDangTai] = useState(false);

  // Đồng bộ từ khóa khi người dùng gõ trên Navbar
  useEffect(() => {
    setTuKhoa(tuKhoaKhoiTao);
  }, [tuKhoaKhoiTao]);

  // Tải danh mục thể loại
  useEffect(() => {
    TheLoaiAPI.layTatCa()
      .then(setTheLoaiList)
      .catch(() => {});
  }, []);

  // Gọi API tìm kiếm & lọc mỗi khi điều kiện thay đổi
  useEffect(() => {
    let active = true;
    const locDuLieu = async () => {
      setDangTai(true);
      try {
        const ketQua = await BaiHatAPI.timKiem({
          q: tuKhoa,
          the_loai: theLoaiChon,
          sap_xep: sapXep
        });
        if (active) setDanhSachBaiHat(ketQua);
      } catch (err) {
        console.error('Lỗi tìm kiếm bài hát:', err);
      } finally {
        if (active) setDangTai(false);
      }
    };

    locDuLieu();
    const refresh = () => { void locDuLieu(); };
    window.addEventListener('soundwave:data-changed', refresh);
    return () => {
      active = false;
      window.removeEventListener('soundwave:data-changed', refresh);
    };
  }, [tuKhoa, theLoaiChon, sapXep]);

  return (
    <div className="space-y-6 pb-16">
      {/* Tiêu đề & Ô Tìm Kiếm Chính */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <Search className="w-6 h-6 text-emerald-600" />
          Khám Phá & Tìm Kiếm Bài Hát
        </h1>
        <p className="text-xs text-zinc-600 mt-1">
          Tìm kiếm bài hát theo tên tác phẩm, ca sĩ, album hoặc lựa chọn bộ lọc thể loại
        </p>
      </div>

      {/* Thanh Bộ Lọc & Tìm Kiếm */}
      <div className="bg-zinc-50/80 p-4 rounded-2xl border border-zinc-200 space-y-4 shadow-sm">
        {/* Ô Nhập Từ Khóa */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Nhập tên bài hát, ca sĩ thể hiện, album..."
            className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {tuKhoa && (
            <button
              onClick={() => setTuKhoa('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Bộ Lọc Thể Loại (Chips) & Sắp Xếp */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          {/* Danh Sách Thể Loại */}
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <span className="text-xs font-semibold text-zinc-600 flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5" /> Thể loại:
            </span>
            <button
              onClick={() => setTheLoaiChon('tat_ca')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                theLoaiChon === 'tat_ca'
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
              }`}
            >
              Tất cả
            </button>
            {theLoaiList.map((tl) => (
              <button
                key={tl._id}
                onClick={() => setTheLoaiChon(tl.ten_the_loai)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  theLoaiChon === tl.ten_the_loai
                    ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
                }`}
              >
                {tl.ten_the_loai}
              </button>
            ))}
          </div>

          {/* Hộp Chọn Sắp Xếp */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600" />
            <select
              value={sapXep}
              onChange={(e) => setSapXep(e.target.value)}
              className="bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="luot_nghe">Lượt nghe nhiều nhất</option>
              <option value="moi_nhat">Mới nhất vừa đăng</option>
              <option value="ten_az">Tên bài hát (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hiển Thị Số Lượng Kết Quả */}
      <div className="flex items-center justify-between text-xs text-zinc-600 px-1">
        <span>
          Tìm thấy <strong className="text-emerald-600">{danhSachBaiHat.length}</strong> bài hát phù hợp
        </span>
        {dangTai && (
          <span className="flex items-center gap-1.5 text-emerald-600 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang tải kết quả...
          </span>
        )}
      </div>

      {/* Danh Sách Bài Hát Dạng Lưới */}
      {danhSachBaiHat.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {danhSachBaiHat.map((bai) => (
            <SongCard
              key={bai._id}
              baiHat={bai}
              danhSach={danhSachBaiHat}
              onOpenAuth={onOpenAuth}
              onOpenAddToPlaylist={onOpenAddToPlaylist}
              onOpenSongDetail={onOpenSongDetail}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-zinc-50/30 rounded-3xl border border-zinc-200/60 p-8">
          <Music2 className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-800">Không tìm thấy bài hát nào</h3>
          <p className="text-xs text-zinc-600 max-w-sm mx-auto mt-1">
            Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang chọn thể loại "Tất cả"
          </p>
          <button
            onClick={() => { setTuKhoa(''); setTheLoaiChon('tat_ca'); }}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};
