# API Bridge

![Minecraft Version](https://img.shields.io/badge/Minecraft-1.21.11-brightgreen)
![Fabric Loader](https://img.shields.io/badge/Fabric-0.19.3-blue)

Created and developed by [@DuyAnh662](https://github.com/DuyAnh662)

[Xem tài liệu Tiếng Việt (Vietnamese README)](#tài-liệu-tiếng-việt-vn)

---

## English Documentation

### Introduction
**ApiBridge** is a powerful Fabric mod for Minecraft 1.21.11 that exposes an HTTP REST API to control almost every aspect of the game directly from your terminal or any external application. Whether you want to break blocks, teleport players, control the weather, or even simulate UI clicks, this mod provides a comprehensive interface to do so!

### Features
*   **Block Manipulation:** Break, place, and interact with blocks anywhere in the world.
*   **Player Control:** Teleport, change look direction (pitch/yaw), jump, and swing hands.
*   **Inventory Management:** View items, drop items, change selected hotbar slots, and set items in specific slots.
*   **World Control:** Change time, set weather, and query world states.
*   **Settings & Rules:** Modify Game Rules and adjust difficulty on the fly.
*   **Client Simulation:** Simulate button clicks in the UI and modify client settings (FOV, Render Distance, etc.).
*   **Chat & Commands:** Send broadcast messages and run raw Minecraft commands directly.
*   **AI-Friendly Endpoints (OpenAI Gym style):** Get structured game observations (`/observation`), send actions (`/action`), or combined step (`/step`). Perfect for Reinforcement Learning agents!
*   **SSE Streaming:** Stream game observations in real-time via Server-Sent Events (`/stream`).
*   **Screen Observation:** Detect open UI screens and their components (buttons, sliders, textboxes) for AI navigation.
*   **AI Agent Guide:** Detailed documentation teaching AI agents how to understand observations and master Minecraft. See [docs/en/AI_AGENT_GUIDE.md](docs/en/AI_AGENT_GUIDE.md).

### How to Use

By default, the mod starts an HTTP Server bound to **127.0.0.1** (localhost only) on port `25566`.

#### Authentication (Required)
**Auth is mandatory.** If you don't provide a token via `-Dmcapi.key`, the mod will generate a **random 64-character hex token** on startup and print it to the log. Look for:
```
mcapi.key not provided! Generated random auth token: <token>
```
All API requests require the header `Authorization: Bearer <token>`.

**JVM configuration properties:**
| Property | Default | Description |
|----------|---------|-------------|
| `-Dmcapi.port=25566` | `25566` | HTTP server port |
| `-Dmcapi.key=<token>` | Auto-generated | Bearer token (mandatory) |
| `-Dmcapi.host=127.0.0.1` | `127.0.0.1` | Bind address (use `0.0.0.0` for external access) |

**Security notes:**
- Server binds to **localhost only** by default. Use `-Dmcapi.host=0.0.0.0` for LAN/external access.
- Rate-limited to **60 requests/second** per IP.
- Request body limited to **1 MB**.
- Block/item IDs must follow `namespace:path` format (e.g., `minecraft:stone`).

Here are some examples using `curl` in the terminal (replace `<token>` with your actual token):

**1. Break a block**
```bash
curl -X POST http://localhost:25566/api/block/break \
  -H "Authorization: Bearer <token>" \
  -d '{"x": 10, "y": 64, "z": 10}'
```

**2. Place a block**
```bash
curl -X POST http://localhost:25566/api/block/place \
  -H "Authorization: Bearer <token>" \
  -d '{"x": 10, "y": 64, "z": 10, "block": "minecraft:diamond_block"}'
```

**3. Set Weather to Thunder**
```bash
curl -X POST http://localhost:25566/api/world/weather \
  -H "Authorization: Bearer <token>" \
  -d '{"weather": "thunder", "duration": 6000}'
```

**4. Execute Raw Command**
```bash
curl -X POST http://localhost:25566/api/command \
  -H "Authorization: Bearer <token>" \
  -d '{"command": "give @a minecraft:netherite_sword"}'
```

**5. Get Game Observation (AI)**
```bash
curl -H "Authorization: Bearer <token>" http://localhost:25566/observation
```

**6. Step (Action + Observation)**
```bash
curl -X POST http://localhost:25566/step \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"actions":[{"type":"jump"},{"type":"swing"}]}'
```

**7. Stream Observations (SSE)**
```bash
curl -N -H "Authorization: Bearer <token>" http://localhost:25566/stream
```

For a complete list of endpoints, simply make a GET request to the root API endpoint:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:25566/api/
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
**ApiBridge** là một bản mod Fabric cực kỳ mạnh mẽ dành cho Minecraft 1.21.11, cung cấp một HTTP REST API cho phép bạn điều khiển gần như toàn bộ game thông qua Terminal hoặc bất kỳ ứng dụng bên ngoài nào. Bạn có thể làm mọi thứ: phá khối, đặt khối, dịch chuyển người chơi, đổi thời tiết, hay thậm chí là click các nút trên giao diện!

### Tính Năng Nổi Bật
*   **Tương Tác Khối:** Phá, đặt, lấy thông tin, và tương tác (click chuột phải) vào các khối.
*   **Điều Khiển Người Chơi:** Dịch chuyển (teleport), đổi hướng nhìn (yaw/pitch), nhảy, và vung tay.
*   **Quản Lý Túi Đồ (Inventory):** Lấy danh sách item, vứt đồ (drop), đổi ô đang chọn trên hotbar, và set item vào ô bất kỳ.
*   **Quản Lý Thế Giới:** Đổi thời gian (sáng/tối), thay đổi thời tiết.
*   **Cài Đặt & Luật Game:** Thay đổi Game Rules (luật chơi) và độ khó (Difficulty).
*   **Mô Phỏng Client:** Giả lập click nút trong UI và thay đổi cài đặt Client (FOV, Tầm nhìn,...).
*   **Chat & Lệnh:** Gửi tin nhắn chat và chạy lệnh Minecraft trực tiếp.
*   **AI Endpoints (OpenAI Gym):** Lấy observation game có cấu trúc (`/observation`), gửi hành động (`/action`), hoặc step kết hợp (`/step`). Lý tưởng cho agent Học Tăng Cường!
*   **SSE Streaming:** Nhận observation game theo thời gian thực qua Server-Sent Events (`/stream`).
*   **Screen Observation:** Phát hiện màn hình UI đang mở và các component (button, slider, textbox) để AI điều hướng.

### Hướng Dẫn Sử Dụng

Mặc định, mod chạy HTTP Server ở cổng `25566`, chỉ bind tại **127.0.0.1** (localhost).

#### Xác Thực (Bắt Buộc)
**Auth là bắt buộc.** Nếu bạn không truyền `-Dmcapi.key`, mod sẽ tự động **sinh token ngẫu nhiên 64 ký tự hex** và in ra log. Tìm dòng:
```
mcapi.key not provided! Generated random auth token: <token>
```
Mọi request API đều cần header `Authorization: Bearer <token>`.

**Cấu hình qua JVM properties:**
| Property | Mặc định | Mô tả |
|----------|----------|-------|
| `-Dmcapi.port=25566` | `25566` | Cổng HTTP server |
| `-Dmcapi.key=<token>` | Tự sinh | Bearer token (bắt buộc) |
| `-Dmcapi.host=127.0.0.1` | `127.0.0.1` | Địa chỉ bind (dùng `0.0.0.0` để truy cập ngoài) |

**Lưu ý bảo mật:**
- Server chỉ **localhost** mặc định. Dùng `-Dmcapi.host=0.0.0.0` nếu cần truy cập từ LAN/mạng ngoài.
- Giới hạn **60 requests/giây** mỗi IP.
- Body request tối đa **1 MB**.
- ID block/item phải đúng định dạng `namespace:path` (VD: `minecraft:stone`).

Ví dụ với `curl` (thay `<token>` bằng token thật):

**1. Phá 1 khối**
```bash
curl -X POST http://localhost:25566/api/block/break \
  -H "Authorization: Bearer <token>" \
  -d '{"x": 10, "y": 64, "z": 10}'
```

**2. Đặt 1 khối**
```bash
curl -X POST http://localhost:25566/api/block/place \
  -H "Authorization: Bearer <token>" \
  -d '{"x": 10, "y": 64, "z": 10, "block": "minecraft:diamond_block"}'
```

**3. Đổi thời tiết thành Mưa Bão**
```bash
curl -X POST http://localhost:25566/api/world/weather \
  -H "Authorization: Bearer <token>" \
  -d '{"weather": "thunder", "duration": 6000}'
```

**4. Chạy 1 lệnh Minecraft bất kỳ**
```bash
curl -X POST http://localhost:25566/api/command \
  -H "Authorization: Bearer <token>" \
  -d '{"command": "give @a minecraft:netherite_sword"}'
```

**5. Lấy Observation Game (AI)**
```bash
curl -H "Authorization: Bearer <token>" http://localhost:25566/observation
```

**6. Step (Hành động + Observation)**
```bash
curl -X POST http://localhost:25566/step \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"actions":[{"type":"jump"},{"type":"swing"}]}'
```

**7. Stream Observation (SSE)**
```bash
curl -N -H "Authorization: Bearer <token>" http://localhost:25566/stream
```

Để xem toàn bộ danh sách các API (Endpoints) hiện có, bạn chỉ cần gọi:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:25566/api/
```

### ⚠️ Lưu ý quan trọng & Tuyên bố từ chối trách nhiệm
Bằng việc sử dụng bản mod này, bạn đồng ý tuân thủ [Thỏa thuận cấp phép người dùng cuối (EULA) của Minecraft](https://minecraft.net) và [Hướng dẫn sử dụng thương mại](https://minecraft.net) của Mojang.

*   Mã nguồn của dự án này được cấp phép theo giấy phép MIT, nhưng việc vận hành và áp dụng nó trong trò chơi Minecraft phải tôn trọng tuyệt đối các điều khoản của Mojang.
*   Nhà phát triển (@DuyAnh662) không chịu trách nhiệm cho bất kỳ hành vi lạm dụng API này dẫn đến vi phạm EULA của Minecraft (ví dụ: tạo hệ thống nạp tiền trái phép, chặn tính năng bằng tường phí, hoặc tạo lợi thế bất hợp pháp trên các máy chủ công cộng).
*   Đây là một bản chỉnh sửa không chính thức, không liên kết, không được tài trợ hoặc phê duyệt bởi Mojang Studios hay Microsoft.

### Giấy phép
Dự án này được phát hành dưới bản quyền Giấy phép MIT - xem tệp [LICENSE](LICENSE) để biết thêm chi tiết.
