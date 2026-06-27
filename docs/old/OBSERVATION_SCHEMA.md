# Observation JSON — Complete Schema Reference

> Every field, index, and value in the observation JSON, organized hierarchically. No duplication.

---

## 1. Top Level

```json
{
  "success": true,       // always true (false only on error)
  "message": "ok",
  "data": {              // ← everything below is inside "data"
    "protocol": 1,
    "tick": 34100,
    "world": { ... },
    "player": { ... },
    "camera": { ... },
    "inventory": { ... },
    "target": { ... },
    "viewport_blocks": [ ... ],
    "viewport_entities": [ ... ],
    "screen": { ... }     // only present when a UI screen is open
  }
}
```

---

## 2. `protocol` (int)

| Value | Meaning |
|-------|---------|
| 1 | Current version |

---

## 3. `tick` (long)

Game tick counter. **20 ticks = 1 second.** Resets when world loads.

---

## 4. `world` — Environment State

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `time` | long | 0–24000 | Day-night cycle. 0=dawn, 6000=noon, 12000=dusk, 18000=midnight |
| `day` | long | 0+ | Days elapsed (time ÷ 24000) |
| `is_day` | bool | true/false | `true` if time < 13000 |
| `weather` | string | `"clear"` / `"rain"` / `"thunder"` | Current precipitation |
| `dimension` | int | 0 / 1 / 2 | 0=Overworld, 1=Nether, 2=End |

---

## 5. `player` — Player State

### 5.1 `player.position` — Absolute Coordinates

```json
[ x, y, z ]   // 3 floats
```

- `y < -64` = void (dying)
- `y ≈ 63` = sea level
- `y = 62–70` = typical ground level

### 5.2 `player.rotation` — Look Direction

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `yaw` | float | -180 to 180 | 0=South, 90=West, ±180=North, -90=East |
| `pitch` | float | -90 to 90 | -90=up, 0=horizon, 90=down |
| `facing` | string | `"South"`/`"West"`/`"North"`/`"East"` | Cardinal direction |

### 5.3 `player.velocity` — Movement Vector

```json
[ vx, vy, vz ]   // 3 floats, blocks/tick
```

- All ≈ 0 = standing still
- `vy > 0` = moving up (jumping)
- `vy < 0` = falling

### 5.4 `player.status` — Vital Signs (5 elements)

| Index | Field | Range | Critical |
|-------|-------|-------|----------|
| 0 | health | 0–20 | ≤ 5 danger, = 0 dead |
| 1 | food | 0–20 | ≤ 6 can't sprint, = 0 starving (damage) |
| 2 | saturation | 0–20 | > 0 means food won't decrease yet |
| 3 | armor | 0–20+ | Damage reduction |
| 4 | air | 0–300 | < 300 = underwater, = 0 drowning |

### 5.5 `player.flags` — Binary State (6 elements, 0 or 1)

| Index | Flag | `1` means |
|-------|------|-----------|
| 0 | on_ground | Touching ground (can jump) |
| 1 | sprinting | Moving faster (costs food) |
| 2 | sneaking | Moving slower, won't fall off edges |
| 3 | swimming | In water/lava |
| 4 | flying | Elytra gliding |
| 5 | sleeping | In bed (skipping night) |

---

## 6. `camera` — Vision Settings

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `fov` | float | 30–110 | Field of view (default 70) |
| `matrix` | [int,int,int] | [16, 9, 32] | Viewport_blocks dimensions: [width, height, depth] |

`width × height × depth = 16 × 9 × 32 = 4608` blocks.

---

## 7. `inventory` — Player Inventory

### 7.1 `inventory.slots` — 41 fixed slots

Each slot: `[ item_id, count ]`

| Index Range | Section | Count | Notes |
|-------------|---------|-------|-------|
| 0–8 | Hotbar | 9 | `selected_slot` indexes here (0–8) |
| 9–35 | Main inventory | 27 | |
| 36 | Boots | 1 | Armor slot |
| 37 | Leggings | 1 | Armor slot |
| 38 | Chestplate | 1 | Armor slot |
| 39 | Helmet | 1 | Armor slot |
| 40 | Offhand | 1 | Shield/torch/etc. |

- `[0, 0]` = empty slot
- `item_id`: numeric ID from `BuiltInRegistries.ITEM` (**dynamic per session**)
- `count`: stack size (1–99, max depends on item)

### 7.2 `inventory.selected_slot` (int 0–8)

Currently held hotbar slot.

---

## 8. `target` — Crosshair Target

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `block_id` | int | 0+ | Targeted block ID (0 = nothing/air/far) |
| `distance` | float | 0+ | Euclidean distance to block center |
| `face` | int | 0–5 | Which side of the block: |

