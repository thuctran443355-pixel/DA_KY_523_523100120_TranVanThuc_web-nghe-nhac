/**
 * @file NgheSiModel.ts
 * @description Tầng Model - Mô hình Nghệ Sĩ / Ca Sĩ (Artist Model)
 * Quản lý thông tin ca sĩ, ảnh đại diện, tiểu sử, thể loại chính
 */

import { NgheSiDB } from '../database/co_so_du_lieu.ts';

export interface INgheSi {
  _id?: string;
  ten: string;
  anh_dai_dien?: string;
  tieu_su?: string;
  the_loai_chinh?: string;
  ngay_tao?: string;
}

export const NgheSiModel = {
  find: (dieuKien: Partial<INgheSi> = {}) => NgheSiDB.find(dieuKien),
  findOne: (dieuKien: Partial<INgheSi>) => NgheSiDB.findOne(dieuKien),
  findById: (id: string) => NgheSiDB.findById(id),
  create: (data: Omit<INgheSi, '_id'>) => NgheSiDB.create(data),
  findByIdAndUpdate: (id: string, data: Partial<INgheSi>) => NgheSiDB.findByIdAndUpdate(id, data),
  findByIdAndDelete: (id: string) => NgheSiDB.findByIdAndDelete(id),
  countDocuments: (dieuKien: Partial<INgheSi> = {}) => NgheSiDB.countDocuments(dieuKien)
};
