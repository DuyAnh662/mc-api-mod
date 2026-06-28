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
| `matrix` | [int,int] | [16, 9] | Depth-map ray grid: [width, height] |

`width × height = 16 × 9 = 144` depth rays.

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

## 9. `viewport_blocks` — Depth-Map Vision

### Format
```json
[ depth_0, depth_1, ..., depth_143 ]   // 144 ints
```

### Structure
- **144 values** (16 wide × 9 tall), one per ray
- Each value = distance in blocks (1–32) to the first non-air block along that ray
- `32` = no solid block within range (clear path)

### Index
```
index = height * 16 + width
```
where:
- `height`: 0 (bottom of frustum) to 8 (top)
- `width`: 0 (left) to 15 (right)

### Values
- **1–31**: distance to first solid block
- **32**: all clear (no solid within 32 blocks) (**dynamic per session**)

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
| 0 | type_id | Entity type ID (0–127, generally stable per version) |
| 1 | relX | X relative to player |
| 2 | relY | Y relative to player |
| 3 | relZ | Z relative to player |
| 4 | yaw | Entity's horizontal rotation |
| 5 | pitch | Entity's vertical rotation |
| 6 | health | Entity health (0 for non-living) |
| 7 | distance | Euclidean distance from player |

Only entities actually visible in the frustum are included (no empty padding; array may have 0–16 elements).

### Entity Type IDs (stable)

> **⚠️ These IDs were captured from a vanilla Minecraft 1.21.11 runtime (`BuiltInRegistries.ENTITY_TYPE`). Registry order can shift with mods or version updates. For the definitive mapping, use `GET /api/registry/entities` at runtime.**

