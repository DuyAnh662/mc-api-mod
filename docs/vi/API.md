# Tài Liệu Hướng Dẫn - MC API Mod (1.21.11)

MC API Mod cung cấp một hệ thống HTTP REST API chạy ẩn ngay bên trong Minecraft, cho phép bạn điều khiển toàn bộ trò chơi bằng code (Python, Node.js, v.v.), hoặc qua command line (cURL) mà không cần phải chạm vào bàn phím hay chuột.

---

## 0. Xác Thực (Bắt Buộc)

**Mọi request API đều cần xác thực.** Thêm token vào header `Authorization`:

```bash
-H "Authorization: Bearer <token_của_bạn>"
```

Nếu không truyền `-Dmcapi.key=<token>` trong JVM arguments, mod tự sinh token 64 ký tự hex ngẫu nhiên và in ra log:
```
mcapi.key not provided! Generated random auth token: <token_của_bạn>
```

**Cấu hình JVM:**
| Property | Mặc định | Mô tả |
|----------|----------|-------|
| `-Dmcapi.key=<token>` | Tự sinh | Bearer token |
| `-Dmcapi.port=25566` | `25566` | Cổng HTTP server |
| `-Dmcapi.host=127.0.0.1` | `127.0.0.1` | Địa chỉ bind (dùng `0.0.0.0` cho LAN) |

**Giới hạn bảo mật:**
- Rate-limit: **60 requests/giây** mỗi IP.
- Body tối đa: **1 MB**.
- ID block/item phải đúng format `namespace:path` (VD: `minecraft:stone`).

---

## 1. Cấu trúc của một Lệnh Hoàn Chỉnh

Để gọi API thành công, bạn cần gửi một HTTP Request chuẩn với 4 yếu tố sau:
1. **HTTP Method**: `GET` (lấy dữ liệu) hoặc `POST` (thực hiện hành động).
2. **Endpoint (URL)**: Đường dẫn của lệnh.
3. **Headers**: `Authorization: Bearer <token>` (bắt buộc) + `Content-Type: application/json` cho POST.
4. **Body (Payload)**: Dữ liệu JSON (Lưu ý: trên terminal, JSON phải được bọc trong dấu nháy đơn `'...'`).

---

## 2. Nhóm Lệnh Client (Điều Khiển Bàn Phím, Giao Diện)

### 2.1 Mô phỏng bấm phím (`POST /api/client/input`)
Dùng để nhấn một hoặc nhiều phím bất kì. Hỗ trợ **toàn bộ phím** trên bàn phím, bao gồm cả phím đặc biệt.

**Tham số:**
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `keys` | Mảng chuỗi | Có | Danh sách phím cần nhấn (xem Bảng Phím bên dưới) |
| `duration` | Số (ms) | Không | Thời gian giữ phím (mặc định: 0 = nhấn rồi thả ngay) |

**Ví dụ — Đi tới 1 giây:**
```bash
curl -X POST http://localhost:25566/api/client/input \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"keys": ["w"], "duration": 1000}'
```

**Ví dụ — Sprint (Ctrl + W) trong 2 giây:**
```bash
curl -X POST http://localhost:25566/api/client/input \
     -H "Content-Type: application/json" \
     -d '{"keys": ["ctrl", "w"], "duration": 2000}'
```

**Ví dụ — Mở màn hình F3 Debug:**
```bash
curl -X POST http://localhost:25566/api/client/input \
     -H "Content-Type: application/json" \
     -d '{"keys": ["f3"]}'
```

**Ví dụ — Nhấn phím mũi tên lên:**
```bash
curl -X POST http://localhost:25566/api/client/input \
     -H "Content-Type: application/json" \
     -d '{"keys": ["up"]}'
```

**Ví dụ — Nhấn Tab:**
```bash
curl -X POST http://localhost:25566/api/client/input \
     -H "Content-Type: application/json" \
     -d '{"keys": ["tab"]}'
```

**Ví dụ — Nhấn Escape:**
```bash
curl -X POST http://localhost:25566/api/client/input \
     -H "Content-Type: application/json" \
     -d '{"keys": ["esc"]}'
```

### Bảng Tên Phím Đầy Đủ

