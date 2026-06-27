# Fabric Research Update - 27/06/2026

> **Created:** 27/06/2026
> **Last Modified:** 27/06/2026
> **Purpose:** Xác minh phiên bản mới nhất của Fabric toolchain cho Minecraft 1.21.11

## 1. Minecraft 1.21.11

- **Là phiên bản obfuscated cuối cùng** của Minecraft (theo thông báo từ Mojang tháng 10/2025).
- Version tiếp theo là **26.1** (non-obfuscated, dùng tên class readable).
- Java requirement: **JDK 21**.
- Nguồn: https://fabricmc.net/2025/12/05/12111.html

## 2. Fabric Loader

- Phiên bản hiện tại đang dùng: **0.19.3** (xác nhận latest stable).
- Các bản mới hơn: 0.19.3 là latest (06/2026), support enum extensions, Mixin 0.17.3.
- Nguồn: https://github.com/FabricMC/fabric-loader/releases

## 3. Fabric Loom

- Phiên bản đang dùng: **1.14.10** (dành cho Minecraft 1.21.11 obfuscated).
- Lưu ý: Từ Loom 1.14, có sự phân tách plugin ID:
  - `net.fabricmc.fabric-loom` — cho non-obfuscated (MC 26.1+)
  - `net.fabricmc.fabric-loom-remap` — cho obfuscated (MC 1.21.11 trở về trước)
  - `fabric-loom` — legacy (vẫn dùng được cho obfuscated, tương thích ngược)
- Phiên bản mới nhất hiện nay: Loom **1.17.12** (dành cho MC 26.2).
- Phiên bản 1.14.x vẫn là lựa chọn ổn định cho MC 1.21.11.
- Nguồn: https://docs.fabricmc.net/develop/loom/

## 4. Fabric API

- Phiên bản đang dùng: **0.141.4+1.21.11**.
- Xác nhận đây là bản mới nhất cho 1.21.11 (phát hành 11/05/2026).
- Nguồn: https://www.curseforge.com/minecraft/mc-mods/fabric-api/files/8073350

## 5. Gradle

- Phiên bản wrapper hiện tại: **Gradle 9.6.0**.
- Loom 1.14 yêu cầu Gradle tối thiểu 9.2.
- Gradle 9.6.0 là phiên bản mới nhất (phát hành 20/06/2026).
- Nguồn: gradle-wrapper.properties, https://gradle.org/releases/

## 6. Tổng kết

| Component | Version đang dùng | Latest | Ghi chú |
|-----------|-------------------|--------|---------|
| Minecraft | 1.21.11 | 26.2 | 1.21.11 là obfuscated cuối |
| Fabric Loader | 0.19.3 | 0.19.3 | Latest stable |
| Fabric Loom | 1.14.10 | 1.17.12 | Giữ 1.14.10 cho 1.21.11 |
| Fabric API | 0.141.4+1.21.11 | 0.153.1+26.3 | Giữ cho 1.21.11 |
| Gradle | 9.6.0 | 9.6.0 | Latest |
| Java | 21 | 25 (cho MC 26.1+) | Giữ 21 cho 1.21.11 |

**Kết luận:** Các phiên bản đang dùng đều là mới nhất hoặc phù hợp nhất cho Minecraft 1.21.11. Không cần nâng cấp toolchain. Tập trung vào fix bảo mật và ổn định code.

## 7. Tham khảo

- Fabric Blog: https://fabricmc.net/blog/
- Fabric Docs (Loom): https://docs.fabricmc.net/develop/loom/
- Fabric Develop: https://fabricmc.net/develop/
- Fabric Loader Releases: https://github.com/FabricMC/fabric-loader/releases
- Fabric Loom Releases: https://github.com/FabricMC/fabric-loom/releases
- Gradle Releases: https://gradle.org/releases/
