/**
 * @file App.tsx
 * @description Ứng Dụng Chính Frontend SoundWave
 * Kết nối toàn bộ Layout: Sidebar, Navbar, Các trang nội dung, Audio Player Bar, và các Modal
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AudioPlayerProvider, useAudioPlayer } from './context/AudioPlayerContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { AudioPlayerBar } from './components/AudioPlayerBar.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { UploadSongModal } from './components/UploadSongModal.tsx';
import { AddToPlaylistModal } from './components/AddToPlaylistModal.tsx';
import { SongDetailModal } from './components/SongDetailModal.tsx';

// Các trang nội dung
import { TrangChu } from './pages/TrangChu.tsx';
import { KhamPha } from './pages/KhamPha.tsx';
import { DanhSachTheLoai } from './pages/DanhSachTheLoai.tsx';
import { DanhSachNgheSi } from './pages/DanhSachNgheSi.tsx';
import { DanhSachAlbum } from './pages/DanhSachAlbum.tsx';
import { HoSoCaNhan } from './pages/HoSoCaNhan.tsx';
import { BaiHatYeuThich } from './pages/BaiHatYeuThich.tsx';
import { QuanLyPlaylist } from './pages/QuanLyPlaylist.tsx';
import { LichSuNghePage } from './pages/LichSuNghe.tsx';
import { BaiHatCuaToi } from './pages/BaiHatCuaToi.tsx';
import { TrangQuanTri } from './pages/TrangQuanTri.tsx';

import { TheLoaiAPI, BaiHatAPI } from './services/api.ts';
import { TheLoai, NgheSi, Album } from './types/index.ts';
import { ShieldAlert, LogIn } from 'lucide-react';

const validPages = new Set([
  'trang_chu', 'kham_pha', 'the_loai', 'the_loai_chi_tiet', 'nghe_si', 'nghe_si_chi_tiet',
  'album', 'album_chi_tiet', 'ho_so', 'yeu_thich', 'playlist', 'lich_su', 'bai_hat_cua_toi',
  'quan_tri', 'quan_tri_thong_ke', 'quan_tri_duyet', 'quan_tri_bai_hat', 'quan_tri_nghe_si',
  'quan_tri_album', 'quan_tri_the_loai', 'quan_tri_nguoi_dung'
]);
function readNavigation() {
  const hashPage = window.location.hash.slice(1);
  const page = validPages.has(hashPage) ? hashPage : 'trang_chu';
  try {
    const saved = window.history.state?.page === page
      ? window.history.state
      : JSON.parse(sessionStorage.getItem('soundwave_navigation') || 'null');
    return { page, params: saved?.page === page ? saved.params ?? null : null };
  } catch { return { page, params: null }; }
}
const AppContent: React.FC = () => {
  const { nguoiDung, isKhach, isNguoiDung, isQuanTriVien, dangXuat } = useAuth();

  // Quản lý trang hiện tại
  const [trangHienTai, setTrangHienTai] = useState<string>(() => readNavigation().page);
  const [thamSoTrang, setThamSoTrang] = useState<any>(() => readNavigation().params);
  const [hienMenuMobile, setHienMenuMobile] = useState(false);
  const { baiDangPhat } = useAudioPlayer();
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState<string>('');

  // Danh mục thể loại dùng chung cho modal upload & lọc
  const [theLoaiList, setTheLoaiList] = useState<TheLoai[]>([]);
  const [soBaiChoDuyet, setSoBaiChoDuyet] = useState<number>(0);

  // Quản lý các Modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'dang_nhap' | 'dang_ky' | 'dang_nhap_admin'>('dang_nhap');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [addToPlaylistId, setAddToPlaylistId] = useState<string | null>(null);
  const [songDetailId, setSongDetailId] = useState<string | null>(null);

  // Tải thể loại & số bài chờ duyệt
  const capNhatThongTinChung = async () => {
    try {
      const genres = await TheLoaiAPI.layTatCa();
      setTheLoaiList(genres);

      if (isQuanTriVien) {
        const allSongs = await BaiHatAPI.adminLayTatCa();
        const pending = allSongs.filter(b => b.trang_thai === 'cho_duyet').length;
        setSoBaiChoDuyet(pending);
      }
    } catch (e) {
      console.warn('Lỗi đồng bộ dữ liệu ban đầu:', e);
    }
  };

  useEffect(() => {
    capNhatThongTinChung();
  }, [isQuanTriVien]);

  // Điều hướng trang kèm tham số
  const handleChuyenTrang = (trang: string, params?: any) => {
    if (!validPages.has(trang)) return;
    setTrangHienTai(trang);
    setThamSoTrang(params ?? null);
    setHienMenuMobile(false);
    const snapshot = { page: trang, params: params ?? null };
    try { sessionStorage.setItem('soundwave_navigation', JSON.stringify(snapshot)); } catch {}
    if (window.location.hash !== '#' + trang) window.history.pushState(snapshot, '', '#' + trang);
  };

  useEffect(() => {
    const restore = (event: PopStateEvent | HashChangeEvent) => {
      const saved = readNavigation();
      setTrangHienTai(saved.page);
      setThamSoTrang('state' in event && event.state?.page === saved.page ? event.state.params ?? null : saved.params);
      setHienMenuMobile(false);
    };
    window.addEventListener('popstate', restore);
    window.addEventListener('hashchange', restore);
    return () => {
      window.removeEventListener('popstate', restore);
      window.removeEventListener('hashchange', restore);
    };
  }, []);

  // Mở modal xác thực với chế độ chỉ định
  const handleOpenAuth = (mode: 'dang_nhap' | 'dang_ky' | 'dang_nhap_admin' = 'dang_nhap') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // Render trang tương ứng
  const renderTrangNoiDung = () => {
    switch (trangHienTai) {
      case 'trang_chu':
        return (
          <TrangChu
            onOpenAuth={() => handleOpenAuth('dang_nhap')}
            onOpenAddToPlaylist={(id) => setAddToPlaylistId(id)}
            onOpenSongDetail={(id) => setSongDetailId(id)}
            onChuyenTrang={handleChuyenTrang}
          />
        );

      case 'kham_pha':
        return (
          <KhamPha
            tuKhoaKhoiTao={tuKhoaTimKiem}
            onOpenAuth={() => handleOpenAuth('dang_nhap')}
            onOpenAddToPlaylist={(id) => setAddToPlaylistId(id)}
            onOpenSongDetail={(id) => setSongDetailId(id)}
          />
        );

      case 'the_loai':
      case 'the_loai_chi_tiet':
        return (
          <DanhSachTheLoai
            theLoaiDuocChon={thamSoTrang as TheLoai}
            onOpenAuth={() => handleOpenAuth('dang_nhap')}
            onOpenAddToPlaylist={(id) => setAddToPlaylistId(id)}
            onOpenSongDetail={(id) => setSongDetailId(id)}
          />
        );

      case 'nghe_si':
      case 'nghe_si_chi_tiet':
        return (
          <DanhSachNgheSi
            ngheSiDuocChon={thamSoTrang as NgheSi}
            onOpenAuth={() => handleOpenAuth('dang_nhap')}
            onOpenAddToPlaylist={(id) => setAddToPlaylistId(id)}
            onOpenSongDetail={(id) => setSongDetailId(id)}
          />
        );

      case 'album':
      case 'album_chi_tiet':
        return (
          <DanhSachAlbum
            albumDuocChon={thamSoTrang as Album}
            onOpenAuth={() => handleOpenAuth('dang_nhap')}
            onOpenAddToPlaylist={(id) => setAddToPlaylistId(id)}
            onOpenSongDetail={(id) => setSongDetailId(id)}
          />
        );

      case 'ho_so':
        return isKhach ? (
          <div className="py-20 text-center">
            <p className="text-zinc-600 mb-4">Vui lòng đăng nhập để xem hồ sơ cá nhân</p>
            <button
              onClick={() => handleOpenAuth('dang_nhap')}
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          <HoSoCaNhan />
        );

      case 'yeu_thich':
        return isKhach ? (
          <div className="py-20 text-center">
            <p className="text-zinc-600 mb-4">Vui lòng đăng nhập để xem các bài hát đã thích</p>
            <button
              onClick={() => handleOpenAuth('dang_nhap')}
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          <BaiHatYeuThich
            onOpenAddToPlaylist={(id) => setAddToPlaylistId(id)}
            onOpenSongDetail={(id) => setSongDetailId(id)}
          />
        );

      case 'playlist':
        return isKhach ? (
          <div className="py-20 text-center">
            <p className="text-zinc-600 mb-4">Vui lòng đăng nhập để quản lý danh sách phát</p>
            <button
              onClick={() => handleOpenAuth('dang_nhap')}
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          <QuanLyPlaylist onOpenSongDetail={(id) => setSongDetailId(id)} />
        );

      case 'lich_su':
        return isKhach ? (
          <div className="py-20 text-center">
            <p className="text-zinc-600 mb-4">Vui lòng đăng nhập để theo dõi lịch sử nghe nhạc</p>
            <button
              onClick={() => handleOpenAuth('dang_nhap')}
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          <LichSuNghePage onOpenSongDetail={(id) => setSongDetailId(id)} />
        );

      case 'bai_hat_cua_toi':
        return isKhach ? (
          <div className="py-20 text-center">
            <p className="text-zinc-600 mb-4">Vui lòng đăng nhập để xem danh sách bài hát đã đăng</p>
            <button
              onClick={() => handleOpenAuth('dang_nhap')}
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          <BaiHatCuaToi
            onOpenUpload={() => setUploadModalOpen(true)}
            onOpenSongDetail={(id) => setSongDetailId(id)}
          />
        );

      case 'quan_tri':
      case 'quan_tri_thong_ke':
      case 'quan_tri_duyet':
      case 'quan_tri_bai_hat':
      case 'quan_tri_nghe_si':
      case 'quan_tri_album':
      case 'quan_tri_the_loai':
      case 'quan_tri_nguoi_dung':
        return isQuanTriVien ? (
          <TrangQuanTri
            tabKhoiTao={
              trangHienTai === 'quan_tri_duyet'
                ? 'duyet_bai'
                : trangHienTai === 'quan_tri_bai_hat'
                ? 'bai_hat'
                : trangHienTai === 'quan_tri_nghe_si'
                ? 'nghe_si'
                : trangHienTai === 'quan_tri_album'
                ? 'album'
                : trangHienTai === 'quan_tri_the_loai'
                ? 'the_loai'
                : trangHienTai === 'quan_tri_nguoi_dung'
                ? 'nguoi_dung'
                : 'thong_ke'
            }
            onChuyenTab={(tabId) => {
              const mapTabSangTrang: Record<string, string> = {
                thong_ke: 'quan_tri',
                duyet_bai: 'quan_tri_duyet',
                bai_hat: 'quan_tri_bai_hat',
                nghe_si: 'quan_tri_nghe_si',
                album: 'quan_tri_album',
                the_loai: 'quan_tri_the_loai',
                nguoi_dung: 'quan_tri_nguoi_dung'
              };
              if (mapTabSangTrang[tabId]) {
                handleChuyenTrang(mapTabSangTrang[tabId]);
              }
            }}
            onOpenUpload={() => setUploadModalOpen(true)}
            onCapNhatSoLuongChoDuyet={(cnt) => setSoBaiChoDuyet(cnt)}
          />
        ) : (
          <div className="py-16 max-w-lg mx-auto text-center bg-zinc-50/60 border border-rose-200/40 rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-zinc-900 mb-2">Khu Vực Dành Riêng Cho Quản Trị Viên</h2>
            <p className="text-xs text-zinc-600 mb-6 leading-relaxed">
              {isKhach
                ? 'Bạn đang duyệt web với tư cách Khách vãng lai. Vui lòng đăng nhập với tài khoản Quản trị viên (admin) để có quyền truy cập hệ thống quản trị.'
                : 'Tài khoản hiện tại của bạn là Thành viên (User), không có quyền can thiệp vào hệ thống quản lý. Vui lòng đăng nhập bằng tài khoản Quản trị viên.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => handleChuyenTrang('trang_chu')}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Về Trang Chủ
              </button>
              <button
                onClick={() => handleOpenAuth('dang_nhap_admin')}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-lg shadow-rose-200/50"
              >
                Đăng Nhập Quản Trị Viên
              </button>
            </div>
          </div>
        );

      default:
        return (
          <TrangChu
            onOpenAuth={() => handleOpenAuth('dang_nhap')}
            onOpenAddToPlaylist={(id) => setAddToPlaylistId(id)}
            onOpenSongDetail={(id) => setSongDetailId(id)}
            onChuyenTrang={handleChuyenTrang}
          />
        );
    }
  };

  return (
    <div className="flex h-dvh bg-white text-zinc-900 font-sans antialiased overflow-hidden selection:bg-emerald-500 selection:text-black">
      {/* Sidebar Bên Trái */}
      {hienMenuMobile && (
        <button type="button" aria-label="Đóng menu điều hướng" onClick={() => setHienMenuMobile(false)}
          className="fixed inset-0 z-40 bg-zinc-900/35 lg:hidden" />
      )}
      <div className={`${hienMenuMobile ? 'block' : 'hidden'} fixed inset-y-0 left-0 z-50 w-64 lg:static lg:block lg:z-auto lg:shrink-0`}>
      <Sidebar
        trangHienTai={trangHienTai}
        onChuyenTrang={handleChuyenTrang}
        onOpenUpload={() => setUploadModalOpen(true)}
        onOpenAuth={handleOpenAuth}
        soBaiChoDuyet={soBaiChoDuyet}
      />
      </div>

      {/* Khung Nội Dung Chính */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar Trên Cùng */}
        <Navbar
          onToggleMenu={() => setHienMenuMobile(value => !value)}
          menuOpen={hienMenuMobile}
          onOpenAuth={handleOpenAuth}
          onOpenUpload={() => setUploadModalOpen(true)}
          onChuyenTrang={handleChuyenTrang}
          trangHienTai={trangHienTai}
          tuKhoaTimKiem={tuKhoaTimKiem}
          setTuKhoaTimKiem={setTuKhoaTimKiem}
          soBaiChoDuyet={soBaiChoDuyet}
        />

        {/* Nội Dung Trang Cuộn Dọc */}
        <main className={`flex-1 min-w-0 overflow-y-auto px-4 lg:px-8 pt-6 ${baiDangPhat ? 'pb-44 md:pb-28' : 'pb-6'} scrollbar-thin scrollbar-thumb-zinc-300`}>
          <div className="max-w-7xl mx-auto">
            <React.Fragment key={nguoiDung?._id || 'guest'}>{renderTrangNoiDung()}</React.Fragment>
          </div>
        </main>
      </div>

      {/* Thanh Điều Khiển Phát Nhạc Dưới Cùng */}
      <AudioPlayerBar
        onOpenAuth={() => handleOpenAuth('dang_nhap')}
        onOpenSongDetail={(id) => setSongDetailId(id)}
      />

      {/* Modal Xác Thực (Đăng Nhập / Đăng Ký) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
        onLoginSuccess={(vaiTro) => {
          if (authMode === 'dang_nhap_admin' && vaiTro === 'quan_tri_vien') {
            handleChuyenTrang('quan_tri');
          }
        }}
      />

      {/* Modal Đăng Tải / Thêm Bài Hát */}
      <UploadSongModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        theLoaiList={theLoaiList}
        onUploadSuccess={capNhatThongTinChung}
        onOpenAuth={handleOpenAuth}
      />

      {/* Modal Thêm Vào Playlist */}
      <AddToPlaylistModal
        isOpen={addToPlaylistId !== null}
        onClose={() => setAddToPlaylistId(null)}
        baiHatId={addToPlaylistId}
      />

      {/* Modal Xem Chi Tiết Bài Hát */}
      <SongDetailModal
        isOpen={songDetailId !== null}
        onClose={() => setSongDetailId(null)}
        baiHatId={songDetailId}
        onOpenAddToPlaylist={(id) => setAddToPlaylistId(id)}
        onOpenAuth={() => handleOpenAuth('dang_nhap')}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AudioPlayerProvider>
        <AppContent />
      </AudioPlayerProvider>
    </AuthProvider>
  );
}