Bạn chỉ cần gõ tên ngắn gọn, không phân biệt hoa/thường.

| Nhóm | Tên phím | Ví dụ |
|------|----------|-------|
| **Chữ cái** | `a` đến `z` | `"a"`, `"w"`, `"s"` |
| **Số** | `0` đến `9` | `"1"`, `"5"` |
| **Phím chức năng** | `f1` đến `f25` | `"f3"`, `"f11"` |
| **Modifier** | `shift`, `lshift`, `rshift`, `ctrl`, `lctrl`, `rctrl`, `alt`, `lalt`, `ralt`, `win` | `"ctrl"`, `"shift"` |
| **Mũi tên** | `up`, `down`, `left`, `right` | `"up"`, `"down"` |
| **Di chuyển** | `pageup`, `pagedown`, `home`, `end` | `"pageup"` |
| **Khoảng trắng** | `space`, `tab`, `enter`, `backspace` | `"space"`, `"tab"` |
| **Xóa/Chèn** | `delete` / `del`, `insert` / `ins` | `"del"` |
| **Đặc biệt** | `esc` / `escape`, `capslock` / `caps`, `numlock`, `scrolllock`, `printscreen` / `prtsc`, `pause`, `menu` | `"esc"` |
| **Ký hiệu** | `minus` / `-`, `equal` / `=`, `lbracket` / `[`, `rbracket` / `]`, `backslash` / `\`, `semicolon` / `;`, `apostrophe` / `'`, `grave` / `` ` ``, `comma` / `,`, `period` / `.`, `slash` / `/` | `"-"`, `"."` |
| **Numpad** | `numpad0`–`numpad9` (hoặc `kp0`–`kp9`), `numpad_add`, `numpad_subtract`, `numpad_multiply`, `numpad_divide`, `numpad_enter`, `numpad_decimal` | `"numpad5"`, `"kp_add"` |
| **Chuột** | `mouse_left` / `mouse1`, `mouse_right` / `mouse2`, `mouse_middle` / `mouse3`, `mouse4`, `mouse5` | `"mouse_left"` |

### 2.2 Tự động click vào nút UI (`POST /api/client/click_button`)
Tìm nút trên màn hình hiện tại và click vào nó.
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/client/click_button \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"button_text": "singleplayer"}'
```

### 2.3 Đổi cài đặt Video (`POST /api/client/settings`)
Đổi nhanh cấu hình hiển thị.
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/client/settings \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"fov": 90, "renderDistance": 12}'
```

### 2.4 Lấy thông tin Debug / F3 (`GET /api/client/debug`)
Lấy thông tin từ màn hình F3 Debug mà **không cần mở F3**. Có thể lấy toàn bộ hoặc chỉ một vài trường.

**Tham số query (URL):**
| Tham số | Mô tả |
|---------|-------|
| `fields` | Danh sách trường cách nhau bởi dấu phẩy. Nếu bỏ trống, trả về **tất cả**. |

**Các trường hỗ trợ:** `fps`, `days`, `xyz`, `chunk`, `dimension`, `biome`

**Ví dụ — Lấy toàn bộ thông tin:**
```bash
curl -H "Authorization: Bearer <token>" -X GET http://localhost:25566/api/client/debug
```

**Ví dụ — Chỉ lấy FPS:**
```bash
curl -H "Authorization: Bearer <token>" -X GET "http://localhost:25566/api/client/debug?fields=fps"
```

**Ví dụ — Lấy FPS và số ngày đã chơi:**
```bash
curl -H "Authorization: Bearer <token>" -X GET "http://localhost:25566/api/client/debug?fields=fps,days"
```

**Ví dụ — Lấy tọa độ và biome:**
```bash
curl -X GET "http://localhost:25566/api/client/debug?fields=xyz,biome"
```

### 2.5 Chụp màn hình (`GET /api/client/screenshot`)
Chụp cửa sổ game hiện tại, nén thành JPEG base64, tối ưu cho YOLO object detection.

**Tham số query:**
| Tham số | Kiểu | Mặc định | Mô tả |
|---------|------|----------|-------|
| `width` | int | 640 | Chiều rộng đích (64-1920) |
| `height` | int | 360 | Chiều cao đích (36-1080) |
| `quality` | int | 85 | Chất lượng JPEG (10-100) |

