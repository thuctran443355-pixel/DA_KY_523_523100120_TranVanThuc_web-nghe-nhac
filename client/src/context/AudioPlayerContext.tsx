import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { BaiHat } from '../types/index.ts';
import { BaiHatAPI, LichSuAPI, YeuThichAPI } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';

interface AudioPlayerContextType {
  baiDangPhat: BaiHat | null;
  danhSachPhat: BaiHat[];
  dangPhat: boolean;
  dangTaiNhac: boolean;
  loiPhatNhac: string;
  thoiGianHienTai: number;
  thoiLuong: number;
  amLuong: number;
  isMuted: boolean;
  isLapLai: boolean;
  isNgauNhien: boolean;
  danhSachYeuThichIds: string[];
  phatBaiHat: (baiHat: BaiHat, danhSach?: BaiHat[]) => void;
  tamDung: () => void;
  tiepTuc: () => void;
  chuyenBaiTiep: () => void;
  chuyenBaiTruoc: () => void;
  tua: (thoiGian: number) => void;
  thayDoiAmLuong: (giaTri: number) => void;
  batTatMute: () => void;
  batTatLapLai: () => void;
  batTatNgauNhien: () => void;
  toggleYeuThich: (baiHatId: string) => Promise<void>;
  kiemTraDaThich: (baiHatId: string) => boolean;
}
const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);
export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { nguoiDung } = useAuth();
  const [baiDangPhat, setBaiDangPhat] = useState<BaiHat | null>(null);
  const [danhSachPhat, setDanhSachPhat] = useState<BaiHat[]>([]);
  const [dangPhat, setDangPhat] = useState(false);
  const [dangTaiNhac, setDangTaiNhac] = useState(false);
  const [loiPhatNhac, setLoiPhatNhac] = useState('');
  const [thoiGianHienTai, setThoiGianHienTai] = useState(0);
  const [thoiLuong, setThoiLuong] = useState(0);
  const [amLuong, setAmLuong] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLapLai, setIsLapLai] = useState(false);
  const [isNgauNhien, setIsNgauNhien] = useState(false);
  const [danhSachYeuThichIds, setDanhSachYeuThichIds] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playRequestRef = useRef(0);
  const selectedSongRef = useRef<BaiHat | null>(null);
  const countedRequestRef = useRef(-1);
  const playbackRef = useRef({ chuyenBaiTiep: () => {}, nguoiDung });
  playbackRef.current.nguoiDung = nguoiDung;

  useEffect(() => {
    let active = true;
    setDanhSachYeuThichIds([]);
    if (nguoiDung) {
      YeuThichAPI.layDanhSachId()
        .then(ids => { if (active) setDanhSachYeuThichIds(ids); })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [nguoiDung?._id]);

  const thongBaoLoi = (error?: { name?: string }) => {
    if (error?.name === 'AbortError') return;
    setDangTaiNhac(false);
    setDangPhat(false);
    setLoiPhatNhac(error?.name === 'NotAllowedError'
      ? 'Trình duyệt đang chặn âm thanh. Nhấn Phát nhạc để thử lại.'
      : 'Không tải được âm thanh của bài này. Kiểm tra file nhạc hoặc kết nối tới nguồn nhạc, rồi nhấn Phát nhạc để thử lại.');
  };
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;
    audio.ontimeupdate = () => setThoiGianHienTai(audio.currentTime);
    audio.ondurationchange = () => setThoiLuong(Number.isFinite(audio.duration) ? audio.duration : 0);
    audio.onplaying = () => {
      setDangPhat(true);
      setDangTaiNhac(false);
      setLoiPhatNhac('');
      const song = selectedSongRef.current;
      const request = playRequestRef.current;
      if (song && countedRequestRef.current !== request) {
        countedRequestRef.current = request;
        const calls = [BaiHatAPI.ghiNhanLuotNghe(song._id)];
        if (playbackRef.current.nguoiDung) calls.push(LichSuAPI.ghiNhan(song._id));
        void Promise.allSettled(calls).then(results => {
          for (const result of results) if (result.status === 'rejected') console.warn('Không lưu được lượt nghe:', result.reason);
        });
      }
    };
    audio.onwaiting = () => setDangTaiNhac(true);
    audio.onpause = () => { setDangPhat(false); setDangTaiNhac(false); };
    audio.onended = () => { setDangPhat(false); playbackRef.current.chuyenBaiTiep(); };
    audio.onerror = () => thongBaoLoi();
    return () => {
      ++playRequestRef.current;
      audio.ontimeupdate = audio.ondurationchange = audio.onplaying = audio.onwaiting = audio.onpause = audio.onended = audio.onerror = null;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (audioRef.current) { audioRef.current.volume = amLuong; audioRef.current.muted = isMuted; }
  }, [amLuong, isMuted]);
  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = isLapLai;
  }, [isLapLai]);

  const phatBaiHat = async (baiHat: BaiHat, danhSach?: BaiHat[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const request = ++playRequestRef.current;
    audio.pause();
    selectedSongRef.current = baiHat;
    setBaiDangPhat(baiHat);
    const queue = danhSach?.length ? danhSach : danhSachPhat.some(song => song._id === baiHat._id) ? danhSachPhat : [baiHat];
    setDanhSachPhat(queue);
    setThoiGianHienTai(0);
    setThoiLuong(0);
    setLoiPhatNhac('');
    if (!baiHat.file_url?.trim()) {
      setLoiPhatNhac('Bài hát chưa có file âm thanh. Vui lòng cập nhật file nhạc.');
      return;
    }
    setDangTaiNhac(true);
    audio.src = baiHat.file_url.trim();
    try { await audio.play(); }
    catch (error: any) { if (request === playRequestRef.current) thongBaoLoi(error); }
  };
  const tamDung = () => {
    audioRef.current?.pause();
    setDangTaiNhac(false);
  };
  const tiepTuc = async () => {
    const audio = audioRef.current;
    if (!audio || !selectedSongRef.current?.file_url) return;
    const request = playRequestRef.current;
    setLoiPhatNhac('');
    setDangTaiNhac(true);
    if (audio.error) audio.load();
    try { await audio.play(); }
    catch (error: any) { if (request === playRequestRef.current) thongBaoLoi(error); }
  };
  const chuyenBaiTiep = () => {
    if (!baiDangPhat || !danhSachPhat.length) return;
    const currentIndex = danhSachPhat.findIndex(b => b._id === baiDangPhat._id);
    let nextIndex = (currentIndex + 1) % danhSachPhat.length;
    if (isNgauNhien && danhSachPhat.length > 1) {
      nextIndex = (Math.max(0, currentIndex) + 1 + Math.floor(Math.random() * (danhSachPhat.length - 1))) % danhSachPhat.length;
    }
    void phatBaiHat(danhSachPhat[nextIndex], danhSachPhat);
  };
  playbackRef.current.chuyenBaiTiep = chuyenBaiTiep;
  const chuyenBaiTruoc = () => {
    if (!baiDangPhat || !danhSachPhat.length) return;
    if (audioRef.current && audioRef.current.currentTime > 3) { audioRef.current.currentTime = 0; return; }
    const index = danhSachPhat.findIndex(b => b._id === baiDangPhat._id);
    void phatBaiHat(danhSachPhat[(index - 1 + danhSachPhat.length) % danhSachPhat.length], danhSachPhat);
  };
  const tua = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(value) || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(value, audio.duration));
    setThoiGianHienTai(audio.currentTime);
  };
  const thayDoiAmLuong = (value: number) => {
    if (!Number.isFinite(value)) return;
    setAmLuong(Math.max(0, Math.min(1, value)));
    if (value > 0) setIsMuted(false);
  };
  const batTatMute = () => setIsMuted(value => !value);
  const batTatLapLai = () => setIsLapLai(value => !value);
  const batTatNgauNhien = () => setIsNgauNhien(value => !value);
  const toggleYeuThich = async (baiHatId: string) => {
    if (!nguoiDung) throw new Error('Vui lòng đăng nhập để lưu bài hát yêu thích!');
    const userId = nguoiDung._id;
    const res = await YeuThichAPI.toggle(baiHatId);
    if (playbackRef.current.nguoiDung?._id !== userId) return;
    setDanhSachYeuThichIds(prev => res.da_thich ? [...new Set([...prev, baiHatId])] : prev.filter(id => id !== baiHatId));
  };
  const kiemTraDaThich = (id: string) => danhSachYeuThichIds.includes(id);
  return <AudioPlayerContext.Provider value={{
    baiDangPhat, danhSachPhat, dangPhat, dangTaiNhac, loiPhatNhac, thoiGianHienTai, thoiLuong, amLuong,
    isMuted, isLapLai, isNgauNhien, danhSachYeuThichIds, phatBaiHat, tamDung, tiepTuc,
    chuyenBaiTiep, chuyenBaiTruoc, tua, thayDoiAmLuong, batTatMute, batTatLapLai, batTatNgauNhien,
    toggleYeuThich, kiemTraDaThich
  }}>{children}</AudioPlayerContext.Provider>;
};
export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error('useAudioPlayer phải được sử dụng bên trong AudioPlayerProvider!');
  return context;
};
