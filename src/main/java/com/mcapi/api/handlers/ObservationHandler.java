package com.mcapi.api.handlers;

import com.google.gson.JsonObject;
import com.mcapi.api.ApiResponse;
import com.mcapi.api.ApiServer;
import com.mcapi.api.ObservationProvider;
import com.mcapi.api.ScreenObserver;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

public class ObservationHandler implements HttpHandler {
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

        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<JsonObject> obsRef = new AtomicReference<>();

        ApiServer.getInstance().queueClientCommand((client) -> {
            var obs = ObservationProvider.generateObservation();
            var screen = ScreenObserver.observe();
            if (screen != null && !screen.isEmpty() && screen.has("id") && !screen.get("id").getAsString().isEmpty()) {
                obs.add("screen", screen);
            }
            obsRef.set(obs);
            latch.countDown();
        });

        try {
            boolean completed = latch.await(5000, TimeUnit.MILLISECONDS);
            if (!completed) {
                ApiServer.sendResponse(exchange, 408, ApiResponse.jsonError(408, "Observation timeout"));
                return;
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            ApiServer.sendResponse(exchange, 500, ApiResponse.jsonError(500, "Interrupted"));
            return;
        }

        JsonObject obs = obsRef.get();
        if (obs != null) {
            ApiServer.sendResponse(exchange, 200, ApiResponse.jsonData(obs));
        } else {
            ApiServer.sendResponse(exchange, 500, ApiResponse.jsonError(500, "Failed to get observation"));
        }
    }
}
