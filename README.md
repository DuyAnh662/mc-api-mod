# MC API Mod

![Minecraft Version](https://img.shields.io/badge/Minecraft-1.21.11-brightgreen)
![Fabric Loader](https://img.shields.io/badge/Fabric-0.19.3-blue)

Created and developed by [@DuyAnh662](https://github.com/DuyAnh662)

[Xem tài liệu Tiếng Việt (Vietnamese README)](#tài-liệu-tiếng-việt-vn)

---

## English Documentation

### Introduction
**MC API Mod** is a powerful Fabric mod for Minecraft 1.21.11 that exposes an HTTP REST API to control almost every aspect of the game directly from your terminal or any external application. Whether you want to break blocks, teleport players, control the weather, or even simulate UI clicks, this mod provides a comprehensive interface to do so!

### Features
*   **Block Manipulation:** Break, place, and interact with blocks anywhere in the world.
*   **Player Control:** Teleport, change look direction (pitch/yaw), jump, and swing hands.
*   **Inventory Management:** View items, drop items, change selected hotbar slots, and set items in specific slots.
*   **World Control:** Change time, set weather, and query world states.
*   **Settings & Rules:** Modify Game Rules and adjust difficulty on the fly.
*   **Client Simulation:** Simulate button clicks in the UI and modify client settings (FOV, Render Distance, etc.).
*   **Chat & Commands:** Send broadcast messages and run raw Minecraft commands directly.

### How to Use

By default, the mod starts an HTTP Server on port `25566`. You can change this or add security via JVM arguments (e.g., `-Dmcapi.port=8080 -Dmcapi.key=my_secret_token`).

You can send HTTP POST/GET requests to the server. Here are some examples using `curl` in the terminal:

**1. Break a block**
```bash
curl -X POST http://localhost:25566/api/block/break \
  -d '{"x": 10, "y": 64, "z": 10}'
```

**2. Place a block**
```bash
curl -X POST http://localhost:25566/api/block/place \
  -d '{"x": 10, "y": 64, "z": 10, "block": "minecraft:diamond_block"}'
```

**3. Set Weather to Thunder**
```bash
curl -X POST http://localhost:25566/api/world/weather \
  -d '{"weather": "thunder", "duration": 6000}'
```

**4. Execute Raw Command**
```bash
curl -X POST http://localhost:25566/api/command \
  -d '{"command": "give @a minecraft:netherite_sword"}'
```

For a complete list of endpoints, simply make a GET request to the root API endpoint:
```bash
curl http://localhost:25566/api/
```
### ⚠️ Important Notice & Disclaimer
By using this mod, you agree to comply with Mojang's [Minecraft End User License Agreement (EULA)](https://minecraft.net) and [Commercial Usage Guidelines](https://minecraft.net). 

*   This mod is provided under the MIT License for the source code, but its utilization within Minecraft must strictly respect Mojang's terms.
*   The developer (@DuyAnh662) is not responsible for any misuse of this API that violates Minecraft's EULA (e.g., creating unauthorized monetization systems, paywalls, or unfair advantages on public servers).
*   This is an unofficial modification and is not affiliated with or endorsed by Mojang Studios or Microsoft.

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Tài Liệu Tiếng Việt (VN)

### Giới Thiệu
**MC API Mod** là một bản mod Fabric cực kỳ mạnh mẽ dành cho Minecraft 1.21.11, cung cấp một HTTP REST API cho phép bạn điều khiển gần như toàn bộ game thông qua Terminal hoặc bất kỳ ứng dụng bên ngoài nào. Bạn có thể làm mọi thứ: phá khối, đặt khối, dịch chuyển người chơi, đổi thời tiết, hay thậm chí là click các nút trên giao diện!

### Tính Năng Nổi Bật
*   **Tương Tác Khối:** Phá, đặt, lấy thông tin, và tương tác (click chuột phải) vào các khối.
*   **Điều Khiển Người Chơi:** Dịch chuyển (teleport), đổi hướng nhìn (yaw/pitch), nhảy, và vung tay.
*   **Quản Lý Túi Đồ (Inventory):** Lấy danh sách item, vứt đồ (drop), đổi ô đang chọn trên hotbar, và set item vào ô bất kỳ.
*   **Quản Lý Thế Giới:** Đổi thời gian (sáng/tối), thay đổi thời tiết.
*   **Cài Đặt & Luật Game:** Thay đổi Game Rules (luật chơi) và độ khó (Difficulty).
*   **Mô Phỏng Client:** Giả lập click nút trong UI và thay đổi cài đặt Client (FOV, Tầm nhìn,...).
*   **Chat & Lệnh:** Gửi tin nhắn chat và chạy lệnh Minecraft trực tiếp.

### Hướng Dẫn Sử Dụng

Mặc định, mod sẽ chạy một HTTP Server ở cổng `25566`. Bạn có thể thay đổi cổng hoặc thêm bảo mật bằng tham số khởi chạy JVM (ví dụ: `-Dmcapi.port=8080 -Dmcapi.key=my_secret_token`).

Bạn có thể gửi các HTTP Request (POST/GET) đến server. Dưới đây là một số ví dụ sử dụng lệnh `curl` trên Terminal:

**1. Phá 1 khối**
```bash
curl -X POST http://localhost:25566/api/block/break \
  -d '{"x": 10, "y": 64, "z": 10}'
```

**2. Đặt 1 khối**
```bash
curl -X POST http://localhost:25566/api/block/place \
  -d '{"x": 10, "y": 64, "z": 10, "block": "minecraft:diamond_block"}'
```

**3. Đổi thời tiết thành Mưa Bão**
```bash
curl -X POST http://localhost:25566/api/world/weather \
  -d '{"weather": "thunder", "duration": 6000}'
```

**4. Chạy 1 lệnh Minecraft bất kỳ**
```bash
curl -X POST http://localhost:25566/api/command \
  -d '{"command": "give @a minecraft:netherite_sword"}'
```

Để xem toàn bộ danh sách các API (Endpoints) hiện có, bạn chỉ cần mở trình duyệt hoặc gọi lệnh GET tới đường dẫn gốc:
```bash
curl http://localhost:25566/api/
```
### ⚠️ Lưu ý quan trọng & Tuyên bố từ chối trách nhiệm
Bằng việc sử dụng bản mod này, bạn đồng ý tuân thủ [Thỏa thuận cấp phép người dùng cuối (EULA) của Minecraft](https://minecraft.net) và [Hướng dẫn sử dụng thương mại](https://minecraft.net) của Mojang.

*   Mã nguồn của dự án này được cấp phép theo giấy phép MIT, nhưng việc vận hành và áp dụng nó trong trò chơi Minecraft phải tôn trọng tuyệt đối các điều khoản của Mojang.
*   Nhà phát triển (@DuyAnh662) không chịu trách nhiệm cho bất kỳ hành vi lạm dụng API này dẫn đến vi phạm EULA của Minecraft (ví dụ: tạo hệ thống nạp tiền trái phép, chặn tính năng bằng tường phí, hoặc tạo lợi thế bất hợp pháp trên các máy chủ công cộng).
*   Đây là một bản chỉnh sửa không chính thức, không liên kết, không được tài trợ hoặc phê duyệt bởi Mojang Studios hay Microsoft.

### Giấy phép
Dự án này được phát hành dưới bản quyền Giấy phép MIT - xem tệp [LICENSE](LICENSE) để biết thêm chi tiết.
