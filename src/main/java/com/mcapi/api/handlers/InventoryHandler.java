package com.mcapi.api.handlers;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.mcapi.api.ApiServer;
import com.mcapi.api.ApiResponse;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.item.ItemStack;

import java.io.IOException;
import java.util.List;

public class InventoryHandler {

    private static ServerPlayer getPlayer(JsonObject body) {
        String playerName = body.has("player") ? body.get("player").getAsString() : "";
        var server = com.mcapi.McApiMod.SERVER;
        if (server == null) return null;
        if (!playerName.isEmpty()) {
            return server.getPlayerList().getPlayerByName(playerName);
        }
        List<ServerPlayer> players = server.getPlayerList().getPlayers();
        return players.isEmpty() ? null : players.get(0);
    }

    public static class GetHandler implements HttpHandler {
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
                ServerPlayer player = getPlayer(new JsonObject());
                if (player == null) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "No players online"));
                    return;
                }

                var inventory = player.getInventory();
                JsonArray slots = new JsonArray();

                for (int i = 0; i < inventory.getContainerSize(); i++) {
                    ItemStack stack = inventory.getItem(i);
                    if (!stack.isEmpty()) {
                        JsonObject slotData = new JsonObject();
                        slotData.addProperty("slot", i);
                        slotData.addProperty("item", BuiltInRegistries.ITEM.getKey(stack.getItem()).toString());
                        slotData.addProperty("count", stack.getCount());
                        slotData.addProperty("name", stack.getHoverName().getString());
                        slots.add(slotData);
                    }
                }

                JsonObject data = new JsonObject();
                data.addProperty("player", player.getName().getString());
                data.addProperty("selectedSlot", inventory.selected);
                data.add("items", slots);
                ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Inventory retrieved", data).toJson());
            });

            ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Inventory query queued"));
        }
    }

    public static class SetHandler implements HttpHandler {
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
            if (!body.has("slot") || !body.has("item")) {
                ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing 'slot' or 'item'"));
                return;
            }

            int slot = body.get("slot").getAsInt();
            String itemId = body.get("item").getAsString();
            int count = body.has("count") ? body.get("count").getAsInt() : 1;

            ApiServer.getInstance().queueCommand((server) -> {
                ServerPlayer player = getPlayer(body);
                if (player == null) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "No players online"));
                    return;
                }

                // Use /item command for cross-version compatibility
                String playerName = player.getName().getString();
                server.getCommands().performPrefixedCommand(
                        server.createCommandSourceStack(),
                        "item replace entity " + playerName + " container." + slot + " with " + itemId + " " + count
                );

                JsonObject data = new JsonObject();
                data.addProperty("player", playerName);
                data.addProperty("slot", slot);
                data.addProperty("item", itemId);
                data.addProperty("count", count);
                ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Inventory slot set", data).toJson());
            });

            ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Inventory set queued"));
        }
    }

    public static class SelectHandler implements HttpHandler {
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
            if (!body.has("slot")) {
                ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing 'slot'"));
                return;
            }

            int slot = body.get("slot").getAsInt();

            ApiServer.getInstance().queueCommand((server) -> {
                ServerPlayer player = getPlayer(body);
                if (player == null) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "No players online"));
                    return;
                }
                if (slot < 0 || slot > 8) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Slot must be 0-8"));
                    return;
                }
                player.getInventory().selected = slot;

                JsonObject data = new JsonObject();
                data.addProperty("player", player.getName().getString());
                data.addProperty("selectedSlot", slot);
                ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Slot selected", data).toJson());
            });

            ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Select queued"));
        }
    }

    public static class DropHandler implements HttpHandler {
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
            if (!body.has("slot")) {
                ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing 'slot'"));
                return;
            }

            int slot = body.get("slot").getAsInt();
            boolean entireStack = body.has("all") && body.get("all").getAsBoolean();

            ApiServer.getInstance().queueCommand((server) -> {
                ServerPlayer player = getPlayer(body);
                if (player == null) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "No players online"));
                    return;
                }

                var inventory = player.getInventory();
                ItemStack stack = inventory.getItem(slot);

                if (stack.isEmpty()) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Slot is empty"));
                    return;
                }

                if (entireStack) {
                    ItemStack dropped = stack.copy();
                    inventory.setItem(slot, ItemStack.EMPTY);
                    player.drop(dropped, false, true);
                } else {
                    ItemStack dropped = stack.split(1);
                    player.drop(dropped, false, true);
                }

                JsonObject data = new JsonObject();
                data.addProperty("player", player.getName().getString());
                data.addProperty("slot", slot);
                data.addProperty("entireStack", entireStack);
                ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Item dropped", data).toJson());
            });

            ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Drop queued"));
        }
    }
}
