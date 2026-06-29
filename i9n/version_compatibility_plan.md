# Kế hoạch tương thích phiên bản — MC-API Mod

**Ngày tạo:** 29/06/2026
**Chỉnh sửa lần cuối:** 29/06/2026
**Mục tiêu:** Xác định nhóm tương thích giữa Minecraft 1.21.0 → 1.21.8 và 26.0 → 26.2

---

## 1. Tổng quan phiên bản Minecraft (Java Edition)

### Nhóm phiên bản cũ (1.21.x — 2024–2025)

| Version | Ngày phát hành | Loại | Data Pack | Resource Pack |
|---------|---------------|------|-----------|---------------|
| 1.21 | 13/06/2024 | Major (Tricky Trials) | 48 | 34 |
| 1.21.1 | 08/08/2024 | Hotfix | 48 | 34 |
| 1.21.2 | 22/10/2024 | Game drop (Bundles of Bravery) | 57 | 42 |
| 1.21.3 | 23/10/2024 | Hotfix | 57 | 42 |
| 1.21.4 | 03/12/2024 | Game drop (The Garden Awakens) | 61 | 46 |
| 1.21.5 | 25/03/2025 | Game drop (Spring to Life) | 71 | 55 |
| 1.21.6 | 17/06/2025 | Game drop (Chase the Skies) | 80 | 64 |
| 1.21.7 | 30/06/2025 | Hotfix | 81 | 64 |
| 1.21.8 | 17/07/2025 | Hotfix (graphical fixes) | 81 | 64 |

### Nhóm phiên bản mới (26.x — 2026, đánh số theo năm)

| Version | Ngày phát hành | Loại | Java | Data Pack | Ghi chú |
|---------|---------------|------|------|-----------|---------|
| 26.0 | 10/02/2026 | **Bedrock Edition** | — | — | KHÔNG có Java Edition |
| 26.1 | 24/03/2026 | Game drop (Tiny Takeover) | Java 25 | 101.1 | Phiên bản Java đầu tiên dùng số mới |
| 26.1.1 | ~04/2026 | Hotfix | Java 25 | 101.1 | |
| 26.1.2 | ~06/2026 | Hotfix | Java 25 | 101.1 | |
| 26.2 | 06/2026 | Game drop | Java 25 | 106.1 | Backend Vulkan/OpenGL |

> **26.0 là Bedrock Edition — không áp dụng cho Fabric mod (Java Edition).**

---

## 2. Yêu cầu công cụ theo phiên bản

### 2.1. Fabric Loader

Fabric Loader dùng số phiên bản `0.x.y`, **không phải** 26.x:

| Loader | Ngày | Ghi chú |
|--------|------|---------|
| 0.16.0 | 07/2024 | Đầu tiên hỗ trợ 1.21 |
| 0.16.7 | 10/2024 | Khuyên dùng cho 1.21.2/1.21.3 |
| 0.16.10 | 01/2025 | Khuyên dùng cho 1.21.5 |
| 0.16.14 | 04/2025 | Khuyên dùng cho 1.21.6/1.21.7/1.21.8 |
| 0.17.2 | 08/2025 | Khuyên dùng cho 1.21.9/1.21.10 |
| 0.18.1 | 11/2025 | Khuyên dùng cho 1.21.11 |
| 0.19.3 | 06/2026 | Mới nhất, hỗ trợ 26.2 |

**Loader tương thích ngược — bản mới nhất luôn chạy được mọi version Minecraft.**

### 2.2. Fabric Loom & Gradle

| MC Version | Loom | Gradle | Java |
|-----------|------|--------|------|
| 1.21 – 1.21.1 | 1.6+ | 8.8+ | 21 |
| 1.21.2 – 1.21.3 | 1.8+ | 8.10+ | 21 |
| 1.21.4 | 1.8+ | 8.10+ | 21 |
| 1.21.5 | 1.10+ | 8.12+ | 21 |
| 1.21.6 – 1.21.8 | 1.10+ | 8.12+ | 21 |
| 1.21.9 – 1.21.10 | 1.11+ | 8.x | 21 |
| 1.21.11 | 1.14+ | 8.x | 21 |
| **26.1.x** | **1.15+** | **9.4+** | **25** |
| **26.2** | **1.17+** | **9.5+** | **25** |

