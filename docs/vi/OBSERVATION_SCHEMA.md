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
| `matrix` | [int,int,int] | [16, 9] | Kích thước viewport_blocks: [width, height, depth] |

`width × height = 16 × 9 = 144` tia depth.

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

## 9. `viewport_blocks` — Depth-Map

### Định dạng
```json
[ depth_0, depth_1, ..., depth_143 ]   // 144 số int
```

### Cấu trúc
- **144 giá trị** (16 ngang × 9 dọc), mỗi giá trị = khoảng cách (1–32 block) tới khối đặc đầu tiên trên tia đó
- `32` = không có vật cản trong tầm

### Công thức chỉ mục
```
index = height * 16 + width
```
với:
- `height`: 0 (đáy) đến 8 (đỉnh)
- `width`: 0 (trái) đến 15 (phải)

### Giá trị
- **1–31**: khoảng cách tới khối đặc đầu tiên
- **32**: thông thoáng (không vật cản trong 32 block)
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
| 0 | type_id | ID loại entity (0–127, **thường ổn định**) |
| 1 | relX | X tương đối so với người chơi |
| 2 | relY | Y tương đối so với người chơi |
| 3 | relZ | Z tương đối so với người chơi |
| 4 | yaw | Xoay ngang của entity |
| 5 | pitch | Xoay dọc của entity |
| 6 | health | Máu entity (0 nếu không sống) |
| 7 | distance | Khoảng cách Euclid từ người chơi |

Chỉ trả về entity thực tế trong frustum (không pad rỗng; mảng có 0–16 phần tử).

### Bảng ID Entity (cập nhật từ runtime)

> **⚠️ Các ID này được dump từ vanilla Minecraft 1.21.11 (`BuiltInRegistries.ENTITY_TYPE`). Thứ tự registry có thể thay đổi theo mod hoặc phiên bản. Để có mapping chính xác, dùng `GET /api/registry/entities` lúc runtime.**

