/**
 * @file BaiHatService.ts
 * @description Tầng Service - Xử lý nghiệp vụ liên quan đến Bài Hát
 * Phục vụ cả 3 đối tượng:
 * - Khách vãng lai & Người dùng: Xem danh sách, tìm kiếm, lọc, nghe nhạc, xem chi tiết
 * - Người dùng: Đăng tải bài hát mới (chờ duyệt), xem bài hát của tôi
 * - Quản trị viên: Kiểm duyệt bài hát (Duyệt / Từ chối), thêm trực tiếp bài hát, sửa, xóa
 */

import { BaiHatModel, type IBaiHat } from '../models/BaiHatModel.ts';
import { NguoiDungModel } from '../models/NguoiDungModel.ts';
import { PlaylistModel } from '../models/PlaylistModel.ts';
import { AlbumModel } from '../models/AlbumModel.ts';
import { YeuThichDB, LichSuDB } from '../database/co_so_du_lieu.ts';

export const BaiHatService = {
  /**
   * Lấy danh sách bài hát công khai (Chỉ những bài ĐÃ DUYỆT)
   * Dành cho Khách vãng lai và Người dùng
   */
  async layDanhSachDaDuyet(query: { the_loai?: string; nghe_si?: string; sap_xep?: string } = {}) {
    let tatCaBaiHat = await BaiHatModel.find({ trang_thai: 'da_duyet' });

    // Lọc theo thể loại nếu có
    if (query.the_loai && query.the_loai !== 'all' && query.the_loai !== 'tat_ca') {
      tatCaBaiHat = tatCaBaiHat.filter(bh => 
        bh.the_loai.toLowerCase() === query.the_loai?.toLowerCase()
      );
    }

    // Lọc theo nghệ sĩ nếu có
    if (query.nghe_si) {
      tatCaBaiHat = tatCaBaiHat.filter(bh => 
        bh.nghe_si.toLowerCase().includes(query.nghe_si!.toLowerCase())
      );
    }

    // Sắp xếp
    if (query.sap_xep === 'moi_nhat') {
      tatCaBaiHat.sort((a, b) => new Date(b.ngay_tao || 0).getTime() - new Date(a.ngay_tao || 0).getTime());
    } else if (query.sap_xep === 'luot_nghe_nhieu') {
      tatCaBaiHat.sort((a, b) => (b.luot_nghe || 0) - (a.luot_nghe || 0));
    } else {
      // Mặc định sắp xếp theo lượt nghe giảm dần
      tatCaBaiHat.sort((a, b) => (b.luot_nghe || 0) - (a.luot_nghe || 0));
    }

    return tatCaBaiHat;
  },

  /**
   * Tìm kiếm và lọc bài hát nâng cao (Tên bài, tên ca sĩ, thể loại)
   */
  async timKiemVaLoc(params: { tu_khoa?: string; the_loai?: string; sap_xep?: string }) {
    const { tu_khoa, the_loai, sap_xep } = params;
    let danhSach = await BaiHatModel.find({ trang_thai: 'da_duyet' });

    if (tu_khoa && tu_khoa.trim() !== '') {
      const keyword = tu_khoa.toLowerCase().trim();
      danhSach = danhSach.filter(bh => 
        bh.tieu_de.toLowerCase().includes(keyword) || 
        bh.nghe_si.toLowerCase().includes(keyword) ||
        (bh.album && bh.album.toLowerCase().includes(keyword)) ||
        bh.the_loai.toLowerCase().includes(keyword)
      );
    }

    if (the_loai && the_loai !== 'all' && the_loai !== 'tat_ca') {
      danhSach = danhSach.filter(bh => bh.the_loai.toLowerCase() === the_loai.toLowerCase());
    }

    if (sap_xep === 'moi_nhat') {
      danhSach.sort((a, b) => new Date(b.ngay_tao || 0).getTime() - new Date(a.ngay_tao || 0).getTime());
    } else if (sap_xep === 'luot_nghe') {
      danhSach.sort((a, b) => (b.luot_nghe || 0) - (a.luot_nghe || 0));
    } else if (sap_xep === 'ten_az') {
      danhSach.sort((a, b) => a.tieu_de.localeCompare(b.tieu_de));
    }

    return danhSach;
  },

  /**
   * Lấy thông tin chi tiết một bài hát và tự động tăng lượt nghe
   */
  async layChiTietVaTangLuotNghe(baiHatId: string, tangLuotNghe = false) {
    const baiHat = await BaiHatModel.findById(baiHatId);
    if (!baiHat) {
      throw new Error('Bài hát không tồn tại trên hệ thống!');
    }

    // Tăng số lượt nghe
    const luotNgheMoi = (baiHat.luot_nghe || 0) + (tangLuotNghe ? 1 : 0);
    if (tangLuotNghe) await BaiHatModel.findByIdAndUpdate(baiHatId, { luot_nghe: luotNgheMoi });

    // Lấy thông tin người đăng (nếu có)
    let nguoiDang = null;
    if (baiHat.nguoi_dang_id) {
      const user = await NguoiDungModel.findById(baiHat.nguoi_dang_id);
      if (user) {
        nguoiDang = {
          _id: user._id,
          ho_ten: user.ho_ten,
          avatar: user.avatar,
          vai_tro: user.vai_tro
        };
      }
    }

    return {
      ...baiHat,
      luot_nghe: luotNgheMoi,
      nguoi_dang: nguoiDang
    };
  },

  /**
   * Người dùng đăng tải bài hát lên hệ thống -> BẮT BUỘC TRẠNG THÁI 'cho_duyet'
   */
  async nguoiDungUpload(duLieu: {
    tieu_de: string;
    nghe_si: string;
    album?: string;
    the_loai: string;
    file_url: string;
    anh_bia?: string;
    thoi_luong?: number;
    loi_bai_hat?: string;
    nguoi_dang_id: string;
  }) {
    if (!duLieu.tieu_de || !duLieu.nghe_si || !duLieu.the_loai || !duLieu.file_url) {
      throw new Error('Vui lòng cung cấp tiêu đề, nghệ sĩ, thể loại và file nhạc hợp lệ!');
    }

    const baiHatMoi = await BaiHatModel.create({
      tieu_de: duLieu.tieu_de.trim(),
      nghe_si: duLieu.nghe_si.trim(),
      album: duLieu.album ? duLieu.album.trim() : 'Đĩa đơn',
      the_loai: duLieu.the_loai.trim(),
      file_url: duLieu.file_url,
      anh_bia: duLieu.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
      thoi_luong: duLieu.thoi_luong || 210,
      luot_nghe: 0,
      trang_thai: 'cho_duyet', // Chờ Quản Trị Viên phê duyệt!
      nguoi_dang_id: duLieu.nguoi_dang_id,
      loi_bai_hat: duLieu.loi_bai_hat || ''
    });

    return {
      thanh_cong: true,
      thong_bao: 'Bài hát đã được tải lên thành công và đang chờ Quản trị viên phê duyệt!',
      bai_hat: baiHatMoi
    };
  },

  /**
   * Quản trị viên thêm trực tiếp bài hát -> TỰ ĐỘNG ĐƯỢC DUYỆT NGAY ('da_duyet')
   */
  async adminThemBaiHat(duLieu: {
    tieu_de: string;
    nghe_si: string;
    album?: string;
    the_loai: string;
    file_url: string;
    anh_bia?: string;
    thoi_luong?: number;
    loi_bai_hat?: string;
    admin_id: string;
  }) {
    const baiHatMoi = await BaiHatModel.create({
      tieu_de: duLieu.tieu_de.trim(),
      nghe_si: duLieu.nghe_si.trim(),
      album: duLieu.album ? duLieu.album.trim() : 'Đĩa đơn',
      the_loai: duLieu.the_loai.trim(),
      file_url: duLieu.file_url,
      anh_bia: duLieu.anh_bia || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
      thoi_luong: duLieu.thoi_luong || 220,
      luot_nghe: 0,
      trang_thai: 'da_duyet', // Admin thêm thì tự động duyệt ngay
      nguoi_dang_id: duLieu.admin_id,
      loi_bai_hat: duLieu.loi_bai_hat || ''
    });

    return baiHatMoi;
  },

  /**
   * Quản trị viên phê duyệt hoặc từ chối bài hát
   */
  async adminPheDuyetBaiHat(baiHatId: string, trang_thai: 'da_duyet' | 'tu_choi', ly_do_tu_choi?: string) {
    const baiHat = await BaiHatModel.findById(baiHatId);
    if (!baiHat) {
      throw new Error('Không tìm thấy bài hát cần phê duyệt!');
    }

    const capNhat = await BaiHatModel.findByIdAndUpdate(baiHatId, {
      trang_thai,
      ly_do_tu_choi: trang_thai === 'tu_choi' ? (ly_do_tu_choi || 'Nội dung chưa phù hợp tiêu chuẩn hệ thống') : undefined
    });

    return capNhat;
  },

  /**
   * Lấy danh sách toàn bộ bài hát trong hệ thống (Dành cho Quản trị viên quản lý)
   */
  async adminLayTatCaBaiHat(trangThaiFilter?: string) {
    let danhSach = await BaiHatModel.find();
    if (trangThaiFilter && trangThaiFilter !== 'tat_ca') {
      danhSach = danhSach.filter(bh => bh.trang_thai === trangThaiFilter);
    }
    // Sắp xếp bài hát mới nhất và bài chờ duyệt lên đầu
    danhSach.sort((a, b) => {
      if (a.trang_thai === 'cho_duyet' && b.trang_thai !== 'cho_duyet') return -1;
      if (b.trang_thai === 'cho_duyet' && a.trang_thai !== 'cho_duyet') return 1;
      return new Date(b.ngay_tao || 0).getTime() - new Date(a.ngay_tao || 0).getTime();
    });
    return danhSach;
  },

  /**
   * Lấy danh sách bài hát do chính người dùng hiện tại đã đăng tải
   */
  async layBaiHatCuaToi(userId: string) {
    const danhSach = await BaiHatModel.find({ nguoi_dang_id: userId });
    danhSach.sort((a, b) => new Date(b.ngay_tao || 0).getTime() - new Date(a.ngay_tao || 0).getTime());
    return danhSach;
  },

  /**
   * Quản trị viên chỉnh sửa thông tin bài hát
   */
  async adminSuaBaiHat(id: string, duLieu: Partial<IBaiHat>) {
    delete duLieu._id;
    if ('tieu_de' in duLieu && (typeof duLieu.tieu_de !== 'string' || !duLieu.tieu_de.trim())) throw new Error('Tên không được để trống!');
    const capNhat = await BaiHatModel.findByIdAndUpdate(id, duLieu);
    if (!capNhat) {
      throw new Error('Không tìm thấy bài hát để cập nhật!');
    }
    return capNhat;
  },

  /**
   * Dọn dẹp liên kết bài hát trong playlist, yêu thích và lịch sử
   */
  async donDepLienKetBaiHat(baiHatId: string) {
    try {
      // 1. Xóa bài hát khỏi tất cả playlist
      const tatCaPlaylist = await PlaylistModel.find();
      for (const pl of tatCaPlaylist) {
        if (pl._id && pl.danh_sach_bai_hat && pl.danh_sach_bai_hat.includes(baiHatId)) {
          const danhSachMoi = pl.danh_sach_bai_hat.filter((id: string) => id !== baiHatId);
          await PlaylistModel.findByIdAndUpdate(pl._id, { danh_sach_bai_hat: danhSachMoi });
        }
      }
      // 2. Xóa bài hát khỏi tất cả album
      const tatCaAlbum = await AlbumModel.find();
      for (const ab of tatCaAlbum) {
        if (ab._id && ab.danh_sach_bai_hat && ab.danh_sach_bai_hat.includes(baiHatId)) {
          const danhSachMoi = ab.danh_sach_bai_hat.filter((id: string) => id !== baiHatId);
          await AlbumModel.findByIdAndUpdate(ab._id, { danh_sach_bai_hat: danhSachMoi });
        }
      }
      // 3. Xóa khỏi danh sách yêu thích
      await YeuThichDB.deleteMany({ bai_hat_id: baiHatId });
      // 4. Xóa khỏi lịch sử nghe
      await LichSuDB.deleteMany({ bai_hat_id: baiHatId });
    } catch (e) {
      throw new Error('Không thể hoàn tất dọn dẹp liên kết bài hát.', { cause: e });
    }
  },

  /**
   * Người dùng xóa bài hát do chính mình tải lên
   */
  async nguoiDungXoaBaiHat(baiHatId: string, userId: string) {
    const baiHat = await BaiHatModel.findById(baiHatId);
    if (!baiHat) {
      throw new Error('Không tìm thấy bài hát để xóa!');
    }
    if (baiHat.nguoi_dang_id !== userId) {
      throw new Error('Bạn không có quyền xóa bài hát này!');
    }

    const ketQua = await BaiHatModel.findByIdAndDelete(baiHatId);
    if (!ketQua) {
      throw new Error('Không thể xóa bài hát này!');
    }

    await this.donDepLienKetBaiHat(baiHatId);
    return { thanh_cong: true, thong_bao: 'Đã xóa bài hát của bạn thành công!' };
  },

  /**
   * Quản trị viên xóa bài hát khỏi hệ thống
   */
  async adminXoaBaiHat(id: string) {
    const ketQua = await BaiHatModel.findByIdAndDelete(id);
    if (!ketQua) {
      throw new Error('Không tìm thấy bài hát để xóa!');
    }
    await this.donDepLienKetBaiHat(id);
    return { thanh_cong: true, thong_bao: 'Đã xóa bài hát thành công!' };
  }
};
