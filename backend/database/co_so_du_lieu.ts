/**
 * @file co_so_du_lieu.ts
 * @description Tầng Quản Lý Dữ Liệu (Mô phỏng MongoDB / Mongoose cho người mới bắt đầu)
 * Hỗ trợ lưu trữ bền vững vào file JSON (không lo lỗi thiếu dịch vụ MongoDB bên ngoài).
 * Cung cấp các hàm chuẩn giống hệt MongoDB: find(), findById(), create(), findByIdAndUpdate(), findByIdAndDelete().
 * Lưu trữ JSON trên máy chủ; không có kết nối MongoDB.
 */

import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../config.ts';

// Đường dẫn lưu trữ file dữ liệu JSON trong thư mục backend/database/data
const DB_FILE = path.join(DATA_DIR, 'du_lieu_nhac.json');

// Đảm bảo thư mục lưu trữ dữ liệu luôn tồn tại
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Định dạng cấu trúc dữ liệu toàn bộ hệ thống
export interface DuLieuHeThong {
  nguoi_dung: any[];
  bai_hat: any[];
  nghe_si: any[];
  album: any[];
  the_loai: any[];
  playlist: any[];
  lich_su: any[];
  yeu_thich: any[];
}

// Dữ liệu khởi tạo ban đầu phong phú và chuẩn chỉnh
const DU_LIEU_MAC_DINH: DuLieuHeThong = {
  nguoi_dung: [
    {
      _id: 'nd_admin_01',
      username: 'admin',
      email: 'admin@music.vn',
      // Mật khẩu mẫu: admin123 (đã mã hóa hoặc kiểm tra qua bcrypt)
      password: '$2a$10$w099k769YqD.y9pT8w4kbe22b5kZ0fN/VqK6vV9lGfLqm2Vb/n6u6', // bcrypt của "admin123"
      ho_ten: 'Quản Trị Viên Hệ Thống',
      vai_tro: 'quan_tri_vien', // 3 đối tượng: khach, nguoi_dung, quan_tri_vien
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      tieu_su: 'Quản trị viên cấp cao của SoundWave, phụ trách kiểm duyệt và phát triển âm nhạc.',
      trang_thai: 'hoat_dong', // 'hoat_dong' hoặc 'bi_khoa'
      ngay_tao: '2026-01-01T00:00:00.000Z'
    },
    {
      _id: 'nd_user_01',
      username: 'thuctran',
      email: 'user@music.vn',
      // Mật khẩu mẫu: user123
      password: '$2a$10$94X1qJz5R8sX6u0mN2j0XeWzYqH6mYlS7oV5x3/Xo8YjL1qM4pN4q', // bcrypt của "user123"
      ho_ten: 'Trần Văn Thực',
      vai_tro: 'nguoi_dung',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      tieu_su: 'Người yêu âm nhạc indie, ballad trữ tình và nhạc trẻ sôi động.',
      trang_thai: 'hoat_dong',
      ngay_tao: '2026-02-15T00:00:00.000Z'
    },
    {
      _id: 'nd_user_02',
      username: 'minhanh',
      email: 'minhanh@music.vn',
      password: '$2a$10$94X1qJz5R8sX6u0mN2j0XeWzYqH6mYlS7oV5x3/Xo8YjL1qM4pN4q',
      ho_ten: 'Lê Minh Anh',
      vai_tro: 'nguoi_dung',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      tieu_su: 'Thích khám phá những giai điệu acoustic mộc mạc và nhạc không lời.',
      trang_thai: 'hoat_dong',
      ngay_tao: '2026-03-01T00:00:00.000Z'
    }
  ],
  the_loai: [
    {
      _id: 'tl_01',
      ten_the_loai: 'V-Pop',
      mo_ta: 'Nhạc trẻ Việt Nam thịnh hành, giai điệu bắt tai và ca từ ý nghĩa.',
      anh_the_loai: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
      mau_sac: '#3b82f6'
    },
    {
      _id: 'tl_02',
      ten_the_loai: 'Ballad Trữ Tình',
      mo_ta: 'Những bản tình ca da diết, sâu lắng chạm đến trái tim người nghe.',
      anh_the_loai: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
      mau_sac: '#ec4899'
    },
    {
      _id: 'tl_03',
      ten_the_loai: 'Acoustic & Lo-Fi',
      mo_ta: 'Âm thanh mộc mạc, thư giãn cho những buổi chiều làm việc và học tập.',
      anh_the_loai: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
      mau_sac: '#10b981'
    },
    {
      _id: 'tl_04',
      ten_the_loai: 'EDM & Dance',
      mo_ta: 'Tiết tấu bùng nổ, năng lượng sôi động khuấy đảo mọi không gian tiệc tùng.',
      anh_the_loai: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=80',
      mau_sac: '#8b5cf6'
    },
    {
      _id: 'tl_05',
      ten_the_loai: 'Rap & Hip-Hop',
      mo_ta: 'Những giai điệu gieo vần độc đáo, phản ánh câu chuyện cuộc sống chân thực.',
      anh_the_loai: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
      mau_sac: '#f59e0b'
    }
  ],
  nghe_si: [
    {
      _id: 'ns_01',
      ten: 'Sơn Tùng M-TP',
      anh_dai_dien: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      tieu_su: 'Ca sĩ, nhạc sĩ hàng đầu Việt Nam với loạt bản hit quốc dân.',
      the_loai_chinh: 'V-Pop',
      ngay_tao: '2026-01-01T00:00:00.000Z'
    },
    {
      _id: 'ns_02',
      ten: 'Vũ.',
      anh_dai_dien: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      tieu_su: 'Hoàng tử Indie Việt Nam với chất giọng trầm ấm và phong cách mộc mạc.',
      the_loai_chinh: 'Acoustic & Lo-Fi',
      ngay_tao: '2026-01-05T00:00:00.000Z'
    },
    {
      _id: 'ns_03',
      ten: 'Hòa Minzy',
      anh_dai_dien: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      tieu_su: 'Nữ ca sĩ sở hữu giọng hát nội lực, truyền cảm và đầy cảm xúc.',
      the_loai_chinh: 'Ballad Trữ Tình',
      ngay_tao: '2026-01-10T00:00:00.000Z'
    },
    {
      _id: 'ns_04',
      ten: 'Đen Vâu',
      anh_dai_dien: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      tieu_su: 'Rapper tài năng với ca từ mộc mạc, triết lý sống gần gũi và sâu sắc.',
      the_loai_chinh: 'Rap & Hip-Hop',
      ngay_tao: '2026-01-15T00:00:00.000Z'
    }
  ],
  album: [
    {
      _id: 'ab_01',
      ten_album: 'Một Vạn Năm',
      nghe_si: 'Vũ.',
      anh_bia: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
      nam_phat_hanh: 2023,
      mo_ta: 'Album phòng thu thứ hai ghi dấu những chiêm nghiệm trưởng thành trong âm nhạc.',
      danh_sach_bai_hat: ['bh_01', 'bh_02'],
      ngay_tao: '2026-01-05T00:00:00.000Z'
    },
    {
      _id: 'ab_02',
      ten_album: 'Chúng Ta Của Hiện Tại',
      nghe_si: 'Sơn Tùng M-TP',
      anh_bia: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&auto=format&fit=crop&q=80',
      nam_phat_hanh: 2024,
      mo_ta: 'Giai điệu hoài niệm phong cách thập niên 90 kết hợp R&B hiện đại.',
      danh_sach_bai_hat: ['bh_03'],
      ngay_tao: '2026-01-06T00:00:00.000Z'
    },
    {
      _id: 'ab_03',
      ten_album: 'Thị Mầu Trẩy Hội',
      nghe_si: 'Hòa Minzy',
      anh_bia: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
      nam_phat_hanh: 2023,
      mo_ta: 'Sự kết hợp giữa chất liệu chèo dân gian và EDM hiện đại sôi động.',
      danh_sach_bai_hat: ['bh_04'],
      ngay_tao: '2026-01-07T00:00:00.000Z'
    }
  ],
  bai_hat: [
    {
      _id: 'bh_01',
      tieu_de: 'Bước Qua Mùa Cô Đơn',
      nghe_si: 'Vũ.',
      album: 'Một Vạn Năm',
      the_loai: 'Acoustic & Lo-Fi',
      // Link audio mẫu chất lượng cao có thể phát được trực tiếp
      file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      anh_bia: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
      thoi_luong: 284,
      luot_nghe: 1420,
      trang_thai: 'da_duyet', // Trạng thái: 'cho_duyet', 'da_duyet', 'tu_choi'
      nguoi_dang_id: 'nd_admin_01',
      loi_bai_hat: 'Mùa thu rơi vào em vào chiếc hôn nồng nàn\nCòn anh rơi vào giấc mơ dang dở\nMưa vẫn rơi trên từng con phố quen xưa...',
      ngay_tao: '2026-01-10T08:00:00.000Z'
    },
    {
      _id: 'bh_02',
      tieu_de: 'Lạ Lùng',
      nghe_si: 'Vũ.',
      album: 'Một Vạn Năm',
      the_loai: 'Ballad Trữ Tình',
      file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      anh_bia: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
      thoi_luong: 258,
      luot_nghe: 2350,
      trang_thai: 'da_duyet',
      nguoi_dang_id: 'nd_admin_01',
      loi_bai_hat: 'Kìa cơn mưa đưa em về đâu\nBầu trời sao rơi nghiêng nghiêng vào đôi mắt nâu\nNày người lạ ơi dừng chân ghé thăm...',
      ngay_tao: '2026-01-11T09:30:00.000Z'
    },
    {
      _id: 'bh_03',
      tieu_de: 'Chúng Ta Của Hiện Tại',
      nghe_si: 'Sơn Tùng M-TP',
      album: 'Chúng Ta Của Hiện Tại',
      the_loai: 'V-Pop',
      file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      anh_bia: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&auto=format&fit=crop&q=80',
      thoi_luong: 301,
      luot_nghe: 5890,
      trang_thai: 'da_duyet',
      nguoi_dang_id: 'nd_admin_01',
      loi_bai_hat: 'Mùa thu mang giấc mơ quay về\nVẫn nguyên vẹn như hôm nào\nĐiệp khúc ngọt ngào anh trao em ngày đầu tiên...',
      ngay_tao: '2026-01-15T10:00:00.000Z'
    },
    {
      _id: 'bh_04',
      tieu_de: 'Thị Mầu',
      nghe_si: 'Hòa Minzy',
      album: 'Thị Mầu Trẩy Hội',
      the_loai: 'EDM & Dance',
      file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      anh_bia: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
      thoi_luong: 236,
      luot_nghe: 3120,
      trang_thai: 'da_duyet',
      nguoi_dang_id: 'nd_admin_01',
      loi_bai_hat: 'Tự xưng em là Thị Mầu\nCon quan gấm vóc lụa là kiêu sa\nNhác trông thấy bóng thầy tiểu...',
      ngay_tao: '2026-01-20T14:15:00.000Z'
    },
    {
      _id: 'bh_05',
      tieu_de: 'Đi Về Nhà',
      nghe_si: 'Đen Vâu',
      album: 'Hành Trình Mới',
      the_loai: 'Rap & Hip-Hop',
      file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      anh_bia: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
      thoi_luong: 215,
      luot_nghe: 4500,
      trang_thai: 'da_duyet',
      nguoi_dang_id: 'nd_admin_01',
      loi_bai_hat: 'Đường về nhà là vào tim ta\nDẫu nắng mưa gian nan ngập tràn\nHạnh phúc đơn sơ là về bên mái ấm...',
      ngay_tao: '2026-01-25T11:00:00.000Z'
    },
    {
      _id: 'bh_06',
      tieu_de: 'Hoàng Hôn Sau Cửa Sổ (Demo Người Dùng Tải Lên)',
      nghe_si: 'Trần Văn Thực (Cover)',
      album: 'Đĩa Đơn Mới',
      the_loai: 'Ballad Trữ Tình',
      file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      anh_bia: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
      thoi_luong: 240,
      luot_nghe: 0,
      trang_thai: 'cho_duyet', // BÀI HÁT CHỜ QUẢN TRỊ VIÊN DUYỆT!
      nguoi_dang_id: 'nd_user_01',
      loi_bai_hat: 'Bài hát tự sáng tác và thu âm bằng guitar acoustic, hy vọng được ban quản trị phê duyệt!',
      ngay_tao: '2026-03-25T07:45:00.000Z'
    }
  ],
  playlist: [
    {
      _id: 'pl_01',
      ten_playlist: 'Giai Điệu Chill Buổi Chiều',
      nguoi_dung_id: 'nd_user_01',
      mo_ta: 'Tập hợp những bản tình ca mộc mạc và sâu lắng để thư giãn sau giờ làm việc.',
      anh_bia: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
      danh_sach_bai_hat: ['bh_01', 'bh_02', 'bh_03'],
      cong_khai: true,
      ngay_tao: '2026-03-10T12:00:00.000Z'
    },
    {
      _id: 'pl_02',
      ten_playlist: 'Top V-Pop Bắt Tai',
      nguoi_dung_id: 'nd_user_01',
      mo_ta: 'Những bản nhạc trẻ sôi động hot nhất trên các bảng xếp hạng.',
      anh_bia: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&auto=format&fit=crop&q=80',
      danh_sach_bai_hat: ['bh_03', 'bh_04'],
      cong_khai: true,
      ngay_tao: '2026-03-12T15:30:00.000Z'
    }
  ],
  lich_su: [
    {
      _id: 'ls_01',
      nguoi_dung_id: 'nd_user_01',
      bai_hat_id: 'bh_01',
      thoi_gian_nghe: '2026-03-28T02:10:00.000Z',
      so_lan_nghe: 12
    },
    {
      _id: 'ls_02',
      nguoi_dung_id: 'nd_user_01',
      bai_hat_id: 'bh_03',
      thoi_gian_nghe: '2026-03-27T19:40:00.000Z',
      so_lan_nghe: 8
    }
  ],
  yeu_thich: [
    {
      _id: 'yt_01',
      nguoi_dung_id: 'nd_user_01',
      bai_hat_id: 'bh_01',
      ngay_thich: '2026-03-20T10:00:00.000Z'
    },
    {
      _id: 'yt_02',
      nguoi_dung_id: 'nd_user_01',
      bai_hat_id: 'bh_02',
      ngay_thich: '2026-03-22T14:30:00.000Z'
    }
  ]
};

