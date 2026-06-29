package com.mcapi.api.handlers;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mcapi.api.ApiResponse;
import com.mcapi.api.ApiServer;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import net.minecraft.client.KeyMapping;
import com.mojang.blaze3d.platform.InputConstants;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class ClientInputHandler implements HttpHandler {
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
        
        if (body.has("keys")) {
            JsonArray keysArray = body.getAsJsonArray("keys");
            List<InputConstants.Key> keysToPress = new ArrayList<>();
            
            for (JsonElement el : keysArray) {
                String keyStr = el.getAsString();
                keysToPress.add(com.mcapi.api.KeyAliasMap.resolve(keyStr));
            }
            
            long duration = body.has("duration") ? body.get("duration").getAsLong() : 0;
            
            ApiServer.getInstance().queueClientCommand((client) -> {
                for (InputConstants.Key key : keysToPress) {
                    com.mcapi.api.TaskManager.getInstance().trackKey(key);
                    KeyMapping.set(key, true);
                    client.keyboardHandler.keyPress(client.getWindow().getWindow(), key.getValue(), 0, 1, 0);
                }
            });
            
            if (duration > 0) {
                com.mcapi.api.TaskManager.getInstance().schedule(() -> {
                    ApiServer.getInstance().queueClientCommand((client) -> {
                        for (InputConstants.Key key : keysToPress) {
                            com.mcapi.api.TaskManager.getInstance().untrackKey(key);
                            KeyMapping.set(key, false);
                            client.keyboardHandler.keyPress(client.getWindow().getWindow(), key.getValue(), 0, 0, 0);
                        }
                    });
                }, duration);
            } else {
                ApiServer.getInstance().queueClientCommand((client) -> {
                    for (InputConstants.Key key : keysToPress) {
                        com.mcapi.api.TaskManager.getInstance().untrackKey(key);
                        KeyMapping.set(key, false);
                        client.keyboardHandler.keyPress(client.getWindow().getWindow(), key.getValue(), 0, 0, 0);
                    }
                });
            }
            
            ApiServer.sendResponse(exchange, 200, ApiResponse.jsonSuccess("Keys simulated"));
            return;
        }

        // Fallback to legacy specific boolean properties (forward, back, etc.)
        ApiServer.getInstance().queueClientCommand((client) -> {
            if (client.options == null) return;

            if (body.has("forward")) {
                client.options.keyUp.setDown(body.get("forward").getAsBoolean());
            }
            if (body.has("back")) {
                client.options.keyDown.setDown(body.get("back").getAsBoolean());
            }
            if (body.has("left")) {
                client.options.keyLeft.setDown(body.get("left").getAsBoolean());
            }
            if (body.has("right")) {
                client.options.keyRight.setDown(body.get("right").getAsBoolean());
            }
            if (body.has("jump")) {
                client.options.keyJump.setDown(body.get("jump").getAsBoolean());
            }
            if (body.has("sneak")) {
                client.options.keyShift.setDown(body.get("sneak").getAsBoolean());
            }
            if (body.has("sprint")) {
                client.options.keySprint.setDown(body.get("sprint").getAsBoolean());
            }
            if (body.has("attack")) {
                client.options.keyAttack.setDown(body.get("attack").getAsBoolean());
            }
            if (body.has("use")) {
                client.options.keyUse.setDown(body.get("use").getAsBoolean());
            }
        });

        ApiServer.sendResponse(exchange, 200, ApiResponse.jsonSuccess("Inputs updated"));
    }
}
