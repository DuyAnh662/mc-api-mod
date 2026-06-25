package com.mcapi.api.handlers;

import com.google.gson.JsonObject;
import com.mcapi.api.ApiServer;
import com.mcapi.api.ApiResponse;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import net.minecraft.core.BlockPos;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;
import net.minecraft.core.registries.BuiltInRegistries;
import java.io.IOException;

public class BlockHandler {

    private static BlockPos parseBlockPos(JsonObject body) {
        int x = body.get("x").getAsInt();
        int y = body.get("y").getAsInt();
        int z = body.get("z").getAsInt();
        return new BlockPos(x, y, z);
    }

    private static ServerPlayer getPlayer(MinecraftServer server, JsonObject body) {
        String playerName = body.has("player") ? body.get("player").getAsString() : "";
        if (!playerName.isEmpty()) {
            return server.getPlayerList().getPlayerByName(playerName);
        }
        return server.getPlayerList().getPlayers().isEmpty() ? null
                : server.getPlayerList().getPlayers().get(0);
    }

    public static class BreakHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!ApiServer.getInstance().checkAuth(exchange)) {
                ApiServer.sendResponse(exchange, 401, ApiResponse.jsonError(401, "Unauthorized"));
                return;
            }
            if (!"POST".equals(exchange.getRequestMethod())) {
                ApiServer.sendResponse(exchange, 405, ApiResponse.jsonError(405, "Method not allowed"));
                return;
            }
            JsonObject body = ApiServer.parseBody(ApiServer.readBody(exchange));
            if (!body.has("x") || !body.has("y") || !body.has("z")) {
                ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing x, y, or z"));
                return;
            }

            BlockPos pos = parseBlockPos(body);
            ApiServer.getInstance().queueCommand((server) -> {
                ServerLevel level = server.overworld();
                ServerPlayer player = getPlayer(server, body);
                BlockState state = level.getBlockState(pos);
                Block block = state.getBlock();

                level.destroyBlock(pos, true, player);
                if (player != null) {
                    player.gameMode.destroyBlock(pos);
                }

                JsonObject data = new JsonObject();
                data.addProperty("block", BuiltInRegistries.BLOCK.getKey(block).toString());
                data.addProperty("x", pos.getX());
                data.addProperty("y", pos.getY());
                data.addProperty("z", pos.getZ());
                data.addProperty("destroyed", true);
                ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Block broken", data).toJson());
            });

            ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Break command queued"));
        }
    }

    public static class PlaceHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!ApiServer.getInstance().checkAuth(exchange)) {
                ApiServer.sendResponse(exchange, 401, ApiResponse.jsonError(401, "Unauthorized"));
                return;
            }
            if (!"POST".equals(exchange.getRequestMethod())) {
                ApiServer.sendResponse(exchange, 405, ApiResponse.jsonError(405, "Method not allowed"));
                return;
            }
            JsonObject body = ApiServer.parseBody(ApiServer.readBody(exchange));
            if (!body.has("x") || !body.has("y") || !body.has("z")) {
                ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing x, y, or z"));
                return;
            }
            if (!body.has("block")) {
                ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing 'block' field (e.g. 'minecraft:stone')"));
                return;
            }

            BlockPos pos = parseBlockPos(body);
            String blockId = body.get("block").getAsString();
            ApiServer.getInstance().queueCommand((server) -> {

                // Use command to place block - cross-version compatible
                server.getCommands().performPrefixedCommand(
                        server.createCommandSourceStack(),
                        "setblock " + pos.getX() + " " + pos.getY() + " " + pos.getZ() + " " + blockId
                );

                JsonObject data = new JsonObject();
                data.addProperty("block", blockId);
                data.addProperty("x", pos.getX());
                data.addProperty("y", pos.getY());
                data.addProperty("z", pos.getZ());
                data.addProperty("placed", true);
                ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Block placed", data).toJson());
            });

            ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Place command queued"));
        }
    }

    public static class GetHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!ApiServer.getInstance().checkAuth(exchange)) {
                ApiServer.sendResponse(exchange, 401, ApiResponse.jsonError(401, "Unauthorized"));
                return;
            }
            String query = exchange.getRequestURI().getQuery();
            if (query == null || query.isEmpty()) {
                ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Query params x, y, z required"));
                return;
            }

            try {
                java.util.Map<String, String> params = parseQuery(query);
                int x = Integer.parseInt(params.get("x"));
                int y = Integer.parseInt(params.get("y"));
                int z = Integer.parseInt(params.get("z"));
                BlockPos pos = new BlockPos(x, y, z);

                ApiServer.getInstance().queueCommand((server) -> {
                    ServerLevel level = server.overworld();
                    BlockState state = level.getBlockState(pos);
                    Block block = state.getBlock();

                    JsonObject data = new JsonObject();
                    data.addProperty("block", BuiltInRegistries.BLOCK.getKey(block).toString());
                    data.addProperty("x", x);
                    data.addProperty("y", y);
                    data.addProperty("z", z);
                    data.addProperty("isAir", state.isAir());

                    JsonObject properties = new JsonObject();
                    for (var prop : state.getProperties()) {
                        properties.addProperty(prop.getName(), state.getValue(prop).toString());
                    }
                    data.add("properties", properties);

                    ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Block found", data).toJson());
                });

                ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Get block command queued"));
            } catch (Exception e) {
                ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Invalid query params"));
            }
        }

        private java.util.Map<String, String> parseQuery(String query) {
            java.util.Map<String, String> result = new java.util.HashMap<>();
            if (query == null) return result;
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                String[] kv = pair.split("=", 2);
                if (kv.length == 2) {
                    result.put(kv[0], kv[1]);
                }
            }
            return result;
        }
    }

    public static class InteractHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!ApiServer.getInstance().checkAuth(exchange)) {
                ApiServer.sendResponse(exchange, 401, ApiResponse.jsonError(401, "Unauthorized"));
                return;
            }
            if (!"POST".equals(exchange.getRequestMethod())) {
                ApiServer.sendResponse(exchange, 405, ApiResponse.jsonError(405, "Method not allowed"));
                return;
            }
            JsonObject body = ApiServer.parseBody(ApiServer.readBody(exchange));
            if (!body.has("x") || !body.has("y") || !body.has("z")) {
                ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing x, y, or z"));
                return;
            }

            BlockPos pos = parseBlockPos(body);
            ApiServer.getInstance().queueCommand((server) -> {
                ServerPlayer player = getPlayer(server, body);
                if (player == null) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "No players online"));
                    return;
                }

                ServerLevel level = server.overworld();
                BlockState state = level.getBlockState(pos);
                Vec3 hitVec = new Vec3(pos.getX() + 0.5, pos.getY() + 0.5, pos.getZ() + 0.5);
                BlockHitResult hitResult = new BlockHitResult(hitVec,
                        player.getDirection().getOpposite(), pos, false);

                InteractionResult result = state.useWithoutItem(level, player, hitResult);
                if (result.consumesAction()) {
                    level.updateNeighborsAt(pos, state.getBlock());
                }

                JsonObject data = new JsonObject();
                data.addProperty("block", BuiltInRegistries.BLOCK.getKey(state.getBlock()).toString());
                data.addProperty("x", pos.getX());
                data.addProperty("y", pos.getY());
                data.addProperty("z", pos.getZ());
                data.addProperty("interacted", result.consumesAction());
                ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Block interacted", data).toJson());
            });

            ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Interact command queued"));
        }
    }
}
