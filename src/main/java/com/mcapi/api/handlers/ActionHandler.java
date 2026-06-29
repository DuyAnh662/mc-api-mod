package com.mcapi.api.handlers;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mcapi.api.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import net.minecraft.client.KeyMapping;
import net.minecraft.network.chat.Component;
import net.minecraft.server.level.ServerPlayer;
import com.mojang.blaze3d.platform.InputConstants;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class ActionHandler implements HttpHandler {
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
        if (!body.has("actions")) {
            ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing 'actions' array"));
            return;
        }

        JsonArray actions = body.getAsJsonArray("actions");
        int count = processActions(actions);

        JsonObject data = new JsonObject();
        data.addProperty("actions_queued", count);
        ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Actions queued", data).toJson());
    }

    public static int processActions(JsonArray actions) {
        int count = 0;
        for (JsonElement el : actions) {
            JsonObject action = el.getAsJsonObject();
            String type = action.has("type") ? action.get("type").getAsString() : "";
            processAction(type, action);
            count++;
        }
        return count;
    }

    private static void processAction(String type, JsonObject action) {
        switch (type) {
            case "key" -> handleKey(action);
            case "select_slot" -> handleSelectSlot(action);
            case "place" -> handlePlace(action);
            case "break" -> handleBreak(action);
            case "interact" -> handleInteract(action);
            case "jump" -> handleJump();
            case "swing" -> handleSwing();
            case "look" -> handleLook(action);
            case "craft" -> handleCraft(action);
            case "chat" -> handleChat(action);
            case "command" -> handleCommand(action);
            case "click_button" -> handleClickButton(action);
        }
    }

    private static void handleKey(JsonObject action) {
        JsonArray keysArray = action.getAsJsonArray("keys");
        if (keysArray == null) return;
        List<InputConstants.Key> keys = new ArrayList<>();
        for (JsonElement k : keysArray) {
            keys.add(KeyAliasMap.resolve(k.getAsString()));
        }
        long duration = action.has("duration") ? action.get("duration").getAsLong() : 0;

        ApiServer.getInstance().queueClientCommand((client) -> {
            for (InputConstants.Key key : keys) {
                TaskManager.getInstance().trackKey(key);
                KeyMapping.set(key, true);
                client.keyboardHandler.keyPress(client.getWindow().getWindow(), key.getValue(), 0, 1, 0);
            }
        });

        if (duration > 0) {
            TaskManager.getInstance().schedule(() -> {
                ApiServer.getInstance().queueClientCommand((client) -> {
                    for (InputConstants.Key key : keys) {
                        TaskManager.getInstance().untrackKey(key);
                        KeyMapping.set(key, false);
                        client.keyboardHandler.keyPress(client.getWindow().getWindow(), key.getValue(), 0, 0, 0);
                    }
                });
            }, duration);
        } else {
            ApiServer.getInstance().queueClientCommand((client) -> {
                for (InputConstants.Key key : keys) {
                    TaskManager.getInstance().untrackKey(key);
                    KeyMapping.set(key, false);
                    client.keyboardHandler.keyPress(client.getWindow().getWindow(), key.getValue(), 0, 0, 0);
                }
            });
        }
    }

    private static void handleSelectSlot(JsonObject action) {
        if (!action.has("slot")) return;
        int slot = action.get("slot").getAsInt();

        ApiServer.getInstance().queueCommand((server) -> {
            List<ServerPlayer> players = server.getPlayerList().getPlayers();
            if (!players.isEmpty()) {
                ServerPlayer player = players.get(0);
                if (slot >= 0 && slot <= 8) {
                    player.getInventory().selected = slot;
                }
            }
        });
    }

    private static void handlePlace(JsonObject action) {
        String face = action.has("face") ? action.get("face").getAsString() : "up";

        ApiServer.getInstance().queueClientCommand((client) -> {
            if (client.player == null || client.level == null) return;
            net.minecraft.core.Direction dir = switch (face.toLowerCase()) {
                case "down" -> net.minecraft.core.Direction.DOWN;
                case "north" -> net.minecraft.core.Direction.NORTH;
                case "south" -> net.minecraft.core.Direction.SOUTH;
                case "west" -> net.minecraft.core.Direction.WEST;
                case "east" -> net.minecraft.core.Direction.EAST;
                default -> net.minecraft.core.Direction.UP;
            };
            var hitResult = client.hitResult;
            if (hitResult != null && hitResult.getType() == net.minecraft.world.phys.HitResult.Type.BLOCK) {
                var blockHit = (net.minecraft.world.phys.BlockHitResult) hitResult;
                var placePos = blockHit.getBlockPos().relative(dir);
                var hand = net.minecraft.world.InteractionHand.MAIN_HAND;
                var stack = client.player.getItemInHand(hand);
                if (!stack.isEmpty()) {
                    client.gameMode.useItemOn(client.player, hand,
                            new net.minecraft.world.phys.BlockHitResult(
                                    net.minecraft.world.phys.Vec3.atCenterOf(placePos),
                                    dir.getOpposite(), placePos, false));
                }
            }
        });
    }

    private static void handleBreak(JsonObject action) {
        ApiServer.getInstance().queueClientCommand((client) -> {
            if (client.player == null || client.level == null) return;
            var hitResult = client.hitResult;
            if (hitResult != null && hitResult.getType() == net.minecraft.world.phys.HitResult.Type.BLOCK) {
                var blockHit = (net.minecraft.world.phys.BlockHitResult) hitResult;
                // Survival mining: gửi start destroy packet → block đứt tự nhiên, drop item
                client.gameMode.startDestroyBlock(blockHit.getBlockPos(), blockHit.getDirection());
            }
        });
    }

    private static void handleInteract(JsonObject action) {
        ApiServer.getInstance().queueClientCommand((client) -> {
            if (client.player == null || client.level == null) return;
            var hitResult = client.hitResult;
            if (hitResult != null && hitResult.getType() == net.minecraft.world.phys.HitResult.Type.BLOCK) {
                client.gameMode.useItemOn(client.player, net.minecraft.world.InteractionHand.MAIN_HAND,
                        (net.minecraft.world.phys.BlockHitResult) hitResult);
            }
        });
    }

    private static void handleJump() {
        ApiServer.getInstance().queueCommand((server) -> {
            List<ServerPlayer> players = server.getPlayerList().getPlayers();
            if (!players.isEmpty()) {
                players.get(0).jumpFromGround();
            }
        });
    }

    private static void handleSwing() {
        ApiServer.getInstance().queueClientCommand((client) -> {
            if (client.player != null) {
                client.player.swing(net.minecraft.world.InteractionHand.MAIN_HAND);
            }
        });
    }

    private static void handleLook(JsonObject action) {
        float absYaw = action.has("yaw") ? action.get("yaw").getAsFloat() : Float.NaN;
        float absPitch = action.has("pitch") ? action.get("pitch").getAsFloat() : Float.NaN;
        float deltaYaw = action.has("deltaYaw") ? action.get("deltaYaw").getAsFloat() : 0;
        float deltaPitch = action.has("deltaPitch") ? action.get("deltaPitch").getAsFloat() : 0;

        ApiServer.getInstance().queueCommand((server) -> {
            List<ServerPlayer> players = server.getPlayerList().getPlayers();
            if (players.isEmpty()) return;
            ServerPlayer player = players.get(0);

            float newYaw = player.getYRot();
            float newPitch = player.getXRot();

            if (!Float.isNaN(absYaw)) {
                newYaw = absYaw;
            } else if (deltaYaw != 0) {
                newYaw += deltaYaw;
            }
            if (!Float.isNaN(absPitch)) {
                newPitch = absPitch;
            } else if (deltaPitch != 0) {
                newPitch += deltaPitch;
            }

            newPitch = Math.max(-90.0f, Math.min(90.0f, newPitch));

            player.setYRot(newYaw);
            player.setXRot(newPitch);
            player.yRotO = newYaw;
            player.xRotO = newPitch;
            player.setYHeadRot(newYaw);
            player.connection.teleport(player.getX(), player.getY(), player.getZ(), newYaw, newPitch);
        });
    }

    private static void handleCraft(JsonObject action) {
        if (!action.has("recipe")) return;
        String recipe = action.get("recipe").getAsString();
        String mode = action.has("mode") ? action.get("mode").getAsString() : "craft_once";

        ApiServer.getInstance().queueCommand((server) -> {
            server.getCommands().performPrefixedCommand(
                    server.createCommandSourceStack(),
                    "recipe give @p " + recipe
            );
        });
    }

    private static void handleChat(JsonObject action) {
        if (!action.has("message")) return;
        String message = action.get("message").getAsString();

        ApiServer.getInstance().queueCommand((server) -> {
            server.getPlayerList().broadcastSystemMessage(Component.literal(message), false);
        });
    }

    private static void handleCommand(JsonObject action) {
        if (!action.has("command")) return;
        String command = action.get("command").getAsString();

        ApiServer.getInstance().queueCommand((server) -> {
            server.getCommands().performPrefixedCommand(server.createCommandSourceStack(), command);
        });
    }

    private static void handleClickButton(JsonObject action) {
        if (!action.has("button_text")) return;
        String buttonText = action.get("button_text").getAsString();

        ApiServer.getInstance().queueClientCommand((client) -> {
            var screen = client.screen;
            if (screen == null) return;

            for (var element : screen.children()) {
                if (element instanceof net.minecraft.client.gui.components.Button button) {
                    String btnText = button.getMessage().getString();
                    if (btnText.contains(buttonText)) {
                        button.onPress();
                        break;
                    }
                }
            }
        });
    }
}
