# Tổng hợp Endpoints (hiện có và đề xuất) của MC-API

**Endpoints hiện có (phiên bản 1.21.x):** theo tài liệu gốc, MC-API đã cung cấp rất nhiều endpoint REST để điều khiển Minecraft, ví dụ:

- `POST /api/client/input` – mô phỏng nhấn phím (gửi danh sách phím và thời gian giữ).
- `POST /api/client/click_button` – click các nút UI trên màn hình (menu, recipe book, v.v).
- `POST /api/client/settings` – thay đổi cài đặt video (GUI scale, FOV, v.v).
- `GET  /api/client/debug` – lấy thông tin debug (tọa độ, FPS, Debug info).
- `POST /api/player/teleport` – dịch chuyển người chơi đến tọa độ cho trước.
- `POST /api/player/look` – xoay hướng nhìn (góc yaw, pitch).
- `POST /api/player/jump` và `POST /api/player/swing` – nhảy, vung tay.
- `GET  /api/player/*` – lấy thông tin vị trí người chơi, danh sách người chơi.
- `POST /api/block/place` – đặt khối tại vị trí đối tượng trỏ (với Face).
- `POST /api/block/break` – phá khối đang trỏ tới.
- `POST /api/block/interact` – tương tác chuột phải vào khối (mở cửa, rương, v.v).
- `POST /api/inventory/select` – chọn slot trên thanh Hotbar.
- `POST /api/inventory/set` – đặt vật phẩm vào slot bất kỳ (chỉ dùng cho cheat, bypass constraint).
- `POST /api/inventory/drop` – vứt vật phẩm từ slot (toàn bộ stack hoặc một đơn vị).
- `GET  /api/inventory/get` – lấy danh sách vật phẩm trong Inventory hiện tại (slot và số lượng).
- `POST /api/world/time` – đổi thời gian trong thế giới (day, night, v.v).
- `POST /api/world/weather` – đổi thời tiết (rain, thunder, clear).
- `POST /api/command` – chạy lệnh Minecraft thuần (console command) trên server/client.
- `POST /api/chat/send` – gửi tin nhắn chat.
- `POST /api/settings/gamerule` – đổi gamerule.
- `POST /api/settings/difficulty` – đổi độ khó.
- `POST /api/script` – chạy tập lệnh (multi-commands).
- `POST /api/cancel` – hủy tất cả script/hành động đang chạy.

Đây chỉ là những endpoint tiêu biểu. Tuy nhiên, để chuyển MC-API thành một **môi trường huấn luyện AI chuẩn** như OpenAI Gym, chúng ta nên **đơn giản hóa** và **gộp nhiều endpoint**. Cụ thể, đề xuất:

- `POST /session` (tùy chọn) – tạo một phiên làm việc (cho các agent độc lập).
- `GET  /observation` – trả về trạng thái (quan sát) hiện tại của game.
- `POST /action` – gửi một hoặc nhiều hành động cho tick hiện tại (có hoặc không yêu cầu trả về quan sát mới).
- `POST /step` – gửi hành động và trả về quan sát của tick kế tiếp (kết hợp `action` + `observation` trong một lần gọi). API này tương đương với phương thức `env.step(action)` trong các thư viện RL.
- `GET  /stream` – (dành cho debug/monitor) dùng Server-Sent Events để đẩy chuỗi quan sát liên tục cho client khi game tick mới.
- `POST /close` (hoặc tương đương) – đóng session khi kết thúc.

Tóm lại, thay vì gọi hàng chục endpoint độc lập như hiện tại, một agent AI điển hình sẽ chỉ quan tâm đến hai khái niệm: **Quan sát (Observation)** và **Hành động (Action)**. Điều này tương ứng với luồng:
```
GET /observation → Xử lý quyết định (Agent) → POST /action → [game tick] → GET /observation → ...
```
Hoặc tối ưu hơn, `POST /step` kết hợp:
```
POST /step {tick, actions} → Trả về {tick_next, observation} → (Agent tiếp tục)
```
Đây là thiết kế tương tự các môi trường như OpenAI Gym.  

