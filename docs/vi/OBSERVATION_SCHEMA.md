# Observation JSON — Tham chiếu schema đầy đủ

> Mọi field, index, và giá trị trong observation JSON, được sắp xếp theo thứ bậc. Không trùng lặp.

---

## 1. Cấp cao nhất

```json
{
  "success": true,       // luôn true (false chỉ khi lỗi)
  "message": "ok",
  "data": {              // ← mọi thứ bên dưới nằm trong "data"
    "protocol": 1,
    "tick": 34100,
    "world": { ... },
    "player": { ... },
    "camera": { ... },
    "inventory": { ... },
    "target": { ... },
    "viewport_blocks": [ ... ],
    "viewport_entities": [ ... ],
    "screen": { ... }     // chỉ xuất hiện khi có UI screen mở
  }
}
```

---

## 2. `protocol` (int)

| Giá trị | Ý nghĩa |
|---------|---------|
| 1 | Phiên bản hiện tại |

---

## 3. `tick` (long)

Bộ đếm game tick. **20 ticks = 1 giây.** Reset khi tải world mới.

---

## 4. `world` — Trạng thái môi trường

| Field | Kiểu | Giá trị | Mô tả |
|-------|------|---------|-------|
| `time` | long | 0–24000 | Chu kỳ ngày-đêm. 0=bình minh, 6000=trưa, 12000=hoàng hôn, 18000=nửa đêm |
| `day` | long | 0+ | Số ngày đã trôi qua (time ÷ 24000) |
| `is_day` | bool | true/false | `true` nếu time < 13000 |
| `weather` | string | `"clear"` / `"rain"` / `"thunder"` | Thời tiết hiện tại |
| `dimension` | int | 0 / 1 / 2 | 0=Overworld, 1=Nether, 2=End |

---

## 5. `player` — Trạng thái người chơi

### 5.1 `player.position` — Tọa độ tuyệt đối

```json
[ x, y, z ]   // 3 số float
```

- `y < -64` = void (chết)
- `y ≈ 63` = mực nước biển
- `y = 62–70` = mặt đất thông thường

### 5.2 `player.rotation` — Hướng nhìn

| Field | Kiểu | Khoảng | Mô tả |
|-------|------|--------|-------|
| `yaw` | float | -180 đến 180 | 0=Nam, 90=Tây, ±180=Bắc, -90=Đông |
| `pitch` | float | -90 đến 90 | -90=lên, 0=ngang, 90=xuống |
| `facing` | string | `"South"`/`"West"`/`"North"`/`"East"` | Hướng chính |

### 5.3 `player.velocity` — Vector vận tốc

```json
[ vx, vy, vz ]   // 3 số float, blocks/tick
```

- Tất cả ≈ 0 = đứng yên
- `vy > 0` = đi lên (nhảy)
- `vy < 0` = rơi

### 5.4 `player.status` — Chỉ số sinh tồn (5 phần tử)

| Index | Field | Khoảng | Nguy hiểm |
|-------|-------|--------|-----------|
| 0 | máu | 0–20 | ≤ 5 nguy hiểm, = 0 chết |
| 1 | thức ăn | 0–20 | ≤ 6 không chạy được, = 0 đói (mất máu) |
| 2 | độ bão hòa | 0–20 | > 0 thì thức ăn chưa giảm |
| 3 | giáp | 0–20+ | Giảm sát thương |
| 4 | không khí | 0–300 | < 300 = dưới nước, = 0 ngạt thở |

### 5.5 `player.flags` — Trạng thái nhị phân (6 phần tử, 0 hoặc 1)

| Index | Flag | `1` có nghĩa |
|-------|------|--------------|
| 0 | on_ground | Đang chạm đất (có thể nhảy) |
| 1 | sprinting | Chạy nhanh hơn (tốn thức ăn) |
| 2 | sneaking | Đi chậm, không rơi khỏi mép |
| 3 | swimming | Trong nước/lava |
| 4 | flying | Đang lượn (elytra) |
| 5 | sleeping | Trên giường (bỏ qua đêm) |

---

## 6. `camera` — Cài đặt tầm nhìn

| Field | Kiểu | Khoảng | Mô tả |
|-------|------|--------|-------|
| `fov` | float | 30–110 | Trường nhìn (mặc định 70) |
| `matrix` | [int,int,int] | [16, 9, 32] | Kích thước viewport_blocks: [width, height, depth] |

