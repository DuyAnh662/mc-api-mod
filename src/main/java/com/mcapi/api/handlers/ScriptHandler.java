package com.mcapi.api.handlers;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mcapi.api.ApiResponse;
import com.mcapi.api.ApiServer;
import com.mcapi.api.TaskManager;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import net.minecraft.client.KeyMapping;
import net.minecraft.network.chat.Component;
import net.minecraft.server.level.ServerPlayer;
import com.mojang.blaze3d.platform.InputConstants;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class ScriptHandler implements HttpHandler {
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

        String rawBody = ApiServer.readBody(exchange);
        
        // Parse text format if it's not JSON
        List<JsonObject> script = new ArrayList<>();
        
        if (rawBody.trim().startsWith("[") || rawBody.trim().startsWith("{")) {
            JsonElement el = com.google.gson.JsonParser.parseString(rawBody);
            if (el.isJsonArray()) {
                for (JsonElement item : el.getAsJsonArray()) {
                    script.add(item.getAsJsonObject());
                }
            } else if (el.isJsonObject()) {
                script.add(el.getAsJsonObject());
            }
        } else {
            // Simple text format parsing
            String[] lines = rawBody.split("\\r?\\n");
            for (String line : lines) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;
                String[] parts = line.split("\\s+");
                JsonObject cmd = new JsonObject();
                String action = parts[0].toLowerCase();
                cmd.addProperty("action", action);
                
                if (action.equals("key") && parts.length >= 2) {
                    JsonArray keys = new JsonArray();
                    for (String k : parts[1].split(",")) keys.add(k);
                    cmd.add("keys", keys);
                    if (parts.length >= 3) cmd.addProperty("duration", Long.parseLong(parts[2]));
                } else if (action.equals("look") && parts.length >= 3) {
                    cmd.addProperty("deltaYaw", Float.parseFloat(parts[1]));
                    cmd.addProperty("deltaPitch", Float.parseFloat(parts[2]));
                } else if (action.equals("chat") && parts.length >= 2) {
                    cmd.addProperty("message", line.substring(line.indexOf("chat") + 4).trim());
                } else if (action.equals("delay") && parts.length >= 2) {
                    cmd.addProperty("duration", Long.parseLong(parts[1]));
                } else if (action.equals("command") && parts.length >= 2) {
                    cmd.addProperty("command", line.substring(line.indexOf("command") + 7).trim());
                }
                script.add(cmd);
            }
        }

        // Execute script in background
        TaskManager.getInstance().submit(() -> {
            for (JsonObject cmd : script) {
                if (Thread.currentThread().isInterrupted()) break;
                
                String action = cmd.has("action") ? cmd.get("action").getAsString() : "";
                
                try {
                    switch (action) {
                        case "delay":
                            Thread.sleep(cmd.get("duration").getAsLong());
                            break;
                            
                        case "chat":
                            String msg = cmd.get("message").getAsString();
                            ApiServer.getInstance().queueCommand((server) -> {
                                server.getPlayerList().broadcastSystemMessage(Component.literal(msg), false);
                            });
                            break;
                            
                        case "command":
                            String command = cmd.get("command").getAsString();
                            ApiServer.getInstance().queueCommand((server) -> {
                                server.getCommands().performPrefixedCommand(server.createCommandSourceStack(), command);
                            });
                            break;

                        case "look":
                            float dy = cmd.has("deltaYaw") ? cmd.get("deltaYaw").getAsFloat() : 0;
                            float dp = cmd.has("deltaPitch") ? cmd.get("deltaPitch").getAsFloat() : 0;
                            float absYaw = cmd.has("yaw") ? cmd.get("yaw").getAsFloat() : Float.NaN;
                            float absPitch = cmd.has("pitch") ? cmd.get("pitch").getAsFloat() : Float.NaN;
                            ApiServer.getInstance().queueCommand((server) -> {
                                List<ServerPlayer> players = server.getPlayerList().getPlayers();
                                if (!players.isEmpty()) {
                                    ServerPlayer p = players.get(0);
                                    float newYaw = p.getYRot();
                                    float newPitch = p.getXRot();
                                    if (!Float.isNaN(absYaw)) {
                                        newYaw = absYaw;
                                    } else {
                                        newYaw += dy;
                                    }
                                    if (!Float.isNaN(absPitch)) {
                                        newPitch = absPitch;
                                    } else {
                                        newPitch += dp;
                                    }
                                    newPitch = Math.max(-90.0f, Math.min(90.0f, newPitch));
                                    p.setYRot(newYaw);
                                    p.setXRot(newPitch);
                                    p.yRotO = newYaw;
                                    p.xRotO = newPitch;
                                    p.setYHeadRot(newYaw);
                                    p.connection.teleport(p.getX(), p.getY(), p.getZ(), newYaw, newPitch);
                                }
                            });
                            break;
                            
                        case "key":
                            if (cmd.has("keys")) {
                                List<InputConstants.Key> keys = new ArrayList<>();
                                for (JsonElement k : cmd.getAsJsonArray("keys")) {
                                    keys.add(com.mcapi.api.KeyAliasMap.resolve(k.getAsString()));
                                }
                                
                                ApiServer.getInstance().queueClientCommand((client) -> {
                                    for (InputConstants.Key key : keys) {
                                        TaskManager.getInstance().trackKey(key);
                                        KeyMapping.set(key, true);
                                        client.keyboardHandler.keyPress(client.getWindow().getWindow(), key.getValue(), 0, 1, 0);
                                    }
                                });
                                
                                if (cmd.has("duration")) {
                                    Thread.sleep(cmd.get("duration").getAsLong());
                                    ApiServer.getInstance().queueClientCommand((client) -> {
                                        for (InputConstants.Key key : keys) {
                                            TaskManager.getInstance().untrackKey(key);
                                            KeyMapping.set(key, false);
                                            client.keyboardHandler.keyPress(client.getWindow().getWindow(), key.getValue(), 0, 0, 0);
                                        }
                                    });
                                }
                            }
                            break;
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });

        ApiServer.sendResponse(exchange, 200, ApiResponse.jsonSuccess("Script started executing"));
    }
}
