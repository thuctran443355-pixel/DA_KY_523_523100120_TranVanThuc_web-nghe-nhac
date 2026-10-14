/**
 * @file LichSuNghe.tsx
 * @description Trang Xem & Quản Lý Lịch Sử Nghe Nhạc
 * Hiển thị các bài hát đã nghe, thời gian nghe gần nhất và số lần nghe
 */

import React, { useState, useEffect } from 'react';
import { LichSuNghe } from '../types/index.ts';
import { LichSuAPI } from '../services/api.ts';
import { useAudioPlayer } from '../context/AudioPlayerContext.tsx';
import { History, Play, Trash2, Clock, Headphones } from 'lucide-react';

interface LichSuNgheProps {
  onOpenSongDetail: (id: string) => void;
}

export const LichSuNghePage: React.FC<LichSuNgheProps> = ({ onOpenSongDetail }) => {
  const { phatBaiHat } = useAudioPlayer();
  const [danhSachLichSu, setDanhSachLichSu] = useState<LichSuNghe[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [hienModalXoa, setHienModalXoa] = useState(false);
  const [dangXoa, setDangXoa] = useState(false);
  const [thongBao, setThongBao] = useState('');

  const taiLichSu = async () => {
    try {
      const data = await LichSuAPI.layDanhSach();
      setDanhSachLichSu(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiLichSu();
    const refresh = () => { void taiLichSu(); };
    window.addEventListener('soundwave:data-changed', refresh);
    window.addEventListener('soundwave:history-changed', refresh);
    return () => {
      window.removeEventListener('soundwave:data-changed', refresh);
      window.removeEventListener('soundwave:history-changed', refresh);
    };
  }, []);

  const handleXacNhanXoaTatCa = async () => {
    setDangXoa(true);
    try {
      await LichSuAPI.xoaTatCa();
      setDanhSachLichSu([]);
      setHienModalXoa(false);
      setThongBao('Đã xóa toàn bộ lịch sử nghe nhạc thành công!');
      setTimeout(() => setThongBao(''), 3000);
    } catch (err: any) {
      setThongBao(err.message || 'Lỗi xóa lịch sử');
      setTimeout(() => setThongBao(''), 4000);
    } finally {
      setDangXoa(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Trang Lịch Sử */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50 border border-zinc-200 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-lg shadow-amber-200/50">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Lịch Sử Nghe Nhạc</h1>
            <p className="text-xs text-zinc-600 mt-0.5">
              Những bản nhạc bạn đã thưởng thức gần đây ({danhSachLichSu.length} bài hát)
            </p>
          </div>
        </div>

        {danhSachLichSu.length > 0 && (
          <button
            onClick={() => setHienModalXoa(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 hover:bg-rose-500/20 text-zinc-700 hover:text-rose-600 text-xs font-semibold border border-zinc-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa Lịch Sử</span>
          </button>
        )}
      </div>

      {thongBao && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <span>{thongBao}</span>
          <button onClick={() => setThongBao('')} className="text-emerald-600 hover:text-zinc-900 text-xs cursor-pointer">×</button>
        </div>
      )}

      {/* Danh Sách Lịch Sử */}
      {danhSachLichSu.length > 0 ? (
        <div className="space-y-2">
          {danhSachLichSu.map((ls, index) => {
            const bai = ls.bai_hat;
            if (!bai) return null;
            return (
              <div
                key={ls._id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50/60 hover:bg-zinc-100/80 border border-zinc-200/60 transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span className="text-xs font-mono text-zinc-500 w-5 text-center">{index + 1}</span>
                  <img
                    src={bai.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                    alt={bai.tieu_de}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h4
                      onClick={() => onOpenSongDetail(bai._id)}
                      className="text-sm font-bold text-zinc-900 hover:text-emerald-600 truncate cursor-pointer transition-colors"
                    >
                      {bai.tieu_de}
                    </h4>
                    <p className="text-xs text-zinc-600 truncate">{bai.nghe_si} • {bai.the_loai}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-xs text-zinc-600">
                  <span className="hidden sm:flex items-center gap-1.5 text-zinc-500">
                    <Headphones className="w-3.5 h-3.5" /> Đã nghe {ls.so_lan_nghe} lần
                  </span>
                  <span className="hidden md:flex items-center gap-1.5 text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(ls.thoi_gian_nghe).toLocaleString('vi-VN')}
                  </span>
                  <button
                    onClick={() => phatBaiHat(bai)}
                    className="p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/30 transition-transform active:scale-95 cursor-pointer"
                    title="Nghe lại"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-zinc-50/30 rounded-3xl border border-zinc-200/60 p-8">
          <History className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-800">Chưa có lịch sử nghe nhạc</h3>
          <p className="text-xs text-zinc-600 max-w-sm mx-auto mt-1">
            Bất kỳ khi nào bạn phát một bài hát, lịch sử nghe sẽ tự động được ghi nhận tại đây!
          </p>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Toàn Bộ Lịch Sử */}
      {hienModalXoa && (
        <div className="fixed inset-0 z-50 bg-zinc-900/35 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-50 border border-rose-500/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl shadow-rose-200/40">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">Xóa toàn bộ lịch sử nghe nhạc?</h3>
            <p className="text-xs text-zinc-600 mb-5 leading-relaxed">
              Bạn có chắc chắn muốn xóa toàn bộ {danhSachLichSu.length} bản ghi nghe nhạc? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                disabled={dangXoa}
                onClick={() => setHienModalXoa(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                disabled={dangXoa}
                onClick={handleXacNhanXoaTatCa}
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
