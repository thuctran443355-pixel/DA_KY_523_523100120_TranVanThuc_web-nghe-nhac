# SoundWave chạy trên Windows

Dự án dùng React/TypeScript/Vite và Express trên cùng cổng. Dữ liệu được lưu trong JSON tại backend/database/data/du_lieu_nhac.json, file tải lên nằm trong uploads. Không cần MongoDB hoặc Gemini API key cho các chức năng nghe nhạc.

## Chạy local

Yêu cầu Node.js >=22.12; phiên kiểm thử dùng Node 24.13.0 và npm 11.6.2.

1. Mở terminal VS Code tại thư mục có package.json.
2. Nếu chưa cài dependencies, chạy npm ci. Dùng package-lock.json với npm; không trộn npm và Bun trong cùng lần cài.
3. Chạy npm run dev.
4. Mở http://localhost:3000. Frontend và API /api dùng chung Express, không cần CORS cho luồng này.

Nếu đang chạy server từ trước khi sửa, dừng bằng Ctrl+C và chạy lại npm run dev. Việc HMR cập nhật React không thay thế bước khởi động lại backend.

.env và .env.local đều được tải từ thư mục dự án. Biến của shell ưu tiên cao nhất, rồi .env.local, rồi .env. Xem .env.example cho PORT và các đường dẫn tùy chọn. Không đặt NODE_ENV=production khi đang phát triển.

## Tài khoản mẫu và mật khẩu

Hash trong bản dữ liệu export của admin và thuctran không khớp mật khẩu mẫu từng được ghi trong code. Bản cũ đã bỏ qua xác minh mật khẩu cho hai tài khoản này, đồng thời cho phép dùng mật khẩu mẫu để đổi mật khẩu tài khoản khác. Bản sửa đã loại bỏ các đường vòng đó.

Mật khẩu hiện có chưa bị thay đổi. Nếu muốn tiếp tục dùng tài khoản mẫu, chạy lần lượt trong terminal VS Code:

    npm run reset-password -- admin
    npm run reset-password -- thuctran

Công cụ yêu cầu bạn nhập và xác nhận mật khẩu mới, không hiển thị ký tự mật khẩu. Công cụ giữ nguyên ID, vai trò, hồ sơ, playlist, nhạc và tự sao lưu JSON trước khi đổi hash. Chỉ chạy lệnh cho tài khoản bạn muốn đặt lại. Không chạy đồng thời với các thao tác cập nhật dữ liệu khác.

Phiên đăng nhập cũ từ bản export phải đăng nhập lại. Token mới có chữ ký, hết hạn sau 7 ngày, vẫn hợp lệ sau khi khởi động lại server nhờ khóa tự sinh trong backend/database/data/.session-key. Đổi mật khẩu làm vô hiệu các token cũ; đổi mật khẩu qua giao diện cấp token mới cho phiên hiện tại. Không công khai khóa này.

## Build và kiểm thử

    npm run lint
    npm run build
    npm run test:local

test:local tạo dữ liệu và uploads riêng trong thư mục tạm Windows, khởi động server trên cổng trống, kiểm tra development và production. Tài khoản/mật khẩu kiểm thử được tạo ngẫu nhiên. Bộ kiểm thử kiểm tra hash để bảo đảm JSON gốc không thay đổi; đường dẫn dữ liệu thử được in ở cuối.

Để chạy bản build trong PowerShell:

    $env:NODE_ENV = 'production'
    npm start

Khi quay lại development:

    Remove-Item Env:NODE_ENV -ErrorAction SilentlyContinue
    npm run dev

npm run preview chỉ xem frontend build, không cung cấp backend Express. Hãy dùng npm start để kiểm tra website có API.

## Kiểm tra trên trình duyệt

Đã bổ sung npm run test:browser: chạy Chrome/Edge ẩn bằng dữ liệu riêng, kiểm tra phát MP3 thật, giữ trang sau thao tác, playlist, các modal và bố cục điện thoại. Lượt kiểm tra ngày 14/10/2026 đạt 23 kiểm tra trình duyệt và 114 kiểm tra API. Xem UI_FIX_REPORT.md và ảnh kiểm tra trong .soundwave-backups.

Các bước dưới đây dùng để kiểm tra thủ công thêm:

1. Guest: mở trang chủ, tìm nhanh nhiều từ khóa, lọc thể loại, mở nghệ sĩ/album và quay về danh sách.
2. Phát bài đã upload nằm trong /uploads; thử play/pause, tua, âm lượng, mute, next/previous, shuffle, bật/tắt repeat khi đang phát. Để bài kết thúc rồi xác nhận tự chuyển bài.
3. Khi nhạc đang phát, chuyển qua các trang để kiểm tra không ngắt âm thanh. Tải lại cả trang là lần khởi tạo ứng dụng mới; không có tính năng tự phát lại sau reload.
4. Đăng ký, đăng nhập, đăng xuất; tải lại trang để kiểm tra phiên. Sửa hồ sơ, đổi mật khẩu và đăng nhập bằng mật khẩu mới.
5. Thêm/bỏ yêu thích ngay trên trang yêu thích; tạo/sửa/xóa playlist, thêm/xóa bài trong playlist; nghe nhạc rồi kiểm tra lịch sử, xóa một mục và toàn bộ lịch sử.
6. User upload MP3 và ảnh bìa, kiểm tra Bài hát của tôi có trạng thái chờ duyệt. Admin duyệt/từ chối; kiểm tra bài duyệt xuất hiện công khai.
7. Admin thử thêm/sửa/xóa bài hát, nghệ sĩ, album, thể loại; thay file nhạc/ảnh khi sửa, đổi tên danh mục và kiểm tra liên kết bài hát. Thử khóa/mở khóa, đổi vai trò và xóa tài khoản thử.
8. Khởi động lại server và kiểm tra dữ liệu vẫn tồn tại. Mở DevTools > Network; /api phải trả JSON, /uploads phải trả file; yêu cầu Range cho audio có thể trả 206.

Nhạc demo dùng URL SoundHelix và ảnh demo dùng dịch vụ bên ngoài. Chúng cần mạng và quyền truy cập từ máy của bạn; không phải file của các bài hát thật ghi trong tiêu đề demo. Bộ kiểm thử local kiểm tra file tải lên, không xác nhận phát nhạc từ các dịch vụ bên ngoài.

Chi tiết kết quả và phạm vi kiểm thử ở LOCALHOST_FIX_REPORT.md.