**Ví dụ:**
```bash
curl -H "Authorization: Bearer <token>" http://localhost:25566/api/client/screenshot
```

**Phản hồi:**
```json
{
  "success": true,
  "data": {
    "width": 640,
    "height": 360,
    "original_width": 1920,
    "original_height": 1080,
    "format": "jpeg",
    "quality": 85,
    "image": "/9j/4AAQSkZJRg...base64..."
  }
}
```

Trường `image` là chuỗi JPEG base64. Mặc định (640×360, quality 85) ~30-60 KB (40-80 KB base64).

**Dùng với YOLO bên ngoài (Python):**
```python
import requests, base64, cv2, numpy as np

r = requests.get("http://localhost:25566/api/client/screenshot",
                 headers={"Authorization": "Bearer <token>"})
img_b64 = r.json()["data"]["image"]
img_bytes = base64.b64decode(img_b64)
img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
# Chạy YOLO detection trên img
```

---

## 3. Nhóm Lệnh Player (Điều Khiển Người Chơi)

### 3.1 Dịch chuyển (`POST /api/player/teleport`)
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/player/teleport \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"x": 100, "y": 70, "z": 200}'
```

### 3.2 Nhìn theo hướng (`POST /api/player/look`)
Đặt hướng nhìn tuyệt đối (yaw/pitch) hoặc tương đối (deltaYaw/deltaPitch).

**Tham số:**
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `yaw` | Số | Hướng ngang tuyệt đối (0-360). 0 = Nam, 90 = Tây, 180 = Bắc, 270 = Đông |
| `pitch` | Số | Hướng dọc tuyệt đối. -90 = nhìn lên trời, 0 = thẳng, 90 = nhìn xuống đất |
| `deltaYaw` | Số | Quay ngang tương đối. Dương = quay phải, Âm = quay trái |
| `deltaPitch` | Số | Quay dọc tương đối. Dương = nhìn xuống, Âm = nhìn lên |

**Ví dụ — Đặt hướng nhìn tuyệt đối:**
```bash
curl -X POST http://localhost:25566/api/player/look \
     -H "Content-Type: application/json" \
     -d '{"yaw": 90.0, "pitch": 0.0}'
```

**Ví dụ — Quay phải 90 độ:**
```bash
curl -X POST http://localhost:25566/api/player/look \
     -H "Content-Type: application/json" \
     -d '{"deltaYaw": 90.0}'
```

**Ví dụ — Nhìn lên 45 độ và quay trái 30 độ cùng lúc:**
```bash
curl -X POST http://localhost:25566/api/player/look \
     -H "Content-Type: application/json" \
     -d '{"deltaYaw": -30.0, "deltaPitch": -45.0}'
```

**Ví dụ — Xoay 360 độ (quay tròn):**
```bash
curl -X POST http://localhost:25566/api/player/look \
     -H "Content-Type: application/json" \
     -d '{"deltaYaw": 360}'
```

### 3.3 Nhảy (`POST /api/player/jump`) và Vung tay (`POST /api/player/swing`)
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/player/jump \
     -H "Authorization: Bearer <token>"
```
```bash
curl -X POST http://localhost:25566/api/player/swing \
     -H "Authorization: Bearer <token>"
```

### 3.4 Lấy tọa độ và Danh sách người chơi (`GET`)
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -H "Authorization: Bearer <token>" -X GET http://localhost:25566/api/player/position
```
```bash
curl -H "Authorization: Bearer <token>" -X GET http://localhost:25566/api/player/list
```

---

## 4. Nhóm Lệnh Block (Xây Dựng, Đập Phá)

### 4.1 Đặt Block (`POST /api/block/place`)
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/block/place \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"x": 10, "y": 64, "z": 10, "block": "minecraft:diamond_block"}'
```

### 4.2 Phá Block (`POST /api/block/break`)
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/block/break \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"x": 10, "y": 64, "z": 10}'
```

### 4.3 Tương tác Block (Chuột phải) (`POST /api/block/interact`)
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/block/interact \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"x": 10, "y": 64, "z": 10}'
```

