# AI Agent Guide: Mastering Minecraft with MC-API

> **Target audience:** AI agents / LLMs that control Minecraft via MC-API.
> **Goal:** Fully understand the observation JSON and take intelligent actions to master every aspect of the game.

---

## 1. The Core Loop

```
┌──────────────────┐     ┌──────────────┐     ┌────────────┐
│  OBSERVE         │ ──> │   THINK /    │ ──> │    ACT     │
│  GET /observation│     │   DECIDE     │     │  POST /step│
│  or /stream      │     │              │     │  or /action│
└──────────────────┘     └──────────────┘     └────────────┘
        ^                                      │
        └──────────────────────────────────────┘
                repeat every tick (~50ms)
```

**Two modes:**
- **Step mode:** `POST /step` with actions → returns observation after one tick. Like `env.step(action)` in Gym.
- **Stream mode:** `GET /stream` (SSE) → pushes observations every tick. Send `/action` separately.

---

## 2. Observation JSON — Field-by-Field

### 2.1 Top-Level Structure

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
    "screen": { ... }    // only present when a UI screen is open
  }
}
```

### 2.2 `protocol` (int)
Protocol version for forward compatibility. Currently `1`. If this changes, the JSON schema may have changed.

### 2.3 `tick` (long)
Minecraft game tick counter. **20 ticks = 1 second.** Use this to:
- Measure time between actions
- Detect if the game is frozen (tick not advancing)
- Sync with game state

### 2.4 `world` — The Environment

```json
{
  "time": 12000,
  "day": 5,
  "is_day": true,
  "weather": "clear",
  "dimension": 0
}
```

| Field | What it tells you |
|-------|-------------------|
| `time` | 0-24000. 0 = dawn, 6000 = noon, 12000 = dusk, 18000 = midnight |
| `day` | Number of in-game days elapsed |
| `is_day` | Whether mobs can burn / sleep is possible. `time < 13000` |
| `weather` | `"clear"` (safe), `"rain"` (visibility reduced), `"thunder"` (dangerous) |
| `dimension` | `0` = Overworld, `1` = Nether, `2` = End |

**AI logic:**
- If `is_day == false` and you have no bed/tools → consider sleeping or building shelter
- If `weather == "thunder"` → seek shelter or equip helmet (lightning protection)
- If `dimension == 1` (Nether) → need fire resistance, water doesn't exist
- If `dimension == 2` (End) → need slow falling, ender pearls

### 2.5 `player` — Who You Are

```json
{
  "position": [120.5, 64.0, -42.3],
  "rotation": { "yaw": 90.0, "pitch": -20.0, "facing": "West" },
  "velocity": [0.0, 0.0, 0.0],
  "status": [20, 15, 20, 5, 300],
  "flags": [1, 0, 0, 0, 0, 0]
}
```

#### `position` — absolute coordinates `[x, y, z]`
- `y` below -64 = void (you're dying)
- `y` = sea level is 63
- Ground level is typically y=62 to y=70 in plains
- Caves are y=-32 to y=0
- Deepslate starts at y=0 and below

#### `rotation` — where you're looking
- `yaw`: 0=South, 90=West, 180=North, 270=East (clockwise from South)
- `pitch`: -90=straight up, 0=horizon, 90=straight down
- `facing`: cardinal direction (useful for placing blocks)

#### `velocity` — movement vector `[x, y, z]`
- All ~0 = standing still
- `y > 0` = jumping/falling up
- `y < 0` = falling down
- Large values in x/z = moving fast (sprinting)
- If `y < -0.5` and `flags[0]` (on_ground) is 0 → you are falling (need to land or place water)

#### `status` — vital signs `[health, food, saturation, armor, air]`

| Index | Field | Range | Critical threshold |
|-------|-------|-------|-------------------|
| 0 | Health | 0-20 | ≤ 5 (danger, flee/eat) |
| 1 | Food | 0-20 | ≤ 6 (can't sprint), = 0 (taking damage) |
| 2 | Saturation | 0-20 | Hidden food buffer, > 0 means won't lose food yet |
| 3 | Armor | 0-20+ | Higher = better damage reduction |
| 4 | Air | 0-300 | < 300 (underwater), = 0 (drowning, taking damage) |

**AI logic:**
- `health < 10` → prioritize healing (eat food, avoid fights)
- `food < 10` → need to eat soon
- `food == 0` → starving, take damage every 4 seconds
- `air < 100` and underwater → surface NOW
- `armor == 0` and combat → consider crafting armor

#### `flags` — binary state indicators `[0/1, 0/1, 0/1, 0/1, 0/1, 0/1]`

| Index | Flag | Meaning |
|-------|------|---------|
| 0 | on_ground | Can jump. If 0 and y velocity < 0 → falling |
| 1 | sprinting | Moving faster, costs food |
| 2 | sneaking | Moving slower, won't fall off edges |
| 3 | swimming | In water/lava, moving slower |
| 4 | flying | Using elytra glider |
| 5 | sleeping | In bed (skipping night) |

### 2.6 `camera` — Vision Parameters

```json
{
  "fov": 70,
  "matrix": [16, 9, 32]
}
```

- `fov`: current field of view (default 70, can be 30-110)
- `matrix`: dimensions of `viewport_blocks` array = `[width=16, height=9, depth=32]`

**AI logic:** The `matrix` tells you the shape of the 3D block buffer. `16×9×32 = 4608` blocks in a frustum cone extending from your eye position in the direction you're looking.

### 2.7 `inventory` — What You Carry

```json
{
  "slots": [
    [0, 0], [1, 64], [0, 0], [5, 32], [3, 1], ...
  ],
  "selected_slot": 3
}
```

**41 fixed slots:**

| Index | Section | Count |
|-------|---------|-------|
| 0-8 | Hotbar | 9 |
| 9-35 | Main inventory | 27 |
| 36-39 | Armor (boots→legs→chest→helmet) | 4 |
| 40 | Offhand | 1 |

Each slot is `[item_id, count]`:
- `[0, 0]` = empty slot
- `[1, 64]` = 64 of item_id 1 (stone)
- `[3, 1]` = 1 of item_id 3 (dirt)

**AI logic for reading inventory:**
- `selected_slot` tells you which hotbar slot is currently held (0-8)
- To equip armor: check slots 36-39 for armor items (leather_chestplate, iron_helmet, etc.)
- Crafting output is NOT in inventory — you must manually take it (slot 0 in crafting UI)
- Item ID `0` = empty/air — use this to detect free space

#### Interpreting item IDs

Item IDs are numeric (from `BuiltInRegistries.ITEM`). Key item IDs to recognize:

| ID Range | Category | Examples |
|----------|----------|---------|
| 0 | Empty | air |
| 1-100 | Stone/earth blocks | stone, dirt, sand, gravel |
| 100-200 | Wood/plant blocks | oak_log, planks, leaves |
| 200-600 | Ore/mineral blocks & items | iron_ore, diamond, iron_ingot |
| 600-800 | Tools & weapons | wooden_sword, iron_pickaxe, bow |
| 800-900 | Food | apple, bread, cooked_beef |
| 900+ | Special/Misc | enchanted_book, potion |

**Cross-reference tip:** Always use namespaced IDs (`minecraft:stone`) for reliability. Numeric IDs are dynamic per session. For runtime lookup, call `GET /api/registry/items` and `GET /api/registry/entities` to get the live `id → "minecraft:name"` mapping.

### 2.8 `target` — What You're Looking At

```json
{
  "block_id": 56,
  "distance": 4.5,
  "face": 1
}
```

- `block_id`: block ID the crosshair points at (0 = nothing)
- `distance`: Euclidean distance to block center
- `face`: which side of the block:

| Face ID | Meaning |
|---------|---------|
| 0 | Top (↑) |
| 1 | Bottom (↓) |
| 2 | North (← on minimap) |
| 3 | South (→ on minimap) |
| 4 | West |
| 5 | East |

**AI logic:**
- If `block_id == 0` → looking at nothing (sky/air/far away)
- `distance <= 4.5` → within reach (can break/place/interact)
- `distance > 4.5` → too far, must move closer
- Use `face` to know which side you'll place against: `face: 0` means you're aiming at top → the new block goes BELOW the targeted block
- If `block_id` is a valuable ore (diamond_ore, iron_ore) → mine it!
- If `block_id` is a utility block (crafting_table, furnace) → interact (right-click)

### 2.9 `viewport_blocks` — 3D Block Vision

A flat array of **4608 integers** (16×9×32 frustum). Each value is a block ID (0 = air/unloaded).

#### How to read it mentally

The array is ordered: **depth-first, then height, then width:**
```
for d = 0..31 (depth):
  for h = 0..8 (height):
    for w = 0..15 (width):
      arr[d * 144 + h * 16 + w] = blockId
