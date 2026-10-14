# Báo cáo sửa SoundWave trên localhost

Ngày kiểm thử: 14/10/2026. Giữ kiến trúc React/Vite + Express, dữ liệu JSON và giao diện hiện có; bổ sung thao tác sửa còn thiếu theo kiểu form/modal sẵn có. Không xóa dữ liệu, file nhạc hoặc thay cơ chế lưu trữ.

## Nguyên nhân đã xác định từ source

| Vấn đề | Bản sửa |
|---|---|
| /lich-su/:id bắt nhầm /lich-su/xoa-tat-ca | Đặt route tĩnh trước route tham số |
| Audio bị tạo lại khi thay đổi repeat; onended giữ queue cũ | Duy trì một Audio instance, đọc handler/trạng thái hiện tại qua ref |
| Audio lỗi phát giai điệu giả, UI không phản ánh bài thật | Báo lỗi file thật, đồng bộ play/pause và chỉ ghi lượt nghe sau play thành công |
| Xem chi tiết cũng tăng lượt nghe | GET chi tiết chỉ đọc; POST lượt nghe dùng khi phát |
| Lỗi đọc JSON quay về dữ liệu mẫu; lỗi ghi bị che | Không dùng dữ liệu mẫu khi file hỏng; ghi tệp tạm rồi thay thế và trả lỗi |
| deleteMany dùng OR thay vì AND cho điều kiện | Xóa đúng các bản ghi khớp toàn bộ điều kiện |
| Đường dẫn DB/upload dựa vào working directory | Dùng thư mục dự án, thống nhất backend và Express static |
| Backend không tải .env/.env.local | Tải rõ hai file từ thư mục dự án |
| Token có thể giả mạo bằng ID, mật khẩu mẫu bỏ qua xác minh | Token có chữ ký, thời hạn và vô hiệu sau đổi mật khẩu; bỏ đường vòng mật khẩu |
| Hồ sơ nhận cả trường vai_tro/password từ body | Chỉ nhận họ tên, avatar và tiểu sử |
| Hash hai tài khoản demo không khớp mật khẩu demo | Công cụ reset-password bằng mật khẩu tự chọn, có sao lưu; không tự sửa tài khoản hiện có |
| Đăng nhập định tuyến admin theo username cố định | Dùng vai trò thực tế trả về từ backend |
| API sửa bài hát bỏ qua req.files | Cập nhật URL âm thanh và ảnh mới từ Multer |
| Upload cho phép ảnh ở trường audio | Kiểm tra theo trường file, thêm UUID tránh trùng tên |
| Sửa playlist có service nhưng thiếu route/API/form | Nối PUT, frontend API và form sửa |
| Admin có API sửa nhưng thiếu thao tác giao diện | Nối nút sửa và modal cho bài hát, nghệ sĩ, album, thể loại |
| Đổi tên danh mục làm mất liên kết theo tên | Cập nhật các tên liên quan cùng một lần ghi JSON |
| Danh sách không cập nhật sau upload/thả tim | Tải lại dữ liệu của trang đang mở sau thao tác thay đổi |
| Điều hướng giữ tham số chi tiết cũ | Xóa tham số và đồng bộ lựa chọn khi trở lại danh sách |
| Kết quả tìm kiếm/chi tiết cũ ghi đè request mới | Bỏ qua kết quả của effect đã hết hiệu lực |
| Đổi tài khoản giữ state trang của tài khoản trước | Khởi tạo lại nội dung theo ID, giữ Audio Provider toàn cục |
| API thiếu/file thiếu trả về HTML của SPA | Trả 404 rõ ràng trước Vite/static SPA |
| npm start dùng node server.ts, clean dùng rm trên Windows | Dùng tsx và script Node cho clean |
| Vite lỗi âm thầm phục vụ build cũ | Báo lỗi startup, không che lỗi bằng build cũ |

## Kiểm thử đã thực hiện

- npm run lint: PASS.
- npm run build: PASS.
- npm ls --depth=0: không báo dependency thiếu hoặc invalid.
- npm run test:local: PASS, 114 kiểm tra API/static/persistence.
- Development: Express + Vite trả trang có /@vite/client, entry React và API.
- Production: frontend build, API, xác thực, quyền Guest/User/Admin.
- Đăng ký, đăng nhập đúng/sai, duplicate đã trim, token giả, hồ sơ và ngăn tự nâng quyền.
- Đổi mật khẩu đúng/sai, token cũ hết hiệu lực, đăng nhập mới; reset-password trên bản sao có sao lưu.
- Danh sách, tìm kiếm, chi tiết bài/album/nghệ sĩ/thể loại; GET chi tiết không tăng lượt nghe, POST tăng đúng.
- Playlist tạo/sửa/xóa, thêm/xóa bài, ngăn sửa playlist người khác và ngăn thêm ID bài không tồn tại.
- Yêu thích thêm/bỏ; lịch sử ghi/xóa từng mục/xóa tất cả và không xóa lịch sử người khác.
- Upload audio, thay audio qua PUT, từ chối ảnh ở trường âm thanh, phê duyệt bài.
- CRUD bài hát/nghệ sĩ/album/thể loại, upload ảnh danh mục, đổi tên nghệ sĩ giữ liên kết bài.
- Tải audio bằng Range trả 206 và đúng 128 byte yêu cầu; tải ảnh trả 200.
- Dashboard, danh sách tài khoản, khóa/mở khóa, thay vai trò, xóa tài khoản thử.
- Khởi động lại server giữ hồ sơ, playlist và token.
- Mô phỏng lỗi ghi tệp JSON: API báo lỗi, file không đổi.
- Mô phỏng JSON hỏng: API báo lỗi, không ghi đè bằng dữ liệu demo.
- Hash dữ liệu JSON gốc giữ nguyên trong toàn bộ lần chạy kiểm thử.

Tất cả thao tác ghi API kiểm thử chạy trên bản sao trong thư mục tạm; không dùng dữ liệu hoạt động của bạn. Test files được giữ lại và in đường dẫn để kiểm tra.

## Giới hạn cần biết

Không có công cụ trình duyệt trong phiên này. Chưa kiểm tra âm thanh phát thực tế, autoplay của trình duyệt, tua/âm lượng/repeat/shuffle, liên tục khi chuyển trang và các click/form trong giao diện. TypeScript và build thành công không chứng minh các tương tác này đã hoạt động. README.md có checklist thủ công.

Không có bản chụp runtime hoặc dữ liệu từ ứng dụng đang chạy trên Google AI Studio để đối chiếu trực tiếp. Các lỗi trên được xác định trong source export và kiểm thử local; chưa khẳng định đã tái hiện mọi khác biệt so với bản hosted.

Chưa kiểm tra khả năng phát URL SoundHelix/ảnh ngoài từ trình duyệt trên mạng của bạn. Giữ nguyên URL và dữ liệu demo. Âm thanh ngoài có thể không truy cập được dù server local chạy tốt.

Mô hình lưu JSON hiện tại dành cho một tiến trình server; không kiểm thử chạy nhiều tiến trình cùng ghi một file dữ liệu. Không đổi sang database khác.

Server cổng 3000 của bạn đã chạy trước phiên sửa. Không tự dừng tiến trình của bạn; hãy Ctrl+C rồi npm run dev để backend tải code mới. Các server kiểm thử dùng cổng trống riêng và đã được dừng.

Code gốc của nhóm sửa đầu tiên được sao lưu trong .soundwave-backups/20261014-091532. Mật khẩu hiện có chưa bị đặt lại; dùng công cụ trong README nếu cần truy cập lại tài khoản demo.