### 4.4 Lấy thông tin Block (`GET /api/block/get`)
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -H "Authorization: Bearer <token>" "http://localhost:25566/api/block/get?x=10&y=64&z=10"
```

---

## 5. Nhóm Lệnh Túi Đồ (Inventory)

### 5.1 Chọn ô cầm trên tay (`POST /api/inventory/select`)
Chuyển đổi vật phẩm đang cầm (Hotbar slot 0 -> 8).
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/inventory/select \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"slot": 2}'
```

### 5.2 Đặt item vào vị trí bất kỳ (`POST /api/inventory/set`)
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/inventory/set \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"slot": 0, "item": "minecraft:netherite_sword", "count": 1}'
```

### 5.3 Vứt vật phẩm (`POST /api/inventory/drop`)
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/inventory/drop \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"slot": 0, "all": true}'
```

### 5.4 Lấy danh sách item (`GET /api/inventory/get`)
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -H "Authorization: Bearer <token>" -X GET http://localhost:25566/api/inventory/get
```

---

## 6. Nhóm Lệnh Thế Giới & Máy Chủ (World & Server)

### 6.1 Đổi Thời Gian (`POST /api/world/time`)
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/world/time \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"time": 1000}'
```

### 6.2 Đổi Thời Tiết (`POST /api/world/weather`)
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/world/weather \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"weather": "thunder", "duration": 6000}'
```

### 6.3 Chạy lệnh Minecraft Server bất kì (`POST /api/command`)
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/command \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"command": "kill @e[type=zombie]"}'
```

### 6.4 Nhắn tin Chat (`POST /api/chat/send`)
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/chat/send \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello Server!"}'
```

### 6.5 Đổi Game Rule & Độ Khó (`POST /api/settings/gamerule` & `difficulty`)
**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/settings/gamerule \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"rule": "keepInventory", "value": "true"}'
```
```bash
curl -X POST http://localhost:25566/api/settings/difficulty \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"difficulty": "hard"}'
```

---

## 7. Hệ Thống Script / Macro (Chạy Nhiều Lệnh Cùng Lúc)

### 7.1 Chạy Script (`POST /api/script`)
Gửi **một danh sách lệnh** để thực thi tuần tự. Hỗ trợ cả **JSON** và **Text siêu ngắn**.

#### Cú pháp JSON:
```bash
curl -X POST http://localhost:25566/api/script \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '[
        {"action": "key", "keys": ["w", "ctrl"], "duration": 2000},
        {"action": "delay", "duration": 500},
        {"action": "look", "deltaYaw": 90},
        {"action": "chat", "message": "Quay xong rồi!"},
        {"action": "command", "command": "time set day"}
      ]'
```

#### Cú pháp Text (Siêu ngắn, mỗi dòng một lệnh):
```bash
curl -X POST http://localhost:25566/api/script \
     -H "Authorization: Bearer <token>" \
     -d 'key w,ctrl 2000
delay 500
look 90 0
chat Quay xong rồi!
command time set day'
```

**Các action hỗ trợ:**

| Action | Cú pháp JSON | Cú pháp Text | Mô tả |
|--------|-------------|--------------|-------|
| `key` | `{"action":"key", "keys":["w","ctrl"], "duration":1000}` | `key w,ctrl 1000` | Nhấn phím |
| `delay` | `{"action":"delay", "duration":500}` | `delay 500` | Chờ N ms |
| `look` | `{"action":"look", "deltaYaw":90, "deltaPitch":0}` | `look 90 0` | Xoay camera |
| `chat` | `{"action":"chat", "message":"Hi"}` | `chat Hi` | Gửi tin nhắn |
| `command` | `{"action":"command", "command":"time set day"}` | `command time set day` | Chạy lệnh MC |

**Ví dụ thực tế — Bot tự động đào hầm:**
```bash
curl -X POST http://localhost:25566/api/script \
     -H "Authorization: Bearer <token>" \
     -d 'key w 500
key mouse_left 200
delay 100
key w 500
key mouse_left 200'
```

### 7.2 Hủy tất cả lệnh đang chạy (`POST /api/cancel`)
Dừng ngay lập tức tất cả các script, phím đang được giữ, và lệnh đang chờ.