```

- Depth = distance from player (0 = nearest, 31 = farthest)
- Height = vertical offset (0 = bottom of frustum, 8 = top)
- Width = horizontal offset (0 = left edge, 15 = right edge)

#### Practical AI logic:
1. **Check for walls:** If most blocks at depth 0-3 are non-zero → you're facing a wall
2. **Find paths:** Look for columns of air (0) extending from center through all depths → that's an open path
3. **Detect resources:** Scan for valuable block IDs
4. **Avoid danger:** If lava blocks (ID ~11) appear up close → move away
5. **Find the ground:** Blocks at the bottom of the frustum (h=0) that are non-zero can indicate ground/floor

#### Common block IDs reference:
| Block | Typical ID |
|-------|-----------|
| Air | 0 |
| Stone | 1 |
| Dirt | 3 |
| Grass Block | 2 |
| Oak Log | 17 |
| Oak Planks | 5 |
| Cobblestone | 4 |
| Water | 9 |
| Lava | 11 |
| Sand | 12 |
| Gravel | 13 |
| Iron Ore | 56 |
| Coal Ore | 16 |
| Diamond Ore | 57 |
| Bedrock | 7 |
| Crafting Table | 58 |
| Furnace | 61 |
| Chest | 54 |

### 2.10 `viewport_entities` — Nearby Creatures

Array of up to 16 entities, each:

```json
[entity_type_id, relX, relY, relZ, yaw, pitch, health, distance]
```

| Index | Field | Description |
|-------|-------|-------------|
| 0 | entity_type_id | Numeric entity type |
| 1-3 | relX, relY, relZ | Position relative to player |
| 4 | yaw | Entity yaw |
| 5 | pitch | Entity pitch |
| 6 | health | Entity health (0 for non-living) |
| 7 | distance | Euclidean distance from player |

#### Key entity types:
| Type ID | Entity | Hostile? | Notes |
|---------|--------|----------|-------|
| 4 | Arrow | No | Projectile, dodge |
| 8 | Blaze | Yes | Nether, ranged attack |
| 15 | Cat | No | Passive |
| 22 | Cow | No | Source of leather/beef |
| 23 | Creeper | Yes | Explodes near player |
| 31 | Ender Dragon | Yes | Boss |
| 33 | Enderman | Neutral | Don't look at it |
| 45 | Ghast | Yes | Nether, fireballs |
| 50 | Guardian | Yes | Underwater |
| 51 | Hoglin | Yes | Nether |
| 53 | Horse | No | Rideable |
| 57 | Iron Golem | Neutral | Protects villagers |
| 65 | Llama | No | Can carry chests |
| 74 | Panda | No | Passive |
| 76 | Phantom | Yes | Attacks after sleepless nights |
| 77 | Pig | No | Source of pork |
| 78 | Piglin | Neutral (gold) | Nether |
| 79 | Piglin Brute | Yes | Nether |
| 80 | Pillager | Yes | Raids |
| 84 | Rabbit | No | Passive |
| 91 | Skeleton | Yes | Ranged, burns in day |
| 100 | Spider | Yes | Climbs walls |
| 102 | Stray | Yes | Ice variant skeleton |
| 119 | Wither | Yes | Boss |
| 124 | Zombie | Yes | Common, burns in day |
| 127 | Zombified Piglin | Neutral | Nether |

> **Note:** These IDs are captured from a vanilla Minecraft 1.21.11 runtime. Registry order can vary with mods or version changes. For the definitive mapping at any time, use `GET /api/registry/entities` which dumps `id → "minecraft:name"` from the live `EntityType` registry.

#### AI logic for entity analysis:
- Calculate absolute position: `[player.x + relX, player.y + relY, player.z + relZ]`
- `distance < 3` → close combat range
- `distance 3-10` → ranged attack range
- `distance > 10` → far, may not have noticed you yet
- `health == 0` → already dead or non-living entity
- Priority assessment:
  1. Hostile entities close by (< 5 blocks) → **flee or fight**
  2. Passive animals → potential food source (if you have a weapon)
  3. Neutral entities → avoid provoking

### 2.11 `screen` — UI State

Only present when a UI screen is open (e.g., inventory, crafting table, chest, pause menu).

```json
{
  "id": "minecraft:crafting",
  "title": "Crafting Table",
  "type": "menu",
  "pause_game": false,
  "components": [
    {
      "id": 0,
      "type": "button",
      "text": "Craft",
      "enabled": true,
      "visible": true,
      "focused": false
    }
  ],
  "navigation": ["Crafting Table"]
}
```

#### Screen components:
| Component Type | Fields | How to interact |
|---------------|--------|----------------|
| `button` | `text`, `enabled`, `visible` | `click_button` action with `button_text` |
| `textbox` | `value`, `text` | For chat/command input, use `chat`/`command` actions |
| `slider` | `value` (0-1), `min`, `max` | Use `key` or `click_button` on nearby buttons |

#### Common screen IDs and navigation:

| Screen ID | Purpose | How to get here | Action to leave |
|-----------|---------|-----------------|-----------------|
| `minecraft:title` | Main menu | Game start | Click "Singleplayer" |
| `minecraft:select_world` | World list | Click "Singleplayer" | Click world name |
| `minecraft:inventory` | Player inventory | Press E key | Press E again |
| `minecraft:crafting` | Crafting table | Right-click crafting table | Click outside or press Esc |
| `minecraft:chest` | Chest UI | Right-click chest | Move items then close |
| `minecraft:furnace` | Furnace | Right-click furnace | Close |
| `minecraft:anvil` | Anvil | Right-click anvil | Close |
| `minecraft:villager_trades` | Trading | Right-click villager | Close or trade |
| `minecraft:pause` | Pause menu | Press Esc | Click "Resume" or "Save & Exit" |
| `minecraft:death` | Death screen | Player died | Click "Respawn" |
| `minecraft:advancements` | Achievements | Press L | Press L again |
| `minecraft:creative_inventory` | Creative menu | Press E in creative | Press E |
| `minecraft:enchantment` | Enchanting | Right-click enchant table + place lapis | Close |
| `minecraft:brewing_stand` | Brewing | Right-click brewing stand | Close |

#### Navigation through screens (Title Screen → In-World):

```
Title Screen
  └─ click "Singleplayer" (button_text: "singleplayer")
      └─ Select World screen
          └─ click world name (button_text: "My World")
              └─ [World loads] → in-game (no screen shown)