---

## Đối chiếu với MineRL và Project Malmo

- **OpenAI Gym / MineRL:** Trong thư viện RL chuẩn như Gym, `env.step(action)` sẽ cập nhật môi trường và trả về _observation_, _reward_, _done_ (xong cuộc) và _info_. Đối với Minecraft (MineRL), đầu ra quan sát thường bao gồm ảnh (RGB) của game kèm thông tin trạng thái (máu, độ đói, inventory, v.v). Hành động được biểu diễn dưới dạng từ điển (dictionary) với các phím như `"forward"`, `"attack"`, `"hotbar.1"`, `"inventory"` (mở inventory), v.v. MC-API thay thế ảnh (render) bằng dữ liệu thô (block, mobs, v.v) nhưng vẫn tuân theo nguyên tắc: **quan sát cố định** và **đầu vào hành động đơn lẻ**. Phương thức `/step` tương đương `env.step`, trả về quan sát mới sau khi thực hiện hành động.  

- **Project Malmo:** Malmo là nền tảng AI của Microsoft cho Minecraft. Nó sử dụng các lệnh XML để điều khiển nhân vật. Trong Malmo có các lệnh quản lý inventory như `swapInventoryItems` (đổi đồ giữa hai slot) và `combineInventoryItems` (gộp đồ). Các lệnh `place`, `attack`, `use` cũng tương tự. MC-API tái hiện hầu hết các chức năng này qua API: ví dụ ta có các hành động **select_slot**, **swap**, **place**, **drop**, **craft**, v.v. Nhìn chung, API mới của MC-API sẽ cung cấp đủ các thao tác mà Malmo hỗ trợ qua cú pháp JSON/HTTP, nhưng để AI có thể dùng đơn giản.  

Như vậy, MC-API sẽ kết hợp ý tưởng của Gym/MineRL (cấu trúc bước thời gian) và Malmo (hành động đa dạng) để tạo nên **một môi trường AI tiêu chuẩn** cho Minecraft. Điều này giúp agent AI chỉ phải học 2 hàm: quan sát và hành động, thay vì nhiều API rời rạc.

---

## Cấu trúc JSON mẫu cho `/observation` và `/step`

Để đảm bảo hiệu suất cao và ổn định (mảng cố định, không thay đổi khóa), ta định nghĩa **cấu trúc JSON cố định** sau cho mọi quan sát:

```json
{
  "protocol": 1,
  "tick": 34100,
  "world": {
    "time": 12000,
    "day": 5,
    "is_day": true,
    "weather": "clear",      // hoặc "rain", "thunder"
    "dimension": 0          // 0=Overworld, 1=Nether, 2=End (có thể bổ sung nếu mod khác)
  },
  "player": {
    "position": [ 120.5, 64.0, -42.3 ],
    "rotation": { "yaw": 90.0, "pitch": -20.0, "facing": "West" },
    "velocity": [ 0.0, 0.0, 0.0 ],
    "status": [ 20, 15, 20, 5, 300 ],
               // [health, food, saturation, armor, air]
    "flags": [ 1, 0, 0, 0, 0, 0 ]
               // [on_ground, sprinting, sneaking, swimming, flying, sleeping] (0/1)
  },
  "camera": {
    "fov": 70,
    "matrix": [16, 9, 32]
  },
  "inventory": {
    "slots": [
      [0, 0], [0, 0], [0, 0], [5, 64], [0, 0], [17, 12], [0, 0], [0, 0], [0, 0],
      [  // tiếp tục 36 slot (gồm hotbar + main), ví dụ slot 3 chứa 64 gỗ (ID=5), slot 5 chứa 12 dirt (17)
      ],
      [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0],
      // ... (tổng 36 slot chính, không đổi kích thước)
      // Rồi sau đó 4 slot armor và 1 slot offhand, cũng đệm 0
      [0,0], [0,0], [0,0], [0,0], [0,0]
    ],
    "selected_slot": 3
  },
  "target": {
    "block_id": 56,
    "distance": 4.5,
    "face": 1            // 0=Up,1=Down,2=North,3=South,4=East,5=West
  },
  "viewport_blocks": [
    1,1,1,0,4,17,17,56,
    ...  // danh sách ID các khối trong Frustum tầm nhìn (chiều sâu 32, 16x9x32=4608 phần tử)
  ],
  "viewport_entities": [
    [54, 3.2, 0.0, 5.1, 180, 0, 20, 6.0],
    [ 0, 0.0, 0.0, 0.0, 0, 0, 0, 0 ]
  ]
}
```

