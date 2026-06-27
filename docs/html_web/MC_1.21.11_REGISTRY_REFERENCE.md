# Minecraft 1.21.11 Registry Reference

> **Created:** 27/06/2026
> **Purpose:** Comprehensive reference for numeric IDs in MC-API observation JSON.
> **Note:** Numeric IDs from `BuiltInRegistries.getId()` are **dynamic** (assigned at runtime order). Namespaced IDs (`minecraft:stone`) are stable across versions.

---

## 1. Dimension IDs

| ID | Dimension |
|----|-----------|
| 0 | Overworld |
| 1 | Nether |
| 2 | End |

---

## 2. Cardinal Directions (Facing)

Based on player yaw:

| Direction | Yaw Range |
|-----------|-----------|
| South | -45 to 45 |
| West | 45 to 135 |
| North | 135 to 225 |
| East | 225 to 315 |

---

## 3. Block Face Indices (target.face)

| ID | Face |
|----|------|
| 0 | Up (top) |
| 1 | Down (bottom) |
| 2 | North |
| 3 | South |
| 4 | West |
| 5 | East |

---

## 4. Player Flags (player.flags array)

| Index | Flag | Description |
|-------|------|-------------|
| 0 | on_ground | Player is touching ground |
| 1 | sprinting | Player is sprinting |
| 2 | sneaking | Player is sneaking/crouching |
| 3 | swimming | Player is swimming |
| 4 | flying | Player is fall-flying (elytra) |
| 5 | sleeping | Player is sleeping in bed |

---

## 5. Status Array (player.status)

| Index | Field | Range |
|-------|-------|-------|
| 0 | health | 0-20 (half hearts) |
| 1 | food | 0-20 |
| 2 | saturation | 0-20 |
| 3 | armor | 0-20+ |
| 4 | air | 0-300 (max underwater) |

---

## 6. Weather Values

| Value | Meaning |
|-------|---------|
| `"clear"` | No precipitation |
| `"rain"` | Raining |
| `"thunder"` | Thunderstorm (rain + lightning) |

---

## 7. Entity Registry (Numeric IDs)

**NOTE:** These numeric IDs are from `BuiltInRegistries.ENTITY_TYPE.getId()`. They represent the **ordinal position** in the registry at runtime and may vary.

