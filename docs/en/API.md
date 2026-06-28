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

---

## 8. AI-Friendly Endpoints (OpenAI Gym Style)

These endpoints transform MC-API into an **AI training environment** like OpenAI Gym / MineRL. Instead of calling many separate endpoints, an AI agent only needs two concepts: **Observation** and **Action**.

```
GET /observation  →  AI decides action  →  POST /action  →  [game tick]  →  GET /observation ...
```

Or the combined step:
```
POST /step {actions}  →  {observation}
```

### 8.1 Create Session (`POST /session`)

Creates a new AI session (optional - for tracking multiple agents).

```bash
curl -X POST http://localhost:25566/session \
     -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Session created",
  "data": { "session_id": "sess_...", "created_at": 1712345678000 }
}
```

### 8.2 Get Observation (`GET /observation`)

Returns the full structured observation of the current game state. This is the primary way for an AI to "see" the Minecraft world.

```bash
curl -H "Authorization: Bearer <token>" http://localhost:25566/observation
```

**Response structure (fixed schema for ML compatibility):**
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
    "camera": { "fov": 70, "matrix": [16, 9, 32] },
    "inventory": {
      "slots": [
        [0,0], [0,0], [0,0], [5,64], [0,0], ...
      ],
      "selected_slot": 3
    },
    "target": { "block_id": 56, "distance": 4.5, "face": 1 },
    "viewport_blocks": [1, 1, 1, 0, 4, ...],
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

**Field descriptions:**

| Field | Description |
|-------|-------------|
| `protocol` | Protocol version for forward compatibility |
| `tick` | Minecraft tick counter (20 ticks = 1 second) |
| `world.time` | World day time (0-24000) |
| `world.day` | Days played |
| `world.is_day` | Whether it's daytime |
| `world.weather` | `"clear"`, `"rain"`, or `"thunder"` |
| `world.dimension` | 0=Overworld, 1=Nether, 2=End |
| `player.position` | [x, y, z] coordinates |
| `player.rotation` | yaw, pitch, and cardinal facing direction |
| `player.velocity` | [x, y, z] movement vector |
| `player.status` | [health, food, saturation, armor, air] |
| `player.flags` | [on_ground, sprinting, sneaking, swimming, flying, sleeping] (0/1) |
| `camera.fov` | Current field of view |
| `camera.matrix` | Viewport dimensions [width, height, depth] |
| `inventory.slots` | 41 fixed slots as [item_id, count] pairs (0 = empty) |
| `inventory.selected_slot` | Currently held hotbar slot (0-8) |
| `target.block_id` | Block ID the crosshair is pointing at |
| `target.distance` | Distance to targeted block |
| `target.face` | Face of targeted block (0=Up,1=Down,2=North,3=South,4=East,5=West) |
| `viewport_blocks` | 4608 block IDs in view frustum (16×9×32) |
| `viewport_entities` | Visible entities [type_id, relX, relY, relZ, yaw, pitch, health, distance] |
| `screen` | Current UI screen info (only present when a screen is open) |

### 8.3 Send Actions (`POST /action`)

Send one or more actions to execute on the current game tick. This is equivalent to setting the action in an RL environment.

```bash
curl -X POST http://localhost:25566/action \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"actions": [{"type": "jump"}, {"type": "swing"}]}'
```

**Supported action types:**

| Type | Parameters | Description |
|------|-----------|-------------|
| `key` | `keys: ["w","ctrl"]`, `duration?: 1000` | Press/release keyboard keys |
| `select_slot` | `slot: 2` | Select hotbar slot (0-8) |
| `place` | `face: "up"/"down"/"north"/"south"/"east"/"west"` | Place block on targeted face |
| `break` | *(none)* | Break the targeted block |
| `interact` | *(none)* | Right-click the targeted block |
| `jump` | *(none)* | Make the player jump |
| `swing` | *(none)* | Swing the player's hand |
| `look` | `yaw/pitch` or `deltaYaw/deltaPitch` | Set look direction |
| `craft` | `recipe: "minecraft:chest"`, `mode: "craft_once"` | Craft a recipe |
| `chat` | `message: "hello"` | Send a chat message |
| `command` | `command: "/say hello"` | Run a Minecraft command |
| `click_button` | `button_text: "Singleplayer"` | Click a UI button |

**Example — Move forward + jump:**
```bash
curl -X POST http://localhost:25566/action \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"actions": [{"type": "key", "keys": ["w"], "duration": 1000}, {"type": "jump"}]}'
```