Giải thích các thành phần chính:

- **protocol**: Phiên bản giao thức (để tương thích ngược khi mở rộng).
- **tick**: Chỉ số tick của Minecraft (20 tick = 1 giây).
- **world**: Thông tin thế giới (thời gian, ngày, thời tiết, dimension).
- **player**: Thông tin người chơi:
  - `position`: toạ độ X,Y,Z (float).
  - `rotation`: góc quay `yaw`/`pitch` và hướng `facing` (bắc/nam/đông/tây).
  - `velocity`: vector vận tốc hiện tại (cho bóng rơi, bơi).
  - `status`: `[health, food, saturation, armor, air]` (giá trị số).
  - `flags`: các cờ boolean (đứng trên đất, đang chạy, né, bơi, bay, ngủ).
- **camera**: Trường nhìn `fov` (do game cài), và `matrix` kích thước ma trận sâu (mặc định `[16,9,32]`).
- **inventory**: Thể hiện toàn bộ hòm đồ người chơi:
  - `slots`: mảng 2-chiều cố định **41 x 2** (36 slot chính + 4 slot áo giáp + 1 slot offhand). Mỗi phần tử `[item_id, count]`. Ví dụ `[5,64]` nghĩa 64 khúc gỗ (ID=5). Nếu slot trống, đưa `[0,0]`.
  - `selected_slot`: chỉ số slot đang cầm (0–8 với hotbar).
- **target**: Khối đang được tâm ngắm (`block_id`, `face`) và khoảng cách.
- **viewport_blocks**: Mảng tĩnh chiều dài `16*9*32` = 4608, chứa ID của tất cả block trong vùng nhìn (Frustum). Khối nằm ngoài tầm nhìn hoặc bị che khuất được lọc (giống cách một người chơi nhìn thấy).
- **viewport_entities**: Mảng các thực thể (mob, item rơi, vv) nhìn thấy: mỗi thực thể `[Entity_ID, relX, relY, relZ, yaw, pitch, health, distance]`. Đệm `[0,...,0]` nếu không có đủ.

Tất cả mảng và khóa đều cố định độ dài, chỉ giá trị thay đổi. Cơ chế **padding** với giá trị `0` cho slot/entity trống giúp client (Python) có thể ánh xạ trực tiếp vào Tensor mà không tốn bộ nhớ.  

---

## Ví dụ sử dụng API qua curl

Giả sử game đang tick `1000`. Dưới đây là ví dụ tương tác một số hành động qua curl:

- **Chọn slot**: Chọn ô hotbar thứ 3 (index bắt đầu 0) đang chứa vật phẩm cần đặt:
  ```bash
  curl -X POST http://localhost:25566/step \
       -H "Content-Type: application/json" \
       -d '{
         "tick":1000,
         "actions":[
           {"type":"select_slot", "slot": 2}
         ]
       }'
  ```
  *Server sẽ đáp trả tick kế tiếp và trạng thái mới (mặc dù vị trí vật phẩm chỉ thay đổi ở mức client).*

