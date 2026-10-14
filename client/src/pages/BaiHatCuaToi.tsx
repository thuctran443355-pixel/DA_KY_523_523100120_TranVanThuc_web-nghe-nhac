/**
 * @file BaiHatCuaToi.tsx
 * @description Trang Danh Sách Các Bài Hát Do Người Dùng Đăng Tải
 * Hiển thị rõ ràng trạng thái kiểm duyệt: "Chờ duyệt", "Đã duyệt", hoặc "Bị từ chối" kèm lý do
 */

import React, { useState, useEffect } from 'react';
import { BaiHat } from '../types/index.ts';
import { BaiHatAPI } from '../services/api.ts';
import { useAudioPlayer } from '../context/AudioPlayerContext.tsx';
import {
  UploadCloud,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Headphones,
  Music2,
  Trash2
} from 'lucide-react';

interface BaiHatCuaToiProps {
  onOpenUpload: () => void;
  onOpenSongDetail: (id: string) => void;
}

export const BaiHatCuaToi: React.FC<BaiHatCuaToiProps> = ({
  onOpenUpload,
  onOpenSongDetail
}) => {
  const { phatBaiHat } = useAudioPlayer();
  const [baiHatCuaToi, setBaiHatCuaToi] = useState<BaiHat[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [baiHatXoa, setBaiHatXoa] = useState<BaiHat | null>(null);
  const [dangXoa, setDangXoa] = useState(false);
  const [thongBao, setThongBao] = useState('');

  const taiDuLieu = async () => {
    try {
      const data = await BaiHatAPI.layBaiHatCuaToi();
      setBaiHatCuaToi(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieu();
    const refresh = () => { void taiDuLieu(); };
    window.addEventListener('soundwave:data-changed', refresh);
    return () => window.removeEventListener('soundwave:data-changed', refresh);
  }, []);

  const handleXacNhanXoa = async () => {
    if (!baiHatXoa) return;
    setDangXoa(true);
    try {
      await BaiHatAPI.nguoiDungXoa(baiHatXoa._id);
      setThongBao(`Đã xóa bài hát "${baiHatXoa.tieu_de}" thành công!`);
      setBaiHatXoa(null);
      await taiDuLieu();
      setTimeout(() => setThongBao(''), 3000);
    } catch (err: any) {
      setThongBao(err.message || 'Lỗi khi xóa bài hát');
      setTimeout(() => setThongBao(''), 4000);
    } finally {
      setDangXoa(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50 border border-zinc-200 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 shadow-lg shadow-purple-950/50">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Bài Hát Tôi Đã Tải Lên</h1>
            <p className="text-xs text-zinc-600 mt-0.5">
              Theo dõi tiến độ phê duyệt và xuất bản các tác phẩm âm nhạc của bạn
            </p>
          </div>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-200/50 transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tải Lên Bài Mới</span>
        </button>
      </div>

      {thongBao && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <span>{thongBao}</span>
          <button onClick={() => setThongBao('')} className="text-emerald-600 hover:text-zinc-900 text-xs cursor-pointer">×</button>
        </div>
      )}

      {/* Danh sách bài hát & Trạng thái duyệt */}
      {baiHatCuaToi.length > 0 ? (
        <div className="space-y-3">
          {baiHatCuaToi.map((bai) => {
            const isChoDuyet = bai.trang_thai === 'cho_duyet';
            const isDaDuyet = bai.trang_thai === 'da_duyet';
            const isTuChoi = bai.trang_thai === 'tu_choi';

            return (
              <div
                key={bai._id}
                className="p-4 rounded-2xl bg-zinc-50/60 border border-zinc-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <img
                    src={bai.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                    alt={bai.tieu_de}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4
                      onClick={() => onOpenSongDetail(bai._id)}
                      className="text-sm font-bold text-zinc-900 hover:text-emerald-600 truncate cursor-pointer transition-colors"
                    >
                      {bai.tieu_de}
                    </h4>
                    <p className="text-xs text-zinc-600 truncate">{bai.nghe_si} • {bai.the_loai}</p>
                    <span className="text-[11px] text-zinc-500 block mt-0.5">
                      Đăng lúc: {bai.ngay_tao ? new Date(bai.ngay_tao).toLocaleString('vi-VN') : 'Gần đây'}
                    </span>
                  </div>
                </div>

                {/* Huy hiệu trạng thái kiểm duyệt */}
                <div className="flex flex-wrap items-center gap-4 shrink-0">
                  {isChoDuyet && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Đang chờ Admin duyệt</span>
                    </div>
                  )}

                  {isDaDuyet && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã duyệt & Đang phát hành</span>
                      <span className="ml-1 text-[11px] text-zinc-600 flex items-center gap-1">
                        (<Headphones className="w-3 h-3" /> {bai.luot_nghe || 0})
                      </span>
                    </div>
                  )}

                  {isTuChoi && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-semibold">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Bị từ chối: {bai.ly_do_tu_choi || 'Chưa đạt chuẩn'}</span>
                    </div>
                  )}

                  {/* Nút nghe thử */}
                  <button
                    onClick={() => phatBaiHat(bai)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Nghe thử</span>
                  </button>

                  {/* Nút xóa bài hát của tôi */}
                  <button
                    onClick={() => setBaiHatXoa(bai)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-600 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
                    title="Xóa bài hát này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-zinc-50/30 rounded-3xl border border-zinc-200/60 p-8">
          <UploadCloud className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-800">Bạn chưa tải lên bài hát nào</h3>
          <p className="text-xs text-zinc-600 max-w-sm mx-auto mt-1 mb-4">
            Hãy chia sẻ các tác phẩm âm nhạc hay bản cover của bạn với cộng đồng nghe nhạc!
          </p>
          <button
            onClick={onOpenUpload}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow"
          >
            Đăng Tải Ngay
          </button>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Bài Hát Của Tôi */}
      {baiHatXoa && (
        <div className="fixed inset-0 z-50 bg-zinc-900/35 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-50 border border-rose-500/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl shadow-rose-200/40">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">Xóa bài hát đã tải lên?</h3>
            <p className="text-xs text-zinc-600 mb-2">Bạn có chắc chắn muốn gỡ bỏ bài hát:</p>
            <p className="text-sm font-semibold text-rose-700 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 mb-4">
              {baiHatXoa.tieu_de}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                disabled={dangXoa}
                onClick={() => setBaiHatXoa(null)}
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