**Ví dụ cURL hoàn chỉnh:**
```bash
curl -X POST http://localhost:25566/api/cancel \
     -H "Authorization: Bearer <token>"
```

**Kịch bản sử dụng:** Bạn chạy một script giữ phím W trong 60 giây, nhưng muốn dừng sau 5 giây:
```bash
# Bắt đầu đi
curl -X POST http://localhost:25566/api/client/input \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"keys": ["w"], "duration": 60000}'

# 5 giây sau, hủy!
curl -X POST http://localhost:25566/api/cancel \
     -H "Authorization: Bearer <token>"
```

---

## 8. AI Endpoints (OpenAI Gym Style)

Các endpoint này biến MC-API thành **môi trường huấn luyện AI** như OpenAI Gym / MineRL. Thay vì gọi hàng chục endpoint riêng lẻ, agent AI chỉ cần 2 khái niệm: **Quan sát (Observation)** và **Hành động (Action)**.

```
GET /observation → AI xử lý → POST /action → [game tick] → GET /observation ...
```

Hoặc dạng step kết hợp:
```
POST /step {actions} → {observation}
```

### 8.1 Tạo Session (`POST /session`)

Tạo một phiên làm việc AI mới (tùy chọn - để theo dõi nhiều agent).

```bash
curl -X POST http://localhost:25566/session \
     -H "Authorization: Bearer <token>"
```

**Phản hồi:**
```json
{
  "success": true,
  "message": "Session created",
  "data": { "session_id": "sess_...", "created_at": 1712345678000 }
}
```

### 8.2 Lấy Observation (`GET /observation`)

Trả về observation có cấu trúc đầy đủ của trạng thái game hiện tại. Đây là cách chính để AI "nhìn thấy" thế giới Minecraft.

```bash
curl -H "Authorization: Bearer <token>" http://localhost:25566/observation
```