`width × height × depth = 16 × 9 × 32 = 4608` blocks.

---

## 7. `inventory` — Túi đồ

### 7.1 `inventory.slots` — 41 slot cố định

Mỗi slot: `[ item_id, count ]`

| Khoảng index | Khu vực | Số lượng | Ghi chú |
|--------------|---------|----------|---------|
| 0–8 | Hotbar | 9 | `selected_slot` chỉ vào đây (0–8) |
| 9–35 | Túi chính | 27 | |
| 36 | Ủng | 1 | Slot giáp |
| 37 | Quần | 1 | Slot giáp |
| 38 | Áo giáp | 1 | Slot giáp |
| 39 | Mũ | 1 | Slot giáp |
| 40 | Tay trái | 1 | Khiên/đuốc/v.v. |

- `[0, 0]` = slot rỗng
- `item_id`: ID số từ `BuiltInRegistries.ITEM` (**thay đổi mỗi session**)
- `count`: số lượng (1–99, tối đa tùy item)

### 7.2 `inventory.selected_slot` (int 0–8)

Slot hotbar đang chọn.

---

## 8. `target` — Vật thể đang ngắm

| Field | Kiểu | Khoảng | Mô tả |
|-------|------|--------|-------|
| `block_id` | int | 0+ | ID block đang ngắm (0 = không có/air/xa quá) |
| `distance` | float | 0+ | Khoảng cách Euclid tới tâm block |
| `face` | int | 0–5 | Mặt nào của block: |

**Chỉ số mặt block:**

| face | Mặt |
|------|-----|
| 0 | Trên (↑) |
| 1 | Dưới (↓) |
| 2 | Bắc |
| 3 | Nam |
| 4 | Tây |
| 5 | Đông |

---

## 9. `viewport_blocks` — Tầm nhìn 3D

### Định dạng
```json
[ block_id_0, block_id_1, ..., block_id_4607 ]   // 4608 số int
```

### Công thức chỉ mục
```
index = depth * 288 + height * 16 + width
```
với:
- `depth`: 0 (gần nhất) đến 31 (xa nhất)
- `height`: 0 (đáy hình chóp) đến 8 (đỉnh)
- `width`: 0 (trái) đến 15 (phải)

### Giá trị
- `0` = air hoặc chunk chưa load/ngoài phạm vi
- Giá trị khác = ID block số từ `BuiltInRegistries.BLOCK` (**thay đổi mỗi session**)

---

## 10. `viewport_entities` — Entity gần đó

### Định dạng
```json
[
  [ type_id, relX, relY, relZ, yaw, pitch, health, distance ],
  [ type_id, relX, relY, relZ, yaw, pitch, health, distance ],
  ...  // tối đa 16 entity
]
```

Mỗi entity có 8 giá trị:

| Index | Field | Mô tả |
|-------|-------|-------|
| 0 | type_id | ID loại entity (0–127, **ổn định qua các session**) |
| 1 | relX | X tương đối so với người chơi |
| 2 | relY | Y tương đối so với người chơi |
| 3 | relZ | Z tương đối so với người chơi |
| 4 | yaw | Xoay ngang của entity |
| 5 | pitch | Xoay dọc của entity |
| 6 | health | Máu entity (0 nếu không sống) |
| 7 | distance | Khoảng cách Euclid từ người chơi |

Slot trống: `[0, 0, 0, 0, 0, 0, 0, 0]`

### Bảng ID Entity (ổn định)

