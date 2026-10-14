/**
 * @file api.ts
 * @description Tầng Dịch Vụ API Frontend - Gọi các Endpoint của Backend NodeJS
 * Tự động đính kèm Token trong Header Authorization cho người dùng đã đăng nhập
 */

import {
  NguoiDung,
  BaiHat,
  NgheSi,
  Album,
  TheLoai,
  Playlist,
  LichSuNghe,
  ThongKeHeThong
} from '../types/index.ts';

const API_BASE = '/api';

// Hàm lấy token từ bộ nhớ trình duyệt
export function layToken(): string | null {
  return localStorage.getItem('soundwave_token') || localStorage.getItem('soundcloud_token') || localStorage.getItem('zingsound_token');
}

// Hàm lưu token
export function luuToken(token: string) {
  localStorage.setItem('soundwave_token', token);
  localStorage.setItem('soundcloud_token', token);
  localStorage.setItem('zingsound_token', token);
}

// Hàm xóa token
export function xoaToken() {
  localStorage.removeItem('soundwave_token');
  localStorage.removeItem('soundcloud_token');
  localStorage.removeItem('zingsound_token');
}

// Hàm gửi request bọc fetch có xử lý Token và Báo lỗi rõ ràng
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = layToken();
  const headers = new Headers(options.headers || {});

  // Nếu gửi dữ liệu dạng JSON thì đặt Content-Type
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Đính kèm token xác thực nếu có
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Máy chủ không trả JSON cho API (' + response.status + '). Hãy chạy npm run dev tại cổng backend.');
  }
  const data = await response.json();

  if (!response.ok || data.thanh_cong === false) {
    throw new Error(data.thong_bao || 'Đã có lỗi xảy ra khi kết nối máy chủ!');
  }

  if (options.method && options.method !== 'GET') {
    // Recording playback must not replace every visible song list.
    if (endpoint === '/lich-su/ghi-nhan') {
      window.dispatchEvent(new CustomEvent('soundwave:history-changed', { detail: endpoint }));
    } else if (!endpoint.startsWith('/bai-hat/luot-nghe/') && !endpoint.startsWith('/xac-thuc/')) {
      window.dispatchEvent(new CustomEvent('soundwave:data-changed', { detail: endpoint }));
    }
  }
  return data;
}

// ======================= API XÁC THỰC =======================
export const AuthAPI = {
  // Đăng ký tài khoản mới
  async dangKy(thongTin: { username: string; email: string; password: string; ho_ten?: string }) {
    const res = await apiRequest<{ du_lieu: { nguoiDung: NguoiDung; token: string } }>('/xac-thuc/dang-ky', {
      method: 'POST',
      body: JSON.stringify(thongTin)
    });
    luuToken(res.du_lieu.token);
    return res.du_lieu;
  },

  // Đăng nhập
  async dangNhap(thongTin: { identifier: string; password: string }) {
    const res = await apiRequest<{ du_lieu: { nguoiDung: NguoiDung; token: string } }>('/xac-thuc/dang-nhap', {
      method: 'POST',
      body: JSON.stringify(thongTin)
    });
    luuToken(res.du_lieu.token);
    return res.du_lieu;
  },

  // Lấy hồ sơ tài khoản hiện tại
  async layHoSo(): Promise<NguoiDung> {
    const res = await apiRequest<{ du_lieu: NguoiDung }>('/xac-thuc/ho-so');
    return res.du_lieu;
  },

  // Cập nhật hồ sơ
  async capNhatHoSo(duLieu: { ho_ten?: string; avatar?: string; tieu_su?: string }): Promise<NguoiDung> {
    const res = await apiRequest<{ du_lieu: NguoiDung }>('/xac-thuc/ho-so', {
      method: 'PUT',
      body: JSON.stringify(duLieu)
    });
    return res.du_lieu;
  },

  // Đổi mật khẩu
  async doiMatKhau(mat_khau_cu: string, mat_khau_moi: string) {
    const res = await apiRequest<{ thong_bao: string; token: string }>('/xac-thuc/doi-mat-khau', {
      method: 'PUT',
      body: JSON.stringify({ mat_khau_cu, mat_khau_moi })
    });
    luuToken(res.token);
    return res;
  }
};

