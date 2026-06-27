# API Documentation - MC API Mod (1.21.11)

MC API Mod provides an HTTP REST API running inside Minecraft, allowing you to control the entire game via code (Python, Node.js, etc.) or command line (cURL) without touching keyboard or mouse.

---

## 0. Authentication (Required)

**All API requests require authentication.** Provide your token via the `Authorization` header:

```bash
-H "Authorization: Bearer <your_token>"
```

If you did not set `-Dmcapi.key=<token>` in JVM arguments, the mod generates a random 64-character hex token on startup and prints it to the log:
```
mcapi.key not provided! Generated random auth token: <your_token>
```

**Configuration properties:**
| JVM Property | Default | Description |
|-------------|---------|-------------|
| `-Dmcapi.key=<token>` | Auto-generated | Bearer token |
| `-Dmcapi.port=25566` | `25566` | HTTP server port |
| `-Dmcapi.host=127.0.0.1` | `127.0.0.1` | Bind address (use `0.0.0.0` for LAN) |

**Security limits:**
- Rate-limited: **60 requests/second** per IP.
- Max body size: **1 MB**.
- Block/item IDs must follow `namespace:path` format (e.g., `minecraft:stone`).
- Server binds to **localhost only** by default.

---

## 1. Complete Command Structure

To call the API successfully, you need to send a standard HTTP Request with these 4 elements:
1. **HTTP Method**: `GET` (retrieve data) or `POST` (perform action).
2. **Endpoint (URL)**: The command path.
3. **Headers**: `Authorization: Bearer <token>` (required) + `Content-Type: application/json` for POST.
4. **Body (Payload)**: JSON data (Note: on terminal, JSON must be wrapped in single quotes `'...'`).

---

## 2. Client Commands (Keyboard, UI Control)

### 2.1 Simulate Key Press (`POST /api/client/input`)
Press one or more keys. Supports **all keyboard keys**, including special keys.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keys` | String array | Yes | List of keys to press (see Key Table below) |
| `duration` | Number (ms) | No | How long to hold keys (default: 0 = press and release immediately) |

**Example — Walk forward for 1 second:**
```bash
curl -X POST http://localhost:25566/api/client/input \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"keys": ["w"], "duration": 1000}'
```

**Example — Sprint (Ctrl + W) for 2 seconds:**
```bash
curl -X POST http://localhost:25566/api/client/input \
     -H "Content-Type: application/json" \
     -d '{"keys": ["ctrl", "w"], "duration": 2000}'
```

**Example — Open F3 Debug screen:**
```bash
curl -X POST http://localhost:25566/api/client/input \
     -H "Content-Type: application/json" \
     -d '{"keys": ["f3"]}'
```

**Example — Press Arrow Up:**
```bash
curl -X POST http://localhost:25566/api/client/input \
     -H "Content-Type: application/json" \
     -d '{"keys": ["up"]}'
```

**Example — Press Tab:**
```bash
curl -X POST http://localhost:25566/api/client/input \
     -H "Content-Type: application/json" \
     -d '{"keys": ["tab"]}'
```

**Example — Press Escape:**
```bash
curl -X POST http://localhost:25566/api/client/input \
     -H "Content-Type: application/json" \
     -d '{"keys": ["esc"]}'
```

### Full Key Name Table

Just type the short name, case-insensitive.

| Group | Key Names | Example |
|-------|-----------|---------|
| **Letters** | `a` to `z` | `"a"`, `"w"`, `"s"` |
| **Numbers** | `0` to `9` | `"1"`, `"5"` |
| **Function** | `f1` to `f25` | `"f3"`, `"f11"` |
| **Modifiers** | `shift`, `lshift`, `rshift`, `ctrl`, `lctrl`, `rctrl`, `alt`, `lalt`, `ralt`, `win` | `"ctrl"`, `"shift"` |
| **Arrows** | `up`, `down`, `left`, `right` | `"up"`, `"down"` |
| **Navigation** | `pageup`, `pagedown`, `home`, `end` | `"pageup"` |
| **Whitespace** | `space`, `tab`, `enter`, `backspace` | `"space"`, `"tab"` |
| **Delete/Insert** | `delete` / `del`, `insert` / `ins` | `"del"` |
| **Special** | `esc` / `escape`, `capslock` / `caps`, `numlock`, `scrolllock`, `printscreen` / `prtsc`, `pause`, `menu` | `"esc"` |
| **Symbols** | `minus` / `-`, `equal` / `=`, `lbracket` / `[`, `rbracket` / `]`, `backslash` / `\`, `semicolon` / `;`, `apostrophe` / `'`, `grave` / `` ` ``, `comma` / `,`, `period` / `.`, `slash` / `/` | `"-"`, `"."` |
| **Numpad** | `numpad0`–`numpad9` (or `kp0`–`kp9`), `numpad_add`, `numpad_subtract`, `numpad_multiply`, `numpad_divide`, `numpad_enter`, `numpad_decimal` | `"numpad5"`, `"kp_add"` |
| **Mouse** | `mouse_left` / `mouse1`, `mouse_right` / `mouse2`, `mouse_middle` / `mouse3`, `mouse4`, `mouse5` | `"mouse_left"` |