**Block face index:**

| face | Side |
|------|------|
| 0 | Top (↑) |
| 1 | Bottom (↓) |
| 2 | North |
| 3 | South |
| 4 | West |
| 5 | East |

---

## 9. `viewport_blocks` — 3D Block Vision

### Format
```json
[ block_id_0, block_id_1, ..., block_id_4607 ]   // 4608 ints
```

### Index Formula
```
index = depth * 288 + height * 16 + width
```
where:
- `depth`: 0 (nearest) to 31 (farthest)
- `height`: 0 (bottom of frustum) to 8 (top)
- `width`: 0 (left) to 15 (right)

### Values
- `0` = air or out-of-range/unloaded chunk
- Other values = numeric block IDs from `BuiltInRegistries.BLOCK` (**dynamic per session**)

---

## 10. `viewport_entities` — Nearby Entities

### Format
```json
[
  [ type_id, relX, relY, relZ, yaw, pitch, health, distance ],
  [ type_id, relX, relY, relZ, yaw, pitch, health, distance ],
  ...  // up to 16 entities
]
```

Each entity has 8 values:

| Index | Field | Description |
|-------|-------|-------------|
| 0 | type_id | Entity type ID (0–127, **stable across sessions**) |
| 1 | relX | X relative to player |
| 2 | relY | Y relative to player |
| 3 | relZ | Z relative to player |
| 4 | yaw | Entity's horizontal rotation |
| 5 | pitch | Entity's vertical rotation |
| 6 | health | Entity health (0 for non-living) |
| 7 | distance | Euclidean distance from player |

Empty slots: `[0, 0, 0, 0, 0, 0, 0, 0]`

### Entity Type IDs (stable)

| ID | Entity | Hostile? | Notes |
|----|--------|----------|-------|
| 0 | Allay | No | |
| 1 | Area Effect Cloud | No | |
| 2 | Armadillo | No | |
| 3 | Armor Stand | No | |
| 4 | Arrow | No | Projectile |
| 5 | Axolotl | No | |
| 6 | Bat | No | |
| 7 | Bee | Neutral | |
| 8 | **Blaze** | **Yes** | Nether |
| 9 | Block Display | No | |
| 10 | Boat | No | |
| 11 | Bogged | Yes | |
| 12 | Breeze | **Yes** | |
| 13 | Breeze Wind Charge | No | |
| 14 | Cat | No | |
| 15 | Camel | No | |
| 16 | Cave Spider | **Yes** | |
| 17 | Chest Boat | No | |
| 18 | Chest Minecart | No | |
| 19 | Chicken | No | Food source |
| 20 | Cod | No | |
| 21 | Cow | No | Food/leather source |
| 22 | **Creeper** | **Yes** | Explodes |
| 23 | Dolphin | No | |
| 24 | Donkey | No | Rideable |
| 25 | Dragon Fireball | No | |
| 26 | Drowned | **Yes** | |
| 27 | Egg | No | |
| 28 | Elder Guardian | **Yes** | |
| 29 | End Crystal | No | |
| 30 | **Ender Dragon** | **Yes** | Boss |
| 31 | Ender Pearl | No | |
| 32 | **Enderman** | Neutral | Don't look at |
| 33 | Endermite | Neutral | |
| 34 | Evoker | **Yes** | |
| 35 | Evoker Fangs | No | |
| 36 | Experience Bottle | No | |
| 37 | Experience Orb | No | |
| 38 | Eye of Ender | No | |
| 39 | Falling Block | No | |
| 40 | Firework Rocket | No | |
| 41 | Fox | No | |
| 42 | Frog | No | |
| 43 | Furnace Minecart | No | |
| 44 | **Ghast** | **Yes** | Nether |
| 45 | Giant | **Yes** | |
| 46 | Glow Item Frame | No | |
| 47 | Glow Squid | No | |
| 48 | Goat | No | |
| 49 | Guardian | **Yes** | Underwater |
| 50 | **Hoglin** | **Yes** | Nether |
| 51 | Hopper Minecart | No | |
| 52 | Horse | No | Rideable |
| 53 | Husk | **Yes** | |
| 54 | Illusioner | **Yes** | |
| 55 | Interaction | No | |
| 56 | Iron Golem | Neutral | Protects villagers |
| 57 | Item (dropped) | No | |
| 58 | Item Display | No | |
| 59 | Item Frame | No | |
| 60 | Llama | No | Carries chests |
| 61 | Magma Cube | **Yes** | Nether |
| 62 | Marker | No | |
| 63 | Minecart | No | |
| 64 | Mooshroom | No | |
| 65 | Mule | No | Rideable |
| 66 | Ocelot | No | |
| 67 | Painting | No | |
| 68 | Panda | No | |
| 69 | Parrot | No | |
| 70 | Phantom | **Yes** | Spawns after sleepless nights |
| 71 | Pig | No | Food source |
| 72 | **Piglin** | Neutral | Nether, distracted by gold |
| 73 | **Piglin Brute** | **Yes** | Nether |
| 74 | **Pillager** | **Yes** | Raids |
| 75 | Polar Bear | Neutral | |
| 76 | Potion | No | |
| 77 | Pufferfish | No | |
| 78 | Rabbit | No | |
| 79 | Ravager | **Yes** | Raids |
| 80 | Salmon | No | |
| 81 | Sheep | No | Wool/mutton source |
| 82 | Shulker | **Yes** | End |
| 83 | Shulker Bullet | No | |
| 84 | Silverfish | **Yes** | |
| 85 | **Skeleton** | **Yes** | Ranged, burns in day |
| 86 | Skeleton Horse | No | |
| 87 | Slime | **Yes** | |
| 88 | Small Fireball | No | |
| 89 | Sniffer | No | |
| 90 | Snow Golem | No | |
| 91 | Snowball | No | |
| 92 | Spider | **Yes** | Climbs walls |
| 93 | Spectral Arrow | No | |
| 94 | Squid | No | |
| 95 | **Stray** | **Yes** | Ice skeleton |
| 96 | Strider | No | Nether, rideable on lava |
| 97 | Tadpole | No | |
| 98 | Text Display | No | |
| 99 | TNT | No | Primed |
| 100 | Trader Llama | No | |
| 101 | Trident | No | |
| 102 | Tropical Fish | No | |
| 103 | Turtle | No | |
| 104 | Vex | **Yes** | |
| 105 | Villager | No | Trading |
| 106 | Vindicator | **Yes** | |
| 107 | Wandering Trader | No | |
| 108 | **Warden** | **Yes** | Blind, sonic shriek |
| 109 | Wind Charge | No | |
| 110 | Witch | **Yes** | |
| 111 | **Wither** | **Yes** | Boss |
| 112 | Wither Skeleton | **Yes** | Nether |
| 113 | Wither Skull | No | |
| 114 | Wolf | Neutral | Tameable |
| 115 | Zoglin | **Yes** | |
| 116 | **Zombie** | **Yes** | Common, burns in day |
| 117 | Zombie Horse | No | |
| 118 | Zombie Villager | **Yes** | |
| 119 | Zombified Piglin | Neutral | Nether |