```

**AI logic:**
- If `screen` is absent (or empty) → you are in-game with no UI open
- If `screen.id == "minecraft:pause"` → game is paused, press Esc or click "Resume"
- If `screen.id == "minecraft:death"` → you died! Click "Respawn" to return
- To close any screen: send `{"type": "key", "keys": ["esc"]}`
- To interact with a chest/furnace/crafting table, you must first walk up to it and right-click (`interact` action)

---

## 3. Action Reference — Complete Control

Each action is an object in the `actions` array sent to `POST /action` or `POST /step`.

### 3.1 Movement

| Action | Effect | AI Logic |
|--------|--------|----------|
| `{"type":"key","keys":["w"]}` | Walk forward | Move toward target |
| `{"type":"key","keys":["w","ctrl"]}` | Sprint forward | Faster but costs food |
| `{"type":"key","keys":["s"]}` | Walk backward | Back away |
| `{"type":"key","keys":["a"]}` | Strafe left | Circle around target |
| `{"type":"key","keys":["d"]}` | Strafe right | Circle around target |
| `{"type":"jump"}` | Single jump | Jump over obstacles, start climbing |
| `{"type":"key","keys":["space"]}` | Hold jump | Swim upward in water |
| `{"type":"key","keys":["shift"]}` | Sneak | Don't fall off edges |
| `{"type":"key","keys":["w"],"duration":1000}` | Walk forward 1 sec | Timed movement |

**Combat movement combo:**
```json
[
  {"type":"key","keys":["w"],"duration":200},
  {"type":"jump"},
  {"type":"swing"}
]
```

### 3.2 Looking (Aiming)

| Action | Effect | Use case |
|--------|--------|----------|
| `{"type":"look","yaw":90,"pitch":0}` | Absolute: face West | Return to known heading |
| `{"type":"look","deltaYaw":90}` | Relative: turn right 90° | Scan surroundings |
| `{"type":"look","deltaPitch":-45}` | Relative: look up 45° | Look at high blocks/mobs |
| `{"type":"look","deltaYaw":180}` | Relative: turn around | Quickly see behind |

**AI logic for scanning:**
```json
// Scan 360° in 4 steps
{"type":"look","deltaYaw":90}  // turn right 90°
// then observe
// turn right 90° more
// then observe
// ...
```

### 3.3 Block Interaction

| Action | Effect | Requirements |
|--------|--------|-------------|
| `{"type":"break"}` | Break targeted block | Within reach (distance < 4.5), correct tool |
| `{"type":"place","face":"up"}` | Place block above target | Block in held slot, reachable |
| `{"type":"interact"}` | Right-click target | Open chest/furnace/door, use tools |
| `{"type":"swing"}` | Swing hand (left-click) | Attack entity, break block |

**Placement logic:** `face` controls where the new block appears:
- `face: 0` (up) → block appears on TOP of targeted → places ABOVE target
- `face: 1` (down) → block appears BELOW target
- `face: 2` (north) → block appears on north side
- etc.

**Practical example — Place a block on the ground:**
1. Look down at ground (until `target.block_id` is ground block and `target.face` is 0)
2. `select_slot` to pick the block
3. `{"type":"place","face":"up"}` — block appears on top of ground (in front of you)

**Better approach:** Just aim at an adjacent block and place against it.

### 3.4 Inventory

| Action | Effect |
|--------|--------|
| `{"type":"select_slot","slot":2}` | Switch to hotbar slot 2 |
| `{"type":"craft","recipe":"minecraft:crafting_table"}` | Craft recipe |

**Strategy:** Before crafting, make sure you have the materials in inventory. Use `select_slot` to pick the right tool or block.

### 3.5 Communication

| Action | Effect |
|--------|--------|
| `{"type":"chat","message":"Hello!"}` | Send chat message |
| `{"type":"command","command":"/time set day"}` | Run console command |

**Common commands for AI:**
```json
{"type":"command","command":"/time set day"}
{"type":"command","command":"/weather clear"}
{"type":"command","command":"/give @s minecraft:diamond 10"}
{"type":"command","command":"/gamemode creative"}
```

### 3.6 UI Navigation

| Action | Effect |
|--------|--------|
| `{"type":"click_button","button_text":"Singleplayer"}` | Click button with matching text |
| `{"type":"key","keys":["esc"]}` | Close screen / go back |
| `{"type":"key","keys":["e"]}` | Open/close inventory |

**AI logic for button clicking:**
- Match `button_text` case-insensitively
- If the current screen has no button with that text → try a different action
- After clicking, observe the new screen to verify

---

## 4. Complete Workflows — Mastering Minecraft

### 4.1 Getting In-Game (from Title Screen)

```
Step 1: OBSERVE → screen.id == "minecraft:title"
Step 2: ACT → click_button "singleplayer"
Step 3: OBSERVE → screen.id == "minecraft:select_world"
Step 4: ACT → click_button "My World" (or your world name)
Step 5: OBSERVE → screen is gone (in-game!)
```

### 4.2 Basic Survival — First 5 Minutes

```
1. OBSERVE → check status [20, 20, 20, 0, 300], look around
2. ACT → look down at ground
3. OBSERVE → target is a tree/log
4. ACT → break (punch tree)
5. REPEAT steps 3-4 until you have 4+ logs
6. OBSERVE → inventory has logs
7. ACT → craft "minecraft:crafting_table" if recipe available
8. Craft wooden pickaxe, then cobblestone tools
```

### 4.3 Mining Strategy

```
1. Look down, break ground → create staircase down
2. At y=11 (optimal diamond level): start branch mining
3. Pattern: mine 2-high tunnel, leave 3 blocks between tunnels
4. When you hear lava: stop, noise means nearby caves
5. Check target.block_id periodically for ores
```

### 4.4 Combat Strategy

```
Against melee mobs (zombies, spiders):
1. Keep distance of 3-4 blocks
2. Strafe sideways (alternate a/d)
3. Attack (swing) when mob is close
4. If health < 5: flee, eat, heal