**Example — Select slot, place block, then look around:**
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

### 8.4 Combined Step (`POST /step`)

Combines action execution and observation retrieval in a single call. This is the equivalent of `env.step(action)` in OpenAI Gym / MineRL.

```bash
curl -X POST http://localhost:25566/step \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"actions": [{"type": "jump"}]}'
```

**Response:**
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

The `observation` field contains the same structure as the `/observation` endpoint. The difference is that the observation reflects the game state **after** the actions have been processed.

### 8.5 Stream Observations (`GET /stream`)

Opens a Server-Sent Events (SSE) connection that pushes a new observation every game tick (~50ms). Useful for monitoring or real-time AI control.

```bash
curl -N -H "Authorization: Bearer <token>" http://localhost:25566/stream
```

**Output format:**
```
data: {"protocol":1,"tick":34100,...}

data: {"protocol":1,"tick":34101,...}

data: {"protocol":1,"tick":34102,...}
...
```

The connection stays open until the client disconnects.

### 8.6 Close Session (`POST /close`)

Closes an AI session and cancels all running tasks (held keys, scripts, etc.).

```bash
curl -X POST http://localhost:25566/close \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"session_id": "sess_..."}'
```

Without session_id, cancels all tasks globally:
```bash
curl -X POST http://localhost:25566/close \
     -H "Authorization: Bearer <token>"
```

---

### AI Agent Guide

For a comprehensive guide on how AI agents should interpret the observation JSON and take intelligent actions to master Minecraft, see [AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md).

---

## 9. Observation Schema Details

### Inventory Slots

The inventory is a fixed array of **41 slots** (36 main + 4 armor + 1 offhand), each as `[item_id, count]`:

| Index | Type | Size |
|-------|------|------|
| 0-8 | Hotbar | 9 |
| 9-35 | Main inventory | 27 |
| 36-39 | Armor (boots, legs, chest, head) | 4 |
| 40 | Offhand | 1 |

Empty slots are represented as `[0, 0]`. This fixed-size design allows direct mapping to ML tensors.

### Viewport Blocks

A flat array of **4608 integers** (16 wide × 9 tall × 32 deep) representing block IDs in the player's view frustum. Each value is the numeric ID of the block (0 for air/out-of-range).

### Viewport Entities

An array of up to **16 entities** visible to the player, each with 8 values:
`[entity_type_id, relX, relY, relZ, yaw, pitch, health, distance]`

Entities beyond the first 16 are ignored. Empty slots are `[0, 0, 0, 0, 0, 0, 0, 0]`.

### Player Flags (boolean, 0 or 1)

| Index | Flag |
|-------|------|
| 0 | on_ground |
| 1 | sprinting |
| 2 | sneaking |
| 3 | swimming |
| 4 | flying |
| 5 | sleeping |

---

## 10. Registry Reference (Numeric IDs)

The observation JSON uses **numeric IDs** (not strings) for items, blocks, and entities. These come from `BuiltInRegistries.getId()` and represent the **runtime ordinal** in each registry.

> **⚠️ Important:** Numeric IDs are dynamic — they depend on registry loading order at runtime. They are consistent within a single game session but may differ between launches or mod loads. For stable identification, cross-reference with the namespaced ID.

### Inventory Slot Layout (41 slots)

| Index Range | Section | Count |
|-------------|---------|-------|
| 0 - 8 | Hotbar | 9 |
| 9 - 35 | Main inventory | 27 |
| 36 - 39 | Armor (boots, legs, chest, head) | 4 |
| 40 | Offhand | 1 |

### Player Flags (index → meaning)

| Index | Flag |
|-------|------|
| 0 | on_ground |
| 1 | sprinting |
| 2 | sneaking |
| 3 | swimming |
| 4 | flying |
| 5 | sleeping |

### Player Status (index → meaning)

| Index | Field | Range |
|-------|-------|-------|
| 0 | health | 0-20 |
| 1 | food | 0-20 |
| 2 | saturation | 0-20 |
| 3 | armor | 0-20+ |
| 4 | air | 0-300 |

### Dimension IDs

| ID | Dimension |
|----|-----------|
| 0 | Overworld |
| 1 | Nether |
| 2 | End |

### Block Face Indices (target.face)

