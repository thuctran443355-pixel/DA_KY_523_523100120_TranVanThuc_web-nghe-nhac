/**
 * @file DanhSachNgheSi.tsx
 * @description Trang Danh Sách Nghệ Sĩ & Xem Toàn Bộ Bài Hát Của Nghệ Sĩ
 */

import React, { useState, useEffect } from 'react';
import { NgheSi, BaiHat } from '../types/index.ts';
import { NgheSiAPI } from '../services/api.ts';
import { SongCard } from '../components/SongCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Mic2, ArrowLeft, Music2, Trash2 } from 'lucide-react';

interface DanhSachNgheSiProps {
  ngheSiDuocChon?: NgheSi | null;
  onOpenAuth: () => void;
  onOpenAddToPlaylist: (id: string) => void;
  onOpenSongDetail: (id: string) => void;
}

export const DanhSachNgheSi: React.FC<DanhSachNgheSiProps> = ({
  ngheSiDuocChon,
  onOpenAuth,
  onOpenAddToPlaylist,
  onOpenSongDetail
}) => {
  const { isQuanTriVien } = useAuth();
  const [danhSachNgheSi, setDanhSachNgheSi] = useState<NgheSi[]>([]);
  const [ngheSiHienTai, setNgheSiHienTai] = useState<NgheSi | null>(ngheSiDuocChon || null);
  const [baiHatList, setBaiHatList] = useState<BaiHat[]>([]);
  const [dangTai, setDangTai] = useState(false);
  const [ngheSiXoa, setNgheSiXoa] = useState<NgheSi | null>(null);
  const [dangXoa, setDangXoa] = useState(false);
  const [thongBao, setThongBao] = useState('');

  const taiDanhSach = async () => {
    try {
      const data = await NgheSiAPI.layTatCa();
      setDanhSachNgheSi(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    taiDanhSach();
  }, []);

  const handleXacNhanXoa = async () => {
    if (!ngheSiXoa) return;
    setDangXoa(true);
    try {
      await NgheSiAPI.adminXoa(ngheSiXoa._id);
      if (ngheSiHienTai?._id === ngheSiXoa._id) {
        setNgheSiHienTai(null);
      }
      setThongBao(`Đã xóa nghệ sĩ "${ngheSiXoa.ten}" thành công!`);
      setNgheSiXoa(null);
      await taiDanhSach();
      setTimeout(() => setThongBao(''), 3000);
    } catch (err: any) {
      setThongBao(err.message || 'Lỗi khi xóa nghệ sĩ');
      setTimeout(() => setThongBao(''), 4000);
    } finally {
      setDangXoa(false);
    }
  };

  useEffect(() => {
    setNgheSiHienTai(ngheSiDuocChon || null);
  }, [ngheSiDuocChon]);

  useEffect(() => {
    if (ngheSiHienTai) {
      setDangTai(true);
      NgheSiAPI.layChiTiet(ngheSiHienTai._id)
        .then(res => {
          setBaiHatList(res.bai_hat);
        })
        .catch(console.error)
        .finally(() => setDangTai(false));
    }
  }, [ngheSiHienTai]);

  return (
    <div className="space-y-6 pb-16">
      {ngheSiHienTai ? (
        <div className="space-y-6">
          <button
            onClick={() => setNgheSiHienTai(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách nghệ sĩ</span>
          </button>

          {/* Profile Nghệ Sĩ */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-zinc-50/80 border border-zinc-200 p-6 rounded-3xl">
            <img
              src={ngheSiHienTai.anh_dai_dien || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'}
              alt={ngheSiHienTai.ten}
              className="w-36 h-36 rounded-full object-cover border-4 border-emerald-500/30 shadow-2xl shrink-0"
            />
            <div className="text-center sm:text-left flex-1 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Nghệ Sĩ
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-2 truncate">{ngheSiHienTai.ten}</h1>
              <p className="text-xs text-zinc-600 mt-2 max-w-xl leading-relaxed">{ngheSiHienTai.tieu_su}</p>
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-zinc-500">
                <span>Thể loại chính: <strong className="text-zinc-700">{ngheSiHienTai.the_loai_chinh}</strong></span>
                <span>•</span>
                <span>{baiHatList.length} bài hát</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Music2 className="w-4 h-4 text-emerald-600" />
              Tất Cả Bài Hát Của {ngheSiHienTai.ten}
            </h3>
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
              <p className="text-xs text-zinc-500 italic py-6 text-center">Chưa có bài hát nào của nghệ sĩ này.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <Mic2 className="w-6 h-6 text-sky-400" />
              Nghệ Sĩ & Ca Sĩ
            </h1>
            <p className="text-xs text-zinc-600 mt-1">Danh sách các nghệ sĩ tiêu biểu trên nền tảng</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {danhSachNgheSi.map((ns) => (
              <div
                key={ns._id}
                onClick={() => setNgheSiHienTai(ns)}
                className="group p-4 rounded-2xl bg-zinc-50/60 hover:bg-zinc-100/80 border border-zinc-200/80 hover:border-zinc-300 transition-all cursor-pointer flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-28 h-28 rounded-full overflow-hidden mb-3 border-2 border-zinc-300 group-hover:border-emerald-500 transition-colors shadow relative">
                  <img
                    src={ns.anh_dai_dien || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'}
                    alt={ns.ten}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isQuanTriVien && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNgheSiXoa(ns);
                      }}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-600 hover:text-zinc-900 transition-opacity cursor-pointer"
                      title="Xóa nghệ sĩ"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  )}
                </div>
                <h3 className="text-sm font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors truncate w-full">
                  {ns.ten}
                </h3>
                <span className="text-[11px] text-zinc-600 truncate w-full mt-0.5">{ns.the_loai_chinh}</span>
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

      {/* Modal Xác Nhận Xóa Nghệ Sĩ */}
      {ngheSiXoa && (
        <div className="fixed inset-0 z-50 bg-zinc-900/35 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-50 border border-rose-500/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl shadow-rose-200/40">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">Xóa nghệ sĩ khỏi hệ thống?</h3>
            <p className="text-xs text-zinc-600 mb-2">Bạn có chắc chắn muốn xóa nghệ sĩ:</p>
            <p className="text-sm font-semibold text-rose-700 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 mb-4">
              {ngheSiXoa.ten}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                disabled={dangXoa}
                onClick={() => setNgheSiXoa(null)}
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
