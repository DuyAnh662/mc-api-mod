package com.mcapi.api;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.HitResult;
import net.minecraft.world.phys.Vec3;

public class ObservationProvider {

    private static final int PROTOCOL_VERSION = 1;
    private static final int VIEWPORT_WIDTH = 16;
    private static final int VIEWPORT_HEIGHT = 9;
    private static final int VIEWPORT_DEPTH = 32;
    private static final int TOTAL_SLOTS = 41;

    public static JsonObject generateObservation() {
        JsonObject obs = new JsonObject();
        obs.addProperty("protocol", PROTOCOL_VERSION);

        Minecraft client = Minecraft.getInstance();
        LocalPlayer player = client.player;
        ClientLevel level = client.level;

        if (player == null || level == null) {
            obs.addProperty("tick", 0);
            obs.add("world", emptyWorld());
            obs.add("player", emptyPlayer());
            obs.add("camera", emptyCamera());
            obs.add("inventory", emptyInventory());
            obs.add("target", emptyTarget());
            obs.add("viewport_blocks", emptyViewportBlocks());
            obs.add("viewport_entities", emptyViewportEntities());
            return obs;
        }

        obs.addProperty("tick", level.getGameTime());

        obs.add("world", buildWorld(level));
        obs.add("player", buildPlayer(player));
        obs.add("camera", buildCamera(client));
        obs.add("inventory", buildInventory(player));
        obs.add("target", buildTarget(player, client));
        obs.add("viewport_blocks", buildViewportBlocks(player, level));
        obs.add("viewport_entities", buildViewportEntities(player, level));

        return obs;
    }

    private static JsonObject emptyWorld() {
        JsonObject w = new JsonObject();
        w.addProperty("time", 0);
        w.addProperty("day", 0);
        w.addProperty("is_day", true);
        w.addProperty("weather", "clear");
        w.addProperty("dimension", 0);
        return w;
    }

    private static JsonObject emptyPlayer() {
        JsonObject p = new JsonObject();
        JsonArray pos = new JsonArray();
        pos.add(0); pos.add(0); pos.add(0);
        p.add("position", pos);
        JsonObject rot = new JsonObject();
        rot.addProperty("yaw", 0);
        rot.addProperty("pitch", 0);
        rot.addProperty("facing", "South");
        p.add("rotation", rot);
        JsonArray vel = new JsonArray();
        vel.add(0); vel.add(0); vel.add(0);
        p.add("velocity", vel);
        JsonArray status = new JsonArray();
        status.add(20); status.add(20); status.add(20); status.add(0); status.add(300);
        p.add("status", status);
        JsonArray flags = new JsonArray();
        for (int i = 0; i < 6; i++) flags.add(0);
        p.add("flags", flags);
        return p;
    }

    private static JsonObject emptyCamera() {
        JsonObject c = new JsonObject();
        c.addProperty("fov", 70);
        JsonArray m = new JsonArray();
        m.add(VIEWPORT_WIDTH); m.add(VIEWPORT_HEIGHT); m.add(VIEWPORT_DEPTH);
        c.add("matrix", m);
        return c;
    }

    private static JsonObject emptyInventory() {
        JsonObject inv = new JsonObject();
        JsonArray slots = new JsonArray();
        for (int i = 0; i < TOTAL_SLOTS; i++) {
            JsonArray slot = new JsonArray();
            slot.add(0); slot.add(0);
            slots.add(slot);
        }
        inv.add("slots", slots);
        inv.addProperty("selected_slot", 0);
        return inv;
    }

    private static JsonObject emptyTarget() {
        JsonObject t = new JsonObject();
        t.addProperty("block_id", 0);
        t.addProperty("distance", 0);
        t.addProperty("face", 0);
        return t;
    }

    private static JsonArray emptyViewportBlocks() {
        JsonArray arr = new JsonArray();
        int size = VIEWPORT_WIDTH * VIEWPORT_HEIGHT * VIEWPORT_DEPTH;
        for (int i = 0; i < size; i++) arr.add(0);
        return arr;
    }

    private static JsonArray emptyViewportEntities() {
        return new JsonArray();
    }

