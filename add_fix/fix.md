### Lỗi không chọn được vài thế giới
Nguyên nhân là do tên thế giới được viết hoa nhưng bản mod lại biến chữ hoa thành chữ thường điều này khiến mod không nhận ra tên của thế giới! Ngoài ra nó còn có thể ảnh hưởng thên vài thứ khác(Chưa rõ)
## Nâng cấp hệ thống bảo mật
Bảo mật luôn là một vấn đề nan gải với các nhà phát triển nên chúng ta cần nâng cấp và duy trì nó. Để tránh việc người khác lợi dụng điểm yếu và điều khiển Sever cũng như là Minecraft của người chơi!
#Đã đọc xong toàn bộ source code (clone qua git, không chỉ trang GitHub). Để chắc chắn không bỏ sót, mình xem tiếp phần `TaskManager.java`:Mình đã đọc toàn bộ source, đây là Fabric mod (client + server) mở HTTP REST API trên cổng 25566 để điều khiển game. Sau khi đọc hết các class (`ApiServer`, các `*Handler`, `TaskManager`...), mình thấy có một vài lỗ hổng khá nghiêm trọng, đặc biệt khi kết hợp với nhau. Mình sắp theo mức độ ưu tiên fix.

## 🔴 Nghiêm trọng (fix trước tiên)

### 1. Không bắt buộc auth theo mặc định + bind ra mọi interface
```java
// ApiServer.java
private String authToken = ""; // mặc định rỗng
...
server = HttpServer.create(new InetSocketAddress(port), 0); // bind 0.0.0.0, không chỉ localhost
...
public boolean checkAuth(HttpExchange exchange) {
    if (authToken.isEmpty()) return true; // ⚠️ không set key = bỏ qua auth hoàn toàn
    ...
}
```
Nếu người dùng quên truyền `-Dmcapi.key=...` (rất dễ quên vì README ghi là optional), **bất kỳ ai trên mạng LAN — hoặc cả Internet nếu port được forward/tunnel (ví dụ qua playit.gg như bạn từng setup) — đều có toàn quyền điều khiển server/client**, kể cả endpoint `/api/command` chạy lệnh Minecraft với quyền console.

**Fix:** auth phải *mandatory*, không có chế độ "no-key = mở toang":
```java
authToken = System.getProperty("mcapi.key", "");
if (authToken.isEmpty()) {
    authToken = generateRandomToken(); // sinh ngẫu nhiên, in ra log 1 lần
    McApiMod.LOGGER.warn("mcapi.key chưa được set! Đã tạo token ngẫu nhiên: {}", authToken);
}
String bindHost = System.getProperty("mcapi.host", "127.0.0.1"); // default chỉ localhost
server = HttpServer.create(new InetSocketAddress(bindHost, port), 0);
```
và trong `checkAuth` bỏ hẳn nhánh `if (authToken.isEmpty()) return true;`.

### 2. "Drive-by" CSRF qua trình duyệt — nguy hiểm hơn cả lỗ hổng #1
Đây là điểm dễ bị bỏ qua nhất nhưng **ảnh hưởng cả người chơi singleplayer, không cần mở port ra ngoài**:

- Mod tự khởi động server ngay khi `CLIENT_STARTED` (client-side), nên **mọi người chơi cài mod này đều có HTTP server chạy ngầm trên máy họ**, dù chỉ chơi offline.
- Mọi response đều set `Access-Control-Allow-Origin: *`.
- `parseBody()` không kiểm tra `Content-Type`, cứ đọc raw body rồi `JsonParser.parseString`.

→ Một trang web độc hại (hoặc quảng cáo độc) mà người chơi mở trong lúc game đang chạy có thể gửi:
```js
fetch("http://localhost:25566/api/command", {
  method: "POST",
  headers: {"Content-Type": "text/plain"}, // content-type "simple" => trình duyệt KHÔNG preflight
  body: JSON.stringify({command: "op AttackerName"})
});
```
Vì `text/plain` + `POST` là "simple request" theo CORS spec, trình duyệt gửi request đi **mà không cần hỏi server trước (preflight)** — và nếu không có `Authorization` header bắt buộc, request này thực thi luôn. Nếu mod không set key (mặc định), kẻ tấn công còn đọc được cả response nhờ `Access-Control-Allow-Origin: *`.