---

## 11. `screen` — UI Screen

Only present when a UI screen is open.

### 11.1 Common Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Screen identifier (see table below) |
| `title` | string | Screen title text |
| `type` | string | Always `"menu"` |
| `pause_game` | bool | Whether game is paused (`true` for pause menu, death) |

### 11.2 `screen.components` — UI widgets

Array of interactive components on the screen. Each component:

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Sequential index (0, 1, 2, ...) |
| `type` | string | `"button"` / `"textbox"` / `"slider"` / `"custom"` |
| `text` | string | Display text |
| `enabled` | bool | Can be interacted with |
| `visible` | bool | Is shown |
| `focused` | bool | Has keyboard focus |
| `value` | string/float | **type=textbox:** text content; **type=slider:** current value (0–1) |
| `min` | float | Only for sliders |
| `max` | float | Only for sliders |

### 11.3 `screen.navigation` — Path

```json
[ "Parent Menu", "Current Screen" ]
```

Breadcrumb trail from main menu to current screen.

### 11.4 Screen ID Reference

| Screen ID | Screen | How to open | How to close |
|-----------|--------|-------------|--------------|
| `minecraft:title` | Title screen | Start game | Click Singleplayer/Multiplayer |
| `minecraft:select_world` | World selection | Click Singleplayer | Click world or Back |
| `minecraft:multiplayer` | Server list | Click Multiplayer | Click server or Back |
| `minecraft:inventory` | Player inventory | Press E | Press E or Esc |
| `minecraft:creative_inventory` | Creative menu | Press E (creative) | Press E or Esc |
| `minecraft:crafting` | Crafting table | Right-click crafting table | Esc |
| `minecraft:furnace` | Furnace | Right-click furnace | Esc |
| `minecraft:blast_furnace` | Blast furnace | Right-click blast furnace | Esc |
| `minecraft:smoker` | Smoker | Right-click smoker | Esc |
| `minecraft:brewing_stand` | Brewing stand | Right-click brewing stand | Esc |
| `minecraft:enchantment` | Enchantment table | Right-click enchant table | Esc |
| `minecraft:anvil` | Anvil | Right-click anvil | Esc |
| `minecraft:grindstone` | Grindstone | Right-click grindstone | Esc |
| `minecraft:cartography_table` | Cartography table | Right-click cartography table | Esc |
| `minecraft:stonecutter` | Stonecutter | Right-click stonecutter | Esc |
| `minecraft:loom` | Loom | Right-click loom | Esc |
| `minecraft:smithing` | Smithing table | Right-click smithing table | Esc |
| `minecraft:villager_trades` | Villager trading | Right-click villager | Esc or trade |
| `minecraft:horse_inventory` | Horse inventory | Right-click horse/donkey/mule | Esc |
| `minecraft:container` | Chest/barrel/shulker | Right-click container | Esc |
| `minecraft:pause` | Pause menu | Press Esc | Click Resume or Esc |
| `minecraft:death` | Death screen | Player dies | Click Respawn |
| `minecraft:options` | Options | From pause/ title | Esc |
| `minecraft:video_settings` | Video settings | Options → Video | Esc |
| `minecraft:sound_settings` | Sound settings | Options → Audio | Esc |
| `minecraft:controls` | Controls | Options → Controls | Esc |
| `minecraft:keybinds` | Key binds | Controls → Key Binds | Esc |
| `minecraft:language` | Language | Options → Language | Esc |
| `minecraft:advancements` | Advancements | Press L | Press L or Esc |
| `minecraft:recipe_book` | Recipe book | In inventory/crafting | Click recipe |
| `minecraft:credits` | End credits | Beat the game | Skip |
| `minecraft:create_world` | Create new world | Title → Singleplayer → Create | Esc |
| `minecraft:edit_world` | Edit world settings | Select world → Edit | Esc |

