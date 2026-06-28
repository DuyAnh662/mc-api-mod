# Hướng Dẫn AI Agent: Làm Chủ Minecraft với MC-API

> **Đối tượng:** AI agent / LLM điều khiển Minecraft qua MC-API.
> **Mục tiêu:** Hiểu toàn bộ JSON observation và đưa ra hành động thông minh để làm chủ mọi khía cạnh của game.

---

## 1. Vòng Lặp Cốt Lõi

```
┌──────────────────┐     ┌──────────────┐     ┌────────────┐
│  QUAN SÁT        │ ──> │  SUY NGHĨ /  │ ──> │  HÀNH ĐỘNG │
│  GET /observation│     │ QUYẾT ĐỊNH   │     │POST /step  │
│  hoặc/stream     │     │              │     │hoặc /action|
└──────────────────┘     └──────────────┘     └────────────┘
        ^                                      │
        └──────────────────────────────────────┘
                lặp lại mỗi tick (~50ms)
```

**Hai chế độ:**
- **Step mode:** `POST /step` với actions → nhận observation sau 1 tick. Giống `env.step(action)` trong Gym.
- **Stream mode:** `GET /stream` (SSE) → đẩy observation mỗi tick. Gửi `/action` riêng.

---

## 2. Observation JSON — Từng Trường Một

### 2.1 Cấu Trúc Tổng Quan

```json
{
  "success": true,
  "data": {
    "protocol": 1,
    "tick": 34100,
    "world": { ... },
    "player": { ... },
    "camera": { ... },
    "inventory": { ... },
    "target": { ... },
    "viewport_blocks": [ ... ],
    "viewport_entities": [ ... ],
    "screen": { ... }
  }
}
```

### 2.2 `protocol` (int)
Phiên bản giao thức. Hiện tại là `1`. Nếu thay đổi → schema JSON có thể đã thay đổi.

### 2.3 `tick` (long)
Số tick game. **20 ticks = 1 giây.** Dùng để:
- Đo thời gian giữa các hành động
- Phát hiện game bị đứng (tick không tăng)
- Đồng bộ với trạng thái game

### 2.4 `world` — Môi Trường

```json
{
  "time": 12000,
  "day": 5,
  "is_day": true,
  "weather": "clear",
  "dimension": 0
}
```

| Trường | Ý nghĩa |
|--------|---------|
| `time` | 0-24000. 0=bình minh, 6000=trưa, 12000=hoàng hôn, 18000=nửa đêm |
| `day` | Số ngày trong game đã qua |
| `is_day` | Ban ngày (`time < 13000`) |
| `weather` | `"clear"` (an toàn), `"rain"` (giảm tầm nhìn), `"thunder"` (nguy hiểm) |
| `dimension` | `0`=Overworld, `1`=Nether, `2`=End |

**Logic AI:**
- `is_day == false` và không có giường/công cụ → xây nơi trú ẩn
- `weather == "thunder"` → trú ẩn hoặc đội mũ giáp (chống sét)
- `dimension == 1` (Nether) → cần kháng lửa
- `dimension == 2` (End) → cần slow falling, ender pearls

### 2.5 `player` — Bạn Là Ai

```json
{
  "position": [120.5, 64.0, -42.3],
  "rotation": { "yaw": 90.0, "pitch": -20.0, "facing": "West" },
  "velocity": [0.0, 0.0, 0.0],
  "status": [20, 15, 20, 5, 300],
  "flags": [1, 0, 0, 0, 0, 0]
}
```

#### `position` — tọa độ tuyệt đối `[x, y, z]`
- `y` dưới -64 = void (đang chết)
- `y` = mực nước biển là 63
- Mặt đất thường ở y=62 đến y=70
- Hang động ở y=-32 đến y=0

#### `rotation` — hướng nhìn
- `yaw`: 0=Nam, 90=Tây, 180=Bắc, 270=Đông
- `pitch`: -90=nhìn lên trời, 0=thẳng, 90=nhìn xuống đất
- `facing`: hướng chính

#### `velocity` — vector di chuyển `[x, y, z]`
- Gần 0 = đang đứng yên
- `y > 0` = đang nhảy lên / bay lên
- `y < 0` = đang rơi
- Nếu `y < -0.5` và `flags[0] == 0` → đang rơi (nguy hiểm)

