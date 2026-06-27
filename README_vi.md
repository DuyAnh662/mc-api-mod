# Minecraft API Mod

[Read in English](README.md)

Điều khiển Minecraft Client và Server hoàn toàn từ Terminal, các đoạn script hoặc ứng dụng bên ngoài thông qua một HTTP API nội bộ.

Bản mod này cung cấp một RESTful JSON API mạnh mẽ cho phép bạn lập trình (script) mọi thứ: từ việc điều hướng menu chính, di chuyển nhân vật, đập khối, cho đến thay đổi cài đặt game. Nó mang lại khả năng tự động hoá hoàn toàn cho Minecraft mà không cần phải viết những bản mod phức tạp cho từng tác vụ nhỏ.

## Tính Năng Nổi Bật
- **Tự Động Hoá Client:** Giả lập thao tác bàn phím (WASD, Chạy, Nhảy, Click chuột).
- **Tương Tác Giao Diện (UI):** Tự động click vào các nút trên màn hình dựa vào chữ (VD: tự click "Singleplayer").
- **Điều Khiển Cài Đặt:** Thay đổi góc nhìn (FOV), tầm nhìn (Render Distance), độ sáng (Gamma) linh hoạt.
- **Tương Tác Thế Giới & Nhân Vật:** Dịch chuyển, đặt khối, đổi vật phẩm, và chạy lệnh game.
- **Đa Nền Tảng:** Điều khiển Minecraft dễ dàng bằng lệnh `curl`, script Python, hoặc Node.js.

## Cài Đặt
1. Cài đặt [Fabric Loader](https://fabricmc.net/) cho Minecraft phiên bản `1.21.11`.
2. Tải `mc-api-mod.jar` và bỏ vào thư mục `.minecraft/mods`.
3. Khởi động game! HTTP server sẽ tự động chạy ở cổng `25566`.

### Xác Thực (Bắt Buộc)
**Auth là bắt buộc.** Nếu không truyền `-Dmcapi.key=<token>`, mod tự sinh token ngẫu nhiên và in ra log:
```
mcapi.key not provided! Generated random auth token: <token>
```
Mọi request API cần header `Authorization: Bearer <token>`.

**Cấu hình JVM:**
| Property | Mặc định | Mô tả |
|----------|----------|-------|
| `-Dmcapi.port=25566` | `25566` | Cổng HTTP server |
| `-Dmcapi.key=<token>` | Tự sinh | Bearer token (bắt buộc) |
| `-Dmcapi.host=127.0.0.1` | `127.0.0.1` | Địa chỉ bind |

**Bảo mật:** Chỉ localhost mặc định, rate-limit 60 req/s/IP, body tối đa 1MB, ID item/block validate format `namespace:path`.

## Tài Liệu Hướng Dẫn
Để xem danh sách đầy đủ các lệnh và cách sử dụng, vui lòng đọc tài liệu hướng dẫn chi tiết của chúng tôi:
- [Tài Liệu API Tiếng Việt](./docs/vi/API.md)
- [English API Documentation](./docs/en/API.md)

## Ví Dụ Cách Dùng
**Tiến lên phía trước và chạy nhanh:**
```bash
curl -X POST http://localhost:25566/api/client/input -H "Content-Type: application/json" -d '{"forward": true, "sprint": true}'
```

**Nhấn nút "Singleplayer" ở màn hình chờ:**
```bash
curl -X POST http://localhost:25566/api/client/click_button -H "Content-Type: application/json" -d '{"button_text": "singleplayer"}'
```

## Tự Build Mod
```bash
git clone https://github.com/DuyAnh662/mc-api-mod.git
cd mc-api-mod
./gradlew build
```
Bản mod đã build (.jar) sẽ nằm trong thư mục `build/libs/`.

---
*Dành riêng cho Minecraft 1.21.11 trên nền tảng Fabric Loader.*