---

## 12. Action Types (for POST /action)

| Type | Required fields | Optional fields | Effect |
|------|----------------|-----------------|--------|
| `key` | `keys: string[]` | `duration: int (ms)` | Press/release keys |
| `select_slot` | `slot: int` (0–8) | — | Switch hotbar slot |
| `place` | — | `face: string` | Place block on targeted face |
| `break` | — | — | Start mining targeted block (survival, drops items) |
| `interact` | — | — | Right-click targeted block |
| `jump` | — | — | Make player jump |
| `swing` | — | — | Swing hand (attack) |
| `look` | — | `yaw`/`pitch`/`deltaYaw`/`deltaPitch` | Set look direction |
| `craft` | `recipe: string` | `mode: string` | Craft item |
| `chat` | `message: string` | — | Send chat message |
| `command` | `command: string` | — | Run Minecraft command |
| `click_button` | `button_text: string` | — | Click UI button |

---

## 13. Inventory Slot Layout Summary

```
Index   Section         Size    Item format
─────────────────────────────────────────────
 0–8    Hotbar           9      [item_id, count]
 9–35   Main inventory  27      [item_id, count]
36      Boots            1      [item_id, count]
37      Leggings         1      [item_id, count]
38      Chestplate       1      [item_id, count]
39      Helmet           1      [item_id, count]
40      Offhand          1      [item_id, count]
─────────────────────────────────────────────
Total: 41 slots
```

`[0, 0]` = empty slot. `item_id` is dynamic per session.

---

## 14. Dimension IDs

| ID | Dimension |
|----|-----------|
| 0 | Overworld |
| 1 | Nether |
| 2 | End |

---

## 15. Weather Values

| Value | Meaning |
|-------|---------|
| `"clear"` | No precipitation |
| `"rain"` | Raining |
| `"thunder"` | Thunderstorm (rain + lightning) |

---

## 16. Block Face Index (target.face)

| face | Side |
|------|------|
| 0 | Up (top) |
| 1 | Down (bottom) |
| 2 | North |
| 3 | South |
| 4 | West |
| 5 | East |

---

## 17. Facing Direction (player.rotation.facing)

| Direction | Yaw Range |
|-----------|-----------|
| South | -45° to 45° |
| West | 45° to 135° |
| North | 135° to 225° |
| East | 225° to 315° |

---

## 18. Cardinal Directions (for place action face)

```
"up"    = positive Y
"down"  = negative Y
"north" = negative Z
"south" = positive Z
"west"  = negative X
"east"  = positive X
```

---

> **⚠️ Note:** Numeric IDs (`block_id`, `item_id`, `entity_type_id`) are from `BuiltInRegistries.getId()`. Items and blocks are **dynamic** (change each session). Entity type IDs are **stable** (0–127, same across sessions). For reliable identification, use namespaced IDs (`minecraft:stone`) as cross-reference.