- **Đặt block**: Sau khi chọn ô, đặt block vào mặt bên của khối mục tiêu:
  ```bash
  curl -X POST http://localhost:25566/step \
       -H "Content-Type: application/json" \
       -d '{
         "tick":1001,
         "actions":[
           {"type":"place", "face":"north"}
         ]
       }'
  ```
  Trong đó `"face":"north"` tức đặt block vào mặt Bắc của khối đang ngắm. Phía server sẽ thực hiện lệnh `setblock` hoặc tương đương.

- **Craft đồ**: Tương tự, nếu muốn chế tạo (ví dụ) 8 *Chest* từ *Oak Planks*, gọi:
  ```bash
  curl -X POST http://localhost:25566/step \
       -H "Content-Type: application/json" \
       -d '{
         "tick":1002,
         "actions":[
           {"type":"craft", "recipe":"minecraft:chest", "mode":"craft_once"}
         ]
       }'
  ```
  Parameter `"mode"` có thể là `"craft_once"` (1 cái) hoặc `"craft_all"` (tối đa). Server sẽ tự động mở bảng chế tạo và thực hiện. 

Mỗi lần gọi `/step` kết hợp quan sát và hành động giúp **đơn giản hóa vòng lặp RL**. Tất nhiên, chúng ta vẫn hỗ trợ các lệnh cũ (`/action/select`, `/screen`) trong thời gian đầu chuyển đổi nếu cần tương thích, nhưng nên hướng agent chỉ dùng `/step` để có độ trễ thấp nhất. 

---

## Checklist bảo mật & tương thích (fix.md)

Dưới đây là các mục **sự cố bảo mật và tính tương thích** cần khắc phục (theo mức độ ưu tiên):

- 🔴 **Bắt buộc xác thực (Auth)**: **Không được cho phép chạy không cần key.** Nếu không có `-Dmcapi.key`, mod phải sinh tự động một token ngẫu nhiên và chỉ log/lưu một lần duy nhất, thay vì để chuỗi rỗng dẫn tới `checkAuth` bỏ qua hoàn toàn. Ví dụ:
  ```java
  authToken = System.getProperty("mcapi.key", "");
  if (authToken.isEmpty()) {
      authToken = generateRandomToken();
      LOGGER.warn("mcapi.key không được cung cấp! Tạo token ngẫu nhiên: {}", authToken);
  }
  ```
  Đồng thời, chỉ bind server trên localhost (`127.0.0.1`) theo mặc định để tránh mở rộng giao diện ra mạng nội bộ hoặc Internet.  

- 🔴 **Chặn CSRF / CORS**: Tuyến mod tự chạy HTTP server ẩn và phản hồi `Access-Control-Allow-Origin: *`, nên một trang web độc hại trên cùng máy tính có thể lợi dụng trường hợp request **POST** với `Content-Type: text/plain` (được coi là “simple request”) để gọi API mà không cần token. Giải pháp: **Xoá header `Access-Control-Allow-Origin: *`**. Khi có token bắt buộc (header `Authorization: Bearer <token>` là “non-simple”), trình duyệt sẽ buộc preflight và kết quả là request bị chặn.  

- 🔴 **So sánh token constant-time**: So sánh token theo `auth.equals(...)` có thể bị tấn công thời gian (timing attack). Nên dùng hàm so sánh bảo mật (`MessageDigest.isEqual`) để tránh rò rỉ thông tin token qua phân tích thời gian phản hồi.  

- 🟠 **Validate input người dùng**: Các lệnh hiện tại nối trực tiếp dữ liệu JSON vào chuỗi lệnh Minecraft (ví dụ `gamerule`, `setblock`, `item replace`). Cần kiểm tra định dạng của các giá trị đầu vào như ResourceLocation (kiểu `"namespace:id"`) qua regex, để tránh injection hoặc lỗi parser. Ví dụ:
  ```java
  private static final Pattern ID_PATTERN = Pattern.compile("^[a-z0-9_.-]+:[a-z0-9_./-]+$");
  if (!ID_PATTERN.matcher(itemId).matches()) {
      sendResponse(exchange, 400, jsonError("Invalid item id"));
      return;
  }
  ```
  Điều này cũng giúp tương thích với các mod thêm block/item mới (nếu mod dùng ID khác namespace).  