| ID | Entity | Thù địch? | Ghi chú |
|----|--------|-----------|---------|
| 0 | Allay | Không | |
| 1 | Area Effect Cloud | Không | |
| 2 | Armadillo | Không | |
| 3 | Armor Stand | Không | |
| 4 | Arrow | Không | Đạn |
| 5 | Axolotl | Không | |
| 6 | Bat | Không | |
| 7 | Bee | Neutral | |
| 8 | **Blaze** | **Có** | Nether |
| 9 | Block Display | Không | |
| 10 | Boat | Không | |
| 11 | Bogged | Có | |
| 12 | Breeze | **Có** | |
| 13 | Breeze Wind Charge | Không | |
| 14 | Cat | Không | |
| 15 | Camel | Không | |
| 16 | Cave Spider | **Có** | |
| 17 | Chest Boat | Không | |
| 18 | Chest Minecart | Không | |
| 19 | Chicken | Không | Nguồn thức ăn |
| 20 | Cod | Không | |
| 21 | Cow | Không | Nguồn thịt/da |
| 22 | **Creeper** | **Có** | Phát nổ |
| 23 | Dolphin | Không | |
| 24 | Donkey | Không | Cưỡi được |
| 25 | Dragon Fireball | Không | |
| 26 | Drowned | **Có** | |
| 27 | Egg | Không | |
| 28 | Elder Guardian | **Có** | |
| 29 | End Crystal | Không | |
| 30 | **Ender Dragon** | **Có** | Boss |
| 31 | Ender Pearl | Không | |
| 32 | **Enderman** | Neutral | Đừng nhìn vào |
| 33 | Endermite | Neutral | |
| 34 | Evoker | **Có** | |
| 35 | Evoker Fangs | Không | |
| 36 | Experience Bottle | Không | |
| 37 | Experience Orb | Không | |
| 38 | Eye of Ender | Không | |
| 39 | Falling Block | Không | |
| 40 | Firework Rocket | Không | |
| 41 | Fox | Không | |
| 42 | Frog | Không | |
| 43 | Furnace Minecart | Không | |
| 44 | **Ghast** | **Có** | Nether |
| 45 | Giant | **Có** | |
| 46 | Glow Item Frame | Không | |
| 47 | Glow Squid | Không | |
| 48 | Goat | Không | |
| 49 | Guardian | **Có** | Dưới nước |
| 50 | **Hoglin** | **Có** | Nether |
| 51 | Hopper Minecart | Không | |
| 52 | Horse | Không | Cưỡi được |
| 53 | Husk | **Có** | |
| 54 | Illusioner | **Có** | |
| 55 | Interaction | Không | |
| 56 | Iron Golem | Neutral | Bảo vệ dân làng |
| 57 | Item (rơi) | Không | |
| 58 | Item Display | Không | |
| 59 | Item Frame | Không | |
| 60 | Llama | Không | Chở rương |
| 61 | Magma Cube | **Có** | Nether |
| 62 | Marker | Không | |
| 63 | Minecart | Không | |
| 64 | Mooshroom | Không | |
| 65 | Mule | Không | Cưỡi được |
| 66 | Ocelot | Không | |
| 67 | Painting | Không | |
| 68 | Panda | Không | |
| 69 | Parrot | Không | |
| 70 | Phantom | **Có** | Xuất hiện sau đêm không ngủ |
| 71 | Pig | Không | Nguồn thức ăn |
| 72 | **Piglin** | Neutral | Nether, bị phân tâm bởi vàng |
| 73 | **Piglin Brute** | **Có** | Nether |
| 74 | **Pillager** | **Có** | Đột kích |
| 75 | Polar Bear | Neutral | |
| 76 | Potion | Không | |
| 77 | Pufferfish | Không | |
| 78 | Rabbit | Không | |
| 79 | Ravager | **Có** | Đột kích |
| 80 | Salmon | Không | |
| 81 | Sheep | Không | Nguồn len/thịt |
| 82 | Shulker | **Có** | End |
| 83 | Shulker Bullet | Không | |
| 84 | Silverfish | **Có** | |
| 85 | **Skeleton** | **Có** | Bắn xa, cháy dưới nắng |
| 86 | Skeleton Horse | Không | |
| 87 | Slime | **Có** | |
| 88 | Small Fireball | Không | |
| 89 | Sniffer | Không | |
| 90 | Snow Golem | Không | |
| 91 | Snowball | Không | |
| 92 | Spider | **Có** | Leo tường |
| 93 | Spectral Arrow | Không | |
| 94 | Squid | Không | |
| 95 | **Stray** | **Có** | Skeleton băng |
| 96 | Strider | Không | Nether, cưỡi trên lava |
| 97 | Tadpole | Không | |
| 98 | Text Display | Không | |
| 99 | TNT | Không | Đã kích hoạt |
| 100 | Trader Llama | Không | |
| 101 | Trident | Không | |
| 102 | Tropical Fish | Không | |
| 103 | Turtle | Không | |
| 104 | Vex | **Có** | |
| 105 | Villager | Không | Trao đổi |
| 106 | Vindicator | **Có** | |
| 107 | Wandering Trader | Không | |
| 108 | **Warden** | **Có** | Mù, tấn công bằng sóng âm |
| 109 | Wind Charge | Không | |
| 110 | Witch | **Có** | |
| 111 | **Wither** | **Có** | Boss |
| 112 | Wither Skeleton | **Có** | Nether |
| 113 | Wither Skull | Không | |
| 114 | Wolf | Neutral | Có thể thuần hóa |
| 115 | Zoglin | **Có** | |
| 116 | **Zombie** | **Có** | Phổ biến, cháy dưới nắng |
| 117 | Zombie Horse | Không | |
| 118 | Zombie Villager | **Có** | |
| 119 | Zombified Piglin | Neutral | Nether |