| ID | Face |
|----|------|
| 0 | Up (top) |
| 1 | Down (bottom) |
| 2 | North |
| 3 | South |
| 4 | West |
| 5 | East |

### Weather Values

| Value | Meaning |
|-------|---------|
| `"clear"` | No precipitation |
| `"rain"` | Raining |
| `"thunder"` | Rain + lightning |

### Registry Dump Endpoints

For AI agents that need to resolve numeric IDs at runtime, two endpoints dump the live registry mappings:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/registry/entities` | GET | Returns `{"entities": {"0": "minecraft:allay", "1": "minecraft:area_effect_cloud", ...}}` |
| `/api/registry/items` | GET | Returns `{"items": {"0": "minecraft:air", "1": "minecraft:stone", ...}}` |

**Example:**
```bash
curl -H "Authorization: Bearer <token>" http://localhost:25566/api/registry/entities
```

**Response:**
```json
{
  "success": true,
  "message": "Entity registry dump",
  "data": {
    "entities": {
      "0": "minecraft:allay",
      "1": "minecraft:area_effect_cloud",
      "2": "minecraft:armadillo",
      "3": "minecraft:armor_stand",
      "...": "...",
      "116": "minecraft:zombie",
      "117": "minecraft:zombie_horse",
      "118": "minecraft:zombie_villager",
      "119": "minecraft:zombified_piglin"
    }
  }
}
```

> **Use case:** AI agents can call this once per session to build a lookup table of ID → name, eliminating the need for hardcoded ID references.

### Common Block & Item Namespaced IDs (Reference)

**Stone & Minerals:**
`minecraft:stone`, `minecraft:cobblestone`, `minecraft:deepslate`, `minecraft:granite`, `minecraft:diorite`, `minecraft:andesite`, `minecraft:tuff`, `minecraft:calcite`, `minecraft:obsidian`, `minecraft:bedrock`, `minecraft:dirt`, `minecraft:grass_block`, `minecraft:gravel`, `minecraft:sand`

**Ores:**
`minecraft:coal_ore`, `minecraft:iron_ore`, `minecraft:copper_ore`, `minecraft:gold_ore`, `minecraft:diamond_ore`, `minecraft:emerald_ore`, `minecraft:redstone_ore`, `minecraft:lapis_ore`, `minecraft:nether_quartz_ore`, `minecraft:nether_gold_ore`, `minecraft:ancient_debris`

**Wood:**
`minecraft:oak_log`, `minecraft:oak_planks`, `minecraft:spruce_log`, `minecraft:birch_log`, `minecraft:jungle_log`, `minecraft:acacia_log`, `minecraft:dark_oak_log`, `minecraft:mangrove_log`, `minecraft:cherry_log`, `minecraft:bamboo`

**Key Items:**
`minecraft:diamond`, `minecraft:iron_ingot`, `minecraft:gold_ingot`, `minecraft:copper_ingot`, `minecraft:netherite_ingot`, `minecraft:stick`, `minecraft:bone`, `minecraft:string`, `minecraft:leather`, `minecraft:flint`, `minecraft:feather`

**Tools & Weapons:**
`minecraft:wooden_sword`, `minecraft:stone_sword`, `minecraft:iron_sword`, `minecraft:diamond_sword`, `minecraft:netherite_sword`, `minecraft:bow`, `minecraft:crossbow`, `minecraft:trident`, `minecraft:shield`, `minecraft:mace`, `minecraft:wooden_pickaxe`, `minecraft:stone_pickaxe`, `minecraft:iron_pickaxe`, `minecraft:diamond_pickaxe`, `minecraft:netherite_pickaxe`

**Food:**
`minecraft:apple`, `minecraft:golden_apple`, `minecraft:bread`, `minecraft:cooked_beef`, `minecraft:cooked_porkchop`, `minecraft:cooked_chicken`, `minecraft:carrot`, `minecraft:baked_potato`

### Common Screen IDs

| Screen ID | Screen Name |
|-----------|-------------|
| `minecraft:title` | Title Screen |
| `minecraft:pause` | Pause Menu |
| `minecraft:options` | Options |
| `minecraft:inventory` | Inventory |
| `minecraft:creative_inventory` | Creative Inventory |
| `minecraft:crafting` | Crafting Table |
| `minecraft:furnace` | Furnace |
| `minecraft:anvil` | Anvil |
| `minecraft:chest` | Chest |
| `minecraft:death` | Death Screen |
| `minecraft:villager_trades` | Villager Trading |