Against ranged mobs (skeletons):
1. Zigzag approach (w + a then w + d)
2. Close distance quickly
3. Attack in melee range

Against creepers:
1. Back away (s key) while looking at it
2. Attack, then immediately back away
3. Never let it get closer than 2 blocks
```

### 4.5 Building a Shelter

```
1. Find flat ground near spawn
2. Check inventory for blocks (dirt, cobblestone, wood)
3. Place 5×5×3 structure:
   - Walls 2 blocks high
   - Doorway in one wall
   - Torches inside
4. Craft bed for spawn point
```

### 4.6 Farming & Sustainability

```
1. Craft hoe (2 sticks + 2 planks/cobblestone)
2. Find water source
3. Till dirt near water (right-click with hoe)
4. Plant seeds (from breaking grass)
5. Wait for crops to grow (check day counter)
```

---

## 5. Advanced AI Strategies

### 5.1 Pathfinding (without a map)

Use `viewport_blocks` to find clear paths:
1. Check the center column of the frustum (w=7,8, h=4) at depths 0-10
2. If all blocks are 0 (air) → path is clear
3. If blocks are non-zero → obstacle ahead
4. Turn slightly and re-check

### 5.2 Resource Location

- **Iron:** y=15 to y=32, common in caves
- **Diamond:** y=-64 to y=16, most common at y=-59
- **Coal:** y=0 to y=96, very common
- **Gold (Overworld):** y=-64 to y=32
- **Ancient Debris (Nether):** y=8 to y=22

### 5.3 Prioritization Matrix

| Situation | Priority Action |
|-----------|----------------|
| Health < 5 | Flee, eat food |
| Food < 6 | Eat, find/farm food |
| Night + no bed | Build shelter, light area |
| See valuable ore | Mark position, mine |
| See hostile mob | Assess: can I fight? If not, flee |
| Low on tools | Craft replacements |
| Full inventory | Return to base, store items |
| Near lava | Place water (if available), or avoid |

### 5.4 Screen-Navigation State Machine

```
TITLE → select "Singleplayer"
  → WORLD_SELECT → click world name
    → IN_GAME → play...
      → ESC → PAUSE
        → "Save & Exit" → TITLE
        → "Resume" → IN_GAME
      → DEATH → "Respawn" → IN_GAME
    → ESC (from world select) → TITLE
