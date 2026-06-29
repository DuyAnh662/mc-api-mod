(function() {
const SECTIONS = {};

SECTIONS['getting-started'] = {
  title: 'Bắt Đầu',
  pages: [
    {
      id: 'getting-started.auth',
      title: 'Xác Thực & Cấu Hình',
      content: `
<h2 id="auth">Xác Thực (Bắt Buộc)</h2>
<div class="alert alert-warn">Mọi request API đều cần xác thực qua Bearer token.</div>

<p>Thêm token vào header <code>Authorization</code>:</p>
<pre><code>-H "Authorization: Bearer &lt;token_của_bạn&gt;"</code></pre>

<p>Nếu không truyền <code>-Dmcapi.key=&lt;token&gt;</code> trong JVM arguments, mod tự sinh token 64 ký tự hex ngẫu nhiên và in ra log:</p>
<pre><code>mcapi.key not provided! Generated random auth token: &lt;token_của_bạn&gt;</code></pre>

<h3 id="jvm-props">Cấu Hình JVM</h3>
<table>
  <tr><th>Property</th><th>Mặc định</th><th>Mô tả</th></tr>
  <tr><td><code>-Dmcapi.key=&lt;token&gt;</code></td><td>Tự sinh</td><td>Bearer token xác thực</td></tr>
  <tr><td><code>-Dmcapi.port=25566</code></td><td><code>25566</code></td><td>Cổng HTTP server</td></tr>
  <tr><td><code>-Dmcapi.host=127.0.0.1</code></td><td><code>127.0.0.1</code></td><td>Địa chỉ bind (dùng <code>0.0.0.0</code> cho LAN/mạng ngoài)</td></tr>
</table>

<h3 id="security-limits">Giới Hạn Bảo Mật</h3>
<table class="param-table">
  <tr><td>Rate limit</td><td>60 requests/giây mỗi IP</td></tr>
  <tr><td>Body tối đa</td><td>1 MB</td></tr>
  <tr><td>So sánh token</td><td>Thời gian hằng định (<code>MessageDigest.isEqual()</code>)</td></tr>
  <tr><td>Validation đầu vào</td><td>ID block/item theo format <code>namespace:path</code></td></tr>
  <tr><td>Bind mặc định</td><td>Chỉ localhost</td></tr>
</table>
`
    },
    {
      id: 'getting-started.usage',
      title: 'Cách Sử Dụng',
      content: `
<h2 id="request-structure">Cấu Trúc Request</h2>
<p>Mỗi lần gọi API cần 4 yếu tố:</p>
<ol>
  <li><strong>HTTP Method:</strong> <code>GET</code> (lấy dữ liệu) hoặc <code>POST</code> (thực hiện hành động)</li>
  <li><strong>Endpoint (URL):</strong> Đường dẫn của lệnh</li>
  <li><strong>Headers:</strong> <code>Authorization: Bearer &lt;token&gt;</code> (bắt buộc) + <code>Content-Type: application/json</code> cho POST</li>
  <li><strong>Body (Payload):</strong> Dữ liệu JSON (trên terminal, bọc JSON trong dấu nháy đơn <code>'...'</code>)</li>
</ol>

<h2 id="list-endpoints">Xem Danh Sách Endpoint</h2>
<pre><code>curl -H "Authorization: Bearer &lt;token&gt;" http://localhost:25566/api/</code></pre>

<p>Endpoint gốc trả về danh sách JSON tất cả API endpoints có sẵn.</p>

<h2 id="installation">Cài Đặt</h2>
<ol>
  <li>Cài đặt <a href="https://fabricmc.net/">Fabric Loader</a> cho Minecraft 1.21.11</li>
  <li>Tải <code>mc-api-mod.jar</code> và bỏ vào thư mục <code>.minecraft/mods/</code></li>
  <li>Khởi động game! HTTP server tự động chạy</li>
</ol>

<h3 id="build-from-source">Tự Build từ Source</h3>
<pre><code>git clone https://github.com/DuyAnh662/mc-api-mod.git
cd mc-api-mod
./gradlew build</code></pre>
<p>Bản mod đã build (.jar) sẽ nằm trong thư mục <code>build/libs/</code>.</p>
`
    }
  ]
};

SECTIONS['api-reference'] = {
  title: 'Tài Liệu API',
  pages: [
    {
      id: 'api.client',
      title: 'Lệnh Client',
      content: `
<h2 id="client-input">2.1 Mô Phỏng Bấm Phím</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/client/input</span>
  <div class="endpoint-desc">Nhấn một hoặc nhiều phím bất kỳ trên bàn phím.</div>
</div>

<h4>Tham Số</h4>
<table class="param-table">
  <tr><th>Tham số</th><th>Kiểu</th><th>Bắt buộc</th><th>Mô tả</th></tr>
  <tr><td><code>keys</code></td><td>Mảng chuỗi</td><td>Có</td><td>Danh sách phím cần nhấn</td></tr>
  <tr><td><code>duration</code></td><td>Số (ms)</td><td>Không</td><td>Thời gian giữ phím (mặc định: 0 = nhấn rồi thả ngay)</td></tr>
</table>

<h4>Ví Dụ</h4>

<p><strong>Đi tới 1 giây:</strong></p>
<pre><code>curl -X POST http://localhost:25566/api/client/input \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"keys": ["w"], "duration": 1000}'</code></pre>

<p><strong>Sprint (Ctrl + W) 2 giây:</strong></p>
<pre><code>curl -X POST http://localhost:25566/api/client/input \\
     -H "Content-Type: application/json" \\
     -d '{"keys": ["ctrl", "w"], "duration": 2000}'</code></pre>

<p><strong>Mở màn hình F3 Debug:</strong></p>
<pre><code>curl -X POST http://localhost:25566/api/client/input \\
     -H "Content-Type: application/json" \\
     -d '{"keys": ["f3"]}'</code></pre>

<p><strong>Nhấn Escape:</strong></p>
<pre><code>curl -X POST http://localhost:25566/api/client/input \\
     -H "Content-Type: application/json" \\
     -d '{"keys": ["esc"]}'</code></pre>

<h3 id="key-table">Bảng Tên Phím Đầy Đủ</h3>
<table>
  <tr><th>Nhóm</th><th>Tên phím</th><th>Ví dụ</th></tr>
  <tr><td><strong>Chữ cái</strong></td><td><code>a</code> đến <code>z</code></td><td><code>"a"</code>, <code>"w"</code>, <code>"s"</code></td></tr>
  <tr><td><strong>Số</strong></td><td><code>0</code> đến <code>9</code></td><td><code>"1"</code>, <code>"5"</code></td></tr>
  <tr><td><strong>Phím chức năng</strong></td><td><code>f1</code> đến <code>f25</code></td><td><code>"f3"</code>, <code>"f11"</code></td></tr>
  <tr><td><strong>Modifier</strong></td><td><code>shift</code>, <code>lshift</code>, <code>rshift</code>, <code>ctrl</code>, <code>lctrl</code>, <code>rctrl</code>, <code>alt</code>, <code>lalt</code>, <code>ralt</code>, <code>win</code></td><td><code>"ctrl"</code>, <code>"shift"</code></td></tr>
  <tr><td><strong>Mũi tên</strong></td><td><code>up</code>, <code>down</code>, <code>left</code>, <code>right</code></td><td><code>"up"</code>, <code>"down"</code></td></tr>
  <tr><td><strong>Di chuyển</strong></td><td><code>pageup</code>, <code>pagedown</code>, <code>home</code>, <code>end</code></td><td><code>"pageup"</code></td></tr>
  <tr><td><strong>Khoảng trắng</strong></td><td><code>space</code>, <code>tab</code>, <code>enter</code>, <code>backspace</code></td><td><code>"space"</code>, <code>"tab"</code></td></tr>
  <tr><td><strong>Xóa/Chèn</strong></td><td><code>delete</code> / <code>del</code>, <code>insert</code> / <code>ins</code></td><td><code>"del"</code></td></tr>
  <tr><td><strong>Đặc biệt</strong></td><td><code>esc</code> / <code>escape</code>, <code>capslock</code> / <code>caps</code>, <code>numlock</code>, <code>scrolllock</code>, <code>printscreen</code> / <code>prtsc</code>, <code>pause</code>, <code>menu</code></td><td><code>"esc"</code></td></tr>
  <tr><td><strong>Ký hiệu</strong></td><td><code>minus</code> / <code>-</code>, <code>equal</code> / <code>=</code>, <code>lbracket</code> / <code>[</code>, <code>rbracket</code> / <code>]</code>, <code>backslash</code> / <code>\\</code>, <code>semicolon</code> / <code>;</code>, <code>apostrophe</code> / <code>'</code>, <code>grave</code> / <code>backtick</code>, <code>comma</code> / <code>,</code>, <code>period</code> / <code>.</code>, <code>slash</code> / <code>/</code></td><td><code>"-"</code>, <code>"."</code></td></tr>
  <tr><td><strong>Numpad</strong></td><td><code>numpad0</code>–<code>numpad9</code> (hoặc <code>kp0</code>–<code>kp9</code>), <code>numpad_add</code>, <code>numpad_subtract</code>, <code>numpad_multiply</code>, <code>numpad_divide</code>, <code>numpad_enter</code>, <code>numpad_decimal</code></td><td><code>"numpad5"</code></td></tr>
  <tr><td><strong>Chuột</strong></td><td><code>mouse_left</code> / <code>mouse1</code>, <code>mouse_right</code> / <code>mouse2</code>, <code>mouse_middle</code> / <code>mouse3</code>, <code>mouse4</code>, <code>mouse5</code></td><td><code>"mouse_left"</code></td></tr>
</table>

<h2 id="click-button">2.2 Click Nút UI</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/client/click_button</span>
  <div class="endpoint-desc">Tìm nút trên màn hình hiện tại và click vào nó.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/client/click_button \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"button_text": "singleplayer"}'</code></pre>

<h2 id="client-settings">2.3 Đổi Cài Đặt Client</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/client/settings</span>
  <div class="endpoint-desc">Đổi nhanh cấu hình hiển thị.</div>
</div>

<h4>Tham Số</h4>
<table class="param-table">
  <tr><th>Tham số</th><th>Kiểu</th><th>Mô tả</th></tr>
  <tr><td><code>fov</code></td><td>Số</td><td>Góc nhìn (30-110)</td></tr>
  <tr><td><code>renderDistance</code></td><td>Số</td><td>Tầm nhìn (chunks)</td></tr>
  <tr><td><code>simulationDistance</code></td><td>Số</td><td>Khoảng cách mô phỏng</td></tr>
  <tr><td><code>gamma</code></td><td>Số</td><td>Độ sáng (0-1)</td></tr>
</table>

<pre><code>curl -X POST http://localhost:25566/api/client/settings \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"fov": 90, "renderDistance": 12}'</code></pre>

<h2 id="client-debug">2.4 Lấy Thông Tin Debug / F3</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/client/debug</span>
  <div class="endpoint-desc">Lấy thông tin từ màn hình F3 Debug mà không cần mở F3.</div>
</div>

<h4>Tham Số Query</h4>
<table class="param-table">
  <tr><th>Tham số</th><th>Mô tả</th></tr>
  <tr><td><code>fields</code></td><td>Danh sách trường: <code>fps</code>, <code>days</code>, <code>xyz</code>, <code>chunk</code>, <code>dimension</code>, <code>biome</code>. Bỏ trống = tất cả.</td></tr>
</table>

<h4>Ví Dụ</h4>
<pre><code># Lấy toàn bộ thông tin
curl -H "Authorization: Bearer &lt;token&gt;" -X GET http://localhost:25566/api/client/debug

# Chỉ lấy FPS
curl -H "Authorization: Bearer &lt;token&gt;" -X GET "http://localhost:25566/api/client/debug?fields=fps"

# Lấy FPS và số ngày đã chơi
curl -H "Authorization: Bearer &lt;token&gt;" -X GET "http://localhost:25566/api/client/debug?fields=fps,days"</code></pre>
`
    },
    {
      id: 'api.player',
      title: 'Lệnh Player',
      content: `
<h2 id="player-teleport">3.1 Dịch Chuyển</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/player/teleport</span>
  <div class="endpoint-desc">Dịch chuyển người chơi tới tọa độ xác định.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/player/teleport \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"x": 100, "y": 70, "z": 200}'</code></pre>

<h2 id="player-look">3.2 Nhìn Theo Hướng</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/player/look</span>
  <div class="endpoint-desc">Đặt hướng nhìn tuyệt đối (yaw/pitch) hoặc tương đối (deltaYaw/deltaPitch).</div>
</div>

<h4>Tham Số</h4>
<table class="param-table">
  <tr><th>Tham số</th><th>Kiểu</th><th>Mô tả</th></tr>
  <tr><td><code>yaw</code></td><td>Số</td><td>Hướng ngang tuyệt đối. 0=Nam, 90=Tây, 180=Bắc, 270=Đông</td></tr>
  <tr><td><code>pitch</code></td><td>Số</td><td>Hướng dọc tuyệt đối. -90=lên trời, 0=thẳng, 90=xuống đất</td></tr>
  <tr><td><code>deltaYaw</code></td><td>Số</td><td>Quay ngang tương đối. Dương=phải, Âm=trái</td></tr>
  <tr><td><code>deltaPitch</code></td><td>Số</td><td>Quay dọc tương đối. Dương=xuống, Âm=lên</td></tr>
</table>

<h4>Ví Dụ</h4>
<pre><code># Đặt hướng nhìn tuyệt đối
curl -X POST http://localhost:25566/api/player/look \\
     -H "Content-Type: application/json" \\
     -d '{"yaw": 90.0, "pitch": 0.0}'

# Quay phải 90 độ
curl -X POST http://localhost:25566/api/player/look \\
     -H "Content-Type: application/json" \\
     -d '{"deltaYaw": 90.0}'

# Nhìn lên 45° và quay trái 30°
curl -X POST http://localhost:25566/api/player/look \\
     -H "Content-Type: application/json" \\
     -d '{"deltaYaw": -30.0, "deltaPitch": -45.0}'

# Xoay 360 độ
curl -X POST http://localhost:25566/api/player/look \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"deltaYaw": 360}'</code></pre>

<h2 id="player-jump-swing">3.3 Nhảy và Vung Tay</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/player/jump</span>
  <div class="endpoint-desc">Nhảy.</div>
</div>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/player/swing</span>
  <div class="endpoint-desc">Vung tay.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/player/jump \\
     -H "Authorization: Bearer &lt;token&gt;"

curl -X POST http://localhost:25566/api/player/swing \\
     -H "Authorization: Bearer &lt;token&gt;"</code></pre>

<h2 id="player-position-list">3.4 Lấy Tọa Độ & Danh Sách Người Chơi</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/player/position</span>
  <div class="endpoint-desc">Lấy tọa độ và hướng nhìn người chơi.</div>
</div>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/player/list</span>
  <div class="endpoint-desc">Liệt kê người chơi online (tọa độ, máu, dimension).</div>
</div>

<pre><code>curl -H "Authorization: Bearer &lt;token&gt;" -X GET http://localhost:25566/api/player/position

curl -H "Authorization: Bearer &lt;token&gt;" -X GET http://localhost:25566/api/player/list</code></pre>
`
    },
    {
      id: 'api.block',
      title: 'Lệnh Block',
      content: `
<h2 id="block-place">4.1 Đặt Block</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/block/place</span>
  <div class="endpoint-desc">Đặt block tại tọa độ xác định.</div>
</div>

<h4>Tham Số</h4>
<table class="param-table">
  <tr><th>Tham số</th><th>Kiểu</th><th>Bắt buộc</th><th>Mô tả</th></tr>
  <tr><td><code>x</code></td><td>Số</td><td>Có</td><td>Tọa độ X</td></tr>
  <tr><td><code>y</code></td><td>Số</td><td>Có</td><td>Tọa độ Y</td></tr>
  <tr><td><code>z</code></td><td>Số</td><td>Có</td><td>Tọa độ Z</td></tr>
  <tr><td><code>block</code></td><td>Chuỗi</td><td>Có</td><td>ID block (VD: <code>minecraft:diamond_block</code>)</td></tr>
</table>

<pre><code>curl -X POST http://localhost:25566/api/block/place \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"x": 10, "y": 64, "z": 10, "block": "minecraft:diamond_block"}'</code></pre>

<h2 id="block-break">4.2 Phá Block</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/block/break</span>
  <div class="endpoint-desc">Phá block tại tọa độ xác định.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/block/break \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"x": 10, "y": 64, "z": 10}'</code></pre>

<h2 id="block-interact">4.3 Tương Tác Block</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/block/interact</span>
  <div class="endpoint-desc">Chuột phải vào block (mở rương, cửa, v.v.).</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/block/interact \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"x": 10, "y": 64, "z": 10}'</code></pre>

<h2 id="block-get">4.4 Lấy Thông Tin Block</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/block/get</span>
  <div class="endpoint-desc">Lấy thông tin block tại tọa độ.</div>
</div>

<pre><code>curl -H "Authorization: Bearer &lt;token&gt;" "http://localhost:25566/api/block/get?x=10&y=64&z=10"</code></pre>
`
    },
    {
      id: 'api.inventory',
      title: 'Lệnh Inventory',
      content: `
<h2 id="inv-select">5.1 Chọn Ô Cầm Tay</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/inventory/select</span>
  <div class="endpoint-desc">Chuyển đổi vật phẩm đang cầm (Hotbar slot 0-8).</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/inventory/select \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"slot": 2}'</code></pre>

<h2 id="inv-set">5.2 Đặt Item Vào Ô</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/inventory/set</span>
  <div class="endpoint-desc">Đặt item vào vị trí bất kỳ trong inventory.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/inventory/set \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"slot": 0, "item": "minecraft:netherite_sword", "count": 1}'</code></pre>

<h2 id="inv-drop">5.3 Vứt Vật Phẩm</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/inventory/drop</span>
  <div class="endpoint-desc">Vứt đồ từ một slot.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/inventory/drop \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"slot": 0, "all": true}'</code></pre>

<h2 id="inv-get">5.4 Lấy Danh Sách Item</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/inventory/get</span>
  <div class="endpoint-desc">Lấy toàn bộ nội dung inventory.</div>
</div>

<pre><code>curl -H "Authorization: Bearer &lt;token&gt;" -X GET http://localhost:25566/api/inventory/get</code></pre>
`
    },
    {
      id: 'api.world',
      title: 'Thế Giới & Server',
      content: `
<h2 id="world-time">6.1 Đổi Thời Gian</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/world/time</span>
  <div class="endpoint-desc">Thay đổi thời gian trong game (0-24000).</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/world/time \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"time": 1000}'</code></pre>

<h2 id="world-weather">6.2 Đổi Thời Tiết</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/world/weather</span>
  <div class="endpoint-desc">Thay đổi thời tiết (clear/rain/thunder).</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/world/weather \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"weather": "thunder", "duration": 6000}'</code></pre>

<h2 id="world-get">6.3 Lấy Trạng Thái Thế Giới</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/world/time</span>
  <div class="endpoint-desc">Lấy thời gian hiện tại.</div>
</div>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/world/weather</span>
  <div class="endpoint-desc">Lấy thời tiết hiện tại.</div>
</div>

<h2 id="command">6.4 Chạy Lệnh Minecraft</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/command</span>
  <div class="endpoint-desc">Chạy bất kỳ lệnh Minecraft server nào.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/command \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"command": "kill @e[type=zombie]"}'</code></pre>

<h2 id="chat">6.5 Nhắn Tin Chat</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/chat/send</span>
  <div class="endpoint-desc">Gửi tin nhắn chat tới tất cả người chơi.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/chat/send \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"message": "Hello Server!"}'</code></pre>

<h2 id="gamerule">6.6 Game Rule & Độ Khó</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/settings/gamerule</span>
  <div class="endpoint-desc">Đặt game rule.</div>
</div>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/settings/difficulty</span>
  <div class="endpoint-desc">Đặt độ khó game.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/settings/gamerule \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"rule": "keepInventory", "value": "true"}'

curl -X POST http://localhost:25566/api/settings/difficulty \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"difficulty": "hard"}'</code></pre>

<h4>Giá Trị Độ Khó</h4>
<table>
  <tr><th>Giá trị</th><th>Mô tả</th></tr>
  <tr><td><code>peaceful</code></td><td>Không có mob thù địch, hồi máu</td></tr>
  <tr><td><code>easy</code></td><td>Ít sát thương, ít mob</td></tr>
  <tr><td><code>normal</code></td><td>Gameplay tiêu chuẩn</td></tr>
  <tr><td><code>hard</code></td><td>Sát thương cao, mob phá được cửa</td></tr>
</table>
`
    },
    {
      id: 'api.script',
      title: 'Hệ Thống Script',
      content: `
<h2 id="script">7.1 Chạy Script</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/script</span>
  <div class="endpoint-desc">Thực thi nhiều lệnh tuần tự bằng JSON hoặc text siêu ngắn.</div>
</div>

<h3>Cú Pháp JSON</h3>
<pre><code>curl -X POST http://localhost:25566/api/script \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '[
        {"action": "key", "keys": ["w", "ctrl"], "duration": 2000},
        {"action": "delay", "duration": 500},
        {"action": "look", "deltaYaw": 90},
        {"action": "chat", "message": "Quay xong rồi!"},
        {"action": "command", "command": "time set day"}
      ]'</code></pre>

<h3>Cú Pháp Text (Siêu Ngắn)</h3>
<pre><code>curl -X POST http://localhost:25566/api/script \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -d 'key w,ctrl 2000
delay 500
look 90 0
chat Quay xong rồi!
command time set day'</code></pre>

<h3>Các Action Hỗ Trợ</h3>
<table>
  <tr><th>Action</th><th>Cú pháp JSON</th><th>Cú pháp Text</th><th>Mô tả</th></tr>
  <tr>
    <td><code>key</code></td>
    <td><code>{"action":"key", "keys":["w","ctrl"], "duration":1000}</code></td>
    <td><code>key w,ctrl 1000</code></td>
    <td>Nhấn phím</td>
  </tr>
  <tr>
    <td><code>delay</code></td>
    <td><code>{"action":"delay", "duration":500}</code></td>
    <td><code>delay 500</code></td>
    <td>Chờ N ms</td>
  </tr>
  <tr>
    <td><code>look</code></td>
    <td><code>{"action":"look", "deltaYaw":90}</code></td>
    <td><code>look 90 0</code></td>
    <td>Xoay camera</td>
  </tr>
  <tr>
    <td><code>chat</code></td>
    <td><code>{"action":"chat", "message":"Hi"}</code></td>
    <td><code>chat Hi</code></td>
    <td>Gửi tin nhắn</td>
  </tr>
  <tr>
    <td><code>command</code></td>
    <td><code>{"action":"command", "command":"time set day"}</code></td>
    <td><code>command time set day</code></td>
    <td>Chạy lệnh MC</td>
  </tr>
</table>

<h3>Bot Tự Động Đào Hầm</h3>
<pre><code>curl -X POST http://localhost:25566/api/script \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -d 'key w 500
key mouse_left 200
delay 100
key w 500
key mouse_left 200'</code></pre>

<h2 id="cancel">7.2 Hủy Tất Cả Lệnh</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/cancel</span>
  <div class="endpoint-desc">Dừng ngay lập tức tất cả script, phím đang giữ, lệnh đang chờ.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/cancel \\
     -H "Authorization: Bearer &lt;token&gt;"</code></pre>

<h4>Kịch Bản</h4>
<pre><code># Bắt đầu đi 60 giây
curl -X POST http://localhost:25566/api/client/input \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"keys": ["w"], "duration": 60000}'

# 5 giây sau, hủy!
curl -X POST http://localhost:25566/api/cancel \\
     -H "Authorization: Bearer &lt;token&gt;"</code></pre>
`
    },
    {
      id: 'api.ai',
      title: 'AI Endpoints',
      content: `
<div class="alert alert-info">Các endpoint này biến MC-API thành môi trường huấn luyện AI như OpenAI Gym / MineRL.</div>

<p>Vòng lặp cốt lõi cho AI agent:</p>
<pre><code>GET /observation → AI xử lý → POST /action → [game tick] → GET /observation ...</code></pre>
<p>Hoặc dạng step kết hợp:</p>
<pre><code>POST /step {actions} → {observation}</code></pre>

<h2 id="session">8.1 Tạo Session</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/session</span>
  <div class="endpoint-desc">Tạo phiên AI mới để theo dõi nhiều agent.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/session \\
     -H "Authorization: Bearer &lt;token&gt;"</code></pre>

<h4>Phản Hồi</h4>
<pre><code>{
  "success": true,
  "message": "Session created",
  "data": { "session_id": "sess_...", "created_at": 1712345678000 }
}</code></pre>

<h2 id="observation">8.2 Lấy Observation</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/observation</span>
  <div class="endpoint-desc">Trả về observation có cấu trúc đầy đủ của game.</div>
</div>

<pre><code>curl -H "Authorization: Bearer &lt;token&gt;" http://localhost:25566/observation</code></pre>

<h4>Cấu Trúc Phản Hồi</h4>
<pre><code>{
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
}</code></pre>

<h2 id="action">8.3 Gửi Hành Động</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/action</span>
  <div class="endpoint-desc">Gửi một hoặc nhiều hành động để thực thi trong tick hiện tại.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/action \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"actions": [{"type": "jump"}, {"type": "swing"}]}'</code></pre>

<h4>Các Loại Hành Động</h4>
<table>
  <tr><th>Loại</th><th>Tham số</th><th>Mô tả</th></tr>
  <tr><td><code>key</code></td><td><code>keys: ["w","ctrl"]</code>, <code>duration?: 1000</code></td><td>Nhấn/thả phím</td></tr>
  <tr><td><code>select_slot</code></td><td><code>slot: 2</code></td><td>Chọn slot hotbar (0-8)</td></tr>
  <tr><td><code>place</code></td><td><code>face: "up"/"down"/"north"/"south"/"east"/"west"</code></td><td>Đặt block vào mặt đang ngắm</td></tr>
  <tr><td><code>break</code></td><td>(không)</td><td>Phá khối đang ngắm</td></tr>
  <tr><td><code>interact</code></td><td>(không)</td><td>Chuột phải vào khối đang ngắm</td></tr>
  <tr><td><code>jump</code></td><td>(không)</td><td>Nhảy</td></tr>
  <tr><td><code>swing</code></td><td>(không)</td><td>Vung tay</td></tr>
  <tr><td><code>look</code></td><td><code>yaw/pitch</code> hoặc <code>deltaYaw/deltaPitch</code></td><td>Xoay hướng nhìn</td></tr>
  <tr><td><code>craft</code></td><td><code>recipe: "minecraft:chest"</code>, <code>mode: "craft_once"</code></td><td>Chế tạo</td></tr>
  <tr><td><code>chat</code></td><td><code>message: "hello"</code></td><td>Gửi tin nhắn chat</td></tr>
  <tr><td><code>command</code></td><td><code>command: "/say hello"</code></td><td>Chạy lệnh</td></tr>
  <tr><td><code>click_button</code></td><td><code>button_text: "Singleplayer"</code></td><td>Click nút UI</td></tr>
</table>

<h2 id="step">8.4 Step Kết Hợp</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/step</span>
  <div class="endpoint-desc">Kết hợp hành động + observation. Giống <code>env.step(action)</code> trong OpenAI Gym.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/step \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"actions": [{"type": "jump"}]}'</code></pre>

<h4>Phản Hồi</h4>
<pre><code>{
  "success": true,
  "message": "ok",
  "data": {
    "tick": 34101,
    "observation": { ... }
  }
}</code></pre>

<h2 id="stream">8.5 Stream Observation</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/stream</span>
  <div class="endpoint-desc">Server-Sent Events (SSE) — đẩy observation mới mỗi tick game (~50ms).</div>
</div>

<pre><code>curl -N -H "Authorization: Bearer &lt;token&gt;" http://localhost:25566/stream</code></pre>

<p>Định dạng đầu ra (SSE):</p>
<pre><code>data: {"protocol":1,"tick":34100,...}

data: {"protocol":1,"tick":34101,...}

data: {"protocol":1,"tick":34102,...}
...</code></pre>

<h2 id="close">8.6 Đóng Session</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/close</span>
  <div class="endpoint-desc">Đóng phiên AI và hủy tất cả tác vụ đang chạy.</div>
</div>

<pre><code># Đóng session cụ thể
curl -X POST http://localhost:25566/close \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"session_id": "sess_..."}'

# Hủy toàn bộ tác vụ
curl -X POST http://localhost:25566/close \\
     -H "Authorization: Bearer &lt;token&gt;"</code></pre>

<h2 id="screenshot">8.7 Chụp Màn Hình</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/client/screenshot</span>
  <div class="endpoint-desc">Chụp cửa sổ game thành JPEG base64, tối ưu cho YOLO detection.</div>
</div>

<h4>Tham số Query</h4>
<table class="param-table">
  <tr><th>Tham số</th><th>Kiểu</th><th>Mặc định</th><th>Mô tả</th></tr>
  <tr><td><code>width</code></td><td>int</td><td>640</td><td>Chiều rộng đích (64-1920)</td></tr>
  <tr><td><code>height</code></td><td>int</td><td>360</td><td>Chiều cao đích (36-1080)</td></tr>
  <tr><td><code>quality</code></td><td>int</td><td>85</td><td>Chất lượng JPEG (10-100)</td></tr>
</table>

<h4>Ví dụ</h4>
<pre><code>curl -H "Authorization: Bearer &lt;token&gt;" http://localhost:25566/api/client/screenshot</code></pre>

<h4>Python + YOLO Ví dụ</h4>
<pre><code>import requests, base64, cv2, numpy as np
from ultralytics import YOLO

r = requests.get("http://localhost:25566/api/client/screenshot",
                 headers={"Authorization": "Bearer &lt;token&gt;"})
img = cv2.imdecode(np.frombuffer(base64.b64decode(
    r.json()["data"]["image"]), np.uint8), cv2.IMREAD_COLOR)
model = YOLO("yolo26n.pt")
results = model(img)</code></pre>
`
    }
  ]
};

SECTIONS['observation-schema'] = {
  title: 'Schema Observation',
  pages: [
    {
      id: 'obs.overview',
      title: 'Tổng Quan',
      content: `
<h2 id="top-level">1. Cấp Cao Nhất</h2>
<pre><code>{
  "success": true,
  "message": "ok",
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
}</code></pre>

<h3 id="field-descriptions">Mô Tả Các Trường</h3>
<table>
  <tr><th>Trường</th><th>Mô tả</th></tr>
  <tr><td><code>protocol</code></td><td>Phiên bản giao thức (hiện tại 1)</td></tr>
  <tr><td><code>tick</code></td><td>Bộ đếm tick game (20 ticks = 1 giây)</td></tr>
  <tr><td><code>world.time</code></td><td>Thời gian trong ngày (0-24000). 0=bình minh, 6000=trưa, 12000=hoàng hôn, 18000=nửa đêm</td></tr>
  <tr><td><code>world.day</code></td><td>Số ngày đã chơi</td></tr>
  <tr><td><code>world.is_day</code></td><td>Ban ngày (time &lt; 13000)</td></tr>
  <tr><td><code>world.weather</code></td><td><code>"clear"</code>, <code>"rain"</code> hoặc <code>"thunder"</code></td></tr>
  <tr><td><code>world.dimension</code></td><td>0=Overworld, 1=Nether, 2=End</td></tr>
  <tr><td><code>player.position</code></td><td>[x, y, z] tọa độ</td></tr>
  <tr><td><code>player.rotation</code></td><td>yaw, pitch, và hướng chính</td></tr>
  <tr><td><code>player.velocity</code></td><td>[x, y, z] vector vận tốc</td></tr>
  <tr><td><code>player.status</code></td><td>[health, food, saturation, armor, air]</td></tr>
  <tr><td><code>player.flags</code></td><td>[on_ground, sprinting, sneaking, swimming, flying, sleeping] (0/1)</td></tr>
  <tr><td><code>camera.fov</code></td><td>Góc nhìn hiện tại (30-110)</td></tr>
  <tr><td><code>camera.matrix</code></td><td>Lưới tia viewport [width=16, height=9] = 288 giá trị (144 cặp [depth, blockId])</td></tr>
  <tr><td><code>inventory.slots</code></td><td>Mảng sparse [slot_index, item_id, count] (chỉ slot có đồ)</td></tr>
  <tr><td><code>inventory.selected_slot</code></td><td>Slot hotbar đang cầm (0-8)</td></tr>
  <tr><td><code>target.block_id</code></td><td>ID khối đang ngắm</td></tr>
  <tr><td><code>target.distance</code></td><td>Khoảng cách tới khối đang ngắm</td></tr>
  <tr><td><code>target.face</code></td><td>Mặt của khối (0=Trên,1=Dưới,2=Bắc,3=Nam,4=Tây,5=Đông)</td></tr>
  <tr><td><code>viewport_blocks</code></td><td>RLE: [[count, depth, blockId], ...] — gộp tia liên tiếp</td></tr>
  <tr><td><code>viewport_entities</code></td><td>Entity trong frustum (lọc FOV) [type, relX, relY, relZ, yaw, pitch, health, distance]</td></tr>
  <tr><td><code>screen</code></td><td>Thông tin màn hình UI (chỉ khi có màn hình mở)</td></tr>
</table>
`
    },
    {
      id: 'obs.player',
      title: 'Trạng Thái Player',
      content: `
<h2 id="player-state">Chi Tiết Trạng Thái Người Chơi</h2>

<h3 id="player-position">position</h3>
<pre><code>[ x, y, z ]   // 3 số float</code></pre>
<ul>
  <li><code>y &lt; -64</code> = void (đang chết)</li>
  <li><code>y ≈ 63</code> = mực nước biển</li>
  <li><code>y = 62–70</code> = mặt đất thông thường</li>
</ul>

<h3 id="player-rotation">rotation</h3>
<table>
  <tr><th>Field</th><th>Khoảng</th><th>Mô tả</th></tr>
  <tr><td><code>yaw</code></td><td>-180 đến 180</td><td>0=Nam, 90=Tây, ±180=Bắc, -90=Đông</td></tr>
  <tr><td><code>pitch</code></td><td>-90 đến 90</td><td>-90=lên trời, 0=ngang, 90=xuống đất</td></tr>
  <tr><td><code>facing</code></td><td>—</td><td>Hướng chính: South/West/North/East</td></tr>
</table>

<h3 id="player-velocity">velocity</h3>
<pre><code>[ vx, vy, vz ]   // 3 số float, blocks/tick</code></pre>
<ul>
  <li>Gần 0 = đứng yên</li>
  <li><code>vy &gt; 0</code> = đi lên (nhảy)</li>
  <li><code>vy &lt; 0</code> = rơi</li>
</ul>

<h3 id="player-status">status — Chỉ Số Sinh Tồn</h3>
<table>
  <tr><th>Index</th><th>Trường</th><th>Khoảng</th><th>Nguy hiểm</th></tr>
  <tr><td>0</td><td>Máu</td><td>0-20</td><td>≤ 5 nguy hiểm, = 0 chết</td></tr>
  <tr><td>1</td><td>Thức ăn</td><td>0-20</td><td>≤ 6 không chạy được, = 0 đói</td></tr>
  <tr><td>2</td><td>Độ no</td><td>0-20</td><td>> 0 thì chưa mất thức ăn</td></tr>
  <tr><td>3</td><td>Giáp</td><td>0-20+</td><td>Giảm sát thương</td></tr>
  <tr><td>4</td><td>Không khí</td><td>0-300</td><td>&lt; 300 = dưới nước, = 0 ngạt thở</td></tr>
</table>

<h3 id="player-flags">flags — Trạng Thái Nhị Phân</h3>
<table>
  <tr><th>Index</th><th>Flag</th><th>1 có nghĩa</th></tr>
  <tr><td>0</td><td>on_ground</td><td>Chạm đất (có thể nhảy)</td></tr>
  <tr><td>1</td><td>sprinting</td><td>Chạy nhanh (tốn thức ăn)</td></tr>
  <tr><td>2</td><td>sneaking</td><td>Đi chậm, không rơi khỏi mép</td></tr>
  <tr><td>3</td><td>swimming</td><td>Trong nước/lava</td></tr>
  <tr><td>4</td><td>flying</td><td>Bay (elytra)</td></tr>
  <tr><td>5</td><td>sleeping</td><td>Trên giường</td></tr>
</table>
`
    },
    {
      id: 'obs.inventory',
      title: 'Inventory',
      content: `
<h2 id="inventory-slots">Inventory Slots</h2>
<p>Sparse slots <code>[slot_index, item_id, count]</code> (chỉ slot có đồ).</p>

<p>Chỉ những slot có chứa item mới được trả về. Slot rỗng bị bỏ qua.</p>

<ul>
  <li><code>item_id</code>: ID số từ <code>BuiltInRegistries.ITEM</code> (thay đổi mỗi session)</li>
  <li><code>count</code>: số lượng (1-99)</li>
  <li><code>selected_slot</code>: slot hotbar đang cầm (0-8)</li>
</ul>

<p>Slot index reference:</p>
<pre><code>slot_index: 0-8 = hotbar, 9-35 = túi chính, 36 = ủng, 37 = quần, 38 = áo giáp, 39 = mũ, 40 = tay trái</code></pre>

<div class="alert alert-warn"><strong>Lưu ý:</strong> ID số của item/block có tính <strong>động</strong> — phụ thuộc vào thứ tự nạp registry. Ổn định trong một phiên chơi nhưng có thể khác giữa các lần khởi động. Dùng namespaced ID (<code>minecraft:stone</code>) để ổn định.</div>
`
    },
    {
      id: 'obs.target',
      title: 'Target & Viewport',
      content: `
<h2 id="target">Target — Vật Thể Đang Ngắm</h2>
<table>
  <tr><th>Field</th><th>Kiểu</th><th>Khoảng</th><th>Mô tả</th></tr>
  <tr><td><code>block_id</code></td><td>int</td><td>0+</td><td>ID block đang ngắm (0 = không có)</td></tr>
  <tr><td><code>distance</code></td><td>float</td><td>0+</td><td>Khoảng cách tới tâm block</td></tr>
  <tr><td><code>face</code></td><td>int</td><td>0-5</td><td>Mặt nào của block</td></tr>
</table>

<h4>Chỉ Số Mặt Block</h4>
<table>
  <tr><th>face</th><th>Mặt</th></tr>
  <tr><td>0</td><td>Trên (↑)</td></tr>
  <tr><td>1</td><td>Dưới (↓)</td></tr>
  <tr><td>2</td><td>Bắc</td></tr>
  <tr><td>3</td><td>Nam</td></tr>
  <tr><td>4</td><td>Tây</td></tr>
  <tr><td>5</td><td>Đông</td></tr>
</table>

<h2 id="viewport-blocks">Viewport Blocks — Depth-Map</h2>
<p>Mảng RLE <strong>[[count, depth, blockId], ...]</strong> — gộp tia liên tiếp giống nhau.</p>

<h2 id="viewport-entities">Viewport Entities — Sinh Vật Gần Đó</h2>
<p>Tối đa <strong>16 entity</strong> trong view frustum (lọc theo FOV, không phải bán kính), mỗi entity 8 giá trị. Chỉ trả về entity thực tế (không pad rỗng):</p>
<pre><code>[type_id, relX, relY, relZ, yaw, pitch, health, distance]</code></pre>

<table>
  <tr><th>Index</th><th>Field</th><th>Mô tả</th></tr>
  <tr><td>0</td><td>type_id</td><td>ID loại entity (0-127, ổn định)</td></tr>
  <tr><td>1-3</td><td>relX, relY, relZ</td><td>Vị trí tương đối so với người chơi</td></tr>
  <tr><td>4</td><td>yaw</td><td>Xoay ngang</td></tr>
  <tr><td>5</td><td>pitch</td><td>Xoay dọc</td></tr>
  <tr><td>6</td><td>health</td><td>Máu (0 nếu không sống)</td></tr>
  <tr><td>7</td><td>distance</td><td>Khoảng cách Euclid</td></tr>
</table>
`
    },
    {
      id: 'obs.screen',
      title: 'Màn Hình UI',
      content: `
<h2 id="screen">Screen — Màn Hình UI</h2>
<p>Chỉ xuất hiện khi có màn hình UI đang mở.</p>

<h3 id="screen-fields">Field Chung</h3>
<table>
  <tr><th>Field</th><th>Kiểu</th><th>Mô tả</th></tr>
  <tr><td><code>id</code></td><td>string</td><td>Định danh màn hình (VD: <code>minecraft:crafting</code>)</td></tr>
  <tr><td><code>title</code></td><td>string</td><td>Tiêu đề màn hình</td></tr>
  <tr><td><code>type</code></td><td>string</td><td>Luôn <code>"menu"</code></td></tr>
  <tr><td><code>pause_game</code></td><td>bool</td><td>Game có bị tạm dừng không</td></tr>
</table>

<h3 id="screen-components">Components</h3>
<p>Mảng widget tương tác trên màn hình:</p>
<table>
  <tr><th>Field</th><th>Kiểu</th><th>Mô tả</th></tr>
  <tr><td><code>id</code></td><td>int</td><td>Index tuần tự</td></tr>
  <tr><td><code>type</code></td><td>string</td><td><code>"button"</code> / <code>"textbox"</code> / <code>"slider"</code> / <code>"custom"</code></td></tr>
  <tr><td><code>text</code></td><td>string</td><td>Chữ hiển thị</td></tr>
  <tr><td><code>enabled</code></td><td>bool</td><td>Có thể tương tác</td></tr>
  <tr><td><code>visible</code></td><td>bool</td><td>Có hiển thị</td></tr>
  <tr><td><code>focused</code></td><td>bool</td><td>Đang được focus</td></tr>
  <tr><td><code>value</code></td><td>string/float</td><td>Nội dung textbox hoặc giá trị slider (0-1)</td></tr>
</table>

<h3 id="screen-navigation">Navigation</h3>
<pre><code>[ "Menu cha", "Screen hiện tại" ]</code></pre>

<h3 id="screen-ids">Bảng Screen ID</h3>
<table>
  <tr><th>Screen ID</th><th>Màn hình</th><th>Cách mở</th></tr>
  <tr><td><code>minecraft:title</code></td><td>Màn hình chính</td><td>Khởi động game</td></tr>
  <tr><td><code>minecraft:select_world</code></td><td>Chọn world</td><td>Click Singleplayer</td></tr>
  <tr><td><code>minecraft:multiplayer</code></td><td>Server list</td><td>Click Multiplayer</td></tr>
  <tr><td><code>minecraft:inventory</code></td><td>Túi đồ</td><td>Ấn E</td></tr>
  <tr><td><code>minecraft:creative_inventory</code></td><td>Sáng tạo</td><td>Ấn E (creative)</td></tr>
  <tr><td><code>minecraft:crafting</code></td><td>Bàn chế tạo</td><td>Chuột phải bàn chế tạo</td></tr>
  <tr><td><code>minecraft:furnace</code></td><td>Lò nung</td><td>Chuột phải lò</td></tr>
  <tr><td><code>minecraft:anvil</code></td><td>Đe</td><td>Chuột phải đe</td></tr>
  <tr><td><code>minecraft:chest</code></td><td>Rương</td><td>Chuột phải rương</td></tr>
  <tr><td><code>minecraft:pause</code></td><td>Menu tạm dừng</td><td>Ấn Esc</td></tr>
  <tr><td><code>minecraft:death</code></td><td>Màn hình chết</td><td>Chết</td></tr>
  <tr><td><code>minecraft:options</code></td><td>Tùy chọn</td><td>Từ pause/title</td></tr>
  <tr><td><code>minecraft:video_settings</code></td><td>Video</td><td>Options → Video</td></tr>
  <tr><td><code>minecraft:sound_settings</code></td><td>Âm thanh</td><td>Options → Audio</td></tr>
  <tr><td><code>minecraft:controls</code></td><td>Điều khiển</td><td>Options → Controls</td></tr>
  <tr><td><code>minecraft:keybinds</code></td><td>Phím tắt</td><td>Controls → Key Binds</td></tr>
  <tr><td><code>minecraft:language</code></td><td>Ngôn ngữ</td><td>Options → Language</td></tr>
  <tr><td><code>minecraft:advancements</code></td><td>Thành tựu</td><td>Ấn L</td></tr>
  <tr><td><code>minecraft:create_world</code></td><td>Tạo world</td><td>Title → Singleplayer → Create</td></tr>
  <tr><td><code>minecraft:villager_trades</code></td><td>Giao dịch dân làng</td><td>Chuột phải dân làng</td></tr>
</table>
`
    }
  ]
};

SECTIONS['ai-guide'] = {
  title: 'Hướng Dẫn AI',
  pages: [
    {
      id: 'ai-guide.core',
      title: 'Vòng Lặp Cốt Lõi',
      content: `
<h2 id="core-loop">Vòng Lặp Cốt Lõi</h2>
<pre><code>┌──────────────────┐     ┌──────────────┐     ┌────────────┐
│  QUAN SÁT        │ ──> │  SUY NGHĨ /  │ ──> │  HÀNH ĐỘNG │
│  GET /observation│     │ QUYẾT ĐỊNH   │     │POST /step  │
│  hoặc/stream     │     │              │     │hoặc /action│
└──────────────────┘     └──────────────┘     └────────────┘
        ^                                      │
        └──────────────────────────────────────┘
                lặp lại mỗi tick (~50ms)</code></pre>

<h3>Hai Chế Độ</h3>
<ul>
  <li><strong>Step mode:</strong> <code>POST /step</code> → nhận observation sau 1 tick. Giống <code>env.step(action)</code> trong Gym.</li>
  <li><strong>Stream mode:</strong> <code>GET /stream</code> (SSE) → đẩy observation mỗi tick.</li>
</ul>

<h2 id="world">world — Môi Trường</h2>
<pre><code>{
  "time": 12000,
  "day": 5,
  "is_day": true,
  "weather": "clear",
  "dimension": 0
}</code></pre>

<h4>Logic AI:</h4>
<ul>
  <li><code>is_day == false</code> và không có giường → xây nơi trú ẩn</li>
  <li><code>weather == "thunder"</code> → đội mũ chống sét</li>
  <li><code>dimension == 1</code> (Nether) → cần kháng lửa</li>
  <li><code>dimension == 2</code> (End) → cần slow falling</li>
</ul>

<h3>status — Chỉ Số Sinh Tồn</h3>
<table>
  <tr><th>Index</th><th>Trường</th><th>Ngưỡng nguy hiểm</th></tr>
  <tr><td>0</td><td>Máu</td><td>≤ 5 (bỏ chạy, ăn)</td></tr>
  <tr><td>1</td><td>Thức ăn</td><td>≤ 6 (không chạy được)</td></tr>
  <tr><td>4</td><td>Không khí</td><td>&lt; 100 (dưới nước, nổi lên ngay)</td></tr>
</table>

<h2 id="workflows">Kịch Bản Làm Chủ Game</h2>

<h3>Vào Game (từ màn hình chính)</h3>
<pre><code>B1: QUAN SÁT → screen.id == "minecraft:title"
B2: HÀNH ĐỘNG → click_button "Singleplayer"
B3: QUAN SÁT → screen.id == "minecraft:select_world"
B4: HÀNH ĐỘNG → click_button "My World"
B5: QUAN SÁT → không còn screen (đã vào game!)</code></pre>

<h3>Sinh Tồn Cơ Bản — 5 Phút Đầu</h3>
<pre><code>1. QUAN SÁT → status [20,20,20,0,300]
2. HÀNH ĐỘNG → nhìn xuống, phá cây (break)
3. LẶP → đến khi có 4+ logs
4. QUAN SÁT → inventory có logs
5. HÀNH ĐỘNG → craft "minecraft:crafting_table"
6. Chế tạo wooden pickaxe, rồi cobblestone tools</code></pre>

<h3>Chiến Đấu</h3>
<p><strong>Chống zombie/spider:</strong></p>
<pre><code>1. Giữ khoảng cách 3-4 blocks
2. Di chuyển ngang (luân phiên a/d)
3. Tấn công (swing) khi mob gần
4. Nếu máu &lt; 5: bỏ chạy, ăn, hồi máu</code></pre>

<p><strong>Chống skeleton:</strong></p>
<pre><code>1. Tiếp cận theo đường zigzag
2. Đánh cận chiến nhanh</code></pre>

<p><strong>Chống creeper:</strong></p>
<pre><code>1. Lùi lại (s key) vừa nhìn nó
2. Đánh 1 phát → lùi ngay
3. Đừng để nó đến gần &lt; 2 blocks</code></pre>

<h3>Đào Khoáng</h3>
<pre><code>1. Đào cầu thang xuống y=11
2. Đào đường hầm 2 cao, cách nhau 3 khối
3. Nghe tiếng lava: dừng lại
4. Kiểm tra target.block_id thường xuyên</code></pre>

<h2 id="error-recovery">Phục Hồi Lỗi</h2>
<table>
  <tr><th>Vấn đề</th><th>Nguyên nhân</th><th>Cách sửa</th></tr>
  <tr><td><code>tick</code> không tăng</td><td>Game bị đứng</td><td>Ấn Esc, kiểm tra, Resume</td></tr>
  <tr><td><code>viewport_blocks</code> toàn 32</td><td>Void/đang load</td><td>Di chuyển đến nơi đã load</td></tr>
  <tr><td><code>screen.id == "minecraft:death"</code></td><td>Bạn chết</td><td>Click "Respawn"</td></tr>
  <tr><td><code>target.block_id</code> luôn 0</td><td>Nhìn trời/xa</td><td>Nhìn xuống hoặc lại gần</td></tr>
  <tr><td>Inventory toàn [0,0]</td><td>Chưa vào game</td><td>Điều hướng từ title vào world</td></tr>
</table>
`
    },
    {
      id: 'ai-guide.actions',
      title: 'Hành Động',
      content: `
<h2 id="action-ref">Hành Động — Điều Khiển Hoàn Toàn</h2>
<p>Mỗi hành động là object trong mảng <code>actions</code> gửi tới <code>POST /action</code> hoặc <code>POST /step</code>.</p>

<h3>Di Chuyển</h3>
<table>
  <tr><th>Hành động</th><th>Hiệu ứng</th></tr>
  <tr><td><code>{"type":"key","keys":["w"]}</code></td><td>Đi tới</td></tr>
  <tr><td><code>{"type":"key","keys":["w","ctrl"]}</code></td><td>Chạy</td></tr>
  <tr><td><code>{"type":"jump"}</code></td><td>Nhảy</td></tr>
  <tr><td><code>{"type":"key","keys":["shift"]}</code></td><td>Né</td></tr>
</table>

<h3>Nhìn (Ngắm)</h3>
<table>
  <tr><th>Hành động</th><th>Hiệu ứng</th></tr>
  <tr><td><code>{"type":"look","yaw":90,"pitch":0}</code></td><td>Quay mặt về Tây</td></tr>
  <tr><td><code>{"type":"look","deltaYaw":90}</code></td><td>Quay phải 90°</td></tr>
  <tr><td><code>{"type":"look","deltaPitch":-45}</code></td><td>Nhìn lên 45°</td></tr>
</table>

<h3>Tương Tác Block</h3>
<table>
  <tr><th>Hành động</th><th>Hiệu ứng</th></tr>
  <tr><td><code>{"type":"break"}</code></td><td>Phá khối đang ngắm</td></tr>
  <tr><td><code>{"type":"place","face":"up"}</code></td><td>Đặt block phía trên</td></tr>
  <tr><td><code>{"type":"interact"}</code></td><td>Chuột phải</td></tr>
  <tr><td><code>{"type":"swing"}</code></td><td>Tấn công</td></tr>
</table>

<h3>Inventory</h3>
<table>
  <tr><th>Hành động</th><th>Hiệu ứng</th></tr>
  <tr><td><code>{"type":"select_slot","slot":2}</code></td><td>Chọn hotbar slot 2</td></tr>
  <tr><td><code>{"type":"craft","recipe":"minecraft:crafting_table"}</code></td><td>Chế tạo</td></tr>
</table>

<h3>Giao Tiếp</h3>
<table>
  <tr><th>Hành động</th><th>Hiệu ứng</th></tr>
  <tr><td><code>{"type":"chat","message":"Hello!"}</code></td><td>Gửi tin nhắn</td></tr>
  <tr><td><code>{"type":"command","command":"/time set day"}</code></td><td>Chạy lệnh</td></tr>
</table>

<h3>UI Navigation</h3>
<table>
  <tr><th>Hành động</th><th>Hiệu ứng</th></tr>
  <tr><td><code>{"type":"click_button","button_text":"Singleplayer"}</code></td><td>Click nút</td></tr>
  <tr><td><code>{"type":"key","keys":["esc"]}</code></td><td>Đóng màn hình</td></tr>
  <tr><td><code>{"type":"key","keys":["e"]}</code></td><td>Mở/đóng inventory</td></tr>
</table>
`
    },
    {
      id: 'ai-guide.workflows',
      title: 'Workflows',
      content: `
<h2 id="workflows">Workflows Hoàn Chỉnh — Chinh Phục Minecraft</h2>

<h3>Vào Game (Từ Màn Hình Title)</h3>
<pre><code>Bước 1: OBSERVE → screen.id == "minecraft:title"
Bước 2: ACT → click_button "singleplayer"
Bước 3: OBSERVE → screen.id == "minecraft:select_world"
Bước 4: ACT → click_button "My World" (tên world của bạn)
Bước 5: OBSERVE → đã vào game!</code></pre>

<h3>Sinh Tồn Cơ Bản — 5 Phút Đầu</h3>
<pre><code>1. OBSERVE → kiểm tra status [20, 20, 20, 0, 300]
2. ACT → look down (nhìn xuống đất)
3. OBSERVE → target là cây/gỗ
4. ACT → break (đập cây)
5. LẶP lại bước 3-4 đến khi có 4+ khúc gỗ
6. OBSERVE → inventory có gỗ
7. ACT → craft "minecraft:crafting_table"
8. Chế tạo cuốc gỗ, rồi tools bằng đá</code></pre>

<h3>Chiến Thuật Đào</h3>
<pre><code>1. Nhìn xuống, phá đất → tạo cầu thang xuống
2. Ở y=11 (tầng diamond lý tưởng): đào hầm branch mining
3. Mẫu: đào hầm cao 2, chừa 3 block giữa các hầm
4. Nghe thấy lava: dừng lại, âm thanh = có hang động gần
5. Kiểm tra target.block_id định kỳ để tìm quặng</code></pre>

<h3>Chiến Thuật Chiến Đấu</h3>
<p><strong>Chống lại melee (zombies, spiders):</strong></p>
<pre><code>1. Giữ khoảng cách 3-4 block
2. Di chuyển ngang (đổi a/d)
3. Tấn công (swing) khi mob đến gần
4. Nếu máu &lt; 5: chạy, ăn, hồi phục</code></pre>

<p><strong>Chống lại tầm xa (skeletons):</strong></p>
<pre><code>1. Tiếp cận zigzag (w + a rồi w + d)
2. Áp sát nhanh
3. Tấn công cận chiến</code></pre>

<p><strong>Chống creeper:</strong></p>
<pre><code>1. Lùi lại (s) khi nhìn vào nó
2. Tấn công, lùi ngay
3. Không để nó đến gần hơn 2 block</code></pre>

<h3>Xây Nhà</h3>
<pre><code>1. Tìm đất bằng gần spawn
2. Kiểm tra inventory (đất, đá cuội, gỗ)
3. Xây cấu trúc 5×5×3:
   - Tường cao 2 block
   - Cửa ra vào
   - Đuốc bên trong
4. Giường để đặt lại spawn</code></pre>

<h3>Trang Trại & Tự Cung</h3>
<pre><code>1. Chế tạo cuốc (2 que + 2 ván/đá cuội)
2. Tìm nguồn nước
3. Cuốc đất gần nước (chuột phải với cuốc)
4. Trồng hạt (từ phá cỏ)
5. Chờ cây trồng lớn (theo dõi day counter)</code></pre>

<h2 id="navigation">Screen Navigation State Machine</h2>
<pre><code>TITLE → chọn "Singleplayer"
  → WORLD_SELECT → click tên world
    → IN_GAME → chơi...
      → ESC → PAUSE
        → "Save & Exit" → TITLE
        → "Resume" → IN_GAME
      → DEATH → "Respawn" → IN_GAME
    → ESC (từ chọn world) → TITLE</code></pre>

<h2 id="error-recovery">Khắc Phục Lỗi</h2>
<table>
  <tr><th>Triệu chứng</th><th>Nguyên nhân</th><th>Xử lý</th></tr>
  <tr><td><code>tick</code> không tăng</td><td>Game bị đóng băng/dừng</td><td>Nhấn Esc, kiểm tra màn hình, resume</td></tr>
  <tr><td><code>viewport_blocks</code> toàn 0</td><td>Đang trong void/load</td><td>Di chuyển tới khu vực đã load</td></tr>
  <tr><td><code>screen.id == "minecraft:death"</code></td><td>Bạn đã chết</td><td>Click "Respawn", nhặt đồ</td></tr>
  <tr><td><code>target.block_id</code> luôn là 0</td><td>Nhìn lên trời/xa quá</td><td>Nhìn xuống hoặc tới gần</td></tr>
  <tr><td>Inventory toàn [0,0]</td><td>Chưa vào game</td><td>Điều hướng từ title vào world</td></tr>
  <tr><td>Action trả về "timeout"</td><td>Server bận</td><td>Thử lại sau 1 giây</td></tr>
  <tr><td>Không kết nối được port 25566</td><td>Mod chưa load</td><td>Khởi động lại Minecraft</td></tr>
</table>

<h2 id="strategies">Chiến Thuật AI Nâng Cao</h2>

<h3>Tìm Đường</h3>
<p>Dùng <code>viewport_blocks</code> để tìm đường:</p>
<ol>
  <li>Kiểm tra tia giữa (index ~76, width=7-8, height=4)</li>
  <li>Nếu giá trị &gt;= 8 → đường thông 8 blocks</li>
  <li>Nếu giá trị &lt; 3 → có chướng ngại gần</li>
  <li>Xoay nhẹ và kiểm tra lại</li>
</ol>

<h3>Vị Trí Tài Nguyên</h3>
<table>
  <tr><th>Tài nguyên</th><th>Y Level</th></tr>
  <tr><td>Sắt</td><td>y=15 đến y=32</td></tr>
  <tr><td>Diamond</td><td>y=-64 đến y=16 (nhiều nhất ở y=-59)</td></tr>
  <tr><td>Than</td><td>y=0 đến y=96</td></tr>
  <tr><td>Ancient Debris (Nether)</td><td>y=8 đến y=22</td></tr>
</table>

<h3>Ưu Tiên Xử Lý</h3>
<table>
  <tr><th>Tình huống</th><th>Hành động ưu tiên</th></tr>
  <tr><td>Máu &lt; 5</td><td>Chạy, ăn đồ</td></tr>
  <tr><td>Đồ ăn &lt; 6</td><td>Ăn, kiếm/trồng đồ ăn</td></tr>
  <tr><td>Đêm + không giường</td><td>Xây nhà, thắp sáng</td></tr>
  <tr><td>Thấy quặng quý</td><td>Đánh dấu, đào</td></tr>
  <tr><td>Thấy mob thù địch</td><td>Đánh giá: đánh được? Không thì chạy</td></tr>
  <tr><td>Đồ đạc yếu</td><td>Chế tạo đồ mới</td></tr>
  <tr><td>Đầy inventory</td><td>Về căn cứ, cất đồ</td></tr>
  <tr><td>Gần lava</td><td>Đặt nước (nếu có), hoặc tránh</td></tr>
</table>
`
    },
    {
      id: 'ai-guide.cheatsheet',
      title: 'Tham Khảo Nhanh',
      content: `
<h2 id="cheatsheet">Tham Khảo Nhanh</h2>

<h3>Observation Fields</h3>
<table>
  <tr><th>Path</th><th>Kiểu</th><th>Ý nghĩa</th></tr>
  <tr><td><code>tick</code></td><td>int</td><td>Thời gian game (tick, ÷20 = giây)</td></tr>
  <tr><td><code>world.time</code></td><td>int</td><td>0-24000 chu kỳ ngày-đêm</td></tr>
  <tr><td><code>world.day</code></td><td>int</td><td>Tổng số ngày đã chơi</td></tr>
  <tr><td><code>world.weather</code></td><td>string</td><td>clear / rain / thunder</td></tr>
  <tr><td><code>world.dimension</code></td><td>int</td><td>0=Overworld, 1=Nether, 2=End</td></tr>
  <tr><td><code>player.position</code></td><td>[x,y,z]</td><td>Vị trí hiện tại</td></tr>
  <tr><td><code>player.rotation.yaw</code></td><td>float</td><td>Hướng nhìn ngang</td></tr>
  <tr><td><code>player.rotation.pitch</code></td><td>float</td><td>Hướng nhìn dọc</td></tr>
  <tr><td><code>player.status[0]</code></td><td>int</td><td>Máu (0-20)</td></tr>
  <tr><td><code>player.status[1]</code></td><td>int</td><td>Đồ ăn (0-20)</td></tr>
  <tr><td><code>player.status[4]</code></td><td>int</td><td>Khí (0-300)</td></tr>
  <tr><td><code>player.flags[0]</code></td><td>0/1</td><td>Đang đứng trên mặt đất</td></tr>
  <tr><td><code>inventory.slots[i]</code></td><td>[id,count]</td><td>Item trong slot i</td></tr>
  <tr><td><code>inventory.selected_slot</code></td><td>int</td><td>Hotbar đang chọn (0-8)</td></tr>
  <tr><td><code>target.block_id</code></td><td>int</td><td>Block đang ngắm (0=không có)</td></tr>
  <tr><td><code>target.distance</code></td><td>float</td><td>Khoảng cách tới mục tiêu</td></tr>
  <tr><td><code>target.face</code></td><td>int</td><td>Mặt của block bị ngắm</td></tr>
  <tr><td><code>viewport_blocks</code></td><td>[288] Depth-blockId pairs</td><td>Depth-map 16×9 tia = 288 giá trị (144 cặp [depth, blockId]). Depth 1-32, blockId=ID block (0 nếu depth=32)</td></tr>
  <tr><td><code>viewport_entities[i]</code></td><td>[8 values]</td><td>Entity gần đó</td></tr>
  <tr><td><code>screen.id</code></td><td>string</td><td>Màn hình UI hiện tại (nếu có)</td></tr>
</table>

<h3>Hành Động Cơ Bản</h3>
<table>
  <tr><th>Mục đích</th><th>Hành động</th></tr>
  <tr><td>Đi tới</td><td><code>{"type":"key","keys":["w"]}</code></td></tr>
  <tr><td>Chạy</td><td><code>{"type":"key","keys":["w","ctrl"]}</code></td></tr>
  <tr><td>Nhảy</td><td><code>{"type":"jump"}</code></td></tr>
  <tr><td>Xoay</td><td><code>{"type":"look","deltaYaw":90}</code></td></tr>
  <tr><td>Phá block</td><td><code>{"type":"break"}</code></td></tr>
  <tr><td>Đặt block</td><td><code>{"type":"place","face":"up"}</code></td></tr>
  <tr><td>Tương tác</td><td><code>{"type":"interact"}</code></td></tr>
  <tr><td>Tấn công</td><td><code>{"type":"swing"}</code></td></tr>
  <tr><td>Chọn slot</td><td><code>{"type":"select_slot","slot":2}</code></td></tr>
  <tr><td>Chế tạo</td><td><code>{"type":"craft","recipe":"minecraft:chest"}</code></td></tr>
  <tr><td>Chat</td><td><code>{"type":"chat","message":"hi"}</code></td></tr>
  <tr><td>Lệnh</td><td><code>{"type":"command","command":"/time set day"}</code></td></tr>
  <tr><td>Click UI</td><td><code>{"type":"click_button","button_text":"Singleplayer"}</code></td></tr>
  <tr><td>Đóng màn hình</td><td><code>{"type":"key","keys":["esc"]}</code></td></tr>
  <tr><td>Mở inventory</td><td><code>{"type":"key","keys":["e"]}</code></td></tr>
  <tr><td>Nhìn xuống đất</td><td><code>{"type":"look","pitch":70}</code></td></tr>
</table>
`
    }
  ]
};

SECTIONS['registry'] = {
  title: 'Tra Cứu',
  pages: [
    {
      id: 'registry.basics',
      title: 'Cơ Bản',
      content: `
<h2 id="registry-intro">Bảng Tra Cứu</h2>
<div class="alert alert-warn"><strong>Quan trọng:</strong> ID số từ <code>BuiltInRegistries.getId()</code> có tính <strong>động</strong> (thay đổi theo thứ tự load). Dùng namespaced ID (<code>minecraft:stone</code>) để ổn định giữa các phiên.</div>

<h3>ID Dimension</h3>
<table>
  <tr><th>ID</th><th>Chiều</th></tr>
  <tr><td>0</td><td>Overworld</td></tr>
  <tr><td>1</td><td>Nether</td></tr>
  <tr><td>2</td><td>End</td></tr>
</table>

<h3>Hướng (Facing) theo Yaw</h3>
<table>
  <tr><th>Hướng</th><th>Khoảng Yaw</th></tr>
  <tr><td>Nam</td><td>-45° đến 45°</td></tr>
  <tr><td>Tây</td><td>45° đến 135°</td></tr>
  <tr><td>Bắc</td><td>135° đến 225°</td></tr>
  <tr><td>Đông</td><td>225° đến 315°</td></tr>
</table>

<h3>Mặt Block</h3>
<table>
  <tr><th>ID</th><th>Mặt</th></tr>
  <tr><td>0</td><td>Trên (up)</td></tr>
  <tr><td>1</td><td>Dưới (down)</td></tr>
  <tr><td>2</td><td>Bắc (north)</td></tr>
  <tr><td>3</td><td>Nam (south)</td></tr>
  <tr><td>4</td><td>Tây (west)</td></tr>
  <tr><td>5</td><td>Đông (east)</td></tr>
</table>

<h3>Hướng Cardinal (cho action place)</h3>
<pre><code>"up"    = dương Y
"down"  = âm Y
"north" = âm Z
"south" = dương Z
"west"  = âm X
"east"  = dương X</code></pre>

<h3>Giá Trị Thời Tiết</h3>
<table>
  <tr><th>Giá trị</th><th>Ý nghĩa</th></tr>
  <tr><td><code>"clear"</code></td><td>Trời trong</td></tr>
  <tr><td><code>"rain"</code></td><td>Mưa</td></tr>
  <tr><td><code>"thunder"</code></td><td>Mưa + sấm chớp</td></tr>
</table>

<h3>Inventory Layout</h3>
<table>
  <tr><th>Index</th><th>Khu vực</th><th>SL</th></tr>
  <tr><td>0-8</td><td>Hotbar</td><td>9</td></tr>
  <tr><td>9-35</td><td>Túi chính</td><td>27</td></tr>
  <tr><td>36-39</td><td>Giáp (ủng→quần→giáp→mũ)</td><td>4</td></tr>
  <tr><td>40</td><td>Tay trái (offhand)</td><td>1</td></tr>
</table>

<h3>Viewport Blocks Array</h3>
<ul>
  <li>Kích thước: 288 phần tử = 144 cặp [depth, blockId] (16 ngang × 9 dọc)</li>
  <li>depth: 1-32 (khoảng cách tới khối đặc đầu tiên trên tia)</li>
  <li>blockId: ID block bề mặt (0 nếu depth=32 = không vật cản)</li>
</ul>

<h3>Viewport Entities Array</h3>
<ul>
  <li>Tối đa 16 entity, mỗi entity: <code>[type_id, relX, relY, relZ, yaw, pitch, health, distance]</code></li>
  <li>Trống: <code>[0, 0, 0, 0, 0, 0, 0, 0]</code></li>
</ul>
`
    },
    {
      id: 'registry.entities',
      title: 'Entity IDs',
      content: `
<h2 id="entity-ids">Entity Registry — Đầy Đủ 0–127</h2>
<p>Entity type IDs từ <code>BuiltInRegistries.ENTITY_TYPE</code> Minecraft 1.21.11. Thứ tự registry có thể khác nếu dùng mod. Tra runtime: <code>GET /api/registry/entities</code>.</p>
<table>
  <tr><th>ID</th><th>Entity</th><th>Ghi chú</th><th>ID</th><th>Entity</th><th>Ghi chú</th></tr>
  <tr><td>0</td><td>Allay</td><td>—</td><td>1</td><td>Area Effect Cloud</td><td>—</td></tr>
  <tr><td>2</td><td>Armadillo</td><td>—</td><td>3</td><td>Armor Stand</td><td>—</td></tr>
  <tr><td>4</td><td>Arrow</td><td>Đạn</td><td>5</td><td>Axolotl</td><td>—</td></tr>
  <tr><td>6</td><td>Bat</td><td>—</td><td>7</td><td>Bee</td><td>Neutral</td></tr>
  <tr><td>8</td><td><strong>Blaze</strong></td><td>Thù địch, Nether</td><td>9</td><td>Block Display</td><td>—</td></tr>
  <tr><td>10</td><td>Boat</td><td>—</td><td>11</td><td><strong>Bogged</strong></td><td>Thù địch</td></tr>
  <tr><td>12</td><td><strong>Breeze</strong></td><td>Thù địch</td><td>13</td><td>Breeze Wind Charge</td><td>—</td></tr>
  <tr><td>14</td><td>Camel</td><td>—</td><td>15</td><td>Cat</td><td>—</td></tr>
  <tr><td>16</td><td><strong>Cave Spider</strong></td><td>Thù địch</td><td>17</td><td>Chest Boat</td><td>—</td></tr>
  <tr><td>18</td><td>Chest Minecart</td><td>—</td><td>19</td><td>Chicken</td><td>Thức ăn</td></tr>
  <tr><td>20</td><td>Cod</td><td>—</td><td>21</td><td>Minecart with Command Block</td><td>—</td></tr>
  <tr><td>22</td><td>Cow</td><td>Thức ăn/da</td><td>23</td><td><strong>Creeper</strong></td><td>Thù địch, nổ</td></tr>
  <tr><td>24</td><td>Dolphin</td><td>—</td><td>25</td><td>Donkey</td><td>Cưỡi được</td></tr>
  <tr><td>26</td><td>Dragon Fireball</td><td>—</td><td>27</td><td><strong>Drowned</strong></td><td>Thù địch</td></tr>
  <tr><td>28</td><td>Egg</td><td>—</td><td>29</td><td><strong>Elder Guardian</strong></td><td>Thù địch</td></tr>
  <tr><td>30</td><td>End Crystal</td><td>—</td><td>31</td><td><strong>Ender Dragon</strong></td><td><strong>Boss</strong></td></tr>
  <tr><td>32</td><td>Ender Pearl</td><td>—</td><td>33</td><td>Enderman</td><td>Neutral</td></tr>
  <tr><td>34</td><td>Endermite</td><td>Neutral</td><td>35</td><td><strong>Evoker</strong></td><td>Thù địch</td></tr>
  <tr><td>36</td><td>Evoker Fangs</td><td>—</td><td>37</td><td>Experience Bottle</td><td>—</td></tr>
  <tr><td>38</td><td>Experience Orb</td><td>—</td><td>39</td><td>Eye of Ender</td><td>—</td></tr>
  <tr><td>40</td><td>Falling Block</td><td>—</td><td>41</td><td>Firework Rocket</td><td>—</td></tr>
  <tr><td>42</td><td>Fox</td><td>—</td><td>43</td><td>Frog</td><td>—</td></tr>
  <tr><td>44</td><td>Furnace Minecart</td><td>—</td><td>45</td><td><strong>Ghast</strong></td><td>Thù địch, Nether</td></tr>
  <tr><td>46</td><td><strong>Giant</strong></td><td>Thù địch</td><td>47</td><td>Glow Item Frame</td><td>—</td></tr>
  <tr><td>48</td><td>Glow Squid</td><td>—</td><td>49</td><td>Goat</td><td>—</td></tr>
  <tr><td>50</td><td><strong>Guardian</strong></td><td>Thù địch, nước</td><td>51</td><td><strong>Hoglin</strong></td><td>Thù địch, Nether</td></tr>
  <tr><td>52</td><td>Hopper Minecart</td><td>—</td><td>53</td><td>Horse</td><td>Cưỡi được</td></tr>
  <tr><td>54</td><td><strong>Husk</strong></td><td>Thù địch</td><td>55</td><td><strong>Illusioner</strong></td><td>Thù địch</td></tr>
  <tr><td>56</td><td>Interaction</td><td>—</td><td>57</td><td>Iron Golem</td><td>Neutral</td></tr>
  <tr><td>58</td><td>Item (rơi)</td><td>—</td><td>59</td><td>Item Display</td><td>—</td></tr>
  <tr><td>60</td><td>Item Frame</td><td>—</td><td>61</td><td>Ominous Item Spawner</td><td>—</td></tr>
  <tr><td>62</td><td>Ghast Fireball</td><td>—</td><td>63</td><td>Leash Knot</td><td>—</td></tr>
  <tr><td>64</td><td>Lightning Bolt</td><td>—</td><td>65</td><td>Llama</td><td>Mang rương</td></tr>
  <tr><td>66</td><td>Llama Spit</td><td>—</td><td>67</td><td><strong>Magma Cube</strong></td><td>Thù địch, Nether</td></tr>
  <tr><td>68</td><td>Marker</td><td>—</td><td>69</td><td>Minecart</td><td>—</td></tr>
  <tr><td>70</td><td>Mooshroom</td><td>—</td><td>71</td><td>Mule</td><td>Cưỡi được</td></tr>
  <tr><td>72</td><td>Ocelot</td><td>—</td><td>73</td><td>Painting</td><td>—</td></tr>
  <tr><td>74</td><td>Panda</td><td>—</td><td>75</td><td>Parrot</td><td>—</td></tr>
  <tr><td>76</td><td><strong>Phantom</strong></td><td>Thù địch</td><td>77</td><td>Pig</td><td>Thức ăn</td></tr>
  <tr><td>78</td><td>Piglin</td><td>Neutral</td><td>79</td><td><strong>Piglin Brute</strong></td><td>Thù địch, Nether</td></tr>
  <tr><td>80</td><td><strong>Pillager</strong></td><td>Thù địch, cướp</td><td>81</td><td>Polar Bear</td><td>Neutral</td></tr>
  <tr><td>82</td><td>Potion</td><td>—</td><td>83</td><td>Pufferfish</td><td>—</td></tr>
  <tr><td>84</td><td>Rabbit</td><td>—</td><td>85</td><td><strong>Ravager</strong></td><td>Thù địch, cướp</td></tr>
  <tr><td>86</td><td>Salmon</td><td>—</td><td>87</td><td>Sheep</td><td>Len/thịt</td></tr>
  <tr><td>88</td><td><strong>Shulker</strong></td><td>Thù địch, End</td><td>89</td><td>Shulker Bullet</td><td>—</td></tr>
  <tr><td>90</td><td><strong>Silverfish</strong></td><td>Thù địch</td><td>91</td><td><strong>Skeleton</strong></td><td>Thù địch, bắn</td></tr>
  <tr><td>92</td><td>Skeleton Horse</td><td>—</td><td>93</td><td><strong>Slime</strong></td><td>Thù địch</td></tr>
  <tr><td>94</td><td>Blaze Fireball</td><td>—</td><td>95</td><td>Sniffer</td><td>—</td></tr>
  <tr><td>96</td><td>Snow Golem</td><td>—</td><td>97</td><td>Snowball</td><td>—</td></tr>
  <tr><td>98</td><td>Minecart with Spawner</td><td>—</td><td>99</td><td>Spectral Arrow</td><td>—</td></tr>
  <tr><td>100</td><td><strong>Spider</strong></td><td>Thù địch</td><td>101</td><td>Squid</td><td>—</td></tr>
  <tr><td>102</td><td><strong>Stray</strong></td><td>Thù địch</td><td>103</td><td>Strider</td><td>Nether, cưỡi được</td></tr>
  <tr><td>104</td><td>Tadpole</td><td>—</td><td>105</td><td>Text Display</td><td>—</td></tr>
  <tr><td>106</td><td>Primed TNT</td><td>—</td><td>107</td><td>Minecart with TNT</td><td>—</td></tr>
  <tr><td>108</td><td>Trader Llama</td><td>—</td><td>109</td><td>Trident</td><td>—</td></tr>
  <tr><td>110</td><td>Tropical Fish</td><td>—</td><td>111</td><td>Turtle</td><td>—</td></tr>
  <tr><td>112</td><td><strong>Vex</strong></td><td>Thù địch</td><td>113</td><td>Villager</td><td>Giao dịch</td></tr>
  <tr><td>114</td><td><strong>Vindicator</strong></td><td>Thù địch</td><td>115</td><td>Wandering Trader</td><td>—</td></tr>
  <tr><td>116</td><td><strong>Warden</strong></td><td>Thù địch, mù</td><td>117</td><td>Wind Charge</td><td>—</td></tr>
  <tr><td>118</td><td>Witch</td><td>Thù địch</td><td>119</td><td><strong>Wither</strong></td><td><strong>Boss</strong></td></tr>
  <tr><td>120</td><td><strong>Wither Skeleton</strong></td><td>Thù địch, Nether</td><td>121</td><td>Wither Skull</td><td>—</td></tr>
  <tr><td>122</td><td>Wolf</td><td>Neutral</td><td>123</td><td><strong>Zoglin</strong></td><td>Thù địch</td></tr>
  <tr><td>124</td><td><strong>Zombie</strong></td><td>Thù địch, phổ biến</td><td>125</td><td>Zombie Horse</td><td>—</td></tr>
  <tr><td>126</td><td><strong>Zombie Villager</strong></td><td>Thù địch</td><td>127</td><td>Zombified Piglin</td><td>Neutral, Nether</td></tr>
</table>
<p>Ô trống = toàn 0 <code>[0, 0, 0, 0, 0, 0, 0, 0]</code>. Đậm = thù địch. Tra runtime: <code>GET /api/registry/entities</code>.</p>
`
    },
    {
      id: 'registry.blocks-items',
      title: 'Block & Item',
      content: `
<h2 id="common-blocks">ID Namespaced Của Block & Item Phổ Biến</h2>

<h3>Đá & Khoáng Sản</h3>
<table>
  <tr><th>Namespaced ID</th><th>Block</th></tr>
  <tr><td>minecraft:stone</td><td>Đá</td></tr>
  <tr><td>minecraft:cobblestone</td><td>Đá cuội</td></tr>
  <tr><td>minecraft:deepslate</td><td>Deepslate</td></tr>
  <tr><td>minecraft:dirt</td><td>Đất</td></tr>
  <tr><td>minecraft:grass_block</td><td>Cỏ</td></tr>
  <tr><td>minecraft:gravel</td><td>Sỏi</td></tr>
  <tr><td>minecraft:sand</td><td>Cát</td></tr>
</table>

<h3>Quặng</h3>
<table>
  <tr><th>Namespaced ID</th><th>Quặng</th></tr>
  <tr><td>minecraft:coal_ore</td><td>Than</td></tr>
  <tr><td>minecraft:iron_ore</td><td>Sắt</td></tr>
  <tr><td>minecraft:copper_ore</td><td>Đồng</td></tr>
  <tr><td>minecraft:gold_ore</td><td>Vàng</td></tr>
  <tr><td>minecraft:diamond_ore</td><td>Kim cương</td></tr>
  <tr><td>minecraft:emerald_ore</td><td>Ngọc lục bảo</td></tr>
  <tr><td>minecraft:ancient_debris</td><td>Ancient Debris</td></tr>
</table>

<h3>Gỗ</h3>
<table>
  <tr><th>Namespaced ID</th><th>Loại</th></tr>
  <tr><td>minecraft:oak_log</td><td>Gỗ sồi</td></tr>
  <tr><td>minecraft:spruce_log</td><td>Gỗ vân sam</td></tr>
  <tr><td>minecraft:birch_log</td><td>Gỗ bạch dương</td></tr>
  <tr><td>minecraft:jungle_log</td><td>Gỗ rừng rậm</td></tr>
</table>

<h3>Item Quan Trọng</h3>
<table>
  <tr><th>Namespaced ID</th><th>Item</th></tr>
  <tr><td>minecraft:diamond</td><td>Kim cương</td></tr>
  <tr><td>minecraft:iron_ingot</td><td>Thỏi sắt</td></tr>
  <tr><td>minecraft:gold_ingot</td><td>Thỏi vàng</td></tr>
  <tr><td>minecraft:netherite_ingot</td><td>Thỏi netherite</td></tr>
  <tr><td>minecraft:stick</td><td>Que gỗ</td></tr>
</table>

<h3>Tools & Vũ Khí</h3>
<table>
  <tr><th>Namespaced ID</th><th>Item</th></tr>
  <tr><td>minecraft:wooden_sword</td><td>Kiếm gỗ</td></tr>
  <tr><td>minecraft:stone_sword</td><td>Kiếm đá</td></tr>
  <tr><td>minecraft:iron_sword</td><td>Kiếm sắt</td></tr>
  <tr><td>minecraft:diamond_sword</td><td>Kiếm kim cương</td></tr>
  <tr><td>minecraft:netherite_sword</td><td>Kiếm netherite</td></tr>
  <tr><td>minecraft:bow</td><td>Cung</td></tr>
  <tr><td>minecraft:iron_pickaxe</td><td>Cuốc sắt</td></tr>
  <tr><td>minecraft:diamond_pickaxe</td><td>Cuốc kim cương</td></tr>
</table>

<h3>Đồ Ăn</h3>
<table>
  <tr><th>Namespaced ID</th><th>Item</th></tr>
  <tr><td>minecraft:apple</td><td>Táo</td></tr>
  <tr><td>minecraft:bread</td><td>Bánh mì</td></tr>
  <tr><td>minecraft:cooked_beef</td><td>Bít tết</td></tr>
  <tr><td>minecraft:cooked_porkchop</td><td>Thịt heo chín</td></tr>
  <tr><td>minecraft:cooked_chicken</td><td>Gà chín</td></tr>
  <tr><td>minecraft:carrot</td><td>Cà rốt</td></tr>
</table>
`
    },
    {
      id: 'registry.screens',
      title: 'Màn Hình UI',
      content: `
<h2 id="screen-ids">Danh Sách Màn Hình UI</h2>
<p>Giá trị trả về trong <code>screen.id</code> khi UI đang mở.</p>

<table>
  <tr><th>Screen ID</th><th>Màn hình</th></tr>
  <tr><td><code>minecraft:title</code></td><td>Màn hình tiêu đề</td></tr>
  <tr><td><code>minecraft:select_world</code></td><td>Chọn world</td></tr>
  <tr><td><code>minecraft:multiplayer</code></td><td>Danh sách server</td></tr>
  <tr><td><code>minecraft:inventory</code></td><td>Túi đồ</td></tr>
  <tr><td><code>minecraft:creative_inventory</code></td><td>Creative menu</td></tr>
  <tr><td><code>minecraft:crafting</code></td><td>Bàn chế tạo</td></tr>
  <tr><td><code>minecraft:furnace</code></td><td>Lò nung</td></tr>
  <tr><td><code>minecraft:blast_furnace</code></td><td>Lò luyện</td></tr>
  <tr><td><code>minecraft:smoker</code></td><td>Lò xông khói</td></tr>
  <tr><td><code>minecraft:brewing_stand</code></td><td>Bàn pha chế</td></tr>
  <tr><td><code>minecraft:enchantment</code></td><td>Bàn phù phép</td></tr>
  <tr><td><code>minecraft:anvil</code></td><td>Đe</td></tr>
  <tr><td><code>minecraft:grindstone</code></td><td>Đá mài</td></tr>
  <tr><td><code>minecraft:cartography_table</code></td><td>Bàn bản đồ</td></tr>
  <tr><td><code>minecraft:stonecutter</code></td><td>Máy cắt đá</td></tr>
  <tr><td><code>minecraft:loom</code></td><td>Khung dệt</td></tr>
  <tr><td><code>minecraft:smithing</code></td><td>Bàn rèn</td></tr>
  <tr><td><code>minecraft:villager_trades</code></td><td>Trao đổi với dân</td></tr>
  <tr><td><code>minecraft:horse_inventory</code></td><td>Túi ngựa</td></tr>
  <tr><td><code>minecraft:container</code></td><td>Rương/thùng/shulker</td></tr>
  <tr><td><code>minecraft:pause</code></td><td>Menu tạm dừng</td></tr>
  <tr><td><code>minecraft:death</code></td><td>Màn hình chết</td></tr>
  <tr><td><code>minecraft:options</code></td><td>Tùy chọn</td></tr>
  <tr><td><code>minecraft:video_settings</code></td><td>Cài đặt video</td></tr>
  <tr><td><code>minecraft:sound_settings</code></td><td>Cài đặt âm thanh</td></tr>
  <tr><td><code>minecraft:controls</code></td><td>Điều khiển</td></tr>
  <tr><td><code>minecraft:keybinds</code></td><td>Phím tắt</td></tr>
  <tr><td><code>minecraft:language</code></td><td>Ngôn ngữ</td></tr>
  <tr><td><code>minecraft:advancements</code></td><td>Tiến trình</td></tr>
  <tr><td><code>minecraft:recipe_book</code></td><td>Sổ công thức</td></tr>
  <tr><td><code>minecraft:credits</code></td><td>Credit cuối game</td></tr>
  <tr><td><code>minecraft:create_world</code></td><td>Tạo world mới</td></tr>
  <tr><td><code>minecraft:edit_world</code></td><td>Sửa world</td></tr>
  <tr><td><code>minecraft:realms</code></td><td>Realms</td></tr>
  <tr><td><code>minecraft:world_loading</code></td><td>Đang tải world</td></tr>
  <tr><td><code>minecraft:jigsaw</code></td><td>Block jigsaw</td></tr>
  <tr><td><code>minecraft:structure_block</code></td><td>Block cấu trúc</td></tr>
</table>
`
    },
    {
      id: 'registry.keys',
      title: 'Danh Sách Phím',
      content: `
<h2 id="key-aliases">Danh Sách Phím (Key Aliases)</h2>
<p>Dùng trong action <code>{"type":"key","keys":["bí_danh1","bí_danh2"]}</code>. Có thể gửi nhiều phím cùng lúc (VD: <code>["w","ctrl"]</code> để chạy).</p>

<h3>Chữ & Số</h3>
<table>
  <tr><th>Bí danh</th><th>Phím</th></tr>
  <tr><td><code>a</code>–<code>z</code></td><td>Chữ cái thường</td></tr>
  <tr><td><code>0</code>–<code>9</code></td><td>Phím số trên hàng trên</td></tr>
  <tr><td><code>1</code>–<code>9</code></td><td>Ô nóng (hotbar) 1–9</td></tr>
</table>

<h3>Di Chuyển</h3>
<table>
  <tr><th>Bí danh</th><th>Tác dụng</th></tr>
  <tr><td><code>w</code></td><td>Đi tới</td></tr>
  <tr><td><code>s</code></td><td>Đi lùi</td></tr>
  <tr><td><code>a</code></td><td>Trái</td></tr>
  <tr><td><code>d</code></td><td>Phải</td></tr>
  <tr><td><code>space</code></td><td>Nhảy</td></tr>
  <tr><td><code>shift</code></td><td>Ngồi (sneak)</td></tr>
  <tr><td><code>ctrl</code></td><td>Chạy (sprint)</td></tr>
  <tr><td><code>q</code></td><td>Ném/vứt đồ đang cầm</td></tr>
  <tr><td><code>e</code></td><td>Mở/đóng túi đồ</td></tr>
  <tr><td><code>f</code></td><td>Đổi tay / đặt block</td></tr>
</table>

<h3>Bổ Trợ (Modifier)</h3>
<table>
  <tr><th>Bí danh</th><th>Phím</th></tr>
  <tr><td><code>shift</code></td><td>Shift (ngồi)</td></tr>
  <tr><td><code>ctrl</code></td><td>Control (chạy)</td></tr>
  <tr><td><code>alt</code></td><td>Alt</td></tr>
</table>

<h3>Phím Chức Năng (F-keys)</h3>
<table>
  <tr><th>Bí danh</th><th>Tác dụng</th></tr>
  <tr><td><code>f1</code>–<code>f25</code></td><td>Tất cả phím chức năng F1–F25</td></tr>
  <tr><td><code>f2</code></td><td>Chụp màn hình</td></tr>
  <tr><td><code>f3</code></td><td>Màn hình debug</td></tr>
  <tr><td><code>f5</code></td><td>Đổi góc nhìn</td></tr>
  <tr><td><code>f11</code></td><td>Toàn màn hình</td></tr>
</table>

<h3>Chuột</h3>
<table>
  <tr><th>Bí danh</th><th>Nút</th></tr>
  <tr><td><code>mouse_left</code></td><td>Trái (tấn công/phá)</td></tr>
  <tr><td><code>mouse_right</code></td><td>Phải (tương tác/dùng)</td></tr>
  <tr><td><code>mouse_middle</code></td><td>Giữa (pick block)</td></tr>
</table>

<h3>Điều Hướng</h3>
<table>
  <tr><th>Bí danh</th><th>Phím</th></tr>
  <tr><td><code>esc</code></td><td>Thoát / đóng màn hình</td></tr>
  <tr><td><code>tab</code></td><td>Tab (chuyển ô)</td></tr>
  <tr><td><code>enter</code></td><td>Enter / Xuống dòng</td></tr>
  <tr><td><code>backspace</code></td><td>Xóa lùi</td></tr>
  <tr><td><code>delete</code></td><td>Xóa</td></tr>
  <tr><td><code>up</code></td><td>Mũi tên Lên</td></tr>
  <tr><td><code>down</code></td><td>Mũi tên Xuống</td></tr>
  <tr><td><code>left</code></td><td>Mũi tên Trái</td></tr>
  <tr><td><code>right</code></td><td>Mũi tên Phải</td></tr>
</table>

<h3>Numpad</h3>
<table>
  <tr><th>Bí danh</th><th>Phím</th></tr>
  <tr><td><code>numpad0</code>–<code>numpad9</code></td><td>Số trên numpad</td></tr>
  <tr><td><code>numpad_add</code></td><td>Numpad +</td></tr>
  <tr><td><code>numpad_sub</code></td><td>Numpad -</td></tr>
  <tr><td><code>numpad_mul</code></td><td>Numpad *</td></tr>
  <tr><td><code>numpad_div</code></td><td>Numpad /</td></tr>
  <tr><td><code>numpad_enter</code></td><td>Numpad Enter</td></tr>
</table>
<p><strong>Lưu ý:</strong> Tên phím không phân biệt hoa thường. Thêm <code>duration</code> (ms) để giữ phím.</p>
`
    },
    {
      id: 'registry.actions',
      title: 'Loại Hành Động',
      content: `
<h2 id="action-types">Tất Cả Loại Hành Động</h2>
<p>12 loại action cho <code>POST /action</code> và <code>POST /step</code>.</p>

<table>
  <tr><th>Type</th><th>Bắt buộc</th><th>Tùy chọn</th><th>Tác dụng</th></tr>
  <tr><td><code>key</code></td><td><code>keys: string[]</code></td><td><code>duration: int</code> (ms)</td><td>Nhấn phím (tap nếu không có duration, giữ+nả nếu có). Có thể nhấn nhiều phím cùng lúc.</td></tr>
  <tr><td><code>select_slot</code></td><td><code>slot: int</code> (0–8)</td><td>—</td><td>Chuyển ô hotbar.</td></tr>
  <tr><td><code>place</code></td><td>—</td><td><code>face: string</code> (up/down/north/south/west/east)</td><td>Đặt block vào mặt của block đang nhắm. Mặc định: up.</td></tr>
  <tr><td><code>break</code></td><td>—</td><td>—</td><td>Đào block đang nhắm (survival: gửi gói start destroy).</td></tr>
  <tr><td><code>interact</code></td><td>—</td><td>—</td><td>Click phải vào block (mở rương, bấm nút, v.v.).</td></tr>
  <tr><td><code>jump</code></td><td>—</td><td>—</td><td>Nhảy.</td></tr>
  <tr><td><code>swing</code></td><td>—</td><td>—</td><td>Vung tay (chỉ hiển thị, không tương tác).</td></tr>
  <tr><td><code>look</code></td><td>—</td><td><code>yaw</code>/<code>pitch</code> (tuyệt đối) hoặc <code>deltaYaw</code>/<code>deltaPitch</code> (tương đối)</td><td>Xoay camera. Giá trị tuyệt đối ghi đè tương đối; pitch bị kẹp ±90.</td></tr>
  <tr><td><code>craft</code></td><td><code>recipe: string</code></td><td><code>mode: string</code> (dự trữ)</td><td>Mở khóa và nhận công thức qua <code>/recipe give</code>.</td></tr>
  <tr><td><code>chat</code></td><td><code>message: string</code></td><td>—</td><td>Phát sóng tin nhắn hệ thống tới toàn bộ người chơi.</td></tr>
  <tr><td><code>command</code></td><td><code>command: string</code></td><td>—</td><td>Chạy lệnh server (không có dấu <code>/</code> ở đầu).</td></tr>
  <tr><td><code>click_button</code></td><td><code>button_text: string</code></td><td>—</td><td>Click vào nút trên màn hình có chứa chữ.</td></tr>
</table>
`
    }
  ]
};

SECTIONS['changelog'] = {
  title: 'Changelog',
  content: `
<h1 id="changelog">Lịch Sử Thay Đổi</h1>

<h2 id="v122">v1.2.2 — Depth-Map kèm Block ID bề mặt</h2>

<h3>Cải Tiến</h3>
<ul>
  <li><strong>viewport_blocks giờ trả về cặp [depth, blockId]</strong> — Trước đây chỉ depth (144 số). Giờ mỗi tia output 2 giá trị: depth (1-32 = khoảng cách) và blockId của khối bề mặt (0 nếu clear). Tổng 288 số.</li>
  <li>AI có thể phân biệt đá, đất, nước trên từng tia mà không cần gọi API riêng.</li>
</ul>

<h3>Sửa Lỗi</h3>
<ul>
  <li><strong>Sửa stride công thức index</strong> — depth * 288 → depth * 144 (mỗi lớp depth có 16×9 = 144 cell, không phải 288).</li>
  <li><strong>viewport_entities không pad rỗng</strong> — Bỏ padding 16 slot cố định. Chỉ trả entity thực tế (0-16 phần tử).</li>
</ul>

<h2 id="v121">v1.2.1 — Registry Endpoints + Sửa Lỗi + Đồng Bộ Tài Liệu</h2>

<h3>Tính Năng Mới</h3>
<ul>
  <li><strong>Registry Dump Endpoints</strong> — Tra ID entity/item runtime:
    <ul>
      <li><code>GET /api/registry/entities</code> — Toàn bộ registry entity với tên namespaced</li>
      <li><code>GET /api/registry/items</code> — Toàn bộ registry item với tên namespaced</li>
      <li>Phản hồi: <code>{"id": 0, "name": "minecraft:allay"}, ...</code></li>
    </ul>
  </li>
</ul>

<h3>Sửa Lỗi</h3>
<ul>
  <li><strong>world.time clamp</strong> — <code>GET /observation</code> trả về <code>world.time</code> trong 0-24000 (trước đây trả raw tick)</li>
  <li><strong>viewport_entities FOV</strong> — Entity ngoài góc nhìn ngang bị loại bỏ</li>
  <li><strong>Bảng entity ID sửa sai</strong> — Tất cả ID entity khớp với registry thật (0-127, thêm 8 entity thiếu)</li>
  <li><strong>Đồng bộ tài liệu</strong> — HTML docs cập nhật bảng entity, registry endpoints, ghi chú FOV</li>
</ul>

<h3>Cải Tiến</h3>
<ul>
  <li>Bảng tài liệu tham chiếu <code>GET /api/registry/entities</code> để tra cứu runtime</li>
  <li>Tài liệu observation schema cập nhật khoảng entity 0-127</li>
  <li>Đồng bộ hoàn toàn tài liệu tiếng Việt</li>
</ul>

<h2 id="v120">v1.2.0 — AI Endpoints + Observation Schema + Bảo Mật</h2>

<h3>Tính Năng Mới</h3>
<ul>
  <li><strong>AI Endpoints (OpenAI Gym style)</strong> — 6 endpoint mới
    <ul>
      <li><code>POST /session</code> — Tạo phiên AI</li>
      <li><code>GET /observation</code> — Observation game có cấu trúc</li>
      <li><code>POST /action</code> — Gửi hành động (12 loại)</li>
      <li><code>POST /step</code> — Kết hợp action + observation</li>
      <li><code>GET /stream</code> — SSE stream observation</li>
      <li><code>POST /close</code> — Đóng session</li>
    </ul>
  </li>
  <li><strong>Observation Schema</strong> — JSON kích thước cố định</li>
  <li><strong>Screen Observation</strong> — 37 màn hình UI</li>
  <li><strong>12 Loại Action</strong></li>
</ul>

<h3>Sửa Lỗi</h3>
<ul>
  <li>Server không dừng khi thoát world</li>
  <li>ObservationHandler không bị crash (CountDownLatch)</li>
  <li>Frustum block scanning sửa công thức cross product</li>
  <li>Screen ID hiển thị tên người đọc được</li>
  <li>So sánh tên world không phân biệt hoa thường</li>
</ul>

<h3>Bảo Mật</h3>
<ul>
  <li>So sánh token thời gian hằng định</li>
  <li>Validate ID block/item</li>
  <li>Giới hạn body 1MB</li>
  <li>Rate limit 60 req/s/IP</li>
</ul>
`
};

docsData.vi.sections = Object.assign(docsData.vi.sections, SECTIONS);
})();