#### `status` — chỉ số sinh tồn `[health, food, saturation, armor, air]`

| Index | Trường | Khoảng | Ngưỡng nguy hiểm |
|-------|--------|--------|------------------|
| 0 | Máu | 0-20 | ≤ 5 (bỏ chạy, ăn) |
| 1 | Thức ăn | 0-20 | ≤ 6 (không chạy được), = 0 (mất máu) |
| 2 | Độ no | 0-20 | > 0 thì chưa mất thức ăn |
| 3 | Giáp | 0-20+ | Cao hơn = giảm sát thương |
| 4 | Khí | 0-300 | < 300 (đang ở dưới nước), = 0 (chết đuối) |

#### `flags` — trạng thái nhị phân

| Index | Flag | Ý nghĩa |
|-------|------|---------|
| 0 | on_ground | Có thể nhảy. Nếu 0 và vận tốc y < 0 → đang rơi |
| 1 | sprinting | Chạy nhanh, tốn thức ăn |
| 2 | sneaking | Đi chậm, không rơi khỏi cạnh |
| 3 | swimming | Đang bơi |
| 4 | flying | Đang bay (elytra) |
| 5 | sleeping | Đang ngủ |

### 2.6 `camera` — Thông Số Thị Giác

```json
{
  "fov": 70,
  "matrix": [16, 9]
}
```

- `fov`: góc nhìn hiện tại
- `matrix`: lưới tia depth-map `viewport_blocks` = `[width=16, height=9]` (144 tia)

### 2.7 `inventory` — Đồ Trong Người

```json
{
  "slots": [
    [0, 0], [1, 64], [0, 0], [5, 32], [3, 1], ...
  ],
  "selected_slot": 3
}
```

**41 slot cố định:**

| Index | Khu vực | Số lượng |
|-------|---------|----------|
| 0-8 | Hotbar | 9 |
| 9-35 | Túi chính | 27 |
| 36-39 | Giáp (giày→quần→áo→mũ) | 4 |
| 40 | Tay trái | 1 |

Mỗi slot là `[item_id, count]`:
- `[0, 0]` = rỗng
- `[1, 64]` = 64 item_id 1 (stone)
- `[3, 1]` = 1 item_id 3 (dirt)

### 2.8 `target` — Bạn Đang Nhìn Gì

```json
{
  "block_id": 56,
  "distance": 4.5,
  "face": 1
}
```

- `block_id`: ID khối đang nhắm (0 = không có gì)
- `distance`: khoảng cách
- `face`: mặt nào của khối:

| Face ID | Ý nghĩa |
|---------|---------|
| 0 | Trên (↑) |
| 1 | Dưới (↓) |
| 2 | Bắc |
| 3 | Nam |
| 4 | Tây |
| 5 | Đông |

**Logic AI:**
- `block_id == 0` → nhìn lên trời/xa quá
- `distance <= 4.5` → trong tầm với
- `face: 0` (đỉnh) → đặt khối sẽ đặt BÊN DƯỚI khối đang nhìn

### 2.9 `viewport_blocks` — Depth-Map

Mảng **144 số nguyên** (16×9 tia). Mỗi giá trị là khoảng cách (1–32 block) tới khối đặc đầu tiên. 32 = không vật cản.

**Thứ tự:** height → width:
```
arr[h * 16 + w] = depth
```

**Logic AI:**
- Giá trị nhỏ (1–3) = tường/va chạm gần → không đi được hướng đó
- Giá trị lớn (20–32) = đường thoáng → có thể đi
- Nhiều tia liền kề có giá trị nhỏ → tường/vách đá
- Giá trị 32 ở trung tâm → đường đi thẳng phía trước

### 2.10 `viewport_entities` — Sinh Vật Gần Đó

Tối đa 16 entity, mỗi entity:

```json
[entity_type_id, relX, relY, relZ, yaw, pitch, health, distance]
```

**Logic AI:**
- Entity thù địch cách < 5 blocks → **chạy hoặc đánh**
- Entity hiền (bò, gà) → nguồn thức ăn
- `health == 0` → đã chết

### 2.11 `screen` — UI

Chỉ xuất hiện khi đang có màn hình UI mở.