| ID | Namespaced ID | Entity |
|----|--------------|--------|
| 0 | minecraft:allay | Allay |
| 1 | minecraft:area_effect_cloud | Area Effect Cloud |
| 2 | minecraft:armadillo | Armadillo |
| 3 | minecraft:armor_stand | Armor Stand |
| 4 | minecraft:arrow | Arrow |
| 5 | minecraft:axolotl | Axolotl |
| 6 | minecraft:bat | Bat |
| 7 | minecraft:bee | Bee |
| 8 | minecraft:blaze | Blaze |
| 9 | minecraft:block_display | Block Display |
| 10 | minecraft:boat | Boat |
| 11 | minecraft:bogged | Bogged |
| 12 | minecraft:breeze | Breeze |
| 13 | minecraft:breeze_wind_charge | Breeze Wind Charge |
| 14 | minecraft:camel | Camel |
| 15 | minecraft:cat | Cat |
| 16 | minecraft:cave_spider | Cave Spider |
| 17 | minecraft:chest_boat | Chest Boat |
| 18 | minecraft:chest_minecart | Minecart with Chest |
| 19 | minecraft:chicken | Chicken |
| 20 | minecraft:cod | Cod |
| 21 | minecraft:command_block_minecart | Minecart with Command Block |
| 22 | minecraft:cow | Cow |
| 23 | minecraft:creeper | Creeper |
| 24 | minecraft:dolphin | Dolphin |
| 25 | minecraft:donkey | Donkey |
| 26 | minecraft:dragon_fireball | Dragon Fireball |
| 27 | minecraft:drowned | Drowned |
| 28 | minecraft:egg | Egg |
| 29 | minecraft:elder_guardian | Elder Guardian |
| 30 | minecraft:end_crystal | End Crystal |
| 31 | minecraft:ender_dragon | Ender Dragon |
| 32 | minecraft:ender_pearl | Ender Pearl |
| 33 | minecraft:enderman | Enderman |
| 34 | minecraft:endermite | Endermite |
| 35 | minecraft:evoker | Evoker |
| 36 | minecraft:evoker_fangs | Evoker Fangs |
| 37 | minecraft:experience_bottle | Bottle o' Enchanting |
| 38 | minecraft:experience_orb | Experience Orb |
| 39 | minecraft:eye_of_ender | Eye of Ender |
| 40 | minecraft:falling_block | Falling Block |
| 41 | minecraft:firework_rocket | Firework Rocket |
| 42 | minecraft:fox | Fox |
| 43 | minecraft:frog | Frog |
| 44 | minecraft:furnace_minecart | Minecart with Furnace |
| 45 | minecraft:ghast | Ghast |
| 46 | minecraft:giant | Giant |
| 47 | minecraft:glow_item_frame | Glow Item Frame |
| 48 | minecraft:glow_squid | Glow Squid |
| 49 | minecraft:goat | Goat |
| 50 | minecraft:guardian | Guardian |
| 51 | minecraft:hoglin | Hoglin |
| 52 | minecraft:hopper_minecart | Minecart with Hopper |
| 53 | minecraft:horse | Horse |
| 54 | minecraft:husk | Husk |
| 55 | minecraft:illusioner | Illusioner |
| 56 | minecraft:interaction | Interaction |
| 57 | minecraft:iron_golem | Iron Golem |
| 58 | minecraft:item | Item (dropped) |
| 59 | minecraft:item_display | Item Display |
| 60 | minecraft:item_frame | Item Frame |
| 61 | minecraft:ominous_item_spawner | Ominous Item Spawner |
| 62 | minecraft:fireball | Ghast Fireball |
| 63 | minecraft:leash_knot | Leash Knot |
| 64 | minecraft:lightning_bolt | Lightning Bolt |
| 65 | minecraft:llama | Llama |
| 66 | minecraft:llama_spit | Llama Spit |
| 67 | minecraft:magma_cube | Magma Cube |
| 68 | minecraft:marker | Marker |
| 69 | minecraft:minecart | Minecart |
| 70 | minecraft:mooshroom | Mooshroom |
| 71 | minecraft:mule | Mule |
| 72 | minecraft:ocelot | Ocelot |
| 73 | minecraft:painting | Painting |
| 74 | minecraft:panda | Panda |
| 75 | minecraft:parrot | Parrot |
| 76 | minecraft:phantom | Phantom |
| 77 | minecraft:pig | Pig |
| 78 | minecraft:piglin | Piglin |
| 79 | minecraft:piglin_brute | Piglin Brute |
| 80 | minecraft:pillager | Pillager |
| 81 | minecraft:polar_bear | Polar Bear |
| 82 | minecraft:potion | Potion |
| 83 | minecraft:pufferfish | Pufferfish |
| 84 | minecraft:rabbit | Rabbit |
| 85 | minecraft:ravager | Ravager |
| 86 | minecraft:salmon | Salmon |
| 87 | minecraft:sheep | Sheep |
| 88 | minecraft:shulker | Shulker |
| 89 | minecraft:shulker_bullet | Shulker Bullet |
| 90 | minecraft:silverfish | Silverfish |
| 91 | minecraft:skeleton | Skeleton |
| 92 | minecraft:skeleton_horse | Skeleton Horse |
| 93 | minecraft:slime | Slime |
| 94 | minecraft:small_fireball | Blaze Fireball |
| 95 | minecraft:sniffer | Sniffer |
| 96 | minecraft:snow_golem | Snow Golem |
| 97 | minecraft:snowball | Snowball |
| 98 | minecraft:spawner_minecart | Minecart with Spawner |
| 99 | minecraft:spectral_arrow | Spectral Arrow |
| 100 | minecraft:spider | Spider |
| 101 | minecraft:squid | Squid |
| 102 | minecraft:stray | Stray |
| 103 | minecraft:strider | Strider |
| 104 | minecraft:tadpole | Tadpole |
| 105 | minecraft:text_display | Text Display |
| 106 | minecraft:tnt | Primed TNT |
| 107 | minecraft:tnt_minecart | Minecart with TNT |
| 108 | minecraft:trader_llama | Trader Llama |
| 109 | minecraft:trident | Trident |
| 110 | minecraft:tropical_fish | Tropical Fish |
| 111 | minecraft:turtle | Turtle |
| 112 | minecraft:vex | Vex |
| 113 | minecraft:villager | Villager |
| 114 | minecraft:vindicator | Vindicator |
| 115 | minecraft:wandering_trader | Wandering Trader |
| 116 | minecraft:warden | Warden |
| 117 | minecraft:wind_charge | Wind Charge |
| 118 | minecraft:witch | Witch |
| 119 | minecraft:wither | Wither |
| 120 | minecraft:wither_skeleton | Wither Skeleton |
| 121 | minecraft:wither_skull | Wither Skull |
| 122 | minecraft:wolf | Wolf |
| 123 | minecraft:zoglin | Zoglin |
| 124 | minecraft:zombie | Zombie |
| 125 | minecraft:zombie_horse | Zombie Horse |
| 126 | minecraft:zombie_villager | Zombie Villager |
| 127 | minecraft:zombified_piglin | Zombified Piglin |

