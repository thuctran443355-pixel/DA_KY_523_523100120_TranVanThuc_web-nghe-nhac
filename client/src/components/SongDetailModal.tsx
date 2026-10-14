/**
 * @file SongDetailModal.tsx
 * @description Modal Xem Chi Tiết Bài Hát Toàn Diện
 * Hiển thị đầy đủ thông tin: ảnh bìa, nghệ sĩ, album, thể loại, lượt nghe, người đăng tải, lời bài hát
 */

import React, { useState, useEffect } from 'react';
import { BaiHat } from '../types/index.ts';
import { BaiHatAPI } from '../services/api.ts';
import { useAudioPlayer } from '../context/AudioPlayerContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  Play,
  Pause,
  Heart,
  Plus,
  Headphones,
  Calendar,
  Layers,
  Disc,
  User,
  Music2,
  FileText
} from 'lucide-react';

interface SongDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  baiHatId: string | null;
  onOpenAddToPlaylist?: (id: string) => void;
  onOpenAuth?: () => void;
}

export const SongDetailModal: React.FC<SongDetailModalProps> = ({
  isOpen,
  onClose,
  baiHatId,
  onOpenAddToPlaylist,
  onOpenAuth
}) => {
  const { isKhach } = useAuth();
  const { baiDangPhat, dangPhat, phatBaiHat, tamDung, tiepTuc, toggleYeuThich, kiemTraDaThich } = useAudioPlayer();

  const [baiHat, setBaiHat] = useState<BaiHat | null>(null);
  const [dangTai, setDangTai] = useState(false);

  useEffect(() => {
    let active = true;
    setBaiHat(null);
    if (isOpen && baiHatId) {
      setDangTai(true);
      BaiHatAPI.layChiTiet(baiHatId)
        .then(song => { if (active) setBaiHat(song); })
        .catch(err => { if (active) { console.error(err); window.alert(err.message || 'Không thể tải bài hát!'); onClose(); } })
        .finally(() => { if (active) setDangTai(false); });
    }
    return () => { active = false; };
  }, [isOpen, baiHatId]);

  if (!isOpen || !baiHat) return null;

  const dangPhatBaiNay = baiDangPhat?._id === baiHat._id;
  const isPlayingNow = dangPhatBaiNay && dangPhat;
  const isLiked = kiemTraDaThich(baiHat._id);

  const handlePlayToggle = () => {
    if (dangPhatBaiNay) {
      if (dangPhat) tamDung();
      else tiepTuc();
    } else {
      phatBaiHat(baiHat);
    }
  };

  const handleLike = async () => {
    if (isKhach) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    try { await toggleYeuThich(baiHat._id); }
    catch (error: any) { window.alert(error.message || 'Không thể cập nhật yêu thích!'); }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Chi tiết bài hát" className="fixed inset-0 z-50 bg-zinc-900/35 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-50 border border-zinc-200 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
        {/* Header Modal */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
            <Music2 className="w-4 h-4 text-emerald-600" />
            Chi Tiết Bài Hát
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-600 hover:text-zinc-900 rounded-full hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung chi tiết cuộn dọc */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-zinc-300">
          {/* Banner Giới Thiệu Bài Hát */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/60 p-5 rounded-2xl border border-zinc-200/80">
            <img
              src={baiHat.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
              alt={baiHat.tieu_de}
              className="w-36 h-36 rounded-2xl object-cover shadow-2xl shrink-0 border border-zinc-200"
            />
            <div className="flex-1 text-center sm:text-left min-w-0">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                {baiHat.the_loai}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 mt-2 truncate">
                {baiHat.tieu_de}
              </h2>
              <p className="text-sm font-semibold text-zinc-700 mt-1">{baiHat.nghe_si}</p>

              {/* Lượt nghe & Thời lượng */}
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-zinc-600">
                <span className="flex items-center gap-1">
                  <Headphones className="w-3.5 h-3.5 text-zinc-500" />
                  {baiHat.luot_nghe || 0} lượt nghe
                </span>
                {baiHat.album && (
                  <span className="flex items-center gap-1">
                    <Disc className="w-3.5 h-3.5 text-zinc-500" />
                    {baiHat.album}
                  </span>
                )}
              </div>

              {/* Các Nút Thao Tác Nhanh */}
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                <button
                  onClick={handlePlayToggle}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 cursor-pointer"
                >
                  {isPlayingNow ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlayingNow ? 'Tạm dừng' : 'Phát bài hát'}</span>
                </button>

                <button
                  onClick={handleLike}
                  className={`p-2 rounded-full border border-zinc-300 hover:border-zinc-500 transition-colors cursor-pointer ${
                    isLiked ? 'bg-rose-500/20 text-rose-500 border-rose-500/50' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                  title="Thích bài hát"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>

                {onOpenAddToPlaylist && (
                  <button
                    onClick={() => {
                      if (isKhach && onOpenAuth) {
                        onOpenAuth();
                      } else {
                        onOpenAddToPlaylist(baiHat._id);
                      }
                    }}
                    className="p-2 rounded-full border border-zinc-300 hover:border-zinc-500 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                    title="Thêm vào Playlist"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Người Đăng Tải Bài Hát */}
          {baiHat.nguoi_dang && (
            <div className="p-3.5 rounded-xl bg-white/40 border border-zinc-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={baiHat.nguoi_dang.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={baiHat.nguoi_dang.ho_ten}
                  className="w-9 h-9 rounded-full object-cover border border-zinc-300"
                />
                <div>
                  <p className="text-xs font-bold text-zinc-800">{baiHat.nguoi_dang.ho_ten}</p>
                  <p className="text-[11px] text-zinc-600">
                    {baiHat.nguoi_dang.vai_tro === 'quan_tri_vien' ? 'Quản Trị Viên' : 'Người dùng đăng tải'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {baiHat.ngay_tao ? new Date(baiHat.ngay_tao).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
              </span>
            </div>
          )}

          {/* Lời Bài Hát */}
          <div>
            <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              Lời Bài Hát (Lyrics)
            </h4>
            <div className="bg-white/80 p-5 rounded-2xl border border-zinc-200/80 text-sm leading-relaxed text-zinc-700 whitespace-pre-line text-center font-mono">
              {baiHat.loi_bai_hat || 'Chưa có lời bài hát cho bài này.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
