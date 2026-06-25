package com.mcapi.api.handlers;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.mcapi.api.ApiServer;
import com.mcapi.api.ApiResponse;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.phys.Vec3;

import java.io.IOException;
import java.util.List;

public class PlayerHandler {

    private static ServerPlayer getPlayer(com.google.gson.JsonObject body) {
        String playerName = body.has("player") ? body.get("player").getAsString() : "";
        var server = com.mcapi.McApiMod.SERVER;
        if (server == null) return null;
        if (!playerName.isEmpty()) {
            return server.getPlayerList().getPlayerByName(playerName);
        }
        List<ServerPlayer> players = server.getPlayerList().getPlayers();
        return players.isEmpty() ? null : players.get(0);
    }

    public static class TeleportHandler implements HttpHandler {
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
            var body = ApiServer.parseBody(ApiServer.readBody(exchange));
            if (!body.has("x") || !body.has("y") || !body.has("z")) {
                ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing x, y, or z"));
                return;
            }

            double x = body.get("x").getAsDouble();
            double y = body.get("y").getAsDouble();
            double z = body.get("z").getAsDouble();
            float yaw = body.has("yaw") ? body.get("yaw").getAsFloat() : Float.NaN;
            float pitch = body.has("pitch") ? body.get("pitch").getAsFloat() : Float.NaN;

            ApiServer.getInstance().queueCommand((server) -> {
                ServerPlayer player = getPlayer(body);
                if (player == null) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "No players online"));
                    return;
                }
                player.teleportTo(x, y, z);
                if (!Float.isNaN(yaw)) player.setYRot(yaw);
                if (!Float.isNaN(pitch)) player.setXRot(pitch);

                var data = new JsonObject();
                data.addProperty("player", player.getName().getString());
                data.addProperty("x", x);
                data.addProperty("y", y);
                data.addProperty("z", z);
                ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Teleported", data).toJson());
            });

            ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Teleport queued"));
        }
    }

    public static class LookHandler implements HttpHandler {
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
            var body = ApiServer.parseBody(ApiServer.readBody(exchange));
            float yaw = body.has("yaw") ? body.get("yaw").getAsFloat() : Float.NaN;
            float pitch = body.has("pitch") ? body.get("pitch").getAsFloat() : Float.NaN;
            float deltaYaw = body.has("deltaYaw") ? body.get("deltaYaw").getAsFloat() : 0f;
            float deltaPitch = body.has("deltaPitch") ? body.get("deltaPitch").getAsFloat() : 0f;

            ApiServer.getInstance().queueCommand((server) -> {
                ServerPlayer player = getPlayer(body);
                if (player == null) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "No players online"));
                    return;
                }

                if (!Float.isNaN(yaw)) {
                    player.setYRot(yaw);
                } else if (deltaYaw != 0f) {
                    player.setYRot(player.getYRot() + deltaYaw);
                }

                if (!Float.isNaN(pitch)) {
                    player.setXRot(pitch);
                } else if (deltaPitch != 0f) {
                    player.setXRot(player.getXRot() + deltaPitch);
                }

                var data = new JsonObject();
                data.addProperty("player", player.getName().getString());
                data.addProperty("yaw", player.getYRot());
                data.addProperty("pitch", player.getXRot());
                ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Look direction set", data).toJson());
            });

            ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Look command queued"));
        }
    }

    public static class PositionHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!ApiServer.getInstance().checkAuth(exchange)) {
                ApiServer.sendResponse(exchange, 401, ApiResponse.jsonError(401, "Unauthorized"));
                return;
            }
            String method = exchange.getRequestMethod();
            var body = ApiServer.parseBody(ApiServer.readBody(exchange));

            if ("POST".equals(method)) {
                if (!body.has("x") || !body.has("y") || !body.has("z")) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing x, y, or z"));
                    return;
                }
                double x = body.get("x").getAsDouble();
                double y = body.get("y").getAsDouble();
                double z = body.get("z").getAsDouble();

                ApiServer.getInstance().queueCommand((server) -> {
                    ServerPlayer player = getPlayer(body);
                    if (player == null) {
                        ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "No players online"));
                        return;
                    }
                    player.teleportTo(x, y, z);
                    var data = new JsonObject();
                    data.addProperty("player", player.getName().getString());
                    data.addProperty("x", x);
                    data.addProperty("y", y);
                    data.addProperty("z", z);
                    ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Position set", data).toJson());
                });
                ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Position update queued"));
            } else if ("GET".equals(method)) {
                ApiServer.getInstance().queueCommand((server) -> {
                    ServerPlayer player = getPlayer(body);
                    if (player == null) {
                        ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "No players online"));
                        return;
                    }
                    Vec3 pos = player.position();
                    var data = new JsonObject();
                    data.addProperty("player", player.getName().getString());
                    data.addProperty("x", pos.x);
                    data.addProperty("y", pos.y);
                    data.addProperty("z", pos.z);
                    data.addProperty("yaw", player.getYRot());
                    data.addProperty("pitch", player.getXRot());
                    data.addProperty("dimension", player.level().dimension().toString());
                    ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Player position", data).toJson());
                });
                ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Position query queued"));
            } else {
                ApiServer.sendResponse(exchange, 405, ApiResponse.jsonError(405, "Method not allowed"));
            }
        }
    }

    public static class JumpHandler implements HttpHandler {
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
            var body = ApiServer.parseBody(ApiServer.readBody(exchange));

            ApiServer.getInstance().queueCommand((server) -> {
                ServerPlayer player = getPlayer(body);
                if (player == null) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "No players online"));
                    return;
                }
                player.jumpFromGround();
                var data = new JsonObject();
                data.addProperty("player", player.getName().getString());
                data.addProperty("jumped", true);
                ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Jumped", data).toJson());
            });

            ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Jump queued"));
        }
    }

    public static class SwingHandler implements HttpHandler {
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
            var body = ApiServer.parseBody(ApiServer.readBody(exchange));

            ApiServer.getInstance().queueCommand((server) -> {
                ServerPlayer player = getPlayer(body);
                if (player == null) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "No players online"));
                    return;
                }
                player.swing(net.minecraft.world.InteractionHand.MAIN_HAND);
                var data = new JsonObject();
                data.addProperty("player", player.getName().getString());
                data.addProperty("swung", true);
                ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Swing hand", data).toJson());
            });

            ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Swing queued"));
        }
    }

    public static class ListHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!ApiServer.getInstance().checkAuth(exchange)) {
                ApiServer.sendResponse(exchange, 401, ApiResponse.jsonError(401, "Unauthorized"));
                return;
            }
            if (!"GET".equals(exchange.getRequestMethod())) {
                ApiServer.sendResponse(exchange, 405, ApiResponse.jsonError(405, "Method not allowed"));
                return;
            }

            ApiServer.getInstance().queueCommand((server) -> {
                var players = server.getPlayerList().getPlayers();
                JsonArray playerList = new JsonArray();
                for (ServerPlayer p : players) {
                    JsonObject pdata = new JsonObject();
                    pdata.addProperty("name", p.getName().getString());
                    pdata.addProperty("uuid", p.getUUID().toString());
                    pdata.addProperty("x", p.position().x);
                    pdata.addProperty("y", p.position().y);
                    pdata.addProperty("z", p.position().z);
                    pdata.addProperty("health", p.getHealth());
                    pdata.addProperty("dimension", p.level().dimension().toString());
                    playerList.add(pdata);
                }
                JsonObject data = new JsonObject();
                data.add("players", playerList);
                data.addProperty("count", playerList.size());
                ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Player list", data).toJson());
            });

            ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("List query queued"));
        }
    }
}
