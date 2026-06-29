# Changelog

## v1.3.0 — Screenshot for YOLO Detection

### ✨ New Features

- **`GET /api/client/screenshot`** — Capture game window as base64 JPEG. Parameters: `width`, `height`, `quality`. Default 640×360, ~30-60 KB. Designed for external YOLO inference (Python integration example included).

## v1.2.4 — RLE Depth-Map + Sparse Inventory

### ✨ Enhancements

- **`viewport_blocks` now uses RLE compression** — Previously 288 ints (144 flat [depth, blockId] pairs). Now consecutive identical rays are merged into runs: `[[count, depth, blockId], ...]`. Typical scene: ~40-60% fewer tokens vs. flat format. Empty state returns `[]`.
- **`inventory.slots` now sparse** — Previously 41 fixed `[item_id, count]` entries (82 ints + JSON overhead). Now only non-empty slots are included, each as `[slot_index, item_id, count]`. Empty state returns `[]`. Early-game saving: ~6-15 token vs 165.

## v1.2.2 — Depth-Map with Surface Block IDs

### ✨ Enhancements

- **`viewport_blocks` now returns `[depth, blockId]` pairs** — Previously a flat depth-only array (144 ints). Now each of the 144 rays produces two values: depth (1–32 = distance to nearest solid) and the numeric block ID of that surface block (0 if clear). Total 288 ints.
- AI can now distinguish stone vs. dirt vs. water at each ray without a separate API call.

### 🐛 Bug Fixes

- **Fixed stride in viewport_blocks doc** — Index formula corrected from `depth * 288` to `depth * 144` (each depth layer has 16×9 = 144 cells, not 288).
- **`viewport_entities` no longer pads empty slots** — Removed 16-slot fixed-size padding. Returns only actual visible entities (0–16 elements).

## v1.2.1 — Registry Endpoints + Bug Fixes

### ✨ New Features

- **Registry Dump Endpoints** — Two new runtime endpoints for resolving numeric IDs:
  - `GET /api/registry/entities` — Dumps `id → "minecraft:name"` from `BuiltInRegistries.ENTITY_TYPE`
  - `GET /api/registry/items` — Dumps `id → "minecraft:name"` from `BuiltInRegistries.ITEM`
  - AI agents can call these once per session for accurate ID lookup, eliminating hardcoded tables.

### 🐛 Bug Fixes

- **`world.time` clamping** — Observation now returns `dayTime % 24000` (range 0–24000) as documented, instead of raw tick value. Fixes `ObservationProvider.java:143`.
- **`viewport_entities` FOV filtering** — Entities are now filtered by the player's actual field of view (frustum cone). Previously all entities within 48 blocks were included regardless of direction. Fixes `ObservationProvider.java:363-371`.
- **Entity ID table in docs** — Both `OBSERVATION_SCHEMA.md` and `AI_AGENT_GUIDE.md` entity type ID tables updated to match the real Minecraft 1.21.11 registry order (from `BuiltInRegistries.ENTITY_TYPE`).
- **API.md doc updates** — Added documentation for registry endpoints; updated `viewport_entities` description to clarify frustum filtering.

## v1.2.0 — AI Endpoints + Observation Schema + Security Fixes

### ✨ New Features

- **AI-Friendly Endpoints (OpenAI Gym style)** — 6 new endpoints for Reinforcement Learning agents:
  - `POST /session` — Create/reuse AI session
  - `GET /observation` — Full structured game observation
  - `POST /action` — Send actions (12 types)
  - `POST /step` — Combined action + observation (like `env.step()`)
  - `GET /stream` — SSE streaming of observations per tick
  - `POST /close` — Close session and cancel tasks

- **Observation Schema** — Fixed-size JSON for ML tensor compatibility:
  - `viewport_blocks`: 4608 block IDs (16×9×32 frustum)
  - `viewport_entities`: Up to 16 entities with type, position, health, distance
  - `inventory.slots`: 41 fixed slots as `[item_id, count]`
  - `player.status`: `[health, food, saturation, armor, air]`
  - `player.flags`: 6 binary state indicators
  - `target`: Crosshair target with `block_id`, `distance`, `face`

- **Screen Observation** — Detect open UI screens with component extraction:
  - 37 known screen class mappings (inventory, chest, crafting, furnace, etc.)
  - Components: buttons, sliders, textboxes with type-specific properties
  - Navigation path tracking

- **AI Agent Guide** — Comprehensive documentation for AI agents:
  - `docs/en/AI_AGENT_GUIDE.md` — Complete JSON field guide + action strategies
  - `docs/vi/AI_AGENT_GUIDE.md` — Vietnamese version
  - Workflows: survival, mining, combat, building, farming
  - Error recovery and prioritization matrix

- **12 Action Types**: `key`, `select_slot`, `place`, `break`, `interact`, `jump`, `swing`, `look`, `craft`, `chat`, `command`, `click_button`

### 🐛 Bug Fixes

- **Server no longer stops on world exit** — Removed `SERVER_STOPPING → ApiServer.stop()`. API server now stays alive when leaving a world, allowing title-screen operations (click "Singleplayer", select world, etc.). Server only stops on `CLIENT_STOPPING` (Minecraft fully closes).

- **ObservationHandler async response crash** — Added `CountDownLatch` to ObservationHandler so the HTTP response is sent synchronously after the MC client thread processes the command. Previously the handler returned before the response was written, causing `curl: (18) transfer closed` errors.

- **Frustum block scanning fixed** — `viewport_blocks` was returning all zeros because:
  - `right` vector had wrong sign (`(-dirZ, 0, dirX)` → `(dirZ, 0, -dirX)`)
  - `up` vector was not perpendicular to the look direction (computed with wrong formula)
  - Fixed with proper cross products: `right = cross(world_up, dir)`, `up = cross(dir, right)`
  - Added gimbal lock handling for straight up/down look

- **Screen ID no longer shows obfuscated names** — `class_433` → `minecraft:pause` via 37 known screen class mappings + heuristic fallback

- **World name matching case-insensitive** — `ClientUIHandler` now uses `toLowerCase().contains()` for matching button text

### 🔒 Security

- **Constant-time token comparison** — Using `MessageDigest.isEqual()` instead of string comparison
- **Input validation** — Block/item IDs validated against `RESOURCE_ID` regex (`namespace:path` format)
- **Body size limit** — 1 MB max request body
- **Rate limiting** — 60 requests/second per IP
- **Thread pool increased** — TaskManager scheduler pool 4→8 threads (DoS mitigation)

### 🔧 Improvements

- **Slot bounds checking** — Hotbar slots validated 0-8, inventory slots 0-35
- **Client-side interactions** — Block breaking/placing uses `client.gameMode` instead of `client.player.gameMode` (compatible with access widener)
- **Inventory API** — Uses `inventory.getItem(i)` / `inventory.getContainerSize()` instead of private field reflection
- **Documentation** — Updated README.md, README_vi.md, docs/en/API.md, docs/vi/API.md with complete Section 8 (AI endpoints) + Section 9 (Observation Schema Details) + Section 10 (Registry Reference)
- **Registry Reference** — Added numeric ID reference for items, blocks, entities, effects, enchantments, biomes. Note: IDs are dynamic per session; use namespaced IDs (`minecraft:stone`) for stability.