---

## 8. Status Effects (Potion Effects)

These correspond to `/effect` command IDs. Note: In 1.21+, numeric IDs are deprecated in NBT but still accessible via `BuiltInRegistries.MOB_EFFECT.getId()`.

| ID | Namespaced ID | Name |
|----|--------------|------|
| 1 | minecraft:speed | Speed |
| 2 | minecraft:slowness | Slowness |
| 3 | minecraft:haste | Haste |
| 4 | minecraft:mining_fatigue | Mining Fatigue |
| 5 | minecraft:strength | Strength |
| 6 | minecraft:instant_health | Instant Health |
| 7 | minecraft:instant_damage | Instant Damage |
| 8 | minecraft:jump_boost | Jump Boost |
| 9 | minecraft:nausea | Nausea |
| 10 | minecraft:regeneration | Regeneration |
| 11 | minecraft:resistance | Resistance |
| 12 | minecraft:fire_resistance | Fire Resistance |
| 13 | minecraft:water_breathing | Water Breathing |
| 14 | minecraft:invisibility | Invisibility |
| 15 | minecraft:blindness | Blindness |
| 16 | minecraft:night_vision | Night Vision |
| 17 | minecraft:hunger | Hunger |
| 18 | minecraft:weakness | Weakness |
| 19 | minecraft:poison | Poison |
| 20 | minecraft:wither | Wither |
| 21 | minecraft:health_boost | Health Boost |
| 22 | minecraft:absorption | Absorption |
| 23 | minecraft:saturation | Saturation |
| 24 | minecraft:glowing | Glowing |
| 25 | minecraft:levitation | Levitation |
| 26 | minecraft:luck | Luck |
| 27 | minecraft:unluck | Bad Luck |
| 28 | minecraft:slow_falling | Slow Falling |
| 29 | minecraft:conduit_power | Conduit Power |
| 30 | minecraft:dolphins_grace | Dolphin's Grace |
| 31 | minecraft:bad_omen | Bad Omen |
| 32 | minecraft:hero_of_the_village | Hero of the Village |
| 33 | minecraft:darkness | Darkness |
| 34 | minecraft:trial_omen | Trial Omen |
| 35 | minecraft:raid_omen | Raid Omen |
| 36 | minecraft:wind_charged | Wind Charged |
| 37 | minecraft:weaving | Weaving |
| 38 | minecraft:oozing | Oozing |
| 39 | minecraft:infested | Infested |

---

## 9. Enchantments

