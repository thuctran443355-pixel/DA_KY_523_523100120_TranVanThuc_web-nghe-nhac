/**
 * @file AudioPlayerBar.tsx
 * @description Thanh Điều Khiển Phát Nhạc Cố Định Phía Dưới Màn Hình
 * Hỗ trợ: Play, Pause, Chuyển bài, Lặp lại, Phát ngẫu nhiên, Tua thời gian, Âm lượng, Thả tim yêu thích
 */

import React, { useState } from 'react';
import { useAudioPlayer } from '../context/AudioPlayerContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  FileText,
  Music2,
  X
} from 'lucide-react';

interface AudioPlayerBarProps {
  onOpenAuth: () => void;
  onOpenSongDetail: (id: string) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  onOpenAuth,
  onOpenSongDetail
}) => {
  const { isKhach } = useAuth();
  const {
    baiDangPhat,
    danhSachPhat,
    dangPhat,
    dangTaiNhac,
    loiPhatNhac,
    thoiGianHienTai,
    thoiLuong,
    amLuong,
    isMuted,
    isLapLai,
    isNgauNhien,
    phatBaiHat,
    tamDung,
    tiepTuc,
    chuyenBaiTiep,
    chuyenBaiTruoc,
    tua,
    thayDoiAmLuong,
    batTatMute,
    batTatLapLai,
    batTatNgauNhien,
    toggleYeuThich,
    kiemTraDaThich
  } = useAudioPlayer();

  const [hienDanhSachPhat, setHienDanhSachPhat] = useState(false);
  const [hienLoiBaiHat, setHienLoiBaiHat] = useState(false);

  // Định dạng số giây thành chuỗi mm:ss
  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleToggleLike = async () => {
    if (!baiDangPhat) return;
    if (isKhach) {
      onOpenAuth();
      return;
    }
    try { await toggleYeuThich(baiDangPhat._id); }
    catch (error: any) { window.alert(error.message || 'Không thể cập nhật yêu thích!'); }
  };

  if (!baiDangPhat) {
    return null; // Chưa chọn bài hát nào thì không hiển thị player bar
  }

  const isLiked = kiemTraDaThich(baiDangPhat._id);
  const phanTramTienTrinh = thoiLuong > 0 ? (thoiGianHienTai / thoiLuong) * 100 : 0;

  return (
    <>
      {/* Drawer Danh Sách Đang Phát (Queue) */}
      {hienDanhSachPhat && (
        <div className="fixed bottom-40 md:bottom-24 right-4 w-[calc(100vw-2rem)] sm:w-96 max-h-[460px] bg-zinc-50 border border-zinc-200 rounded-2xl shadow-2xl p-4 z-40 flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-3">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-zinc-900">Danh Sách Đang Phát</h4>
              <span className="text-xs text-zinc-600">({danhSachPhat.length})</span>
            </div>
            <button
              onClick={() => setHienDanhSachPhat(false)}
              className="p-1 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-300">
            {danhSachPhat.map((bai, idx) => {
              const dangPhatBaiNay = baiDangPhat._id === bai._id;
              return (
                <div
                  key={`${bai._id}_${idx}`}
                  onClick={() => phatBaiHat(bai, danhSachPhat)}
                  className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                    dangPhatBaiNay
                      ? 'bg-emerald-500/20 text-emerald-600'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <img
                    src={bai.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                    alt={bai.tieu_de}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate leading-tight">{bai.tieu_de}</p>
                    <p className="text-[11px] text-zinc-600 truncate">{bai.nghe_si}</p>
                  </div>
                  {dangPhatBaiNay && (
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping mr-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Xem Lời Bài Hát Nhanh */}
      {hienLoiBaiHat && (
        <div className="fixed inset-0 z-50 bg-zinc-900/35 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-50 border border-zinc-200 rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={baiDangPhat.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                  alt={baiDangPhat.tieu_de}
                  className="w-12 h-12 rounded-xl object-cover shadow"
                />
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 leading-tight">{baiDangPhat.tieu_de}</h3>
                  <p className="text-xs text-emerald-600">{baiDangPhat.nghe_si}</p>
                </div>
              </div>
              <button
                onClick={() => setHienLoiBaiHat(false)}
                className="p-1.5 text-zinc-600 hover:text-zinc-900 rounded-full hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-center">
              {baiDangPhat.loi_bai_hat ? (
                <div className="text-sm sm:text-base leading-relaxed text-zinc-800 whitespace-pre-line font-medium">
                  {baiDangPhat.loi_bai_hat}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm italic">
                  Lời bài hát chưa được cập nhật cho tác phẩm này.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Thanh Phát Nhạc Cố Định Phía Dưới */}
      <div data-player className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-zinc-200/80 px-4 py-2.5">
        <div className="max-w-7xl mx-auto grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] items-center gap-x-3 gap-y-2">
          {/* Cột Trái: Thông tin bài hát đang phát */}
          <div className="order-1 flex items-center gap-2 min-w-0">
            <div 
              onClick={() => onOpenSongDetail(baiDangPhat._id)}
              className="relative group cursor-pointer shrink-0"
              title="Xem chi tiết bài hát"
            >
              <img
                src={baiDangPhat.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120'}
                alt={baiDangPhat.tieu_de}
                className="w-13 h-13 rounded-xl object-cover border border-zinc-200 shadow-md group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Music2 className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 
                onClick={() => onOpenSongDetail(baiDangPhat._id)}
                className="text-xs sm:text-sm font-bold text-zinc-900 hover:text-emerald-600 truncate cursor-pointer transition-colors"
              >
                {baiDangPhat.tieu_de}
              </h4>
              <p className="text-[11px] sm:text-xs text-zinc-600 truncate">{baiDangPhat.nghe_si}</p>
              <span className="text-[10px] text-zinc-500 truncate block">
                {baiDangPhat.the_loai}
              </span>
            </div>

            {/* Nút Thả Tim Nhanh */}
            <button
              onClick={handleToggleLike}
              className="p-2 text-zinc-600 hover:text-zinc-900 rounded-full transition-transform active:scale-125 cursor-pointer shrink-0"
              title={isLiked ? 'Bỏ thích' : 'Thêm vào bài hát yêu thích'}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isLiked ? 'fill-rose-500 text-rose-500' : 'hover:text-rose-600'
                }`}
              />
            </button>
          </div>

          {/* Cột Giữa: Bộ điều khiển phát nhạc & Thanh thời gian */}
          <div className="order-3 col-span-2 md:order-2 md:col-span-1 min-w-0 w-full flex flex-col items-center gap-1.5">
            {/* Các nút điều khiển */}
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={batTatNgauNhien}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isNgauNhien ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-700'
                }`}
                title={isNgauNhien ? 'Tắt phát ngẫu nhiên' : 'Bật phát ngẫu nhiên'}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={chuyenBaiTruoc}
                className="p-1.5 text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
                title="Bài trước đó"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={dangPhat ? tamDung : tiepTuc}
                className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 cursor-pointer"
                title={dangPhat ? 'Tạm dừng' : 'Phát nhạc'}
              >
                {dangPhat ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={chuyenBaiTiep}
                className="p-1.5 text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
                title="Bài tiếp theo"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={batTatLapLai}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isLapLai ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-700'
                }`}
                title={isLapLai ? 'Tắt lặp lại' : 'Lặp lại bài hát này'}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Thanh tiến trình thời gian và tua nhạc */}
            <div className="w-full flex items-center gap-2 text-[11px] text-zinc-600 font-mono">
              <span className="w-9 text-right">{formatTime(thoiGianHienTai)}</span>
              <div className="relative flex-1 group py-1 flex items-center">
                <input
                  type="range"
                  min="0"
                  max={thoiLuong || 0}
                  disabled={thoiLuong <= 0}
                  aria-label="Tua nhạc"
                  step="0.5"
                  value={Math.min(thoiGianHienTai, thoiLuong || 0)}
                  onChange={(e) => tua(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                />
              </div>
              <span className="w-9">{formatTime(thoiLuong)}</span>
            </div>
          </div>

          {/* Cột Phải: Xem lời, Danh sách chờ & Âm lượng */}
          <div className="order-2 md:order-3 flex items-center justify-end gap-1 md:gap-3 min-w-0">
            {/* Nút Xem Lời Bài Hát */}
            <button
              onClick={() => setHienLoiBaiHat(!hienLoiBaiHat)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                hienLoiBaiHat ? 'text-emerald-600 bg-zinc-50' : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Xem lời bài hát"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Nút Danh Sách Phát */}
            <button
              onClick={() => setHienDanhSachPhat(!hienDanhSachPhat)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                hienDanhSachPhat ? 'text-emerald-600 bg-zinc-50' : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Danh sách đang phát"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Điều Chỉnh Âm Lượng */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={batTatMute}
                className="text-zinc-600 hover:text-zinc-900 cursor-pointer"
                title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
              >
                {isMuted || amLuong === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-600" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                aria-label="Âm lượng"
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : amLuong}
                onChange={(e) => thayDoiAmLuong(Number(e.target.value))}
                className="w-20 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>
        {(loiPhatNhac || dangTaiNhac) && (
          <p role={loiPhatNhac ? 'alert' : 'status'} className={`max-w-7xl mx-auto pt-1 text-xs leading-relaxed ${loiPhatNhac ? 'text-rose-700' : 'text-zinc-600'}`}>
            {loiPhatNhac || 'Đang tải âm thanh...'}
          </p>
        )}
      </div>
    </>
  );
};