- 🟠 **Giới hạn kích thước Body**: `readBody()` hiện tại đọc không giới hạn có thể gây tràn bộ nhớ nếu attacker gửi payload rất lớn. Nên kiểm tra `Content-Length` hoặc cắt ngắn dải tối đa (ví dụ 1MB). Nếu vượt ngưỡng, từ chối với mã 413 (Payload Too Large).  

- 🟠 **Rate limiting (Hạn chế tốc độ)**: Hiện chưa có giới hạn, kẻ xấu có thể spam `/api/chat/send` hay `/api/command` làm loạn game (DoS). Có thể áp dụng rate-limit cơ bản (ví dụ mỗi IP hoặc mỗi token chỉ một số request/giây tối đa).  

- 🟠 **Thread pool TaskManager**: `TaskManager` đang dùng một `ScheduledThreadPool(4)` chung cho mọi script/hành động trì hoãn. Nếu nhiều script dài (delay lớn) chiếm hết 4 thread, các script bình thường khác sẽ treo. Cần tách pool hoặc tăng số thread, tránh trường hợp DoS cục bộ (kẻ xấu tự làm gián đoạn hành động của bản thân).  

- 🟠 **Logging và audit**: Thêm logging cho mỗi request quan trọng (thời gian, IP, endpoint, mã trả về) để dễ kiểm tra khi có vấn đề. Nhất là các lỗi 401/403 (xác thực) nên được log chi tiết (nhưng không log nội dung token).  

- 🟠 **Khớp tên thế giới**: Lỗi phát hiện “**không chọn được thế giới**” có thể do MC-API chuyển tên thế giới thành chữ thường trong khi bản mod gốc lại phân biệt hoa thường. Cần đảm bảo khớp đúng tên thế giới (hoặc chuyển cả hai về cùng kiểu).  

- 🟠 **Kiểm tra slot inventory**: Ví dụ `InventoryHandler.SetHandler` chưa kiểm tra giới hạn slot, có thể gây `ArrayIndexOutOfBounds`. Nên validate slot nằm trong phạm vi 0–35 (36 slot chính) trước khi thay đổi.  

- 🟢 **Cập nhật tài liệu**: Sau khi sửa code, phải cập nhật README và docs cho các tính năng/hành động mới, ví dụ chỉ rõ rằng `/step` sẽ trả về JSON quan sát mới. 

**Tóm lại:** các lỗ hổng chính là do xác thực không bắt buộc, CORS mở, và xử lý input tự do. Chúng phải được fix khẩn cấp. Các mục khác là defense-in-depth để nâng cao an toàn và tương thích về lâu dài.  

---

Thay đổi lớn về kiến trúc (gộp endpoints, JSON cố định) cùng với **kiểm tra bảo mật** ở trên sẽ khiến `add.md` và `fix.md` đồng bộ hơn. Phần thêm mới trong `add.md` tập trung vào chức năng `/step`, `/observation`, schema JSON và ví dụ sử dụng API, trong khi `fix.md` liệt kê chi tiết các điểm phải khắc phục bảo mật và tính tương thích mod. Việc này giúp tài liệu vừa đầy đủ về mặt kỹ thuật, vừa an toàn khi triển khai.  

**Nguồn tham khảo:** Các khái niệm về môi trường RL (Gym step), API inventory của Project Malmo và tài liệu MineRL đã được tham khảo để định hướng thiết kế.
# Screen Observation (Draft)

## Mục tiêu