// ======================= API BÀI HÁT =======================
export const BaiHatAPI = {
  // Lấy danh sách bài hát công khai đã duyệt
  async layDanhSach(params: { the_loai?: string; nghe_si?: string; sap_xep?: string } = {}): Promise<BaiHat[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await apiRequest<{ du_lieu: BaiHat[] }>(`/bai-hat?${query}`);
    return res.du_lieu;
  },

  // Tìm kiếm bài hát
  async timKiem(params: { q?: string; the_loai?: string; sap_xep?: string } = {}): Promise<BaiHat[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await apiRequest<{ du_lieu: BaiHat[] }>(`/bai-hat/tim-kiem?${query}`);
    return res.du_lieu;
  },

  // Lấy chi tiết bài hát & phát nhạc
  async layChiTiet(id: string): Promise<BaiHat> {
    const res = await apiRequest<{ du_lieu: BaiHat }>(`/bai-hat/chi-tiet/${id}`);
    return res.du_lieu;
  },

  async ghiNhanLuotNghe(id: string) {
    return await apiRequest('/bai-hat/luot-nghe/' + id, { method: 'POST' });
  },

  // Người dùng tải lên bài hát (Chờ Quản trị viên duyệt)
  async nguoiDungUpload(formData: FormData) {
    return await apiRequest<{ thanh_cong: boolean; thong_bao: string; bai_hat: BaiHat }>('/bai-hat/upload', {
      method: 'POST',
      body: formData
    });
  },

  // Người dùng xem các bài hát mình đã upload
  async layBaiHatCuaToi(): Promise<BaiHat[]> {
    const res = await apiRequest<{ du_lieu: BaiHat[] }>('/bai-hat/cua-toi');
    return res.du_lieu;
  },

  // Người dùng xóa bài hát do chính mình tải lên
  async nguoiDungXoa(id: string) {
    return await apiRequest<{ thanh_cong: boolean; thong_bao: string }>(`/bai-hat/cua-toi/${id}`, {
      method: 'DELETE'
    });
  },

  // Admin xem toàn bộ bài hát hệ thống
  async adminLayTatCa(trang_thai?: string): Promise<BaiHat[]> {
    const query = trang_thai ? `?trang_thai=${trang_thai}` : '';
    const res = await apiRequest<{ du_lieu: BaiHat[] }>(`/bai-hat/admin/tat-ca${query}`);
    return res.du_lieu;
  },

  // Admin thêm bài hát (Duyệt ngay)
  async adminThem(formData: FormData): Promise<BaiHat> {
    const res = await apiRequest<{ du_lieu: BaiHat }>('/bai-hat/admin/them', {
      method: 'POST',
      body: formData
    });
    return res.du_lieu;
  },

  // Admin duyệt hoặc từ chối bài hát
  async adminPheDuyet(id: string, trang_thai: 'da_duyet' | 'tu_choi', ly_do_tu_choi?: string): Promise<BaiHat> {
    const res = await apiRequest<{ du_lieu: BaiHat }>(`/bai-hat/admin/duyet/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ trang_thai, ly_do_tu_choi })
    });
    return res.du_lieu;
  },

  // Admin sửa bài hát
  async adminSua(id: string, formData: FormData): Promise<BaiHat> {
    const res = await apiRequest<{ du_lieu: BaiHat }>(`/bai-hat/admin/sua/${id}`, {
      method: 'PUT',
      body: formData
    });
    return res.du_lieu;
  },

  // Admin xóa bài hát
  async adminXoa(id: string) {
    return await apiRequest<{ thanh_cong: boolean; thong_bao: string }>(`/bai-hat/admin/xoa/${id}`, {
      method: 'DELETE'
    });
  }
};

// ======================= API NGHỆ SĨ =======================
export const NgheSiAPI = {
  async layTatCa(): Promise<NgheSi[]> {
    const res = await apiRequest<{ du_lieu: NgheSi[] }>('/nghe-si');
    return res.du_lieu;
  },

  async layChiTiet(id: string): Promise<{ nghe_si: NgheSi; bai_hat: BaiHat[] }> {
    const res = await apiRequest<{ du_lieu: { nghe_si: NgheSi; bai_hat: BaiHat[] } }>(`/nghe-si/${id}`);
    return res.du_lieu;
  },

  async adminThem(formData: FormData): Promise<NgheSi> {
    const res = await apiRequest<{ du_lieu: NgheSi }>('/nghe-si', {
      method: 'POST',
      body: formData
    });
    return res.du_lieu;
  },

  async adminCapNhat(id: string, formData: FormData): Promise<NgheSi> {
    const res = await apiRequest<{ du_lieu: NgheSi }>(`/nghe-si/${id}`, {
      method: 'PUT',
      body: formData
    });
    return res.du_lieu;
  },

  async adminXoa(id: string) {
    return await apiRequest<{ thanh_cong: boolean; thong_bao: string }>(`/nghe-si/${id}`, {
      method: 'DELETE'
    });
  }
};

// ======================= API ALBUM =======================
export const AlbumAPI = {
  async layTatCa(): Promise<Album[]> {
    const res = await apiRequest<{ du_lieu: Album[] }>('/album');
    return res.du_lieu;
  },

  async layChiTiet(id: string): Promise<{ album: Album; bai_hat: BaiHat[] }> {
    const res = await apiRequest<{ du_lieu: { album: Album; bai_hat: BaiHat[] } }>(`/album/${id}`);
    return res.du_lieu;
  },

  async adminThem(formData: FormData): Promise<Album> {
    const res = await apiRequest<{ du_lieu: Album }>('/album', {
      method: 'POST',
      body: formData
    });
    return res.du_lieu;
  },

  async adminCapNhat(id: string, formData: FormData): Promise<Album> {
    const res = await apiRequest<{ du_lieu: Album }>(`/album/${id}`, {
      method: 'PUT',
      body: formData
    });
    return res.du_lieu;
  },

  async adminXoa(id: string) {
    return await apiRequest<{ thanh_cong: boolean; thong_bao: string }>(`/album/${id}`, {
      method: 'DELETE'
    });
  }
};

// ======================= API THỂ LOẠI =======================
export const TheLoaiAPI = {
  async layTatCa(): Promise<TheLoai[]> {
    const res = await apiRequest<{ du_lieu: TheLoai[] }>('/the-loai');
    return res.du_lieu;
  },

  async layChiTiet(idOrName: string): Promise<{ the_loai: TheLoai; bai_hat: BaiHat[] }> {
    const res = await apiRequest<{ du_lieu: { the_loai: TheLoai; bai_hat: BaiHat[] } }>(`/the-loai/${encodeURIComponent(idOrName)}`);
    return res.du_lieu;
  },

  async adminThem(formData: FormData): Promise<TheLoai> {
    const res = await apiRequest<{ du_lieu: TheLoai }>('/the-loai', {
      method: 'POST',
      body: formData
    });
    return res.du_lieu;
  },

  async adminCapNhat(id: string, formData: FormData): Promise<TheLoai> {
    const res = await apiRequest<{ du_lieu: TheLoai }>(`/the-loai/${id}`, {
      method: 'PUT',
      body: formData
    });
    return res.du_lieu;
  },

  async adminXoa(id: string) {
    return await apiRequest<{ thanh_cong: boolean; thong_bao: string }>(`/the-loai/${id}`, {
      method: 'DELETE'
    });
  }
};

// ======================= API PLAYLIST =======================
export const PlaylistAPI = {
  async layCuaToi(): Promise<Playlist[]> {
    const res = await apiRequest<{ du_lieu: Playlist[] }>('/playlist/cua-toi');
    return res.du_lieu;
  },

  async layChiTiet(id: string): Promise<{ playlist: Playlist; bai_hat: BaiHat[] }> {
    const res = await apiRequest<{ du_lieu: { playlist: Playlist; bai_hat: BaiHat[] } }>(`/playlist/chi-tiet/${id}`);
    return res.du_lieu;
  },

  async taoMoi(thongTin: { ten_playlist: string; mo_ta?: string; anh_bia?: string }): Promise<Playlist> {
    const res = await apiRequest<{ du_lieu: Playlist }>('/playlist/tao-moi', {
      method: 'POST',
      body: JSON.stringify(thongTin)
    });
    return res.du_lieu;
  },

  async themBaiHat(playlistId: string, bai_hat_id: string) {
    return await apiRequest<{ thanh_cong: boolean; thong_bao: string }>(`/playlist/${playlistId}/them-bai-hat`, {
      method: 'POST',
      body: JSON.stringify({ bai_hat_id })
    });
  },

  async xoaBaiHat(playlistId: string, baiHatId: string) {
    return await apiRequest<{ thanh_cong: boolean; thong_bao: string }>(`/playlist/${playlistId}/xoa-bai-hat/${baiHatId}`, {
      method: 'DELETE'
    });
  },

  async capNhat(playlistId: string, data: { ten_playlist?: string; mo_ta?: string; anh_bia?: string }): Promise<Playlist> {
    const res = await apiRequest<{ du_lieu: Playlist }>('/playlist/' + playlistId, {
      method: 'PUT', body: JSON.stringify(data)
    });
    return res.du_lieu;
  },

  async xoaPlaylist(playlistId: string) {
    return await apiRequest<{ thanh_cong: boolean; thong_bao: string }>(`/playlist/${playlistId}`, {
      method: 'DELETE'
    });
  }
};

// ======================= API YÊU THÍCH =======================
export const YeuThichAPI = {
  async toggle(bai_hat_id: string): Promise<{ da_thich: boolean; thong_bao: string }> {
    return await apiRequest<{ da_thich: boolean; thong_bao: string }>('/yeu-thich/toggle', {
      method: 'POST',
      body: JSON.stringify({ bai_hat_id })
    });
  },

  async layDanhSachId(): Promise<string[]> {
    const res = await apiRequest<{ du_lieu: string[] }>('/yeu-thich/danh-sach-id');
    return res.du_lieu;
  },

  async layDanhSachDayDu(): Promise<BaiHat[]> {
    const res = await apiRequest<{ du_lieu: BaiHat[] }>('/yeu-thich');
    return res.du_lieu;
  }
};

// ======================= API LỊCH SỬ NGHE =======================
export const LichSuAPI = {
  async ghiNhan(bai_hat_id: string) {
    return await apiRequest('/lich-su/ghi-nhan', {
      method: 'POST', body: JSON.stringify({ bai_hat_id })
    });
  },

  async layDanhSach(): Promise<LichSuNghe[]> {
    const res = await apiRequest<{ du_lieu: LichSuNghe[] }>('/lich-su');
    return res.du_lieu;
  },

  async xoaMot(id: string) {
    return await apiRequest<{ thanh_cong: boolean; thong_bao: string }>(`/lich-su/${id}`, {
      method: 'DELETE'
    });
  },

  async xoaTatCa() {
    return await apiRequest<{ thanh_cong: boolean; thong_bao: string }>('/lich-su/xoa-tat-ca', {
      method: 'DELETE'
    });
  }
};

// ======================= API QUẢN TRỊ VIÊN =======================
export const QuanTriAPI = {
  async layThongKe(): Promise<ThongKeHeThong> {
    const res = await apiRequest<{ du_lieu: ThongKeHeThong }>('/quan-tri/thong-ke');
    return res.du_lieu;
  },

  async layTatCaNguoiDung(): Promise<NguoiDung[]> {
    const res = await apiRequest<{ du_lieu: NguoiDung[] }>('/quan-tri/nguoi-dung');
    return res.du_lieu;
  },

  async khoaHoacMoKhoa(userId: string, trang_thai: 'hoat_dong' | 'bi_khoa'): Promise<NguoiDung> {
    const res = await apiRequest<{ du_lieu: NguoiDung }>(`/quan-tri/nguoi-dung/${userId}/khoa`, {
      method: 'PUT',
      body: JSON.stringify({ trang_thai })
    });
    return res.du_lieu;
  },

  async thayDoiVaiTro(userId: string, vai_tro: 'nguoi_dung' | 'quan_tri_vien'): Promise<NguoiDung> {
    const res = await apiRequest<{ du_lieu: NguoiDung }>(`/quan-tri/nguoi-dung/${userId}/vai-tro`, {
      method: 'PUT',
      body: JSON.stringify({ vai_tro })
    });
    return res.du_lieu;
  },

  async xoaNguoiDung(userId: string) {
    return await apiRequest<{ thanh_cong: boolean; thong_bao: string }>(`/quan-tri/nguoi-dung/${userId}`, {
      method: 'DELETE'
    });
  }
};
