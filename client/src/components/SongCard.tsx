/**
 * @file SongCard.tsx
 * @description Thẻ Hiển Thị Bài Hát Đẹp & Tối Ưu Tương Tác
 * Có nút phát nhạc nhanh, hiển thị lượt nghe, thả tim, thêm vào playlist
 */

import React from 'react';
import { BaiHat } from '../types/index.ts';
import { useAudioPlayer } from '../context/AudioPlayerContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Play, Pause, Heart, Plus, Headphones, Sparkles } from 'lucide-react';

interface SongCardProps {
  baiHat: BaiHat;
  danhSach?: BaiHat[];
  onOpenAuth?: () => void;
  onOpenAddToPlaylist?: (baiHatId: string) => void;
  onOpenSongDetail?: (baiHatId: string) => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  baiHat,
  danhSach,
  onOpenAuth,
  onOpenAddToPlaylist,
  onOpenSongDetail
}) => {
  const { isKhach } = useAuth();
  const { baiDangPhat, dangPhat, phatBaiHat, tamDung, tiepTuc, toggleYeuThich, kiemTraDaThich } = useAudioPlayer();

  const dangPhatBaiNay = baiDangPhat?._id === baiHat._id;
  const isPlayingNow = dangPhatBaiNay && dangPhat;
  const isLiked = kiemTraDaThich(baiHat._id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dangPhatBaiNay) {
      if (dangPhat) {
        tamDung();
      } else {
        tiepTuc();
      }
    } else {
      phatBaiHat(baiHat, danhSach);
    }
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isKhach) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    try { await toggleYeuThich(baiHat._id); }
    catch (error: any) { window.alert(error.message || 'Không thể cập nhật yêu thích!'); }
  };

  const handleAddPlaylistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isKhach) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (onOpenAddToPlaylist) {
      onOpenAddToPlaylist(baiHat._id);
    }
  };

  return (
    <div 
      onClick={() => onOpenSongDetail && onOpenSongDetail(baiHat._id)}
      className="group relative bg-zinc-50/60 hover:bg-zinc-100/80 p-3 rounded-2xl border border-zinc-200/80 hover:border-zinc-300/80 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 min-w-0 flex flex-col"
    >
      {/* Ảnh Bìa Bài Hát & Các Nút Thao Tác Khi Rê Chuột */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white mb-3 shadow-inner">
        <img
          src={baiHat.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80'}
          alt={baiHat.tieu_de}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Lớp phủ mờ tối khi hover hoặc khi bài đang phát */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center gap-2 ${
          isPlayingNow ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100'
        }`}>
          {/* Nút Thả Tim */}
          <button
            onClick={handleLikeClick}
            className="p-2 rounded-full bg-black/60 hover:bg-black text-white hover:scale-110 transition-all cursor-pointer"
            title={isLiked ? 'Bỏ thích' : 'Thích bài hát'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Nút Phát / Tạm Dừng Chính */}
          <button
            onClick={handlePlayClick}
            className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title={isPlayingNow ? 'Tạm dừng' : 'Phát bài này'}
          >
            {isPlayingNow ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Nút Thêm Vào Playlist */}
          <button
            onClick={handleAddPlaylistClick}
            className="p-2 rounded-full bg-black/60 hover:bg-black text-white hover:scale-110 transition-all cursor-pointer"
            title="Thêm vào Playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Huy hiệu thể loại góc trên */}
        <div className="absolute top-2 left-2 pointer-events-none">
          <span className="text-[10px] font-semibold bg-black/60 backdrop-blur-md text-zinc-200 px-2 py-0.5 rounded-full border border-white/10">
            {baiHat.the_loai}
          </span>
        </div>

        {/* Huy hiệu bài đang phát */}
        {isPlayingNow && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping"></span>
            <span>Đang phát</span>
          </div>
        )}
      </div>

      {/* Thông Tin Văn Bản */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-sm text-zinc-900 group-hover:text-emerald-600 transition-colors truncate">
            {baiHat.tieu_de}
          </h4>
          <p className="text-xs text-zinc-600 truncate mt-0.5">{baiHat.nghe_si}</p>
        </div>

        {/* Lượt nghe & Thời lượng */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-200/50 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Headphones className="w-3 h-3" />
            {baiHat.luot_nghe || 0}
          </span>
          {baiHat.thoi_luong && (
            <span>
              {Math.floor(baiHat.thoi_luong / 60)}:
              {(baiHat.thoi_luong % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
