# MC API Mod

![Minecraft Version](https://img.shields.io/badge/Minecraft-1.21.11-brightgreen)
![Fabric Loader](https://img.shields.io/badge/Fabric-0.19.3-blue)

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