// Đọc toàn bộ dữ liệu từ file JSON. Nếu chưa có file thì tạo mới bằng dữ liệu mặc định.
function docDuLieu(): DuLieuHeThong {
  if (!fs.existsSync(DB_FILE)) ghiDuLieu(structuredClone(DU_LIEU_MAC_DINH));
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  for (const key of Object.keys(DU_LIEU_MAC_DINH)) {
    if (!Array.isArray(db[key])) throw new Error('CSDL không hợp lệ: ' + key + '. Không ghi đè dữ liệu hiện có.');
  }
  return db;
}
function ghiDuLieu(duLieu: DuLieuHeThong): void {
  const temporary = DB_FILE + '.tmp';
  fs.writeFileSync(temporary, JSON.stringify(duLieu, null, 2), 'utf8');
  fs.renameSync(temporary, DB_FILE);
}

/**
 * Lớp Bộ Sưu Tập (Collection) chuẩn MongoDB
 * Cung cấp các phương thức thao tác dữ liệu: find, findById, findOne, create, update, delete
 */
export class BoSuuTap<T extends Record<string, any> = any> {
  private tenBoSuuTap: keyof DuLieuHeThong;

  constructor(tenBoSuuTap: keyof DuLieuHeThong) {
    this.tenBoSuuTap = tenBoSuuTap;
  }