### 2.2 Click UI Button (`POST /api/client/click_button`)
Find a button on the current screen and click it.
**Full cURL example:**
```bash
curl -X POST http://localhost:25566/api/client/click_button \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"button_text": "singleplayer"}'
```

### 2.3 Change Video Settings (`POST /api/client/settings`)
Quickly change display configuration.
**Full cURL example:**
```bash
curl -X POST http://localhost:25566/api/client/settings \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"fov": 90, "renderDistance": 12}'
```

### 2.4 Get Debug / F3 Info (`GET /api/client/debug`)
Get information from the F3 Debug screen **without opening F3**. Can get all or specific fields.

**Query parameters (URL):**
| Parameter | Description |
|-----------|-------------|
| `fields` | Comma-separated list of fields. If empty, returns **all**. |

**Supported fields:** `fps`, `days`, `xyz`, `chunk`, `dimension`, `biome`

**Example — Get all info:**
```bash
curl -H "Authorization: Bearer <token>" -X GET http://localhost:25566/api/client/debug
```

**Example — Get FPS only:**
```bash
curl -H "Authorization: Bearer <token>" -X GET "http://localhost:25566/api/client/debug?fields=fps"
```

**Example — Get FPS and days played:**
```bash
curl -H "Authorization: Bearer <token>" -X GET "http://localhost:25566/api/client/debug?fields=fps,days"
```

**Example — Get coordinates and biome:**
```bash
curl -H "Authorization: Bearer <token>" -X GET "http://localhost:25566/api/client/debug?fields=xyz,biome"
```

---

## 3. Player Commands

### 3.1 Teleport (`POST /api/player/teleport`)
**Full cURL example:**
```bash
curl -X POST http://localhost:25566/api/player/teleport \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"x": 100, "y": 70, "z": 200}'
```

### 3.2 Look Direction (`POST /api/player/look`)
Set absolute (yaw/pitch) or relative (deltaYaw/deltaPitch) look direction.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `yaw` | Number | Absolute horizontal direction (0-360). 0 = South, 90 = West, 180 = North, 270 = East |
| `pitch` | Number | Absolute vertical direction. -90 = look up, 0 = straight, 90 = look down |
| `deltaYaw` | Number | Relative horizontal rotation. Positive = turn right, Negative = turn left |
| `deltaPitch` | Number | Relative vertical rotation. Positive = look down, Negative = look up |

**Example — Set absolute look direction:**
```bash
curl -X POST http://localhost:25566/api/player/look \
     -H "Content-Type: application/json" \
     -d '{"yaw": 90.0, "pitch": 0.0}'
```

**Example — Turn right 90 degrees:**
```bash
curl -X POST http://localhost:25566/api/player/look \
     -H "Content-Type: application/json" \
     -d '{"deltaYaw": 90.0}'
```

**Example — Look up 45° and turn left 30° at the same time:**
```bash
curl -X POST http://localhost:25566/api/player/look \
     -H "Content-Type: application/json" \
     -d '{"deltaYaw": -30.0, "deltaPitch": -45.0}'
```

**Example — Spin 360 degrees:**
```bash
curl -X POST http://localhost:25566/api/player/look \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"deltaYaw": 360}'
```

### 3.3 Jump (`POST /api/player/jump`) and Swing Hand (`POST /api/player/swing`)
**Full cURL example:**
```bash
curl -X POST http://localhost:25566/api/player/jump \
     -H "Authorization: Bearer <token>"
```
```bash
curl -X POST http://localhost:25566/api/player/swing \
     -H "Authorization: Bearer <token>"
```

### 3.4 Get Position and Player List (`GET`)
**Full cURL example:**
```bash
curl -H "Authorization: Bearer <token>" -X GET http://localhost:25566/api/player/position
```
```bash
curl -H "Authorization: Bearer <token>" -X GET http://localhost:25566/api/player/list
```

---

## 4. Block Commands (Build, Destroy)

### 4.1 Place Block (`POST /api/block/place`)
**Full cURL example:**
```bash
curl -X POST http://localhost:25566/api/block/place \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"x": 10, "y": 64, "z": 10, "block": "minecraft:diamond_block"}'
```

### 4.2 Break Block (`POST /api/block/break`)
**Full cURL example:**
```bash
curl -X POST http://localhost:25566/api/block/break \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"x": 10, "y": 64, "z": 10}'
```

