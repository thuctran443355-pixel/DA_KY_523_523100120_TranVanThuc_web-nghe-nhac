/**
 * @file XacThucService.ts
 * @description Tầng Service - Dịch Vụ Xác Thực & Quản Lý Tài Khoản
 * Xử lý logic đăng ký, đăng nhập, đổi mật khẩu và cập nhật hồ sơ cá nhân
 */

import bcrypt from 'bcryptjs';
import { taoToken } from './token.ts';
import { NguoiDungModel, type INguoiDung } from '../models/NguoiDungModel.ts';

export const XacThucService = {
  /**
   * Đăng ký tài khoản người dùng mới (Mặc định vai trò 'nguoi_dung')
   */
  async dangKy(duLieu: { username: string; email: string; password: string; ho_ten?: string }) {
    const { password, ho_ten } = duLieu;
    const username = typeof duLieu.username === 'string' ? duLieu.username.trim() : '';
    const email = typeof duLieu.email === 'string' ? duLieu.email.trim().toLowerCase() : '';

    if (!username || !email || typeof password !== 'string' || !password) {
      throw new Error('Vui lòng điền đầy đủ tên đăng nhập, email và mật khẩu!');
    }

    if (typeof password !== 'string' || password.length < 6) throw new Error('Mật khẩu cần ít nhất 6 ký tự!');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email không hợp lệ!');
    // Kiểm tra xem username đã tồn tại chưa
    const daTonTaiUsername = await NguoiDungModel.findOne({ username });
    if (daTonTaiUsername) {
      throw new Error('Tên đăng nhập này đã có người sử dụng!');
    }

    // Kiểm tra email đã tồn tại chưa
    const daTonTaiEmail = await NguoiDungModel.findOne({ email });
    if (daTonTaiEmail) {
      throw new Error('Email này đã được đăng ký trong hệ thống!');
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Tạo người dùng mới trong CSDL
    const nguoiDungMoi = await NguoiDungModel.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: passwordHash,
      ho_ten: ho_ten ? ho_ten.trim() : username,
      vai_tro: 'nguoi_dung', // Người dùng thông thường
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
      tieu_su: 'Thành viên mới của SoundWave.',
      trang_thai: 'hoat_dong'
    });

    const { password: _, ...thongTinCongKhai } = nguoiDungMoi;
    const token = taoToken(nguoiDungMoi._id!, nguoiDungMoi.password);

    return {
      nguoiDung: thongTinCongKhai,
      token
    };
  },

  /**
   * Đăng nhập hệ thống (cho cả Người dùng và Quản trị viên)
   */
  async dangNhap(thongTin: { identifier: string; password: string }) {
    const { password } = thongTin;
    const identifier = typeof thongTin.identifier === 'string' ? thongTin.identifier.trim() : '';

    if (!identifier || typeof password !== 'string' || !password) {
      throw new Error('Vui lòng nhập tên tài khoản/email và mật khẩu!');
    }

    // Tìm kiếm theo username hoặc email
    const nguoiDung = (await NguoiDungModel.findOne({ username: identifier })) || 
                      (await NguoiDungModel.findOne({ email: identifier.toLowerCase() }));

    if (!nguoiDung) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác!');
    }

    if (nguoiDung.trang_thai === 'bi_khoa') {
      throw new Error('Tài khoản này đã bị khóa. Vui lòng liên hệ quản trị viên!');
    }

    // So sánh mật khẩu (Hỗ trợ cả bcrypt và mật khẩu trực tiếp phòng khi khởi tạo test)
    let hopLe = false;
    if (nguoiDung.password?.startsWith('$2a$') || nguoiDung.password?.startsWith('$2b$')) {
      hopLe = await bcrypt.compare(password, nguoiDung.password);
    } else {
      hopLe = nguoiDung.password === password;
    }

    if (!hopLe) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác!');
    }

    const { password: _, ...thongTinCongKhai } = nguoiDung;
    const token = taoToken(nguoiDung._id!, nguoiDung.password);

    return {
      nguoiDung: thongTinCongKhai,
      token
    };
  },

  /**
   * Lấy thông tin hồ sơ của người dùng đang đăng nhập
   */
  async layHoSo(userId: string) {
    const nguoiDung = await NguoiDungModel.findById(userId);
    if (!nguoiDung) {
      throw new Error('Không tìm thấy thông tin tài khoản!');
    }
    const { password: _, ...thongTinCongKhai } = nguoiDung;
    return thongTinCongKhai;
  },

  /**
   * Cập nhật hồ sơ cá nhân (Họ tên, avatar, tiểu sử)
   */
  async capNhatHoSo(userId: string, data: { ho_ten?: string; avatar?: string; tieu_su?: string }) {
    const safe: { ho_ten?: string; avatar?: string; tieu_su?: string } = {};
    for (const key of ['ho_ten', 'avatar', 'tieu_su'] as const) {
      if (data[key] !== undefined) {
        if (typeof data[key] !== 'string') throw new Error('Thông tin hồ sơ không hợp lệ!');
        safe[key] = data[key].trim();
      }
    }
    const capNhat = await NguoiDungModel.findByIdAndUpdate(userId, safe);
    if (!capNhat) {
      throw new Error('Không tìm thấy tài khoản để cập nhật!');
    }
    const { password: _, ...thongTinCongKhai } = capNhat;
    return thongTinCongKhai;
  },

  /**
   * Đổi mật khẩu tài khoản
   */
  async doiMatKhau(userId: string, matKhauCu: string, matKhauMoi: string) {
    const nguoiDung = await NguoiDungModel.findById(userId);
    if (!nguoiDung) {
      throw new Error('Không tìm thấy tài khoản!');
    }

    let dungMatKhauCu = false;
    if (nguoiDung.password?.startsWith('$2a$') || nguoiDung.password?.startsWith('$2b$')) {
      dungMatKhauCu = await bcrypt.compare(matKhauCu, nguoiDung.password);
    } else {
      dungMatKhauCu = nguoiDung.password === matKhauCu;
    }

    if (!dungMatKhauCu) {
      throw new Error('Mật khẩu hiện tại không đúng!');
    }

    const salt = await bcrypt.genSalt(10);
    if (typeof matKhauMoi !== 'string' || matKhauMoi.length < 6) throw new Error('Mật khẩu mới cần ít nhất 6 ký tự!');
    const passwordHash = await bcrypt.hash(matKhauMoi, salt);

    await NguoiDungModel.findByIdAndUpdate(userId, { password: passwordHash });
    return { thong_bao: 'Đổi mật khẩu thành công!', token: taoToken(userId, passwordHash) };
  }
};
