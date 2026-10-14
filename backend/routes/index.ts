/**
 * @file index.ts
 * @description Tầng Route - Tổng hợp tất cả các nhánh định tuyến API của hệ thống
 */

import { Router } from 'express';
import xacThucRoute from './xac_thuc_route.ts';
import baiHatRoute from './bai_hat_route.ts';
import ngheSiRoute from './nghe_si_route.ts';
import albumRoute from './album_route.ts';
import theLoaiRoute from './the_loai_route.ts';
import playlistRoute from './playlist_route.ts';
import lichSuRoute from './lich_su_route.ts';
import yeuThichRoute from './yeu_thich_route.ts';
import quanTriRoute from './quan_tri_route.ts';

const apiRouter = Router();

// Gắn các đường dẫn API theo danh mục rõ ràng
apiRouter.use('/xac-thuc', xacThucRoute);
apiRouter.use('/bai-hat', baiHatRoute);
apiRouter.use('/nghe-si', ngheSiRoute);
apiRouter.use('/album', albumRoute);
apiRouter.use('/the-loai', theLoaiRoute);
apiRouter.use('/playlist', playlistRoute);
apiRouter.use('/lich-su', lichSuRoute);
apiRouter.use('/yeu-thich', yeuThichRoute);
apiRouter.use('/quan-tri', quanTriRoute);

// Endpoint kiểm tra sức khỏe hệ thống
apiRouter.get('/kiem-tra', (req, res) => {
  res.json({
    thanh_cong: true,
    thong_bao: 'Máy chủ SoundWave đang hoạt động ổn định!',
    thoi_gian: new Date().toISOString()
  });
});

export default apiRouter;
