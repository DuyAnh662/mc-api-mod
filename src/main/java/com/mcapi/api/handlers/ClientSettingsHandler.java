package com.mcapi.api.handlers;

import com.google.gson.JsonObject;
import com.mcapi.api.ApiResponse;
import com.mcapi.api.ApiServer;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;

public class ClientSettingsHandler implements HttpHandler {
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
        
        ApiServer.getInstance().queueClientCommand((client) -> {
            if (client.options == null) return;

            if (body.has("fov")) {
                client.options.fov().set(body.get("fov").getAsInt());
            }
            if (body.has("renderDistance")) {
                client.options.renderDistance().set(body.get("renderDistance").getAsInt());
            }
            if (body.has("simulationDistance")) {
                client.options.simulationDistance().set(body.get("simulationDistance").getAsInt());
            }
            if (body.has("gamma")) {
                client.options.gamma().set(body.get("gamma").getAsDouble());
            }
            // Save settings
            client.options.save();
        });

        ApiServer.sendResponse(exchange, 200, ApiResponse.jsonSuccess("Settings updated"));
    }
}