| ID | Entity | Hostile? | Namespaced ID |
|----|--------|----------|---------------|
| 0 | Allay | No | minecraft:allay |
| 1 | Area Effect Cloud | No | minecraft:area_effect_cloud |
| 2 | Armadillo | No | minecraft:armadillo |
| 3 | Armor Stand | No | minecraft:armor_stand |
| 4 | Arrow | No | minecraft:arrow |
| 5 | Axolotl | No | minecraft:axolotl |
| 6 | Bat | No | minecraft:bat |
| 7 | Bee | Neutral | minecraft:bee |
| 8 | **Blaze** | **Yes** | minecraft:blaze |
| 9 | Block Display | No | minecraft:block_display |
| 10 | Boat | No | minecraft:boat |
| 11 | Bogged | Yes | minecraft:bogged |
| 12 | Breeze | **Yes** | minecraft:breeze |
| 13 | Breeze Wind Charge | No | minecraft:breeze_wind_charge |
| 14 | Camel | No | minecraft:camel |
| 15 | Cat | No | minecraft:cat |
| 16 | Cave Spider | **Yes** | minecraft:cave_spider |
| 17 | Chest Boat | No | minecraft:chest_boat |
| 18 | Chest Minecart | No | minecraft:chest_minecart |
| 19 | Chicken | No | minecraft:chicken |
| 20 | Cod | No | minecraft:cod |
| 21 | Minecart with Command Block | No | minecraft:command_block_minecart |
| 22 | Cow | No | minecraft:cow |
| 23 | **Creeper** | **Yes** | minecraft:creeper |
| 24 | Dolphin | No | minecraft:dolphin |
| 25 | Donkey | No | minecraft:donkey |
| 26 | Dragon Fireball | No | minecraft:dragon_fireball |
| 27 | Drowned | **Yes** | minecraft:drowned |
| 28 | Egg | No | minecraft:egg |
| 29 | Elder Guardian | **Yes** | minecraft:elder_guardian |
| 30 | End Crystal | No | minecraft:end_crystal |
| 31 | **Ender Dragon** | **Yes** | minecraft:ender_dragon |
| 32 | Ender Pearl | No | minecraft:ender_pearl |
| 33 | **Enderman** | Neutral | minecraft:enderman |
| 34 | Endermite | Neutral | minecraft:endermite |
| 35 | Evoker | **Yes** | minecraft:evoker |
| 36 | Evoker Fangs | No | minecraft:evoker_fangs |
| 37 | Experience Bottle | No | minecraft:experience_bottle |
| 38 | Experience Orb | No | minecraft:experience_orb |
| 39 | Eye of Ender | No | minecraft:eye_of_ender |
| 40 | Falling Block | No | minecraft:falling_block |
| 41 | Firework Rocket | No | minecraft:firework_rocket |
| 42 | Fox | No | minecraft:fox |
| 43 | Frog | No | minecraft:frog |
| 44 | Minecart with Furnace | No | minecraft:furnace_minecart |
| 45 | **Ghast** | **Yes** | minecraft:ghast |
| 46 | Giant | **Yes** | minecraft:giant |
| 47 | Glow Item Frame | No | minecraft:glow_item_frame |
| 48 | Glow Squid | No | minecraft:glow_squid |
| 49 | Goat | No | minecraft:goat |
| 50 | Guardian | **Yes** | minecraft:guardian |
| 51 | **Hoglin** | **Yes** | minecraft:hoglin |
| 52 | Minecart with Hopper | No | minecraft:hopper_minecart |
| 53 | Horse | No | minecraft:horse |
| 54 | Husk | **Yes** | minecraft:husk |
| 55 | Illusioner | **Yes** | minecraft:illusioner |
| 56 | Interaction | No | minecraft:interaction |
| 57 | Iron Golem | Neutral | minecraft:iron_golem |
| 58 | Item (dropped) | No | minecraft:item |
| 59 | Item Display | No | minecraft:item_display |
| 60 | Item Frame | No | minecraft:item_frame |
| 61 | Ominous Item Spawner | No | minecraft:ominous_item_spawner |
| 62 | Ghast Fireball | No | minecraft:fireball |
| 63 | Leash Knot | No | minecraft:leash_knot |
| 64 | Lightning Bolt | No | minecraft:lightning_bolt |
| 65 | Llama | No | minecraft:llama |
| 66 | Llama Spit | No | minecraft:llama_spit |
| 67 | **Magma Cube** | **Yes** | minecraft:magma_cube |
| 68 | Marker | No | minecraft:marker |
| 69 | Minecart | No | minecraft:minecart |
| 70 | Mooshroom | No | minecraft:mooshroom |
| 71 | Mule | No | minecraft:mule |
| 72 | Ocelot | No | minecraft:ocelot |
| 73 | Painting | No | minecraft:painting |
| 74 | Panda | No | minecraft:panda |
| 75 | Parrot | No | minecraft:parrot |
| 76 | **Phantom** | **Yes** | minecraft:phantom |
| 77 | Pig | No | minecraft:pig |
| 78 | **Piglin** | Neutral | minecraft:piglin |
| 79 | **Piglin Brute** | **Yes** | minecraft:piglin_brute |
| 80 | **Pillager** | **Yes** | minecraft:pillager |
| 81 | Polar Bear | Neutral | minecraft:polar_bear |
| 82 | Potion | No | minecraft:potion |
| 83 | Pufferfish | No | minecraft:pufferfish |
| 84 | Rabbit | No | minecraft:rabbit |
| 85 | Ravager | **Yes** | minecraft:ravager |
| 86 | Salmon | No | minecraft:salmon |
| 87 | Sheep | No | minecraft:sheep |
| 88 | Shulker | **Yes** | minecraft:shulker |
| 89 | Shulker Bullet | No | minecraft:shulker_bullet |
| 90 | Silverfish | **Yes** | minecraft:silverfish |
| 91 | **Skeleton** | **Yes** | minecraft:skeleton |
| 92 | Skeleton Horse | No | minecraft:skeleton_horse |
| 93 | Slime | **Yes** | minecraft:slime |
| 94 | Blaze Fireball | No | minecraft:small_fireball |
| 95 | Sniffer | No | minecraft:sniffer |
| 96 | Snow Golem | No | minecraft:snow_golem |
| 97 | Snowball | No | minecraft:snowball |
| 98 | Minecart with Spawner | No | minecraft:spawner_minecart |
| 99 | Spectral Arrow | No | minecraft:spectral_arrow |
| 100 | **Spider** | **Yes** | minecraft:spider |
| 101 | Squid | No | minecraft:squid |
| 102 | **Stray** | **Yes** | minecraft:stray |
| 103 | Strider | No | minecraft:strider |
| 104 | Tadpole | No | minecraft:tadpole |
| 105 | Text Display | No | minecraft:text_display |
| 106 | Primed TNT | No | minecraft:tnt |
| 107 | Minecart with TNT | No | minecraft:tnt_minecart |
| 108 | Trader Llama | No | minecraft:trader_llama |
| 109 | Trident | No | minecraft:trident |
| 110 | Tropical Fish | No | minecraft:tropical_fish |
| 111 | Turtle | No | minecraft:turtle |
| 112 | Vex | **Yes** | minecraft:vex |
| 113 | Villager | No | minecraft:villager |
| 114 | Vindicator | **Yes** | minecraft:vindicator |
| 115 | Wandering Trader | No | minecraft:wandering_trader |
| 116 | **Warden** | **Yes** | minecraft:warden |
| 117 | Wind Charge | No | minecraft:wind_charge |
| 118 | Witch | **Yes** | minecraft:witch |
| 119 | **Wither** | **Yes** | minecraft:wither |
| 120 | Wither Skeleton | **Yes** | minecraft:wither_skeleton |
| 121 | Wither Skull | No | minecraft:wither_skull |
| 122 | Wolf | Neutral | minecraft:wolf |
| 123 | Zoglin | **Yes** | minecraft:zoglin |
| 124 | **Zombie** | **Yes** | minecraft:zombie |
| 125 | Zombie Horse | No | minecraft:zombie_horse |
| 126 | Zombie Villager | **Yes** | minecraft:zombie_villager |
| 127 | Zombified Piglin | Neutral | minecraft:zombified_piglin |

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

> **⚠️ Note:** Numeric IDs (`block_id`, `item_id`, `entity_type_id`) are from `BuiltInRegistries.getId()`. Items and blocks are **dynamic** (change each session). Entity type IDs are generally stable per Minecraft version but can shift with mods or updates. For reliable identification, use namespaced IDs (`minecraft:stone`) as cross-reference.
>
> **Runtime resolution:** Use `GET /api/registry/entities` and `GET /api/registry/items` to dump the live `id → "minecraft:name"` mapping at any time. AI agents should call these once per session for accurate lookup.