Ngoài việc quan sát thế giới Minecraft (World Observation), MC-API còn hỗ trợ quan sát mọi giao diện (Screen) đang hiển thị.

Điều này cho phép AI hoặc các ứng dụng tự động điều hướng và thao tác với toàn bộ Menu của Minecraft cũng như các Mod mà không cần xử lý hình ảnh.

---

# Screen Observation

Khi có một Screen đang mở, Observation sẽ bổ sung:

```json
"screen":{}
```

Ví dụ:

```json
{
  "screen":{

    "id":"minecraft:options",

    "title":"Options",

    "type":"menu",

    "pause_game":true,

    "components":[]
  }
}
```

---

# Components

Danh sách toàn bộ thành phần có thể tương tác.

```json
{
  "components":[

    {
      "id":0,
      "type":"button",
      "text":"Singleplayer",
      "enabled":true
    },

    {
      "id":1,
      "type":"button",
      "text":"Multiplayer",
      "enabled":true
    },

    {
      "id":2,
      "type":"button",
      "text":"Options",
      "enabled":true
    },

    {
      "id":3,
      "type":"button",
      "text":"Quit Game",
      "enabled":true
    }

  ]
}
```

---

# Supported Component Types

MC-API chuẩn hóa các thành phần giao diện thành các loại sau:

| Type      | Ý nghĩa                     |
| --------- | --------------------------- |
| button    | Nút bấm                     |
| slider    | Thanh kéo                   |
| checkbox  | Ô bật/tắt                   |
| textbox   | Ô nhập văn bản              |
| label     | Văn bản                     |
| tab       | Tab chuyển trang            |
| dropdown  | Danh sách xổ xuống          |
| list      | Danh sách                   |
| scrollbar | Thanh cuộn                  |
| custom    | Thành phần đặc biệt của Mod |

---

# Common Properties

Mọi Component nên có chung các thuộc tính sau:

```json
{
    "id":5,
    "type":"slider",

    "text":"Render Distance",

    "enabled":true,

    "visible":true,

    "focused":false
}
```

---

# Slider

Đối với Slider sẽ có thêm:

```json
{
    "type":"slider",

    "text":"Brightness",

    "value":0.75,

    "min":0,

    "max":1
}
```

---

# Checkbox

```json
{
    "type":"checkbox",

    "text":"Fullscreen",

    "checked":true
}
```

---

# Textbox

```json
{
    "type":"textbox",

    "text":"Player Name",

    "value":"Steve",

    "editable":true
}
```

---

# Dropdown

```json
{
    "type":"dropdown",

    "text":"Language",

    "selected":"English",

    "options":32
}
```

---

# Navigation

Observation sẽ trả về đường dẫn điều hướng của Screen hiện tại.

Ví dụ:

```json
{
    "navigation":[

        "Main Menu",

        "Options",

        "Video Settings",

        "Sodium"
    ]
}
```

AI sẽ biết mình đang ở đâu trong hệ thống Menu.

---

# Screen ID

Mỗi Screen có một ID duy nhất.

Ví dụ:

```
minecraft:title

minecraft:options

minecraft:video_settings

minecraft:keybinds

minecraft:language

minecraft:credits

minecraft:pause

minecraft:create_world

fabric:modmenu

sodium:options

iris:shaderpacks
```

Đối với Mod, ID sẽ sử dụng Namespace của Mod.

---

# Design Goal

MC-API không mô phỏng thao tác chuột hay bàn phím.

Thay vào đó, mọi giao diện của Minecraft được biểu diễn thành một tập hợp các Component có cấu trúc.

Điều này giúp AI có thể:

* Điều hướng Menu.
* Thay đổi cài đặt.
* Chọn thế giới.
* Chọn Server.
* Cấu hình Mod.
* Tương tác với mọi Screen của Vanilla và Mod.

Mà không phụ thuộc vào độ phân giải màn hình, Texture Pack hoặc vị trí hiển thị của các nút.