  // Lấy toàn bộ danh sách hoặc lọc theo điều kiện
  async find(dieuKien: Partial<T> = {}): Promise<T[]> {
    const db = docDuLieu();
    const items = (db[this.tenBoSuuTap] || []) as T[];
    return items.filter((item: any) => {
      for (const [key, value] of Object.entries(dieuKien)) {
        if (item[key] !== value) return false;
      }
      return true;
    });
  }

  // Tìm một bản ghi đầu tiên thỏa mãn điều kiện
  async findOne(dieuKien: Partial<T>): Promise<T | null> {
    const list = await this.find(dieuKien);
    return list.length > 0 ? list[0] : null;
  }

  // Tìm một bản ghi theo _id
  async findById(id: string): Promise<T | null> {
    const db = docDuLieu();
    const items = (db[this.tenBoSuuTap] || []) as any[];
    const item = items.find(it => it._id === id);
    return item ? (item as T) : null;
  }

  // Thêm một bản ghi mới (Tự sinh _id nếu chưa có)
  async create(duLieuMoi: any): Promise<T> {
    const db = docDuLieu();
    const items = (db[this.tenBoSuuTap] || []) as any[];
    
    const banGhiHoanChinh = {
      ...duLieuMoi,
      _id: duLieuMoi._id || `${this.tenBoSuuTap.slice(0, 2)}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ngay_tao: (duLieuMoi as any).ngay_tao || new Date().toISOString()
    } as any;

    items.push(banGhiHoanChinh);
    db[this.tenBoSuuTap] = items as any;
    ghiDuLieu(db);
    return banGhiHoanChinh as T;
  }

  // Cập nhật bản ghi theo _id
  async findByIdAndUpdate(id: string, duLieuCapNhat: Partial<T>): Promise<T | null> {
    const db = docDuLieu();
    const items = (db[this.tenBoSuuTap] || []) as any[];
    const index = items.findIndex(it => it._id === id);

    if (index === -1) return null;

    // Danh mục được liên kết bằng tên trong schema hiện tại.
    // Đổi tên và cập nhật liên kết trong cùng một lần ghi JSON.
    const renameFields: Record<string, [string, string]> = {
      nghe_si: ['ten', 'nghe_si'],
      album: ['ten_album', 'album'],
      the_loai: ['ten_the_loai', 'the_loai']
    };
    const rename = renameFields[this.tenBoSuuTap];
    if (rename) {
      const [sourceKey, songKey] = rename;
      const previous = items[index][sourceKey];
      const updated = (duLieuCapNhat as any)[sourceKey];
      if (typeof previous === 'string' && typeof updated === 'string' && previous !== updated) {
        for (const song of db.bai_hat) {
          if (typeof song[songKey] === 'string' && song[songKey].toLowerCase() === previous.toLowerCase()) song[songKey] = updated;
        }
        if (this.tenBoSuuTap === 'nghe_si') {
          for (const album of db.album) {
            if (album.nghe_si?.toLowerCase() === previous.toLowerCase()) album.nghe_si = updated;
          }
        }
        if (this.tenBoSuuTap === 'the_loai') {
          for (const artist of db.nghe_si) {
            if (artist.the_loai_chinh?.toLowerCase() === previous.toLowerCase()) artist.the_loai_chinh = updated;
          }
        }
      }
    }

    items[index] = {
      ...items[index],
      ...duLieuCapNhat,
      _id: items[index]._id,
      ngay_cap_nhat: new Date().toISOString()
    };

    db[this.tenBoSuuTap] = items as any;
    ghiDuLieu(db);
    return items[index] as T;
  }

  // Xóa bản ghi theo _id
  async findByIdAndDelete(id: string): Promise<boolean> {
    const db = docDuLieu();
    const items = (db[this.tenBoSuuTap] || []) as any[];
    const index = items.findIndex(it => it._id === id);

    if (index === -1) return false;

    items.splice(index, 1);
    db[this.tenBoSuuTap] = items as any;
    ghiDuLieu(db);
    return true;
  }

  // Xóa theo điều kiện
  async deleteMany(dieuKien: Partial<T>): Promise<number> {
    const db = docDuLieu();
    const items = (db[this.tenBoSuuTap] || []) as any[];
    const truocKhiXoa = items.length;

    const filtered = items.filter(item =>
      !Object.entries(dieuKien).every(([key, value]) => item[key] === value)
    );

    db[this.tenBoSuuTap] = filtered as any;
    ghiDuLieu(db);
    return truocKhiXoa - filtered.length;
  }

  // Đếm số lượng bản ghi thỏa mãn điều kiện
  async countDocuments(dieuKien: Partial<T> = {}): Promise<number> {
    const list = await this.find(dieuKien);
    return list.length;
  }
}

// Khởi tạo các bảng bộ sưu tập dữ liệu
export const NguoiDungDB = new BoSuuTap<any>('nguoi_dung');
export const BaiHatDB = new BoSuuTap<any>('bai_hat');
export const NgheSiDB = new BoSuuTap<any>('nghe_si');
export const AlbumDB = new BoSuuTap<any>('album');
export const TheLoaiDB = new BoSuuTap<any>('the_loai');
export const PlaylistDB = new BoSuuTap<any>('playlist');
export const LichSuDB = new BoSuuTap<any>('lich_su');
export const YeuThichDB = new BoSuuTap<any>('yeu_thich');

docDuLieu();
console.log('✅ Đã khởi tạo Cơ Sở Dữ Liệu SoundWave thành công!');