| ID | Namespaced ID | Max Level |
|----|--------------|-----------|
| 0 | minecraft:protection | IV |
| 1 | minecraft:fire_protection | IV |
| 2 | minecraft:feather_falling | IV |
| 3 | minecraft:blast_protection | IV |
| 4 | minecraft:projectile_protection | IV |
| 5 | minecraft:respiration | III |
| 6 | minecraft:aqua_affinity | I |
| 7 | minecraft:thorns | III |
| 8 | minecraft:depth_strider | III |
| 9 | minecraft:frost_walker | II |
| 10 | minecraft:binding_curse | I |
| 11 | minecraft:soul_speed | III |
| 12 | minecraft:swift_sneak | III |
| 13 | minecraft:sharpness | V |
| 14 | minecraft:smite | V |
| 15 | minecraft:bane_of_arthropods | V |
| 16 | minecraft:knockback | II |
| 17 | minecraft:fire_aspect | II |
| 18 | minecraft:looting | III |
| 19 | minecraft:sweeping_edge | III |
| 20 | minecraft:efficiency | V |
| 21 | minecraft:silk_touch | I |
| 22 | minecraft:unbreaking | III |
| 23 | minecraft:fortune | III |
| 24 | minecraft:power | V |
| 25 | minecraft:punch | II |
| 26 | minecraft:flame | I |
| 27 | minecraft:infinity | I |
| 28 | minecraft:luck_of_the_sea | III |
| 29 | minecraft:lure | III |
| 30 | minecraft:loyalty | V |
| 31 | minecraft:impaling | V |
| 32 | minecraft:riptide | III |
| 33 | minecraft:channeling | I |
| 34 | minecraft:multishot | I |
| 35 | minecraft:quick_charge | III |
| 36 | minecraft:piercing | IV |
| 37 | minecraft:mending | I |
| 38 | minecraft:vanishing_curse | I |
| 39 | minecraft:breach | IV |
| 40 | minecraft:density | V |
| 41 | minecraft:wind_burst | III |

---

## 10. Biomes

| Namespaced ID | Dimension |
|--------------|-----------|
| minecraft:badlands | Overworld |
| minecraft:bamboo_jungle | Overworld |
| minecraft:basalt_deltas | Nether |
| minecraft:beach | Overworld |
| minecraft:birch_forest | Overworld |
| minecraft:cherry_grove | Overworld |
| minecraft:cold_ocean | Overworld |
| minecraft:crimson_forest | Nether |
| minecraft:dark_forest | Overworld |
| minecraft:deep_cold_ocean | Overworld |
| minecraft:deep_dark | Overworld |
| minecraft:deep_frozen_ocean | Overworld |
| minecraft:deep_lukewarm_ocean | Overworld |
| minecraft:deep_ocean | Overworld |
| minecraft:desert | Overworld |
| minecraft:dripstone_caves | Overworld |
| minecraft:end_barrens | End |
| minecraft:end_highlands | End |
| minecraft:end_midlands | End |
| minecraft:eroded_badlands | Overworld |
| minecraft:flower_forest | Overworld |
| minecraft:forest | Overworld |
| minecraft:frozen_ocean | Overworld |
| minecraft:frozen_peaks | Overworld |
| minecraft:frozen_river | Overworld |
| minecraft:grove | Overworld |
| minecraft:ice_spikes | Overworld |
| minecraft:jagged_peaks | Overworld |
| minecraft:jungle | Overworld |
| minecraft:lukewarm_ocean | Overworld |
| minecraft:lush_caves | Overworld |
| minecraft:mangrove_swamp | Overworld |
| minecraft:meadow | Overworld |
| minecraft:mushroom_fields | Overworld |
| minecraft:nether_wastes | Nether |
| minecraft:ocean | Overworld |
| minecraft:old_growth_birch_forest | Overworld |
| minecraft:old_growth_pine_taiga | Overworld |
| minecraft:old_growth_spruce_taiga | Overworld |
| minecraft:pale_garden | Overworld |
| minecraft:plains | Overworld |
| minecraft:river | Overworld |
| minecraft:savanna | Overworld |
| minecraft:savanna_plateau | Overworld |
| minecraft:small_end_islands | End |
| minecraft:snowy_beach | Overworld |
| minecraft:snowy_plains | Overworld |
| minecraft:snowy_slopes | Overworld |
| minecraft:snowy_taiga | Overworld |
| minecraft:soul_sand_valley | Nether |
| minecraft:sparse_jungle | Overworld |
| minecraft:stony_peaks | Overworld |
| minecraft:stony_shore | Overworld |
| minecraft:sunflower_plains | Overworld |
| minecraft:swamp | Overworld |
| minecraft:taiga | Overworld |
| minecraft:the_end | End |
| minecraft:the_void | Overworld (void) |
| minecraft:warm_ocean | Overworld |
| minecraft:warped_forest | Nether |
| minecraft:windswept_forest | Overworld |
| minecraft:windswept_gravelly_hills | Overworld |
| minecraft:windswept_hills | Overworld |
| minecraft:windswept_savanna | Overworld |
| minecraft:wooded_badlands | Overworld |