    private static JsonObject buildWorld(ClientLevel level) {
        JsonObject w = new JsonObject();
        long dayTime = level.getDayTime();
        w.addProperty("time", dayTime % 24000L);
        w.addProperty("day", dayTime / 24000L);
        w.addProperty("is_day", dayTime % 24000L < 13000L);

        if (level.isThundering()) {
            w.addProperty("weather", "thunder");
        } else if (level.isRaining()) {
            w.addProperty("weather", "rain");
        } else {
            w.addProperty("weather", "clear");
        }

        var dim = level.dimension();
        int dimId = 0;
        if (dim == Level.NETHER) dimId = 1;
        else if (dim == Level.END) dimId = 2;
        w.addProperty("dimension", dimId);

        return w;
    }

    private static JsonObject buildPlayer(LocalPlayer player) {
        JsonObject p = new JsonObject();

        JsonArray pos = new JsonArray();
        pos.add(player.getX());
        pos.add(player.getY());
        pos.add(player.getZ());
        p.add("position", pos);

        JsonObject rot = new JsonObject();
        float yaw = player.getYRot();
        float pitch = player.getXRot();
        rot.addProperty("yaw", yaw);
        rot.addProperty("pitch", pitch);
        rot.addProperty("facing", getFacing(yaw));
        p.add("rotation", rot);

        JsonArray vel = new JsonArray();
        Vec3 v = player.getDeltaMovement();
        vel.add(v.x);
        vel.add(v.y);
        vel.add(v.z);
        p.add("velocity", vel);

        JsonArray status = new JsonArray();
        status.add((int) player.getHealth());
        status.add(player.getFoodData().getFoodLevel());
        status.add((int) player.getFoodData().getSaturationLevel());
        status.add(player.getArmorValue());
        status.add(player.getAirSupply());
        p.add("status", status);

        JsonArray flags = new JsonArray();
        flags.add(player.onGround() ? 1 : 0);
        flags.add(player.isSprinting() ? 1 : 0);
        flags.add(player.isShiftKeyDown() ? 1 : 0);
        flags.add(player.isSwimming() ? 1 : 0);
        flags.add(player.isFallFlying() ? 1 : 0);
        flags.add(player.isSleeping() ? 1 : 0);
        p.add("flags", flags);

        return p;
    }

    private static String getFacing(float yaw) {
        double d = yaw % 360;
        if (d < -45) d += 360;
        if (d < 45) return "South";
        if (d < 135) return "West";
        if (d < 225) return "North";
        if (d < 315) return "East";
        return "South";
    }

    private static JsonObject buildCamera(Minecraft client) {
        JsonObject c = new JsonObject();
        double fov = 70;
        if (client.options != null) {
            fov = client.options.fov().get();
        }
        c.addProperty("fov", fov);
        JsonArray m = new JsonArray();
        m.add(VIEWPORT_WIDTH);
        m.add(VIEWPORT_HEIGHT);
        m.add(VIEWPORT_DEPTH);
        c.add("matrix", m);
        return c;
    }

    private static JsonObject buildInventory(LocalPlayer player) {
        JsonObject inv = new JsonObject();
        JsonArray slots = new JsonArray();
        var inventory = player.getInventory();

        for (int i = 0; i < inventory.getContainerSize(); i++) {
            ItemStack stack = inventory.getItem(i);
            JsonArray slot = new JsonArray();
            if (stack.isEmpty()) {
                slot.add(0); slot.add(0);
            } else {
                int id = BuiltInRegistries.ITEM.getId(stack.getItem());
                slot.add(id);
                slot.add(stack.getCount());
            }
            slots.add(slot);
        }

        inv.add("slots", slots);
        inv.addProperty("selected_slot", inventory.selected);
        return inv;
    }

    private static JsonObject buildTarget(LocalPlayer player, Minecraft client) {
        JsonObject t = new JsonObject();

        if (client.hitResult != null && client.hitResult.getType() == HitResult.Type.BLOCK) {
            BlockHitResult blockHit = (BlockHitResult) client.hitResult;
            BlockPos blockPos = blockHit.getBlockPos();
            if (player.level() != null) {
                BlockState state = player.level().getBlockState(blockPos);
                int blockId = BuiltInRegistries.BLOCK.getId(state.getBlock());
                t.addProperty("block_id", blockId);
            } else {
                t.addProperty("block_id", 0);
            }

            double dist = player.distanceToSqr(Vec3.atCenterOf(blockPos));
            t.addProperty("distance", Math.sqrt(dist));
            t.addProperty("face", directionToFaceIndex(blockHit.getDirection()));
        } else {
            t.addProperty("block_id", 0);
            t.addProperty("distance", 0);
            t.addProperty("face", 0);
        }

        return t;
    }

