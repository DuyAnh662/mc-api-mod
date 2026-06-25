package com.mcapi.api.handlers;

import com.google.gson.JsonObject;
import com.mcapi.api.ApiResponse;
import com.mcapi.api.ApiServer;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import net.minecraft.client.gui.components.Button;

import java.io.IOException;

public class ClientUIHandler implements HttpHandler {
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
        
        if (!body.has("button_text")) {
            ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing 'button_text' field"));
            return;
        }
        
        String targetText = body.get("button_text").getAsString().toLowerCase();

        ApiServer.getInstance().queueClientCommand((client) -> {
            var screen = client.screen;
            if (screen == null) return;
            
            for (var element : screen.children()) {
                if (element instanceof Button button) {
                    String btnText = button.getMessage().getString().toLowerCase();
                    if (btnText.contains(targetText)) {
                        button.onPress(new net.minecraft.client.input.MouseButtonInfo(0, 0));
                        break;
                    }
                }
            }
        });

        ApiServer.sendResponse(exchange, 200, ApiResponse.jsonSuccess("Attempted to click button containing: " + targetText));
    }
}