**Fix:**
- Bắt buộc có token (fix #1 đã giải quyết phần lớn vì header `Authorization` là "non-simple" → buộc browser phải preflight, và handler hiện tại trả 405/401 cho OPTIONS nên preflight fail → request bị chặn).
- Nên **bỏ hẳn `Access-Control-Allow-Origin: *`** — API này thiết kế để gọi từ curl/script, không phải từ browser, không có lý do gì phải set CORS mở:
```java
// Xoá dòng này trong sendResponse():
exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
```

## 🟠 Cao

### 3. So sánh token không constant-time (timing attack)
```java
return auth != null && auth.equals("Bearer " + authToken);
```
Nên dùng so sánh không rò thời gian:
```java
import java.security.MessageDigest;
...
byte[] a = auth.getBytes(StandardCharsets.UTF_8);
byte[] b = ("Bearer " + authToken).getBytes(StandardCharsets.UTF_8);
return MessageDigest.isEqual(a, b);
```

### 4. Nối chuỗi input người dùng trực tiếp vào lệnh Minecraft, không validate
Gặp ở nhiều nơi:
```java
// BlockHandler.PlaceHandler
"setblock " + pos.getX() + " " + pos.getY() + " " + pos.getZ() + " " + blockId
// InventoryHandler.SetHandler
"item replace entity " + playerName + " container." + slot + " with " + itemId + " " + count
// SettingsHandler.GameRuleHandler
"gamerule " + rule + " " + value
```
`blockId`, `itemId`, `rule`, `value` lấy thẳng từ JSON người dùng gửi lên, không kiểm tra format. Vì `/api/command` đã cho chạy lệnh tuỳ ý nên đây không phải là "cửa sau" mới, nhưng vẫn nên validate bằng regex resource-location trước khi nối chuỗi, để tránh parser Brigadier bị input lạ phá hỏng hoặc nhận nhầm token:
```java
private static final Pattern RESOURCE_ID = Pattern.compile("^[a-z0-9_.-]+:[a-z0-9_./-]+$");
if (!RESOURCE_ID.matcher(blockId).matches()) {
    sendResponse(exchange, 400, ApiResponse.jsonError(400, "Invalid block id"));
    return;
}
```

### 5. Đọc body không giới hạn kích thước → DoS
```java
public static String readBody(HttpExchange exchange) throws IOException {
    ... // đọc hết vào StringBuilder, không giới hạn
}
```
Một request với body vài trăm MB sẽ làm đầy heap. Nên giới hạn:
```java
exchange.getRequestHeaders().getFirst("Content-Length"); // check trước
// hoặc giới hạn khi đọc:
final int MAX_BODY = 1_000_000; // 1MB
... if (sb.length() > MAX_BODY) throw new IOException("Body too large");
```

## 🟡 Trung bình

- **Không rate-limit** bất kỳ endpoint nào (`/api/chat/send`, `/api/script`, `/api/command`...) → spam chat, spam lệnh, làm đầy `commandQueue` gây lag tick server.
- **`TaskManager`** dùng `Executors.newScheduledThreadPool(4)` chung cho cả `schedule()` (delay) và `submit()` (script) — gửi nhiều script có `delay` dài sẽ chiếm hết 4 thread, "treo" toàn bộ chức năng script/key cho chính người dùng hợp lệ (tự DoS).
- **Validate input thiếu nhất quán**: `InventoryHandler.SelectHandler` kiểm tra `slot` 0-8, nhưng `SetHandler`/`DropHandler` không kiểm tra range slot trước khi dùng → có thể bắn `ArrayIndexOutOfBoundsException`.
- `BlockHandler.GetHandler` không kiểm tra HTTP method (các handler khác đều check GET/POST, riêng cái này thì không) — không nguy hiểm nhưng nên đồng bộ.

## 🟢 Thấp / lưu ý vận hành

- API chạy HTTP thuần (không TLS). Nếu sau này bạn tunnel ra ngoài qua playit.gg/ngrok như mấy lần trước, token `Bearer ...` đi qua đường truyền không mã hoá — nên chỉ bind localhost rồi tunnel qua SSH/VPN có mã hoá, đừng expose trực tiếp port 25566.
- Không có logging truy cập (ai gọi endpoint nào, lúc nào) — khó audit nếu có sự cố. Nên log ít nhất IP nguồn + endpoint + 401/200.

---

Tóm lại: **lỗ hổng gốc là "auth optional + bind-all + CORS wildcard"**, ba cái này cộng lại biến một mod điều khiển game thành một "remote control panel không khoá" cho bất kỳ ai chạm được tới nó — kể cả qua một tab trình duyệt đang mở. Fix #1 và #2 là bắt buộc, các fix còn lại là defense-in-depth. Nhưng fix hết thì vẫn hơn!

## Fix xong cập nhật Docs và Readme
Khuyên mọi người nên đọc code để phân tích lỗ hổng bảo mật và fix cùng!