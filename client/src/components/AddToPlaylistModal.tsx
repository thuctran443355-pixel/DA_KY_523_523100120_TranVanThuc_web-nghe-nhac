/**
 * @file AddToPlaylistModal.tsx
 * @description Modal Thêm Bài Hát Vào Playlist Hoặc Tạo Playlist Mới
 */

import React, { useState, useEffect } from 'react';
import { PlaylistAPI } from '../services/api.ts';
import { Playlist } from '../types/index.ts';
import { X, Plus, ListMusic, Check, CheckCircle2 } from 'lucide-react';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  baiHatId: string | null;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  onClose,
  baiHatId
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [tenMoi, setTenMoi] = useState('');
  const [dangTao, setDangTao] = useState(false);
  const [thongBao, setThongBao] = useState('');

  useEffect(() => {
    if (isOpen) {
      PlaylistAPI.layCuaToi()
        .then(setPlaylists)
        .catch(() => setPlaylists([]));
      setThongBao('');
    }
  }, [isOpen]);

  if (!isOpen || !baiHatId) return null;

  const handleThemBaiHat = async (playlistId: string) => {
    try {
      const res = await PlaylistAPI.themBaiHat(playlistId, baiHatId);
      setThongBao(res.thong_bao);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e: any) {
      setThongBao(e.message || 'Lỗi thêm vào playlist!');
    }
  };

  const handleTaoPlaylistMoi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenMoi.trim()) return;
    setDangTao(true);
    try {
      const plMoi = await PlaylistAPI.taoMoi({ ten_playlist: tenMoi.trim() });
      setPlaylists(prev => [...prev, plMoi]);
      setTenMoi('');
      // Tự động thêm bài hát vào playlist vừa tạo
      await handleThemBaiHat(plMoi._id);
    } catch (e: any) {
      setThongBao(e.message);
    } finally {
      setDangTao(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Thêm vào playlist" className="fixed inset-0 z-[60] bg-zinc-900/35 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-50 border border-zinc-200 rounded-3xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-4">
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-emerald-600" />
            Thêm Vào Playlist
          </h3>
          <button onClick={onClose} className="p-1 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {thongBao && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{thongBao}</span>
          </div>
        )}

        {/* Danh sách playlist hiện có */}
        <div className="max-h-52 overflow-y-auto space-y-1 mb-4 scrollbar-thin scrollbar-thumb-zinc-300">
          {playlists.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-4">Bạn chưa có playlist nào. Hãy tạo mới bên dưới!</p>
          ) : (
            playlists.map(pl => {
              const daCo = pl.danh_sach_bai_hat?.includes(baiHatId);
              return (
                <button
                  key={pl._id}
                  disabled={daCo}
                  onClick={() => handleThemBaiHat(pl._id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-medium transition-colors cursor-pointer ${
                    daCo 
                      ? 'bg-zinc-100/40 text-zinc-500 cursor-not-allowed'
                      : 'hover:bg-zinc-100 text-zinc-800'
                  }`}
                >
                  <span className="truncate">{pl.ten_playlist}</span>
                  {daCo ? (
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Đã có
                    </span>
                  ) : (
                    <Plus className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Tạo playlist mới */}
        <form onSubmit={handleTaoPlaylistMoi} className="pt-3 border-t border-zinc-200 flex gap-2">
          <input
            type="text"
            value={tenMoi}
            onChange={(e) => setTenMoi(e.target.value)}
            placeholder="Tên playlist mới..."
            className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={dangTao || !tenMoi.trim()}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Tạo & Thêm
          </button>
        </form>
      </div>
    </div>
  );
};
