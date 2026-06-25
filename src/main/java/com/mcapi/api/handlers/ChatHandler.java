package com.mcapi.api.handlers;

import com.google.gson.JsonObject;
import com.mcapi.api.ApiServer;
import com.mcapi.api.ApiResponse;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import net.minecraft.network.chat.Component;

import java.io.IOException;

public class ChatHandler {

    public static class SendHandler implements HttpHandler {
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
            if (!body.has("message")) {
                ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing 'message' field"));
                return;
            }

            String message = body.get("message").getAsString();

            ApiServer.getInstance().queueCommand((server) -> {
                Component chatMsg = Component.literal(message);
                server.getPlayerList().broadcastSystemMessage(chatMsg, false);

                JsonObject data = new JsonObject();
                data.addProperty("message", message);
                data.addProperty("broadcast", true);
                ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Message sent", data).toJson());
            });

            ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Chat message queued"));
        }
    }
}