---

## 11. `screen` — Màn hình UI

Chỉ xuất hiện khi có UI screen đang mở.

### 11.1 Field chung

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `id` | string | Định danh màn hình (xem bảng bên dưới) |
| `title` | string | Tiêu đề màn hình |
| `type` | string | Luôn `"menu"` |
| `pause_game` | bool | Game có bị tạm dừng không (`true` ở pause, death) |

### 11.2 `screen.components` — Widget UI

Mảng các component tương tác trên màn hình. Mỗi component:

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `id` | int | Index tuần tự (0, 1, 2, ...) |
| `type` | string | `"button"` / `"textbox"` / `"slider"` / `"custom"` |
| `text` | string | Chữ hiển thị |
| `enabled` | bool | Có thể tương tác |
| `visible` | bool | Có hiển thị |
| `focused` | bool | Đang được focus bàn phím |
| `value` | string/float | **type=textbox:** nội dung; **type=slider:** giá trị hiện tại (0–1) |
| `min` | float | Chỉ có ở slider |
| `max` | float | Chỉ có ở slider |

### 11.3 `screen.navigation` — Đường dẫn

```json
[ "Menu cha", "Screen hiện tại" ]
```

### 11.4 Bảng Screen ID

| Screen ID | Màn hình | Cách mở | Cách đóng |
|-----------|----------|---------|-----------|
| `minecraft:title` | Màn hình chính | Khởi động game | Click Singleplayer/Multiplayer |
| `minecraft:select_world` | Chọn world | Click Singleplayer | Click world hoặc Back |
| `minecraft:multiplayer` | Server list | Click Multiplayer | Click server hoặc Back |
| `minecraft:inventory` | Túi đồ | Ấn E | Ấn E hoặc Esc |
| `minecraft:creative_inventory` | Sáng tạo | Ấn E (creative) | Ấn E hoặc Esc |
| `minecraft:crafting` | Bàn chế tạo | Chuột phải vào bàn chế tạo | Esc |
| `minecraft:furnace` | Lò nung | Chuột phải vào lò | Esc |
| `minecraft:blast_furnace` | Lò cao | Chuột phải vào lò cao | Esc |
| `minecraft:smoker` | Lò xông khói | Chuột phải vào lò xông khói | Esc |
| `minecraft:brewing_stand` | Giá pha chế | Chuột phải vào giá pha chế | Esc |
| `minecraft:enchantment` | Bàn phù phép | Chuột phải vào bàn phù phép | Esc |
| `minecraft:anvil` | Đe | Chuột phải vào đe | Esc |
| `minecraft:grindstone` | Đá mài | Chuột phải vào đá mài | Esc |
| `minecraft:cartography_table` | Bàn bản đồ | Chuột phải vào bàn bản đồ | Esc |
| `minecraft:stonecutter` | Máy cắt đá | Chuột phải vào máy cắt đá | Esc |
| `minecraft:loom` | Khung cửi | Chuột phải vào khung cửi | Esc |
| `minecraft:smithing` | Bàn rèn | Chuột phải vào bàn rèn | Esc |
| `minecraft:villager_trades` | Giao dịch dân làng | Chuột phải vào dân làng | Esc |
| `minecraft:horse_inventory` | Túi ngựa | Chuột phải vào ngựa/lừa/la | Esc |
| `minecraft:container` | Rương/thùng/shulker | Chuột phải vào container | Esc |
| `minecraft:pause` | Menu tạm dừng | Ấn Esc | Click Resume hoặc Esc |
| `minecraft:death` | Màn hình chết | Người chơi chết | Click Respawn |
| `minecraft:options` | Tùy chọn | Từ pause/title | Esc |
| `minecraft:video_settings` | Video | Options → Video | Esc |
| `minecraft:sound_settings` | Âm thanh | Options → Audio | Esc |
| `minecraft:controls` | Điều khiển | Options → Controls | Esc |
| `minecraft:keybinds` | Phím tắt | Controls → Key Binds | Esc |
| `minecraft:language` | Ngôn ngữ | Options → Language | Esc |
| `minecraft:advancements` | Thành tựu | Ấn L | Ấn L hoặc Esc |
| `minecraft:recipe_book` | Sách công thức | Trong inventory/crafting | Click công thức |
| `minecraft:credits` | Credits | Thắng game | Skip |
| `minecraft:create_world` | Tạo world mới | Title → Singleplayer → Create | Esc |
| `minecraft:edit_world` | Sửa world | Chọn world → Edit | Esc |