**Cấu trúc phản hồi (schema cố định cho ML):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "protocol": 1,
    "tick": 34100,
    "world": {
      "time": 12000,
      "day": 5,
      "is_day": true,
      "weather": "clear",
      "dimension": 0
    },
    "player": {
      "position": [120.5, 64.0, -42.3],
      "rotation": { "yaw": 90.0, "pitch": -20.0, "facing": "West" },
      "velocity": [0.0, 0.0, 0.0],
      "status": [20, 15, 20, 5, 300],
      "flags": [1, 0, 0, 0, 0, 0]
    },
    "camera": { "fov": 70, "matrix": [16, 9] },
    "inventory": {
      "slots": [[3, 5, 64], [17, 1, 32], ...],
      "selected_slot": 3
    },
    "target": { "block_id": 56, "distance": 4.5, "face": 1 },
      "viewport_blocks": [[5, 1, 1], [3, 3, 4], ...],
    "viewport_entities": [[54, 3.2, 0.0, 5.1, 180, 0, 20, 6.0], ...],
    "screen": {
      "id": "minecraft:title",
      "title": "Minecraft",
      "type": "menu",
      "pause_game": false,
      "components": [
        { "id": 0, "type": "button", "text": "Singleplayer", "enabled": true, "visible": true, "focused": false }
      ],
      "navigation": ["Main Menu"]
    }
  }
}
```

**Mô tả các trường:**

| Trường | Mô tả |
|--------|-------|
| `protocol` | Phiên bản giao thức (tương thích ngược) |
| `tick` | Bộ đếm tick Minecraft (20 tick = 1 giây) |
| `world.time` | Thời gian trong ngày (0-24000) |
| `world.day` | Số ngày đã chơi |
| `world.is_day` | Ban ngày hay không |
| `world.weather` | `"clear"`, `"rain"`, hoặc `"thunder"` |
| `world.dimension` | 0=Overworld, 1=Nether, 2=End |
| `player.position` | Tọa độ [x, y, z] |
| `player.rotation` | yaw, pitch, và hướng chính (bắc/nam/đông/tây) |
| `player.velocity` | Vector vận tốc [x, y, z] |
| `player.status` | [health, food, saturation, armor, air] |
| `player.flags` | [on_ground, sprinting, sneaking, swimming, flying, sleeping] (0/1) |
| `camera.fov` | Góc nhìn hiện tại |
| `camera.matrix` | Lưới tia depth-map [width, height] |
| `inventory.slots` | Sparse slots [slot_index, item_id, count] (chỉ slot có đồ) |
| `inventory.selected_slot` | Slot hotbar đang cầm (0-8) |
| `target.block_id` | ID khối đang ngắm |
| `target.distance` | Khoảng cách tới khối đang ngắm |
| `target.face` | Mặt của khối (0=Trên,1=Dưới,2=Bắc,3=Nam,4=Đông,5=Tây) |
| `viewport_blocks` | RLE: [[count, depth, blockId], ...] — gộp tia liên tiếp giống nhau |
| `viewport_entities` | Thực thể nhìn thấy [type_id, relX, relY, relZ, yaw, pitch, health, distance] |
| `screen` | Thông tin màn hình UI (chỉ xuất hiện khi có màn hình đang mở) |

### 8.3 Gửi Hành động (`POST /action`)

Gửi một hoặc nhiều hành động để thực thi trong tick game hiện tại. Tương đương với `env.step(action)`.

```bash
curl -X POST http://localhost:25566/action \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"actions": [{"type": "jump"}, {"type": "swing"}]}'
```

**Các loại hành động:**

| Loại | Tham số | Mô tả |
|------|---------|-------|
| `key` | `keys: ["w","ctrl"]`, `duration?: 1000` | Nhấn/thả phím bàn phím |
| `select_slot` | `slot: 2` | Chọn slot hotbar (0-8) |
| `place` | `face: "up"/"down"/"north"/"south"/"east"/"west"` | Đặt block vào mặt đang ngắm |
| `break` | *(không)* | Phá khối đang ngắm |
| `interact` | *(không)* | Click chuột phải khối đang ngắm |
| `jump` | *(không)* | Nhảy |
| `swing` | *(không)* | Vung tay |
| `look` | `yaw/pitch` hoặc `deltaYaw/deltaPitch` | Xoay hướng nhìn |
| `craft` | `recipe: "minecraft:chest"`, `mode: "craft_once"` | Chế tạo đồ |
| `chat` | `message: "hello"` | Gửi tin nhắn chat |
| `command` | `command: "/say hello"` | Chạy lệnh Minecraft |
| `click_button` | `button_text: "Singleplayer"` | Click nút UI |

**Ví dụ — Đi tới + nhảy:**
```bash
curl -X POST http://localhost:25566/action \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"actions": [{"type": "key", "keys": ["w"], "duration": 1000}, {"type": "jump"}]}'
```

**Ví dụ — Chọn slot, đặt block, xoay người:**
```bash
curl -X POST http://localhost:25566/action \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"actions": [
       {"type":"select_slot", "slot": 2},
       {"type":"place", "face":"north"},
       {"type":"look", "deltaYaw": 90}
     ]}'
```

### 8.4 Step Kết Hợp (`POST /step`)

Kết hợp gửi hành động và lấy observation trong một lần gọi. Tương đương `env.step(action)` trong OpenAI Gym / MineRL.

```bash
curl -X POST http://localhost:25566/step \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"actions": [{"type": "jump"}]}'
```

**Phản hồi:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "tick": 34101,
    "observation": { ... }
  }
}
```

Trường `observation` có cấu trúc giống endpoint `/observation`. Observation phản ánh trạng thái game **sau khi** hành động đã được xử lý.

### 8.5 Stream Observation (`GET /stream`)

Mở kết nối Server-Sent Events (SSE) để nhận observation mới mỗi tick game (~50ms). Hữu ích cho giám sát thời gian thực hoặc điều khiển AI.

```bash
curl -N -H "Authorization: Bearer <token>" http://localhost:25566/stream
```

**Định dạng đầu ra:**
```
data: {"protocol":1,"tick":34100,...}

data: {"protocol":1,"tick":34101,...}

data: {"protocol":1,"tick":34102,...}
...
```

Kết nối giữ nguyên cho đến khi client ngắt kết nối.

### 8.6 Đóng Session (`POST /close`)