---

## 11. Inventory Slot Layout

The `inventory.slots` array has exactly 41 entries `[item_id, count]`:

| Index Range | Section | Count |
|-------------|---------|-------|
| 0 - 8 | Hotbar | 9 |
| 9 - 35 | Main inventory | 27 |
| 36 - 39 | Armor (boots, legs, chest, head) | 4 |
| 40 | Offhand | 1 |

Empty slots are `[0, 0]`.
`item_id` comes from `BuiltInRegistries.ITEM.getId()` (0 = empty/air).
`count` is the stack size (1-99, max depends on item type).

---

## 12. Viewport Blocks Array

- Size: 4608 elements (16 wide × 9 tall × 32 deep)
- Each element is a block ID from `BuiltInRegistries.BLOCK.getId()`
- 0 = air or out-of-range
- The frustum follows the player's look direction

---

## 13. Viewport Entities Array

- Size: up to 16 entities, each with 8 values
- Format: `[type_id, relX, relY, relZ, yaw, pitch, health, distance]`
- `type_id` from `BuiltInRegistries.ENTITY_TYPE.getId()`
- Entity is relative to player position
- Empty slots: `[0, 0, 0, 0, 0, 0, 0, 0]`

---

## 14. Common Block & Item Namespaced IDs (Reference)

These are the most frequently encountered blocks/items by category:

### Stone & Minerals
| Namespaced ID | Block/Item |
|--------------|------------|
| minecraft:stone | Stone |
| minecraft:cobblestone | Cobblestone |
| minecraft:granite | Granite |
| minecraft:diorite | Diorite |
| minecraft:andesite | Andesite |
| minecraft:deepslate | Deepslate |
| minecraft:tuff | Tuff |
| minecraft:calcite | Calcite |
| minecraft:gravel | Gravel |
| minecraft:sand | Sand |
| minecraft:dirt | Dirt |
| minecraft:grass_block | Grass Block |
| minecraft:bedrock | Bedrock |
| minecraft:obsidian | Obsidian |

### Ores & Minerals
| Namespaced ID | Block/Item |
|--------------|------------|
| minecraft:coal_ore | Coal Ore |
| minecraft:iron_ore | Iron Ore |
| minecraft:copper_ore | Copper Ore |
| minecraft:gold_ore | Gold Ore |
| minecraft:diamond_ore | Diamond Ore |
| minecraft:emerald_ore | Emerald Ore |
| minecraft:lapis_ore | Lapis Lazuli Ore |
| minecraft:redstone_ore | Redstone Ore |
| minecraft:nether_quartz_ore | Nether Quartz Ore |
| minecraft:nether_gold_ore | Nether Gold Ore |
| minecraft:ancient_debris | Ancient Debris |

### Wood & Plants
| Namespaced ID | Block/Item |
|--------------|------------|
| minecraft:oak_log | Oak Log |
| minecraft:oak_planks | Oak Planks |
| minecraft:spruce_log | Spruce Log |
| minecraft:birch_log | Birch Log |
| minecraft:jungle_log | Jungle Log |
| minecraft:acacia_log | Acacia Log |
| minecraft:dark_oak_log | Dark Oak Log |
| minecraft:mangrove_log | Mangrove Log |
| minecraft:cherry_log | Cherry Log |
| minecraft:bamboo | Bamboo |