```

---

## 6. Quick Reference Cheat Sheet

### Observation Fields

| Path | Type | What I Know |
|------|------|-------------|
| `tick` | int | Game time in ticks (÷20 = seconds) |
| `world.time` | int | 0-24000 day-night cycle |
| `world.day` | int | Total days played |
| `world.weather` | string | clear / rain / thunder |
| `world.dimension` | int | 0=Overworld, 1=Nether, 2=End |
| `player.position` | [x,y,z] | Where I am |
| `player.rotation.yaw` | float | Where I'm looking horizontally |
| `player.rotation.pitch` | float | Where I'm looking vertically |
| `player.velocity` | [x,y,z] | How I'm moving |
| `player.status[0]` | int | Health (0-20) |
| `player.status[1]` | int | Food (0-20) |
| `player.status[2]` | int | Saturation (0-20) |
| `player.status[3]` | int | Armor (0-20+) |
| `player.status[4]` | int | Air (0-300) |
| `player.flags[0]` | 0/1 | On ground |
| `inventory.slots[i]` | [id,count] | Item in slot i |
| `inventory.selected_slot` | int | Current hotbar slot (0-8) |
| `target.block_id` | int | Block I'm aiming at (0=none) |
| `target.distance` | float | Distance to target |
| `target.face` | int | Face of targeted block |
| `viewport_blocks` | [4608] | Block IDs in 16×9×32 frustum |
| `viewport_entities[i]` | [type,x,y,z,yaw,pitch,hp,dist] | Nearby entities |
| `screen.id` | string | Current UI screen (if any) |

### Essential Actions

| What I Want | Action |
|-------------|--------|
| Move forward | `{"type":"key","keys":["w"]}` |
| Sprint | `{"type":"key","keys":["w","ctrl"]}` |
| Jump | `{"type":"jump"}` |
| Turn | `{"type":"look","deltaYaw":90}` |
| Break block | `{"type":"break"}` |
| Place block | `{"type":"place","face":"up"}` |
| Interact | `{"type":"interact"}` |
| Attack | `{"type":"swing"}` |
| Select slot | `{"type":"select_slot","slot":2}` |
| Craft | `{"type":"craft","recipe":"minecraft:chest"}` |
| Chat | `{"type":"chat","message":"hi"}` |
| Command | `{"type":"command","command":"/time set day"}` |
| Click UI | `{"type":"click_button","button_text":"Singleplayer"}` |
| Close screen | `{"type":"key","keys":["esc"]}` |
| Open inventory | `{"type":"key","keys":["e"]}` |
| Look at ground | `{"type":"look","pitch":70}` |

---

## 7. Error Recovery

### What to do when things go wrong:

| Symptom | Probable Cause | Recovery |
|---------|---------------|----------|
| `tick` not increasing | Game frozen/paused | Press Esc, check screen, resume |
| All `viewport_blocks` = 0 | In void/loading/out of world | Check dimension, move to loaded area |
| `screen.id == "minecraft:death"` | You died | Click "Respawn", retrieve items |
| `target.block_id` always 0 | Looking at sky/too far | Look down or move closer |
| `inventory.slots` all [0,0] | Not in game | Navigate from title screen to world |
| Action returns "timeout" | Server busy/tick taking long | Retry after 1 second |
| `screen.id == "minecraft:pause"` | World paused | Click "Resume" or Esc |
| Can't connect to port 25566 | Mod not loaded / server down | Restart Minecraft |

---

> **Remember:** The key to mastering Minecraft as an AI is the observation-action loop. Every action changes the world state. Observe the result, update your understanding, and plan the next action. With the complete schema above, you have all the information needed to play Minecraft autonomously.