| Screen ID | Màn hình | Cách thoát |
|-----------|----------|------------|
| `minecraft:title` | Màn hình chính | Click "Singleplayer" |
| `minecraft:select_world` | Chọn thế giới | Click tên world |
| `minecraft:inventory` | Túi đồ | Nhấn E |
| `minecraft:pause` | Tạm dừng | Click "Resume" hoặc Esc |
| `minecraft:death` | Chết | Click "Respawn" |
| `minecraft:crafting` | Bàn chế tạo | Nhấn Esc |

---

## 3. Hành Động (Actions)

| Bạn muốn | Hành động |
|----------|-----------|
| Đi tới | `{"type":"key","keys":["w"]}` |
| Chạy | `{"type":"key","keys":["w","ctrl"]}` |
| Nhảy | `{"type":"jump"}` |
| Xoay người | `{"type":"look","deltaYaw":90}` |
| Phá khối | `{"type":"break"}` |
| Đặt khối | `{"type":"place","face":"up"}` |
| Tương tác | `{"type":"interact"}` |
| Tấn công | `{"type":"swing"}` |
| Chọn slot | `{"type":"select_slot","slot":2}` |
| Chế tạo | `{"type":"craft","recipe":"minecraft:chest"}` |
| Chat | `{"type":"chat","message":"xin chào"}` |
| Lệnh | `{"type":"command","command":"/time set day"}` |
| Click nút | `{"type":"click_button","button_text":"Chơi đơn"}` |
| Đóng màn hình | `{"type":"key","keys":["esc"]}` |

---

## 4. Kịch Bản Làm Chủ Game

### 4.1 Vào Game (từ màn hình chính)

```
B1: QUAN SÁT → screen.id == "minecraft:title"
B2: HÀNH ĐỘNG → click_button "Singleplayer"
B3: QUAN SÁT → screen.id == "minecraft:select_world"
B4: HÀNH ĐỘNG → click_button "My World"
B5: QUAN SÁT → không còn screen (đã vào game!)
```

### 4.2 Sinh Tồn Cơ Bản — 5 Phút Đầu

```
1. QUAN SÁT → status [20,20,20,0,300]
2. HÀNH ĐỘNG → nhìn xuống, phá cây (break)
3. LẶP → đến khi có 4+ logs
4. QUAN SÁT → inventory có logs
5. HÀNH ĐỘNG → craft "minecraft:crafting_table"
6. Chế tạo wooden pickaxe, rồi cobblestone tools
```

### 4.3 Chiến Đấu

```
Chống zombie/spider:
1. Giữ khoảng cách 3-4 blocks
2. Di chuyển ngang (luân phiên a/d)
3. Tấn công (swing) khi mob gần
4. Nếu máu < 5: bỏ chạy, ăn, hồi máu

Chống skeleton:
1. Tiếp cận theo đường zigzag
2. Đánh cận chiến nhanh

Chống creeper:
1. Lùi lại (s key) vừa nhìn nó
2. Đánh 1 phát → lùi ngay
3. Đừng để nó đến gần < 2 blocks
```

### 4.4 Đào Khoáng

```
1. Đào cầu thang xuống y=11
2. Đào đường hầm 2 cao, cách nhau 3 khối
3. Nghe tiếng lava: dừng lại (hang động gần đó)
4. Kiểm tra target.block_id thường xuyên
```

---

## 5. Phục Hồi Lỗi

| Vấn đề | Nguyên nhân | Cách sửa |
|--------|-------------|----------|
| `tick` không tăng | Game bị đứng/tạm dừng | Ấn Esc, kiểm tra, Resume |
| `viewport_blocks` toàn 0 | Void/đang load | Di chuyển đến khu vực đã load |
| `screen.id == "minecraft:death"` | Bạn chết | Click "Respawn", lấy lại đồ |
| `target.block_id` luôn 0 | Nhìn trời/xa quá | Nhìn xuống hoặc lại gần |
| Inventory toàn [0,0] | Chưa vào game | Điều hướng từ title vào world |

---

> **Ghi nhớ:** Chìa khóa làm chủ Minecraft với AI là vòng lặp quan sát-hành động. Mỗi hành động thay đổi thế giới. Quan sát kết quả, cập nhật hiểu biết, lên kế hoạch hành động tiếp theo. Với schema đầy đủ ở trên, bạn có mọi thông tin cần thiết để chơi Minecraft tự động.
