/**
 * @file TrangChu.tsx
 * @description Trang Chủ SoundWave
 * Hiển thị Banner nổi bật, Bảng xếp hạng thịnh hành, Thể loại hot, Nghệ sĩ nổi bật, Album mới
 */

import React, { useState, useEffect } from 'react';
import { BaiHat, TheLoai, NgheSi, Album } from '../types/index.ts';
import { BaiHatAPI, TheLoaiAPI, NgheSiAPI, AlbumAPI } from '../services/api.ts';
import { SongCard } from '../components/SongCard.tsx';
import { useAudioPlayer } from '../context/AudioPlayerContext.tsx';
import { Play, TrendingUp, Sparkles, Layers, Mic2, Disc, ArrowRight, Flame } from 'lucide-react';

interface TrangChuProps {
  onOpenAuth: () => void;
  onOpenAddToPlaylist: (id: string) => void;
  onOpenSongDetail: (id: string) => void;
  onChuyenTrang: (trang: string, params?: any) => void;
}

export const TrangChu: React.FC<TrangChuProps> = ({
  onOpenAuth,
  onOpenAddToPlaylist,
  onOpenSongDetail,
  onChuyenTrang
}) => {
  const { phatBaiHat } = useAudioPlayer();
  const [baiHatHot, setBaiHatHot] = useState<BaiHat[]>([]);
  const [baiHatMoi, setBaiHatMoi] = useState<BaiHat[]>([]);
  const [theLoaiList, setTheLoaiList] = useState<TheLoai[]>([]);
  const [ngheSiList, setNgheSiList] = useState<NgheSi[]>([]);
  const [albumList, setAlbumList] = useState<Album[]>([]);
  const [dangTai, setDangTai] = useState(true);

  useEffect(() => {
    const taiDuLieu = async () => {
      try {
        const [songs, genres, artists, albums] = await Promise.all([
          BaiHatAPI.layDanhSach(),
          TheLoaiAPI.layTatCa(),
          NgheSiAPI.layTatCa(),
          AlbumAPI.layTatCa()
        ]);

        // Bài hát hot nhất theo lượt nghe
        const sortedByViews = [...songs].sort((a, b) => (b.luot_nghe || 0) - (a.luot_nghe || 0));
        setBaiHatHot(sortedByViews.slice(0, 8));

        // Bài hát mới nhất
        const sortedByDate = [...songs].sort((a, b) => 
          new Date(b.ngay_tao || 0).getTime() - new Date(a.ngay_tao || 0).getTime()
        );
        setBaiHatMoi(sortedByDate.slice(0, 8));

        setTheLoaiList(genres.slice(0, 5));
        setNgheSiList(artists.slice(0, 6));
        setAlbumList(albums.slice(0, 4));
      } catch (err) {
        console.error('Lỗi tải dữ liệu trang chủ:', err);
      } finally {
        setDangTai(false);
      }
    };

    taiDuLieu();
    const refresh = () => { void taiDuLieu(); };
    window.addEventListener('soundwave:data-changed', refresh);
    return () => window.removeEventListener('soundwave:data-changed', refresh);
  }, []);

  const baiNoiBat = baiHatHot[0] || null;

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner Nổi Bật */}
      {baiNoiBat && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-50 via-zinc-50 to-white border border-emerald-200/40 p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 mb-3">
              <Flame className="w-3.5 h-3.5 fill-current" />
              Bản Hit Nổi Bật Tuần
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight leading-tight">
              {baiNoiBat.tieu_de}
            </h1>
            <p className="text-emerald-600 font-semibold text-sm sm:text-base mt-2">
              Thể hiện: {baiNoiBat.nghe_si} • {baiNoiBat.the_loai}
            </p>
            <p className="text-zinc-600 text-xs sm:text-sm mt-3 line-clamp-2 leading-relaxed">
              {baiNoiBat.loi_bai_hat || 'Thưởng thức những giai điệu tuyệt vời được tuyển chọn hàng đầu trên hệ thống SoundWave.'}
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => phatBaiHat(baiNoiBat, baiHatHot)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-xl shadow-emerald-500/30 transition-transform active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Phát Ngay Bản Này</span>
              </button>
              <button
                onClick={() => onOpenSongDetail(baiNoiBat._id)}
                className="px-5 py-3 rounded-full bg-zinc-100/80 hover:bg-zinc-200 text-zinc-900 font-semibold text-xs border border-zinc-300 transition-colors cursor-pointer"
              >
                Xem Chi Tiết
              </button>
            </div>
          </div>

          {/* Ảnh nền mờ phía sau */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 lg:opacity-60 pointer-events-none overflow-hidden hidden sm:block">
            <img
              src={baiNoiBat.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'}
              alt={baiNoiBat.tieu_de}
              className="w-full h-full object-cover mask-gradient"
              style={{ maskImage: 'linear-gradient(to left, black 50%, transparent 100%)' }}
            />
          </div>
        </div>
      )}

      {/* Mục 1: Bảng Xếp Hạng Thịnh Hành (Hot) */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 leading-tight">Bài Hát Thịnh Hành</h2>
              <p className="text-xs text-zinc-600">Được nghe nhiều nhất trên hệ thống</p>
            </div>
          </div>
          <button
            onClick={() => onChuyenTrang('kham_pha')}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {baiHatHot.map((bai) => (
            <SongCard
              key={bai._id}
              baiHat={bai}
              danhSach={baiHatHot}
              onOpenAuth={onOpenAuth}
              onOpenAddToPlaylist={onOpenAddToPlaylist}
              onOpenSongDetail={onOpenSongDetail}
            />
          ))}
        </div>
      </section>

      {/* Mục 2: Thể Loại Âm Nhạc Nổi Bật */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 leading-tight">Thể Loại Yêu Thích</h2>
              <p className="text-xs text-zinc-600">Khám phá theo phong cách âm nhạc</p>
            </div>
          </div>
          <button
            onClick={() => onChuyenTrang('the_loai')}
            className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors cursor-pointer"
          >
            <span>Tất cả thể loại</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {theLoaiList.map((tl) => (
            <div
              key={tl._id}
              onClick={() => onChuyenTrang('the_loai_chi_tiet', tl)}
              className="group relative h-28 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 p-3.5 flex flex-col justify-end"
              style={{ backgroundColor: tl.mau_sac || '#4f46e5' }}
            >
              <img
                src={tl.anh_the_loai}
                alt={tl.ten_the_loai}
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-300"
              />
              <div className="relative z-10">
                <h3 className="text-white font-bold text-base leading-tight drop-shadow">
                  {tl.ten_the_loai}
                </h3>
                <p className="text-white/80 text-[10px] truncate mt-0.5">{tl.mo_ta}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mục 3: Nghệ Sĩ / Ca Sĩ Tiêu Biểu */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Mic2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 leading-tight">Nghệ Sĩ Nổi Tiếng</h2>
              <p className="text-xs text-zinc-600">Những giọng ca được yêu mến</p>
            </div>
          </div>
          <button
            onClick={() => onChuyenTrang('nghe_si')}
            className="flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
          >
            <span>Xem tất cả nghệ sĩ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
          {ngheSiList.map((ns) => (
            <div
              key={ns._id}
              onClick={() => onChuyenTrang('nghe_si_chi_tiet', ns)}
              className="group p-3 rounded-2xl bg-zinc-50/50 hover:bg-zinc-100/80 border border-zinc-200/60 hover:border-zinc-300 transition-all cursor-pointer flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-zinc-300 group-hover:border-emerald-500 transition-colors shadow-md">
                <img
                  src={ns.anh_dai_dien || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'}
                  alt={ns.ten}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="text-xs font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors truncate w-full">
                {ns.ten}
              </h4>
              <p className="text-[10px] text-zinc-600 truncate w-full mt-0.5">{ns.the_loai_chinh || 'Ca sĩ'}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mục 4: Album Mới Phát Hành */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Disc className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 leading-tight">Album Chọn Lọc</h2>
              <p className="text-xs text-zinc-600">Bộ sưu tập đĩa đơn và album đặc sắc</p>
            </div>
          </div>
          <button
            onClick={() => onChuyenTrang('album')}
            className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
          >
            <span>Tất cả album</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {albumList.map((ab) => (
            <div
              key={ab._id}
              onClick={() => onChuyenTrang('album_chi_tiet', ab)}
              className="group bg-zinc-50/50 hover:bg-zinc-100/80 p-3 rounded-2xl border border-zinc-200/60 hover:border-zinc-300 transition-all cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-white shadow-inner">
                <img
                  src={ab.anh_bia || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400'}
                  alt={ab.ten_album}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="text-xs font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors truncate">
                {ab.ten_album}
              </h4>
              <p className="text-[11px] text-zinc-600 truncate mt-0.5">{ab.nghe_si}</p>
              <span className="text-[10px] text-zinc-500 block mt-1">Năm {ab.nam_phat_hanh}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