### 2.3. Fabric API

| MC Version | Fabric API |
|-----------|-----------|
| 1.21 | 0.100.0+1.21 – 0.102.0+1.21 |
| 1.21.1 | 0.102.0+1.21.1 – 0.115.0+1.21.1 |
| 1.21.2 | 0.102.2+1.21.2 – 0.106.1+1.21.2 |
| 1.21.3 | 0.106.1+1.21.3 – 0.110.0+1.21.3 |
| 1.21.4 | 0.110.0+1.21.4 – 0.119.0+1.21.4 |
| 1.21.5 | 0.119.0+1.21.5 – 0.120.0+1.21.5 |
| 1.21.6 | 0.120.0+1.21.6 – 0.120.2+1.21.6 |
| 1.21.7 | 0.120.x+1.21.7 |
| 1.21.8 | 0.130.0+1.21.8 |
| 1.21.9 | 0.134.1+1.21.9 |
| 1.21.10 | 0.138.4+1.21.10 |
| 1.21.11 | 0.141.4+1.21.11 |
| 26.1.x | 0.145.x+26.1 |
| 26.2 | 0.153.0+26.2 |

---

## 3. Nhóm tương thích (có thể gộp chung 1 bản build)

> **Cùng nhóm = cùng API surface = có thể dùng 1 bản mod cho nhiều version.**

### Nhóm A: 1.21 – 1.21.1
- Data/Resource pack: 48/34
- Loom: 1.6 – 1.7
- **Thay đổi:** Chỉ hotfix bảo mật, không breaking change
- **Kết luận: ✅ GỘP CHUNG được**

### Nhóm B: 1.21.2 – 1.21.3
- Data/Resource pack: 57/42
- Loom: 1.8 – 1.9
- Breaking change từ A: equipment/armor rework, food component change, KeyEvent class
- **Kết luận: ✅ GỘP CHUNG được (trong nhóm)**

### Nhóm C: 1.21.4
- Data/Resource pack: 61/46
- Loom: 1.8 – 1.9
- Breaking change từ B: item model system overhaul, BlockModel texture rework
- **Kết luận: ❌ RIÊNG — không chung với B**

### Nhóm D: 1.21.5
- Data/Resource pack: 71/55
- Loom: 1.10+
- Breaking change từ C: data component system refactor
- **Kết luận: ❌ RIÊNG — không chung với C**

### Nhóm E: 1.21.6 – 1.21.7 – 1.21.8
- Data/Resource pack: 80–81/64
- Loom: 1.10+
- **Thay đổi từ D:** Minor (strict JSON), hotfixes
- **Kết luận: ✅ GỘP CHUNG được (trong nhóm)**

### Nhóm F: 1.21.9 – 1.21.10 – 1.21.11 (HIỆN TẠI)
- Loom: 1.11 – 1.14
- **Kết luận: ✅ GỘP CHUNG được (trong nhóm)**
- *(Không nằm trong phạm vi yêu cầu 1.21.0–1.21.8)*

### Nhóm G: 26.1.x
- **KHÁC BIỆT LỚN:** Unobfuscated, Java 25, Loom 1.15+, Gradle 9.4+
- World storage format thay đổi
- **Kết luận: ✅ GỘP CHUNG được 26.1/26.1.1/26.1.2**
- **❌ KHÔNG tương thích với 1.21.x**

### Nhóm H: 26.2
- Data/Resource pack: 106.1/88.0
- Loom: 1.17+, Gradle 9.5+
- Breaking change từ G: Vulkan backend, registration refactor, GUI reorganization
- **Kết luận: ❌ RIÊNG — không chung với G**

---

## 4. Phân tích tương thích mã nguồn MC-API hiện tại

Mod hiện tại **target 1.21.9–1.21.11**. Code sử dụng API chỉ có từ 1.21.2+:

| API | File | Có từ | Có ở 1.21.0? |
|-----|------|-------|-------------|
| `KeyEvent` class | `ClientInputHandler.java` | 1.21.2 | ❌ |
| `MouseButtonInfo` class | `ActionHandler.java`, `ClientUIHandler.java` | 1.21.2 | ❌ |
| `BlockState.useWithoutItem()` | `BlockHandler.java` | 1.21.2 | ❌ |
| `server.setDifficulty(Difficulty, boolean)` | `SettingsHandler.java` | 1.21.2 | ❌ |
| `options.fov().set(int)` | `ClientSettingsHandler.java` | 1.21.2 | ❌ |
| `KeyboardHandler.keyPress(..., KeyEvent)` | Access widener | 1.21.2 | ❌ |
| `Level.entitiesForRendering()` | `ObservationProvider.java` | ~1.21.2 | ❌ |

> **Kết luận: Mod KHÔNG hoạt động trên 1.21.0–1.21.1. Cần có code tương thích ngược (multi-version).**

---

## 5. Đề xuất nhánh phát triển

| Nhánh | Minecraft | Phiên bản Mod | Loom | Java | Ghi chú |
|-------|-----------|--------------|------|------|---------|
| `release/1.21.0` | 1.21.0 – 1.21.1 | mc-api-mod_1.21.0-1.21.1 | 1.6 | 21 | Cần backport code |
| `release/1.21.2` | 1.21.2 – 1.21.3 | mc-api-mod_1.21.2-1.21.3 | 1.8 | 21 | Cần backport code |
| `release/1.21.4` | 1.21.4 | mc-api-mod_1.21.4 | 1.8 | 21 | Cần backport code |
| `release/1.21.5` | 1.21.5 | mc-api-mod_1.21.5 | 1.10 | 21 | Cần backport code |
| `release/1.21.6` | 1.21.6 – 1.21.8 | mc-api-mod_1.21.6-1.21.8 | 1.10 | 21 | Cần backport code |
| `main` (hiện tại) | 1.21.9 – 1.21.11 | mc-api-mod_1.21.9-1.21.11 | 1.14 | 21 | Đã hoạt động |
| `release/26.1` | 26.1.x | mc-api-mod_26.1 | 1.15 | 25 | Cần port lại toàn bộ |
| `release/26.2` | 26.2 | mc-api-mod_26.2 | 1.17 | 25 | Cần port lại toàn bộ |

### Xử lý đa version trong 1 bản build

Để 1 bản mod chạy trên nhiều MC version, có thể dùng:
1. **Refmap + Multi-version mappings** — mỗi version có mapping riêng
2. **`@Environment` + `@Shadow`** — Mixin có điều kiện
3. **Gradle build variants** — build riêng từng version từ 1 source
4. **Arch Loom / Multi-version** — công cụ chuyên dụng

---

## 6. Cấu hình gradle.properties cho từng nhóm

### Nhóm E (1.21.6 – 1.21.8) — ƯU TIÊN CAO NHẤT
```properties
mod_version = 1.3.0
maven_group = com.mcapi
archives_base_name = mc-api-mod_1.21.6-1.21.8

minecraft_version = 1.21.8
loader_version = 0.16.14
fabric_version = 0.130.0+1.21.8
loom_version = 1.10
```

### Nhóm B (1.21.2 – 1.21.3)
```properties
archives_base_name = mc-api-mod_1.21.2-1.21.3
minecraft_version = 1.21.3
loader_version = 0.16.7
fabric_version = 0.106.1+1.21.3
loom_version = 1.8
```

### Nhóm D (1.21.5)
```properties
archives_base_name = mc-api-mod_1.21.5
minecraft_version = 1.21.5
loader_version = 0.16.10
fabric_version = 0.119.0+1.21.5
loom_version = 1.10
```

---

## 7. Kế hoạch hành động

1. ✅ Nghiên cứu thông tin phiên bản (đã xong)
2. ✅ Xác định nhóm tương thích (đã xong)
3. ⬜ **Tạo nhánh Git riêng** cho từng nhóm
4. ⬜ **Backport code** cho từng nhóm (sửa API breaking change)
5. ⬜ Cập nhật `gradle.properties` cho nhóm mục tiêu
6. ⬜ Build và test

### Lưu ý quan trọng
- **1.21.0–1.21.1:** Cần viết lại code dùng `KeyEvent`, `MouseButtonInfo`, `useWithoutItem()`, v.v.
- **26.1+:** Cần Java 25, Gradle 9.4+, Loom 1.15+ — toàn bộ toolchain thay đổi
- **26.0:** Không tồn tại cho Java Edition
