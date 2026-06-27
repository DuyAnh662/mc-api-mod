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