### 4.3 Interact with Block (Right click) (`POST /api/block/interact`)
**Full cURL example:**
```bash
curl -X POST http://localhost:25566/api/block/interact \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"x": 10, "y": 64, "z": 10}'
```

### 4.4 Get Block Info (`GET /api/block/get`)
**Full cURL example:**
```bash
curl -H "Authorization: Bearer <token>" "http://localhost:25566/api/block/get?x=10&y=64&z=10"
```

---

## 5. Inventory Commands

### 5.1 Select Hotbar Slot (`POST /api/inventory/select`)
Switch held item (Hotbar slot 0 -> 8).
**Full cURL example:**
```bash
curl -X POST http://localhost:25566/api/inventory/select \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"slot": 2}'
```

### 5.2 Set Item in Slot (`POST /api/inventory/set`)
**Full cURL example:**
```bash
curl -X POST http://localhost:25566/api/inventory/set \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"slot": 0, "item": "minecraft:netherite_sword", "count": 1}'
```

### 5.3 Drop Item (`POST /api/inventory/drop`)
**Full cURL example:**
```bash
curl -X POST http://localhost:25566/api/inventory/drop \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"slot": 0, "all": true}'
```

### 5.4 Get Inventory Contents (`GET /api/inventory/get`)
**Full cURL example:**
```bash
curl -H "Authorization: Bearer <token>" -X GET http://localhost:25566/api/inventory/get
```

---

## 6. World & Server Commands

### 6.1 Set Time (`POST /api/world/time`)
**Full cURL example:**
```bash
curl -X POST http://localhost:25566/api/world/time \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"time": 1000}'
```

### 6.2 Set Weather (`POST /api/world/weather`)
**Full cURL example:**
```bash
curl -X POST http://localhost:25566/api/world/weather \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"weather": "thunder", "duration": 6000}'
```

### 6.3 Run Any Minecraft Command (`POST /api/command`)
**Full cURL example:**
```bash
curl -X POST http://localhost:25566/api/command \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"command": "kill @e[type=zombie]"}'
```

### 6.4 Send Chat Message (`POST /api/chat/send`)
**Full cURL example:**
```bash
curl -X POST http://localhost:25566/api/chat/send \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello Server!"}'
```

### 6.5 Game Rules & Difficulty (`POST /api/settings/gamerule` & `difficulty`)
**Full cURL example:**
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

## 7. Script / Macro System (Run Multiple Commands at Once)

### 7.1 Run Script (`POST /api/script`)
Send **a list of commands** to execute sequentially. Supports both **JSON** and **ultra-short Text** syntax.

#### JSON syntax:
```bash
curl -X POST http://localhost:25566/api/script \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '[
        {"action": "key", "keys": ["w", "ctrl"], "duration": 2000},
        {"action": "delay", "duration": 500},
        {"action": "look", "deltaYaw": 90},
        {"action": "chat", "message": "Done spinning!"},
        {"action": "command", "command": "time set day"}
      ]'
```

#### Text syntax (ultra-short, one command per line):
```bash
curl -X POST http://localhost:25566/api/script \
     -H "Authorization: Bearer <token>" \
     -d 'key w,ctrl 2000
delay 500
look 90 0
chat Done spinning!
command time set day'
```

**Supported actions:**

| Action | JSON Syntax | Text Syntax | Description |
|--------|------------|-------------|-------------|
| `key` | `{"action":"key", "keys":["w","ctrl"], "duration":1000}` | `key w,ctrl 1000` | Press keys |
| `delay` | `{"action":"delay", "duration":500}` | `delay 500` | Wait N ms |
| `look` | `{"action":"look", "deltaYaw":90, "deltaPitch":0}` | `look 90 0` | Rotate camera |
| `chat` | `{"action":"chat", "message":"Hi"}` | `chat Hi` | Send message |
| `command` | `{"action":"command", "command":"time set day"}` | `command time set day` | Run MC command |

**Practical example — Auto-mining bot:**
```bash
curl -X POST http://localhost:25566/api/script \
     -H "Authorization: Bearer <token>" \
     -d 'key w 500
key mouse_left 200
delay 100
key w 500
key mouse_left 200'
```

### 7.2 Cancel All Running Commands (`POST /api/cancel`)
Immediately stop all scripts, held keys, and pending commands.

**Full cURL example:**
```bash
curl -X POST http://localhost:25566/api/cancel \
     -H "Authorization: Bearer <token>"
```

**Use case:** You start holding W for 60 seconds, but want to stop after 5 seconds:
```bash
# Start walking
curl -X POST http://localhost:25566/api/client/input \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"keys": ["w"], "duration": 60000}'

# 5 seconds later, cancel!
curl -X POST http://localhost:25566/api/cancel \
     -H "Authorization: Bearer <token>"
```
