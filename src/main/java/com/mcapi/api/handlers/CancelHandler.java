package com.mcapi.api.handlers;

import com.mcapi.api.ApiResponse;
import com.mcapi.api.ApiServer;
import com.mcapi.api.TaskManager;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;

public class CancelHandler implements HttpHandler {
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

        // Cancel all tasks in TaskManager
        TaskManager.getInstance().cancelAll();
        
        ApiServer.sendResponse(exchange, 200, ApiResponse.jsonSuccess("All running tasks and inputs have been cancelled."));
    }
}