Đóng phiên AI và hủy tất cả tác vụ đang chạy (phím đang giữ, script, v.v.).

```bash
curl -X POST http://localhost:25566/close \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"session_id": "sess_..."}'
```

Không có session_id, hủy toàn bộ tác vụ:
```bash
curl -X POST http://localhost:25566/close \
     -H "Authorization: Bearer <token>"
```

---

### Hướng Dẫn AI Agent

Xem tài liệu hướng dẫn chi tiết cách AI đọc JSON observation và làm chủ Minecraft tại [AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md).

---

## 9. Chi Tiết Schema Observation

### Inventory Slots

Inventory là mảng **sparse**: chỉ chứa các slot có đồ, mỗi phần tử là `[slot_index, item_id, count]`. Nếu rỗng, mảng là `[]`.

| Phần tử | Mô tả |
|---------|-------|
| `slot_index` | Vị trí slot (0-40), xem bảng bên dưới |
| `item_id` | ID numeric của item |
| `count` | Số lượng (1-99) |

**Bố trí slot tham chiếu:**

| Index | Loại | Số lượng |
|-------|------|----------|
| 0-8 | Hotbar | 9 |
| 9-35 | Main inventory | 27 |
| 36-39 | Giáp (giày, quần, áo, mũ) | 4 |
| 40 | Offhand | 1 |

### Viewport Blocks

Mảng **RLE** (Run-Length Encoding): `[[count, depth, blockId], ...]` — gộp các tia liên tiếp giống nhau. Mỗi phần tử: `count` = số tia liên tiếp, `depth` = khoảng cách (1-32), `blockId` = ID block bề mặt (0 nếu depth=32).

### Viewport Entities

Mảng tối đa **16 thực thể** nhìn thấy, mỗi thực thể có 8 giá trị:
`[entity_type_id, relX, relY, relZ, yaw, pitch, health, distance]`

Thực thể vượt quá 16 bị bỏ qua. Chỉ trả về entity thực tế (không pad rỗng; mảng có 0–16 phần tử).

### Player Flags (boolean, 0 hoặc 1)

| Index | Flag |
|-------|------|
| 0 | on_ground (đang đứng trên đất) |
| 1 | sprinting (đang chạy) |
| 2 | sneaking (đang né) |
| 3 | swimming (đang bơi) |
| 4 | flying (đang bay) |
| 5 | sleeping (đang ngủ) |

---

## 10. Bảng Tra Cứu (Numeric ID)

Observation JSON dùng **numeric ID** (số nguyên, không phải chuỗi) cho item, block, entity. Các ID này lấy từ `BuiltInRegistries.getId()` — là **thứ tự runtime** trong registry.

> **⚠️ Quan trọng:** Numeric ID có tính động — phụ thuộc vào thứ tự nạp registry. Ổn định trong cùng phiên chơi nhưng có thể khác giữa các lần khởi động hoặc khi có mod khác. Để định danh ổn định, dùng namespaced ID (`minecraft:stone`) làm chuẩn.

### Bố Trí Inventory (41 slots)

| Index | Khu vực | Số lượng |
|-------|---------|----------|
| 0 - 8 | Hotbar | 9 |
| 9 - 35 | Main inventory | 27 |
| 36 - 39 | Giáp (giày, quần, áo, mũ) | 4 |
| 40 | Offhand | 1 |

### Player Flags (index → ý nghĩa)

| Index | Flag |
|-------|------|
| 0 | on_ground (đang đứng trên đất) |
| 1 | sprinting (đang chạy) |
| 2 | sneaking (đang né) |
| 3 | swimming (đang bơi) |
| 4 | flying (đang bay) |
| 5 | sleeping (đang ngủ) |

### Player Status (index → field)

| Index | Field | Khoảng |
|-------|-------|--------|
| 0 | health | 0-20 |
| 1 | food | 0-20 |
| 2 | saturation | 0-20 |
| 3 | armor | 0-20+ |
| 4 | air | 0-300 |

### Dimension ID

| ID | Dimension |
|----|-----------|
| 0 | Overworld |
| 1 | Nether |
| 2 | End |

### Block Face (target.face)

