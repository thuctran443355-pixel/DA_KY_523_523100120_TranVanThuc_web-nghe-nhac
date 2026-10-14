/**
 * @file index.ts
 * @description Định nghĩa các kiểu dữ liệu TypeScript cho toàn bộ giao diện Frontend
 * Giúp người mới bắt đầu lập trình dễ dàng nắm bắt cấu trúc của từng đối tượng
 */

// Kiểu người dùng
export interface NguoiDung {
  _id: string;
  username: string;
  email: string;
  ho_ten: string;
  vai_tro: 'khach' | 'nguoi_dung' | 'quan_tri_vien';
  avatar?: string;
  tieu_su?: string;
  trang_thai: 'hoat_dong' | 'bi_khoa';
  ngay_tao?: string;
}

// Kiểu bài hát
export interface BaiHat {
  _id: string;
  tieu_de: string;
  nghe_si: string;
  album?: string;
  the_loai: string;
  file_url: string;
  anh_bia?: string;
  thoi_luong?: number;
  luot_nghe?: number;
  trang_thai: 'cho_duyet' | 'da_duyet' | 'tu_choi';
  nguoi_dang_id: string;
  loi_bai_hat?: string;
  ly_do_tu_choi?: string;
  ngay_tao?: string;
  nguoi_dang?: {
    _id: string;
    ho_ten: string;
    avatar?: string;
    vai_tro: string;
  };
}

// Kiểu nghệ sĩ
export interface NgheSi {
  _id: string;
  ten: string;
  anh_dai_dien?: string;
  tieu_su?: string;
  the_loai_chinh?: string;
  ngay_tao?: string;
}

// Kiểu album
export interface Album {
  _id: string;
  ten_album: string;
  nghe_si: string;
  anh_bia?: string;
  nam_phat_hanh?: number;
  mo_ta?: string;
  danh_sach_bai_hat?: string[];
  ngay_tao?: string;
}

// Kiểu thể loại âm nhạc
export interface TheLoai {
  _id: string;
  ten_the_loai: string;
  mo_ta?: string;
  anh_the_loai?: string;
  mau_sac?: string;
}

// Kiểu danh sách phát (Playlist)
export interface Playlist {
  _id: string;
  ten_playlist: string;
  nguoi_dung_id: string;
  mo_ta?: string;
  anh_bia?: string;
  danh_sach_bai_hat: string[];
  cong_khai?: boolean;
  ngay_tao?: string;
}

// Kiểu lịch sử nghe nhạc
export interface LichSuNghe {
  _id: string;
  thoi_gian_nghe: string;
  so_lan_nghe: number;
  bai_hat: BaiHat;
}

// Kiểu thống kê hệ thống (dành cho Admin)
export interface ThongKeHeThong {
  tong_so_bai_hat: number;
  so_bai_cho_duyet: number;
  so_bai_da_duyet: number;
  so_bai_tu_choi: number;
  tong_luot_nghe: number;
  tong_so_nguoi_dung: number;
  so_quan_tri_vien: number;
  so_nguoi_dung_thuong: number;
  so_tai_khoan_bi_khoa: number;
  tong_so_playlist: number;
  tong_so_nghe_si: number;
  tong_so_album: number;
  thong_ke_the_loai: Array<{
    ten_the_loai: string;
    so_bai_hat: number;
    luot_nghe: number;
    mau_sac?: string;
  }>;
  top_bai_hat: BaiHat[];
}
