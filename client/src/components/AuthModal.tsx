/**
 * @file AuthModal.tsx
 * @description Modal Đăng Nhập / Đăng Ký Tài Khoản
 * Người dùng tự nhập tài khoản (admin hoặc user), hệ thống tự động nhận diện phân quyền chính xác.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { X, LogIn, UserPlus, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'dang_nhap' | 'dang_ky' | 'dang_nhap_admin';
  onLoginSuccess?: (vaiTro: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'dang_nhap',
  onLoginSuccess
}) => {
  const { dangNhap, dangKy } = useAuth();
  const [cheDo, setCheDo] = useState<'dang_nhap' | 'dang_ky'>('dang_nhap');
  const [loi, setLoi] = useState<string>('');
  const [dangXuLy, setDangXuLy] = useState<boolean>(false);

  // Form đăng nhập
  const [identifier, setIdentifier] = useState('');
  const [matKhau, setMatKhau] = useState('');

  // Form đăng ký
  const [dkUsername, setDkUsername] = useState('');
  const [dkEmail, setDkEmail] = useState('');
  const [dkPassword, setDkPassword] = useState('');
  const [dkHoTen, setDkHoTen] = useState('');

  useEffect(() => {
    if (defaultMode === 'dang_ky') {
      setCheDo('dang_ky');
    } else {
      setCheDo('dang_nhap');
    }
    setLoi('');
  }, [defaultMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmitDangNhap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoi('');
    setDangXuLy(true);
    try {
      const user = await dangNhap({ identifier: identifier.trim(), password: matKhau });
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess(user.vai_tro);
      }
    } catch (err: any) {
      setLoi(err.message || 'Đăng nhập thất bại! Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.');
    } finally {
      setDangXuLy(false);
    }
  };

  const handleSubmitDangKy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoi('');
    setDangXuLy(true);
    try {
      await dangKy({
        username: dkUsername.trim(),
        email: dkEmail.trim(),
        password: dkPassword,
        ho_ten: dkHoTen.trim()
      });
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess('nguoi_dung');
      }
    } catch (err: any) {
      setLoi(err.message || 'Đăng ký không thành công!');
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Đăng nhập hoặc đăng ký" className="fixed inset-0 z-[70] bg-zinc-900/35 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-50 border border-zinc-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-zinc-200">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              {cheDo === 'dang_nhap' ? (
                <>
                  <LogIn className="w-5 h-5 text-emerald-600" />
                  <span>Đăng Nhập SoundWave</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                  <span>Tạo Tài Khoản Mới</span>
                </>
              )}
            </h3>
            <p className="text-xs text-zinc-600 mt-0.5">
              {cheDo === 'dang_nhap'
                ? 'Đăng nhập để nghe nhạc, tải bài hát, tạo playlist và quản trị'
                : 'Tham gia cộng đồng âm nhạc trực tuyến SoundWave'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-600 hover:text-zinc-900 rounded-full hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Tab Chuẩn: Đăng Nhập & Đăng Ký */}
        <div className="grid grid-cols-2 p-1.5 bg-white/60 m-6 mb-4 rounded-xl border border-zinc-200">
          <button
            type="button"
            onClick={() => { setCheDo('dang_nhap'); setLoi(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
              cheDo === 'dang_nhap'
                ? 'bg-zinc-100 text-zinc-900 shadow'
                : 'text-zinc-600 hover:text-zinc-800'
            }`}
          >
            Đăng Nhập
          </button>

          <button
            type="button"
            onClick={() => { setCheDo('dang_ky'); setLoi(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
              cheDo === 'dang_ky'
                ? 'bg-zinc-100 text-zinc-900 shadow'
                : 'text-zinc-600 hover:text-zinc-800'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Thông Báo Lỗi Nếu Có */}
        {loi && (
          <div className="mx-6 mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{loi}</span>
          </div>
        )}

        {/* Form Đăng Nhập */}
        {cheDo === 'dang_nhap' ? (
          <form onSubmit={handleSubmitDangNhap} className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Tên đăng nhập hoặc Email
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Nhập tên đăng nhập hoặc email..."
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={dangXuLy}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-200/50 cursor-pointer disabled:opacity-50"
            >
              {dangXuLy ? 'Đang xác thực hệ thống...' : 'Đăng Nhập'}
            </button>
          </form>
        ) : (
          /* Form Đăng Ký */
          <form onSubmit={handleSubmitDangKy} className="px-6 pb-6 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Tên đăng nhập (Username) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={dkUsername}
                onChange={(e) => setDkUsername(e.target.value)}
                placeholder="VD: minhhoang99"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Họ và tên hiển thị <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={dkHoTen}
                onChange={(e) => setDkHoTen(e.target.value)}
                placeholder="VD: Minh Hoàng"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Địa chỉ Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={dkEmail}
                onChange={(e) => setDkEmail(e.target.value)}
                placeholder="VD: email@example.com"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Mật khẩu (tối thiểu 6 ký tự) <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={dkPassword}
                onChange={(e) => setDkPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={dangXuLy}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-200/50 cursor-pointer disabled:opacity-50 mt-2"
            >
              {dangXuLy ? 'Đang tạo tài khoản...' : 'Hoàn Tất Đăng Ký'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
