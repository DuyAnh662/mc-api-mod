package com.mcapi.api.handlers;

import com.google.gson.JsonObject;
import com.mcapi.api.ApiResponse;
import com.mcapi.api.ApiServer;
import com.mcapi.api.SessionManager;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;

public class SessionHandler implements HttpHandler {
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

        var session = SessionManager.getInstance().createSession();
        JsonObject data = new JsonObject();
        data.addProperty("session_id", session.getId());
        data.addProperty("created_at", session.getCreatedAt());
        ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Session created", data).toJson());
    }
}
