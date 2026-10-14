/**
 * @file BaiHatYeuThich.tsx
 * @description Trang Quản Lý Bài Hát Yêu Thích Của Người Dùng
 */

import React, { useState, useEffect } from 'react';
import { BaiHat } from '../types/index.ts';
import { YeuThichAPI } from '../services/api.ts';
import { SongCard } from '../components/SongCard.tsx';
import { useAudioPlayer } from '../context/AudioPlayerContext.tsx';
import { Heart, Play, Music, Sparkles } from 'lucide-react';

interface BaiHatYeuThichProps {
  onOpenAddToPlaylist: (id: string) => void;
  onOpenSongDetail: (id: string) => void;
}

export const BaiHatYeuThich: React.FC<BaiHatYeuThichProps> = ({
  onOpenAddToPlaylist,
  onOpenSongDetail
}) => {
  const { phatBaiHat, danhSachYeuThichIds } = useAudioPlayer();
  const [danhSachYeuThich, setDanhSachYeuThich] = useState<BaiHat[]>([]);
  const [dangTai, setDangTai] = useState(true);

  useEffect(() => {
    YeuThichAPI.layDanhSachDayDu()
      .then(setDanhSachYeuThich)
      .catch(console.error)
      .finally(() => setDangTai(false));
  }, [danhSachYeuThichIds]);

  const handlePhatTatCa = () => {
    if (danhSachYeuThich.length > 0) {
      phatBaiHat(danhSachYeuThich[0], danhSachYeuThich);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Trang Yêu Thích */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-50/60 to-zinc-50 border border-rose-200/30 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 shadow-lg shadow-rose-200/50">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Bài Hát Yêu Thích</h1>
            <p className="text-xs text-zinc-600 mt-0.5">
              Danh sách các tác phẩm âm nhạc bạn đã thả tim ({danhSachYeuThich.length} bài hát)
            </p>
          </div>
        </div>

        {danhSachYeuThich.length > 0 && (
          <button
            onClick={handlePhatTatCa}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-500/30 transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Phát Toàn Bộ</span>
          </button>
        )}
      </div>

      {/* Grid danh sách bài hát */}
      {danhSachYeuThich.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {danhSachYeuThich.map((bai) => (
            <SongCard
              key={bai._id}
              baiHat={bai}
              danhSach={danhSachYeuThich}
              onOpenAddToPlaylist={onOpenAddToPlaylist}
              onOpenSongDetail={onOpenSongDetail}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-zinc-50/30 rounded-3xl border border-zinc-200/60 p-8">
          <Heart className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-800">Chưa có bài hát yêu thích nào</h3>
          <p className="text-xs text-zinc-600 max-w-sm mx-auto mt-1">
            Nhấn vào biểu tượng trái tim ở bất kỳ bài hát nào để thêm vào danh sách yêu thích của bạn!
          </p>
        </div>
      )}
    </div>
  );
};
