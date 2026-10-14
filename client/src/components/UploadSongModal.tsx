/**
 * @file UploadSongModal.tsx
 * @description Modal Tải Lên & Đăng Tải Bài Hát Mới
 * - Người dùng thành viên: Bài hát tải lên sẽ có trạng thái "Chờ duyệt" (Quản trị viên sẽ thấy trong mục Duyệt Bài)
 * - Quản trị viên (Admin): Bài hát tải lên sẽ được tự động duyệt ngay và hiển thị lên Trang Chủ
 * - Khách vãng lai: Hướng dẫn đăng nhập trực tiếp ngay trong modal, không gây lỗi tài khoản khó hiểu
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { BaiHatAPI } from '../services/api.ts';
import { TheLoai } from '../types/index.ts';
import {
  X,
  UploadCloud,
  Music,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  LogIn,
  Shield,
  UserCheck,
  Sparkles,
  Volume2
} from 'lucide-react';

interface UploadSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  theLoaiList: TheLoai[];
  onUploadSuccess?: () => void;
  onOpenAuth?: (mode?: 'dang_nhap' | 'dang_ky' | 'dang_nhap_admin') => void;
}

export const UploadSongModal: React.FC<UploadSongModalProps> = ({
  isOpen,
  onClose,
  theLoaiList,
  onUploadSuccess,
  onOpenAuth
}) => {
  const { isKhach, isNguoiDung, isQuanTriVien, nguoiDung, dangNhap } = useAuth();

  const [tieuDe, setTieuDe] = useState('');
  const [ngheSi, setNgheSi] = useState(nguoiDung?.ho_ten || '');
  const [album, setAlbum] = useState('');
  const [theLoai, setTheLoai] = useState('V-Pop');
  const [loiBaiHat, setLoiBaiHat] = useState('');

  const [fileNhac, setFileNhac] = useState<File | null>(null);
  const [fileAnhBia, setFileAnhBia] = useState<File | null>(null);
  const [linkAudioFallback, setLinkAudioFallback] = useState('');
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const [dangUpload, setDangUpload] = useState(false);
  const [dangDangNhapNhanh, setDangDangNhapNhanh] = useState(false);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState('');
  const [thongBaoLoi, setThongBaoLoi] = useState('');

  // Tự động điền tên ca sĩ khi người dùng đăng nhập
  useEffect(() => {
    if (nguoiDung?.ho_ten && !ngheSi) {
      setNgheSi(nguoiDung.ho_ten);
    }
  }, [nguoiDung]);

  // Tạo URL nghe thử khi chọn file nhạc
  useEffect(() => {
    if (fileNhac) {
      const url = URL.createObjectURL(fileNhac);
      setAudioPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (linkAudioFallback) {
      setAudioPreviewUrl(linkAudioFallback);
    } else {
      setAudioPreviewUrl(null);
    }
  }, [fileNhac, linkAudioFallback]);

  useEffect(() => {
    if (!fileAnhBia) { setCoverPreviewUrl(null); return; }
    const url = URL.createObjectURL(fileAnhBia);
    setCoverPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [fileAnhBia]);

  if (!isOpen) return null;

  // Điền file âm thanh mẫu chất lượng cao để kiểm thử nhanh
  const dungAudioMau = () => {
    setFileNhac(null);
    setLinkAudioFallback('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3');
    if (!tieuDe) setTieuDe('Giai Điệu Mùa Thu');
    if (!ngheSi) setNgheSi(nguoiDung?.ho_ten || 'Trần Văn Thực');
    if (!album) setAlbum('Single 2026');
    setThongBaoLoi('');
  };

  // Đăng nhập nhanh ngay trong modal để không bị gián đoạn thao tác
  const handleDangNhapNhanh = (role: 'admin' | 'user') => {
    onOpenAuth?.(role === 'admin' ? 'dang_nhap_admin' : 'dang_nhap');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setThongBaoLoi('');
    setThongBaoThanhCong('');

    if (isKhach) {
      setThongBaoLoi('Bạn đang ở chế độ Khách. Vui lòng đăng nhập tài khoản trước khi đăng tải nhạc!');
      return;
    }

    if (!tieuDe.trim() || !ngheSi.trim()) {
      setThongBaoLoi('Vui lòng nhập tên bài hát và nghệ sĩ!');
      return;
    }

    if (!fileNhac && !linkAudioFallback) {
      setThongBaoLoi('Vui lòng chọn một file nhạc (.mp3, .wav, .ogg, .m4a) hoặc dùng file mẫu!');
      return;
    }

    setDangUpload(true);
    const formData = new FormData();
    formData.append('tieu_de', tieuDe.trim());
    formData.append('nghe_si', ngheSi.trim());
    formData.append('album', album.trim() || 'Đĩa đơn');
    formData.append('the_loai', theLoai);
    formData.append('loi_bai_hat', loiBaiHat.trim());

    if (fileNhac) {
      formData.append('file_nhac', fileNhac);
    } else {
      formData.append('file_url', linkAudioFallback);
    }

    if (fileAnhBia) {
      formData.append('anh_bia', fileAnhBia);
    }

    try {
      if (isQuanTriVien) {
        // Quản trị viên thêm bài hát -> Duyệt ngay lập tức
        await BaiHatAPI.adminThem(formData);
        setThongBaoThanhCong('Thành công! Bài hát đã được Quản trị viên duyệt và phát hành ngay lên Trang Chủ.');
      } else {
        // Người dùng upload bài hát -> Chờ Quản trị viên duyệt
        const res = await BaiHatAPI.nguoiDungUpload(formData);
        setThongBaoThanhCong(res.thong_bao || 'Đã tải lên thành công! Bài hát đã được đưa vào hàng chờ Quản trị viên phê duyệt.');
      }

      if (onUploadSuccess) onUploadSuccess();

      // Đóng modal sau 1.8 giây
      setTimeout(() => {
        onClose();
        setTieuDe('');
        setFileNhac(null);
        setFileAnhBia(null);
        setLinkAudioFallback('');
        setThongBaoThanhCong('');
        setThongBaoLoi('');
      }, 1800);
    } catch (err: any) {
      setThongBaoLoi(err.message || 'Có lỗi xảy ra khi tải bài hát lên hệ thống!');
    } finally {
      setDangUpload(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/35 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`bg-zinc-50 border rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 ${
        isQuanTriVien ? 'border-rose-200/60 shadow-rose-200/40' : 'border-zinc-200'
      }`}>
        {/* Header Modal */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isQuanTriVien ? 'border-rose-200/50 bg-rose-50/20' : 'border-zinc-200 bg-white/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              isQuanTriVien ? 'bg-rose-500/20 text-rose-700' : 'bg-emerald-500/20 text-emerald-700'
            }`}>
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                {isQuanTriVien ? 'Thêm Bài Hát Mới (Quản Trị)' : 'Đăng Tải Bài Hát'}
                {isQuanTriVien && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                    Duyệt Ngay
                  </span>
                )}
                {isNguoiDung && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 border border-amber-500/30">
                    Chờ Duyệt
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-600 mt-0.5">
                {isQuanTriVien
                  ? 'Bài hát của Admin được phát hành trực tiếp ra Trang Chủ'
                  : isNguoiDung
                  ? `Tài khoản: ${nguoiDung?.ho_ten} (@${nguoiDung?.username})`
                  : 'Yêu cầu đăng nhập tài khoản trước khi tải lên'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-600 hover:text-zinc-900 rounded-full hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Khối Cảnh Báo & Đăng Nhập Nhanh Cho Khách Vãng Lai */}
        {isKhach && (
          <div className="m-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-amber-700">
                  Bạn đang ở chế độ Khách vãng lai
                </h4>
                <p className="text-[11px] text-zinc-700 mt-1 leading-relaxed">
                  Để bảo đảm quyền tác giả và quản lý kiểm duyệt, bạn cần đăng nhập tài khoản để đăng tải bài hát.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={dangDangNhapNhanh}
                    onClick={() => handleDangNhapNhanh('user')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Đăng nhập User (thuctran)</span>
                  </button>
                  <button
                    type="button"
                    disabled={dangDangNhapNhanh}
                    onClick={() => handleDangNhapNhanh('admin')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Đăng nhập Admin (admin)</span>
                  </button>
                  {onOpenAuth && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAuth('dang_nhap');
                      }}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                    >
                      Mở form đăng nhập
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thông Báo Thành Công / Lỗi */}
        {thongBaoThanhCong && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{thongBaoThanhCong}</span>
          </div>
        )}
        {thongBaoLoi && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{thongBaoLoi}</span>
          </div>
        )}

        {/* Form Nhập Dữ Liệu */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 scrollbar-thin scrollbar-thumb-zinc-300">
          {/* Tên Bài Hát & Nghệ Sĩ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Tên bài hát <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={tieuDe}
                onChange={(e) => setTieuDe(e.target.value)}
                placeholder="VD: Cơn Mưa Ngang Qua..."
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Nghệ sĩ / Ca sĩ thể hiện <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ngheSi}
                onChange={(e) => setNgheSi(e.target.value)}
                placeholder="VD: Sơn Tùng, Vũ, Cover..."
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Thể Loại & Album */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Thể loại âm nhạc
              </label>
              <select
                value={theLoai}
                onChange={(e) => setTheLoai(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {theLoaiList.map(tl => (
                  <option key={tl._id} value={tl.ten_the_loai}>
                    {tl.ten_the_loai}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Album (Tùy chọn)
              </label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="VD: Đĩa đơn, Album Mùa Thu..."
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Chọn File Nhạc MP3 & Nghe Thử Trực Tiếp */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700">
                File Nhạc (.mp3, .wav, .ogg, .m4a) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={dungAudioMau}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                Dùng file âm thanh mẫu
              </button>
            </div>

            <div className="border border-dashed border-zinc-300 hover:border-emerald-500/80 rounded-2xl p-4 bg-white/60 text-center transition-colors relative">
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileNhac(e.target.files[0]);
                    setLinkAudioFallback('');
                    setThongBaoLoi('');
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <Music className="w-7 h-7 text-emerald-600 mx-auto mb-1.5" />
              {fileNhac ? (
                <div>
                  <p className="text-xs font-bold text-emerald-700 truncate">
                    Đã chọn: {fileNhac.name} ({(fileNhac.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">Nhấp để đổi file khác</p>
                </div>
              ) : linkAudioFallback ? (
                <div>
                  <p className="text-xs font-bold text-amber-700">
                    Đang dùng: File âm thanh mẫu thử nghiệm (.mp3)
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">Nhấp để tải file riêng của bạn</p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-medium text-zinc-800">
                    Nhấp hoặc kéo thả file nhạc (.mp3, .wav, .m4a) từ máy tính vào đây
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">Hỗ trợ tối đa 50MB</p>
                </>
              )}
            </div>

            {/* Trình Nghe Thử Âm Thanh Trước Khi Bấm Upload */}
            {audioPreviewUrl && (
              <div className="mt-2.5 p-3 rounded-xl bg-white border border-emerald-200/40 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe thử file âm thanh trước khi đăng:</span>
                </div>
                <audio
                  controls
                  src={audioPreviewUrl}
                  className="w-full h-8 rounded-lg accent-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Chọn Ảnh Bìa */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Ảnh bìa bài hát (Tùy chọn)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-white border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
                {fileAnhBia ? (
                  <img
                    src={coverPreviewUrl || undefined}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-zinc-400" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFileAnhBia(e.target.files[0]);
                    }
                  }}
                  className="text-xs text-zinc-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-800 hover:file:bg-zinc-200 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-500 mt-1">Hỗ trợ JPG, PNG, WEBP</p>
              </div>
            </div>
          </div>

          {/* Lời Bài Hát */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Lời bài hát (Lyrics)
            </label>
            <textarea
              rows={3}
              value={loiBaiHat}
              onChange={(e) => setLoiBaiHat(e.target.value)}
              placeholder="Nhập lời bài hát tại đây..."
              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Nút Submit Hoàn Tất */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={dangUpload || isKhach}
              className={`w-full py-3 text-sm font-bold rounded-xl text-white transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isQuanTriVien
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-200/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200/50'
              }`}
            >
              {dangUpload
                ? 'Đang xử lý và tải lên file nhạc...'
                : isKhach
                ? 'Vui lòng đăng nhập trước khi tải lên'
                : isQuanTriVien
                ? 'Thêm & Phát Hành Lên Trang Chủ Ngay'
                : 'Đăng Tải Bài Hát (Chờ Duyệt)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