| ID | Entity | Thù địch? | Namespaced ID |
|----|--------|-----------|---------------|
| 0 | Allay | Không | minecraft:allay |
| 1 | Area Effect Cloud | Không | minecraft:area_effect_cloud |
| 2 | Armadillo | Không | minecraft:armadillo |
| 3 | Armor Stand | Không | minecraft:armor_stand |
| 4 | Arrow | Không | minecraft:arrow |
| 5 | Axolotl | Không | minecraft:axolotl |
| 6 | Bat | Không | minecraft:bat |
| 7 | Bee | Neutral | minecraft:bee |
| 8 | **Blaze** | **Có** | minecraft:blaze |
| 9 | Block Display | Không | minecraft:block_display |
| 10 | Boat | Không | minecraft:boat |
| 11 | Bogged | Có | minecraft:bogged |
| 12 | Breeze | **Có** | minecraft:breeze |
| 13 | Breeze Wind Charge | Không | minecraft:breeze_wind_charge |
| 14 | Camel | Không | minecraft:camel |
| 15 | Cat | Không | minecraft:cat |
| 16 | Cave Spider | **Có** | minecraft:cave_spider |
| 17 | Chest Boat | Không | minecraft:chest_boat |
| 18 | Chest Minecart | Không | minecraft:chest_minecart |
| 19 | Chicken | Không | minecraft:chicken |
| 20 | Cod | Không | minecraft:cod |
| 21 | Minecart with Command Block | Không | minecraft:command_block_minecart |
| 22 | Cow | Không | minecraft:cow |
| 23 | **Creeper** | **Có** | minecraft:creeper |
| 24 | Dolphin | Không | minecraft:dolphin |
| 25 | Donkey | Không | minecraft:donkey |
| 26 | Dragon Fireball | Không | minecraft:dragon_fireball |
| 27 | Drowned | **Có** | minecraft:drowned |
| 28 | Egg | Không | minecraft:egg |
| 29 | Elder Guardian | **Có** | minecraft:elder_guardian |
| 30 | End Crystal | Không | minecraft:end_crystal |
| 31 | **Ender Dragon** | **Có** | minecraft:ender_dragon |
| 32 | Ender Pearl | Không | minecraft:ender_pearl |
| 33 | **Enderman** | Neutral | minecraft:enderman |
| 34 | Endermite | Neutral | minecraft:endermite |
| 35 | Evoker | **Có** | minecraft:evoker |
| 36 | Evoker Fangs | Không | minecraft:evoker_fangs |
| 37 | Experience Bottle | Không | minecraft:experience_bottle |
| 38 | Experience Orb | Không | minecraft:experience_orb |
| 39 | Eye of Ender | Không | minecraft:eye_of_ender |
| 40 | Falling Block | Không | minecraft:falling_block |
| 41 | Firework Rocket | Không | minecraft:firework_rocket |
| 42 | Fox | Không | minecraft:fox |
| 43 | Frog | Không | minecraft:frog |
| 44 | Minecart with Furnace | Không | minecraft:furnace_minecart |
| 45 | **Ghast** | **Có** | minecraft:ghast |
| 46 | Giant | **Có** | minecraft:giant |
| 47 | Glow Item Frame | Không | minecraft:glow_item_frame |
| 48 | Glow Squid | Không | minecraft:glow_squid |
| 49 | Goat | Không | minecraft:goat |
| 50 | Guardian | **Có** | minecraft:guardian |
| 51 | **Hoglin** | **Có** | minecraft:hoglin |
| 52 | Minecart with Hopper | Không | minecraft:hopper_minecart |
| 53 | Horse | Không | minecraft:horse |
| 54 | Husk | **Có** | minecraft:husk |
| 55 | Illusioner | **Có** | minecraft:illusioner |
| 56 | Interaction | Không | minecraft:interaction |
| 57 | Iron Golem | Neutral | minecraft:iron_golem |
| 58 | Item (rơi) | Không | minecraft:item |
| 59 | Item Display | Không | minecraft:item_display |
| 60 | Item Frame | Không | minecraft:item_frame |
| 61 | Ominous Item Spawner | Không | minecraft:ominous_item_spawner |
| 62 | Ghast Fireball | Không | minecraft:fireball |
| 63 | Leash Knot | Không | minecraft:leash_knot |
| 64 | Lightning Bolt | Không | minecraft:lightning_bolt |
| 65 | Llama | Không | minecraft:llama |
| 66 | Llama Spit | Không | minecraft:llama_spit |
| 67 | **Magma Cube** | **Có** | minecraft:magma_cube |
| 68 | Marker | Không | minecraft:marker |
| 69 | Minecart | Không | minecraft:minecart |
| 70 | Mooshroom | Không | minecraft:mooshroom |
| 71 | Mule | Không | minecraft:mule |
| 72 | Ocelot | Không | minecraft:ocelot |
| 73 | Painting | Không | minecraft:painting |
| 74 | Panda | Không | minecraft:panda |
| 75 | Parrot | Không | minecraft:parrot |
| 76 | **Phantom** | **Có** | minecraft:phantom |
| 77 | Pig | Không | minecraft:pig |
| 78 | **Piglin** | Neutral | minecraft:piglin |
| 79 | **Piglin Brute** | **Có** | minecraft:piglin_brute |
| 80 | **Pillager** | **Có** | minecraft:pillager |
| 81 | Polar Bear | Neutral | minecraft:polar_bear |
| 82 | Potion | Không | minecraft:potion |
| 83 | Pufferfish | Không | minecraft:pufferfish |
| 84 | Rabbit | Không | minecraft:rabbit |
| 85 | Ravager | **Có** | minecraft:ravager |
| 86 | Salmon | Không | minecraft:salmon |
| 87 | Sheep | Không | minecraft:sheep |
| 88 | Shulker | **Có** | minecraft:shulker |
| 89 | Shulker Bullet | Không | minecraft:shulker_bullet |
| 90 | Silverfish | **Có** | minecraft:silverfish |
| 91 | **Skeleton** | **Có** | minecraft:skeleton |
| 92 | Skeleton Horse | Không | minecraft:skeleton_horse |
| 93 | Slime | **Có** | minecraft:slime |
| 94 | Blaze Fireball | Không | minecraft:small_fireball |
| 95 | Sniffer | Không | minecraft:sniffer |
| 96 | Snow Golem | Không | minecraft:snow_golem |
| 97 | Snowball | Không | minecraft:snowball |
| 98 | Minecart with Spawner | Không | minecraft:spawner_minecart |
| 99 | Spectral Arrow | Không | minecraft:spectral_arrow |
| 100 | **Spider** | **Có** | minecraft:spider |
| 101 | Squid | Không | minecraft:squid |
| 102 | **Stray** | **Có** | minecraft:stray |
| 103 | Strider | Không | minecraft:strider |
| 104 | Tadpole | Không | minecraft:tadpole |
| 105 | Text Display | Không | minecraft:text_display |
| 106 | Primed TNT | Không | minecraft:tnt |
| 107 | Minecart with TNT | Không | minecraft:tnt_minecart |
| 108 | Trader Llama | Không | minecraft:trader_llama |
| 109 | Trident | Không | minecraft:trident |
| 110 | Tropical Fish | Không | minecraft:tropical_fish |
| 111 | Turtle | Không | minecraft:turtle |
| 112 | Vex | **Có** | minecraft:vex |
| 113 | Villager | Không | minecraft:villager |
| 114 | Vindicator | **Có** | minecraft:vindicator |
| 115 | Wandering Trader | Không | minecraft:wandering_trader |
| 116 | **Warden** | **Có** | minecraft:warden |
| 117 | Wind Charge | Không | minecraft:wind_charge |
| 118 | Witch | **Có** | minecraft:witch |
| 119 | **Wither** | **Có** | minecraft:wither |
| 120 | Wither Skeleton | **Có** | minecraft:wither_skeleton |
| 121 | Wither Skull | Không | minecraft:wither_skull |
| 122 | Wolf | Neutral | minecraft:wolf |
| 123 | Zoglin | **Có** | minecraft:zoglin |
| 124 | **Zombie** | **Có** | minecraft:zombie |
| 125 | Zombie Horse | Không | minecraft:zombie_horse |
| 126 | Zombie Villager | **Có** | minecraft:zombie_villager |
| 127 | Zombified Piglin | Neutral | minecraft:zombified_piglin |

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

> **⚠️ Lưu ý:** ID số (`block_id`, `item_id`, `entity_type_id`) lấy từ `BuiltInRegistries.getId()`. Item và block thay đổi mỗi session. Entity type ID thường ổn định trong cùng phiên bản Minecraft nhưng có thể thay đổi nếu có mod hoặc cập nhật. Để xác định chính xác, dùng ID dạng text (`minecraft:stone`) để đối chiếu.
>
> **Tra cứu runtime:** Dùng `GET /api/registry/entities` và `GET /api/registry/items` để lấy mapping `id → "minecraft:name"` trực tiếp từ registry. AI agent nên gọi các endpoint này một lần mỗi session để có bảng tra chính xác.
