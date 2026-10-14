# Sửa giao diện và phát nhạc — 14/10/2026

## Thay đổi

- Đăng nhập thông thường giữ trang đang mở. Đăng nhập qua nút dành riêng cho quản trị viên vẫn mở khu quản trị.
- Lưu trang trong URL dạng hash; hỗ trợ tải lại, Back/Forward và giữ tham số chi tiết trong phiên.
- Vite bỏ qua dữ liệu JSON, uploads và thư mục sao lưu khi theo dõi thay đổi.
- Ghi lượt nghe không làm mọi trang tải lại danh sách; lịch sử có sự kiện cập nhật riêng.
- Duy trì một Audio đang hoạt động, dùng vòng lặp HTML5, đồng bộ trạng thái phát/chờ tải/lỗi; lỗi file được hiển thị tại thanh nhạc và có thể thử lại.
- Ghi lượt nghe/lịch sử khi âm thanh thực sự bắt đầu phát. Lỗi lưu lượt nghe không làm dừng nhạc.
- Phát ngẫu nhiên tránh chọn lại chính bài hiện tại khi có nhiều bài.
- Menu trên màn hình nhỏ mở bằng nút, đóng khi chọn trang. Thanh nhạc chia hai hàng trên điện thoại, chừa chỗ cho nội dung cuộn.
- Nút phát/thích/thêm playlist hiện trên màn hình nhỏ; chỉnh chỗ ngắt chữ, ô nhập và ngôn ngữ HTML thành tiếng Việt.
- Modal thêm playlist nằm trên modal chi tiết; đăng nhập nằm trên chi tiết/upload. Bổ sung nhãn hộp thoại.

## Kết quả kiểm tra

- npm run lint: PASS.
- npm run build: PASS; đã cập nhật client/dist.
- npm run test:local: PASS — 114 kiểm tra API/static/persistence, development và production.
- npm run test:browser: PASS — 23 kiểm tra Chrome ẩn: đăng nhập giữ trang, phát MP3 thật, play/pause, repeat, tiếp tục phát khi chuyển trang, tạo playlist, giữ trang sau reload, thả tim, thêm bài từ chi tiết, thứ tự modal, sửa playlist, Back, menu điện thoại và kích thước thanh phát.
- MP3 thử được sao chép từ file đã upload của dự án; Chrome giải mã và thời gian phát tăng thực tế.
- Một nguồn SoundHelix demo đã phát thành công trong Chrome; không kiểm tra toàn bộ URL ngoài hoặc chất lượng âm thanh bằng nghe trực tiếp.
- Không có exception trình duyệt không xử lý trong lượt kiểm tra cuối.
- Hash JSON gốc không thay đổi qua kiểm thử. Tài khoản, playlist và file thử dùng thư mục riêng.
- Thời gian chờ khởi động của test API tăng từ khoảng 30 giây lên 90 giây để phù hợp với máy này.

## Chạy và kiểm tra lại

Chạy npm run dev và mở http://localhost:3000. Nếu server cũ đang chạy, khởi động lại để nhận cấu hình Vite mới.

npm run test:browser cần Chrome hoặc Edge trên Windows và một MP3 sẵn có trong uploads/audio. Bộ kiểm thử dùng WebSocket có sẵn trong Node, không cài thêm trình duyệt/dependency. Chrome chạy ẩn với hồ sơ riêng; server thử và trình duyệt thử được đóng sau kiểm tra.

Ảnh kiểm tra cuối:
- .soundwave-backups/browser-Q5Vvye/desktop.png
- .soundwave-backups/browser-Q5Vvye/mobile.png

Mã trước khi sửa được sao lưu trong .soundwave-backups/ui-fix-1791965038547; các thay đổi bổ sung hộp thoại/điều hướng có bản sao riêng trong ui-followup-*.

Báo cáo LOCALHOST_FIX_REPORT.md mô tả lần sửa trước; kết quả trình duyệt mới nằm trong báo cáo này. Các bài mẫu hiện vẫn sử dụng ghi âm demo từ URL ngoài, không phải bản thu gốc tương ứng với tiêu đề.