---

## 12. Loại Action (cho POST /action)

| Loại | Field bắt buộc | Field tùy chọn | Hiệu ứng |
|------|----------------|----------------|----------|
| `key` | `keys: string[]` | `duration: int (ms)` | Nhấn/nhả phím |
| `select_slot` | `slot: int` (0–8) | — | Chuyển slot hotbar |
| `place` | — | `face: string` | Đặt block lên mặt đang ngắm |
| `break` | — | — | Bắt đầu đào block (survival, có drop item) |
| `interact` | — | — | Chuột phải vào block đang ngắm |
| `jump` | — | — | Nhảy |
| `swing` | — | — | Vung tay (tấn công) |
| `look` | — | `yaw`/`pitch`/`deltaYaw`/`deltaPitch` | Xoay hướng nhìn |
| `craft` | `recipe: string` | `mode: string` | Chế tạo |
| `chat` | `message: string` | — | Gửi tin nhắn |
| `command` | `command: string` | — | Chạy lệnh Minecraft |
| `click_button` | `button_text: string` | — | Click nút UI |

---

## 13. Layout slot inventory

```
Index   Khu vực          Số lượng   Định dạng item
────────────────────────────────────────────────────
 0–8    Hotbar             9         [item_id, count]
 9–35   Túi chính         27         [item_id, count]
36      Ủng                1         [item_id, count]
37      Quần               1         [item_id, count]
38      Áo giáp            1         [item_id, count]
39      Mũ                 1         [item_id, count]
40      Tay trái           1         [item_id, count]
────────────────────────────────────────────────────
Tổng: 41 slots
```

`[0, 0]` = slot rỗng. `item_id` thay đổi mỗi session.

---

## 14. ID Chiều không gian

| ID | Chiều |
|----|-------|
| 0 | Overworld |
| 1 | Nether |
| 2 | End |

---

## 15. Giá trị Weather

| Giá trị | Ý nghĩa |
|---------|---------|
| `"clear"` | Không mưa |
| `"rain"` | Đang mưa |
| `"thunder"` | Bão (mưa + sấm sét) |

---

## 16. Chỉ số mặt block (target.face)

| face | Mặt |
|------|-----|
| 0 | Trên |
| 1 | Dưới |
| 2 | Bắc |
| 3 | Nam |
| 4 | Tây |
| 5 | Đông |

---

## 17. Hướng (player.rotation.facing)

| Hướng | Khoảng Yaw |
|-------|------------|
| South | -45° đến 45° |
| West | 45° đến 135° |
| North | 135° đến 225° |
| East | 225° đến 315° |

---

## 18. Hướng (cho face trong action place)

```
"up"    = dương Y (trên)
"down"  = âm Y (dưới)
"north" = âm Z (bắc)
"south" = dương Z (nam)
"west"  = âm X (tây)
"east"  = dương X (đông)
```

---

> **⚠️ Lưu ý:** ID số (`block_id`, `item_id`, `entity_type_id`) lấy từ `BuiltInRegistries.getId()`. Item và block thay đổi mỗi session. Entity type ID ổn định (0–127, giống nhau qua các session). Để xác định chính xác, dùng ID dạng text (`minecraft:stone`) để đối chiếu.