    private static int directionToFaceIndex(Direction dir) {
        return switch (dir) {
            case DOWN -> 1;
            case UP -> 0;
            case NORTH -> 2;
            case SOUTH -> 3;
            case WEST -> 4;
            case EAST -> 5;
        };
    }

    private static JsonArray buildViewportBlocks(LocalPlayer player, ClientLevel level) {
        int total = VIEWPORT_WIDTH * VIEWPORT_HEIGHT * VIEWPORT_DEPTH;
        JsonArray arr = new JsonArray();

        float yaw = player.getYRot();
        float pitch = player.getXRot();

        double yawRad = Math.toRadians(yaw);
        double pitchRad = Math.toRadians(pitch);

        double dirX = -Math.sin(yawRad) * Math.cos(pitchRad);
        double dirY = -Math.sin(pitchRad);
        double dirZ = Math.cos(yawRad) * Math.cos(pitchRad);

        Vec3 eyePos = player.getEyePosition();

        int halfW = VIEWPORT_WIDTH / 2;
        int halfH = VIEWPORT_HEIGHT / 2;

        // right = cross(world_up, dir), up = cross(dir, right)
        Vec3 right = new Vec3(dirZ, 0, -dirX).normalize();
        if (Double.isNaN(right.x) || Double.isNaN(right.y) || Double.isNaN(right.z)) {
            right = new Vec3(1, 0, 0);
        }
        Vec3 up = new Vec3(
                dirY * right.z - dirZ * right.y,
                dirZ * right.x - dirX * right.z,
                dirX * right.y - dirY * right.x
        ).normalize();

        for (int d = 0; d < VIEWPORT_DEPTH; d++) {
            double depth = d + 1;
            for (int h = 0; h < VIEWPORT_HEIGHT; h++) {
                double heightOffset = (h - halfH) * 0.5;
                for (int w = 0; w < VIEWPORT_WIDTH; w++) {
                    double widthOffset = (w - halfW) * 0.5;

                    Vec3 samplePos = eyePos
                            .add(new Vec3(dirX * depth, dirY * depth, dirZ * depth))
                            .add(right.scale(widthOffset))
                            .add(up.scale(heightOffset));

                    BlockPos bp = BlockPos.containing(samplePos);
                    int blockId = 0;
                    if (level.isLoaded(bp)) {
                        BlockState state = level.getBlockState(bp);
                        if (!state.isAir()) {
                            blockId = BuiltInRegistries.BLOCK.getId(state.getBlock());
                        }
                    }
                    arr.add(blockId);
                }
            }
        }

        while (arr.size() < total) {
            arr.add(0);
        }

        return arr;
    }

    private static double getPlayerFov(Minecraft client) {
        double fov = 70;
        if (client.options != null) {
            fov = client.options.fov().get();
        }
        return fov;
    }

    private static boolean isEntityInViewport(LocalPlayer player, Entity entity, double fov) {
        Vec3 lookDir = player.getLookAngle();
        Vec3 toEntity = entity.position().subtract(player.getEyePosition()).normalize();

        double cosAngle = lookDir.dot(toEntity);
        cosAngle = Math.max(-1.0, Math.min(1.0, cosAngle));
        double angleDeg = Math.toDegrees(Math.acos(cosAngle));

        return angleDeg <= fov / 2.0;
    }

    private static JsonArray buildViewportEntities(LocalPlayer player, ClientLevel level) {
        JsonArray arr = new JsonArray();
        int count = 0;

        Minecraft client = Minecraft.getInstance();
        double fov = getPlayerFov(client);
        Vec3 playerPos = player.position();
        double maxDist = 48.0;

        for (Entity entity : level.entitiesForRendering()) {
            if (entity == player) continue;
            if (count >= 16) break;

            Vec3 rel = entity.position().subtract(playerPos);
            double dist = rel.length();
            if (dist > maxDist) continue;
            if (!isEntityInViewport(player, entity, fov)) continue;

            JsonArray e = new JsonArray();
            e.add(BuiltInRegistries.ENTITY_TYPE.getId(entity.getType()));
            e.add(rel.x);
            e.add(rel.y);
            e.add(rel.z);
            e.add(entity.getYRot());
            e.add(entity.getXRot());

            float health = 0;
            if (entity instanceof net.minecraft.world.entity.LivingEntity living) {
                health = living.getHealth();
            }
            e.add(health);
            e.add(dist);

            arr.add(e);
            count++;
        }

        return arr;
    }
}