### Items
| Namespaced ID | Item |
|--------------|------|
| minecraft:diamond | Diamond |
| minecraft:iron_ingot | Iron Ingot |
| minecraft:gold_ingot | Gold Ingot |
| minecraft:copper_ingot | Copper Ingot |
| minecraft:netherite_ingot | Netherite Ingot |
| minecraft:stick | Stick |
| minecraft:bone | Bone |
| minecraft:feather | Feather |
| minecraft:flint | Flint |
| minecraft:leather | Leather |
| minecraft:string | String |

### Tools & Weapons
| Namespaced ID | Item |
|--------------|------|
| minecraft:wooden_sword | Wooden Sword |
| minecraft:stone_sword | Stone Sword |
| minecraft:iron_sword | Iron Sword |
| minecraft:diamond_sword | Diamond Sword |
| minecraft:netherite_sword | Netherite Sword |
| minecraft:bow | Bow |
| minecraft:crossbow | Crossbow |
| minecraft:trident | Trident |
| minecraft:shield | Shield |
| minecraft:wooden_pickaxe | Wooden Pickaxe |
| minecraft:stone_pickaxe | Stone Pickaxe |
| minecraft:iron_pickaxe | Iron Pickaxe |
| minecraft:diamond_pickaxe | Diamond Pickaxe |
| minecraft:netherite_pickaxe | Netherite Pickaxe |
| minecraft:mace | Mace |

### Food
| Namespaced ID | Item |
|--------------|------|
| minecraft:apple | Apple |
| minecraft:golden_apple | Golden Apple |
| minecraft:enchanted_golden_apple | Enchanted Golden Apple |
| minecraft:bread | Bread |
| minecraft:beef | Raw Beef |
| minecraft:cooked_beef | Steak |
| minecraft:porkchop | Raw Porkchop |
| minecraft:cooked_porkchop | Cooked Porkchop |
| minecraft:chicken | Raw Chicken |
| minecraft:cooked_chicken | Cooked Chicken |
| minecraft:carrot | Carrot |
| minecraft:potato | Potato |
| minecraft:baked_potato | Baked Potato |

---

## 15. Screen IDs

Common screen identifiers returned in `screen.id`:

| Screen ID | Screen Name |
|-----------|-------------|
| minecraft:title | Title Screen |
| minecraft:pause | Pause Menu |
| minecraft:options | Options |
| minecraft:video_settings | Video Settings |
| minecraft:sound_settings | Sound Settings |
| minecraft:controls | Controls |
| minecraft:keybinds | Key Binds |
| minecraft:language | Language |
| minecraft:create_world | Create World |
| minecraft:select_world | Select World |
| minecraft:multiplayer | Multiplayer |
| minecraft:inventory | Inventory |
| minecraft:creative_inventory | Creative Inventory |
| minecraft:crafting | Crafting Table |
| minecraft:furnace | Furnace |
| minecraft:enchantment | Enchantment Table |
| minecraft:anvil | Anvil |
| minecraft:brewing_stand | Brewing Stand |
| minecraft:chest | Chest |
| minecraft:death | Death Screen |
| minecraft:advancements | Advancements |
| minecraft:recipe_book | Recipe Book |
| minecraft:villager_trades | Villager Trading |

---

> **Important Note on Numeric IDs:**
> In Minecraft 1.21+, registries use dynamic ordering. The numeric ID from `BuiltInRegistries.BLOCK.getId()`, `BuiltInRegistries.ITEM.getId()`, and `BuiltInRegistries.ENTITY_TYPE.getId()` depends on **loading order at runtime**. They are consistent within a single game session but may differ between:
> - Different mod loads
> - Different Minecraft versions
> - Different game launches
>
> For reliable identification, always cross-reference with the namespaced ID (`minecraft:stone`) which is stable across sessions.
