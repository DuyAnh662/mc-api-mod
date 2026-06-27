package com.mcapi.api.handlers;

import com.google.gson.JsonObject;
import com.mcapi.api.ApiResponse;
import com.mcapi.api.ApiServer;
import com.mcapi.api.SessionManager;
import com.mcapi.api.TaskManager;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;

public class CloseHandler implements HttpHandler {
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
        String sessionId = body.has("session_id") ? body.get("session_id").getAsString() : "";

        if (!sessionId.isEmpty()) {
            boolean closed = SessionManager.getInstance().closeSession(sessionId);
            if (closed) {
                ApiServer.sendResponse(exchange, 200, ApiResponse.jsonSuccess("Session closed: " + sessionId));
            } else {
                ApiServer.sendResponse(exchange, 404, ApiResponse.jsonError(404, "Session not found: " + sessionId));
            }
        } else {
            SessionManager.getInstance().closeSession("");
            TaskManager.getInstance().cancelAll();
            ApiServer.sendResponse(exchange, 200, ApiResponse.jsonSuccess("All tasks cancelled and sessions cleared"));
        }
    }
}