| ID | Mặt |
|----|-----|
| 0 | Trên (Up) |
| 1 | Dưới (Down) |
| 2 | Bắc (North) |
| 3 | Nam (South) |
| 4 | Tây (West) |
| 5 | Đông (East) |

### Weather

| Giá trị | Ý nghĩa |
|---------|---------|
| `"clear"` | Trời trong |
| `"rain"` | Mưa |
| `"thunder"` | Mưa + sấm chớp |

### Endpoint Tra Cứu Registry

AI agent có thể dùng các endpoint sau để lấy mapping ID → tên trực tiếp từ registry runtime:

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/registry/entities` | GET | Trả về `{"entities": {"0": "minecraft:allay", "1": "minecraft:area_effect_cloud", ...}}` |
| `/api/registry/items` | GET | Trả về `{"items": {"0": "minecraft:air", "1": "minecraft:stone", ...}}` |

**Ví dụ:**
```bash
curl -H "Authorization: Bearer <token>" http://localhost:25566/api/registry/entities
```

> **Công dụng:** AI agent gọi một lần mỗi session để xây bảng tra ID → tên, không cần hardcode ID.

### Namespaced ID Của Block & Item Phổ Biến

**Đá & Khoáng sản:**
`minecraft:stone`, `minecraft:cobblestone`, `minecraft:deepslate`, `minecraft:granite`, `minecraft:diorite`, `minecraft:andesite`, `minecraft:tuff`, `minecraft:calcite`, `minecraft:obsidian`, `minecraft:bedrock`, `minecraft:dirt`, `minecraft:grass_block`, `minecraft:gravel`, `minecraft:sand`

**Quặng:**
`minecraft:coal_ore`, `minecraft:iron_ore`, `minecraft:copper_ore`, `minecraft:gold_ore`, `minecraft:diamond_ore`, `minecraft:emerald_ore`, `minecraft:redstone_ore`, `minecraft:lapis_ore`, `minecraft:nether_quartz_ore`, `minecraft:nether_gold_ore`, `minecraft:ancient_debris`

**Gỗ:**
`minecraft:oak_log`, `minecraft:oak_planks`, `minecraft:spruce_log`, `minecraft:birch_log`, `minecraft:jungle_log`, `minecraft:acacia_log`, `minecraft:dark_oak_log`, `minecraft:mangrove_log`, `minecraft:cherry_log`, `minecraft:bamboo`

**Item Quan Trọng:**
`minecraft:diamond`, `minecraft:iron_ingot`, `minecraft:gold_ingot`, `minecraft:copper_ingot`, `minecraft:netherite_ingot`, `minecraft:stick`, `minecraft:bone`, `minecraft:string`, `minecraft:leather`, `minecraft:flint`, `minecraft:feather`

**Tools & Vũ Khí:**
`minecraft:wooden_sword`, `minecraft:stone_sword`, `minecraft:iron_sword`, `minecraft:diamond_sword`, `minecraft:netherite_sword`, `minecraft:bow`, `minecraft:crossbow`, `minecraft:trident`, `minecraft:shield`, `minecraft:mace`, `minecraft:wooden_pickaxe`, `minecraft:stone_pickaxe`, `minecraft:iron_pickaxe`, `minecraft:diamond_pickaxe`, `minecraft:netherite_pickaxe`

**Đồ ăn:**
`minecraft:apple`, `minecraft:golden_apple`, `minecraft:bread`, `minecraft:cooked_beef`, `minecraft:cooked_porkchop`, `minecraft:cooked_chicken`, `minecraft:carrot`, `minecraft:baked_potato`

### Screen ID Phổ Biến

| Screen ID | Tên Màn Hình |
|-----------|-------------|
| `minecraft:title` | Màn hình chính |
| `minecraft:pause` | Menu Pause |
| `minecraft:options` | Cài đặt |
| `minecraft:inventory` | Túi đồ |
| `minecraft:creative_inventory` | Kho sáng tạo |
| `minecraft:crafting` | Bàn chế tạo |
| `minecraft:furnace` | Lò nung |
| `minecraft:anvil` | Đe |
| `minecraft:chest` | Rương |
| `minecraft:death` | Màn hình chết |
| `minecraft:villager_trades` | Giao dịch dân làng |
