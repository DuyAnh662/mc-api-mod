package com.mcapi.api.handlers;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.mcapi.api.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import net.minecraft.client.Minecraft;

import java.io.IOException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

public class StepHandler implements HttpHandler {
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

        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<JsonObject> resultRef = new AtomicReference<>();

        long currentTick = 0;
        Minecraft client = Minecraft.getInstance();
        if (client != null && client.level != null) {
            currentTick = client.level.getGameTime();
        }
        final long tickAtStart = currentTick;

        if (body.has("actions")) {
            JsonArray actions = body.getAsJsonArray("actions");
            ActionHandler.processActions(actions);
        }

        ApiServer.getInstance().queueClientCommand((c) -> {
            Minecraft cl = Minecraft.getInstance();
            if (cl != null && cl.level != null) {
                long tickNow = cl.level.getGameTime();
                JsonObject obs = ObservationProvider.generateObservation();
                var screen = ScreenObserver.observe();
                if (screen != null && !screen.isEmpty() && screen.has("id") && !screen.get("id").getAsString().isEmpty()) {
                    obs.add("screen", screen);
                }
                obs.addProperty("tick_next", tickNow);

                JsonObject result = new JsonObject();
                result.addProperty("tick", tickNow);
                result.add("observation", obs);
                resultRef.set(result);
            }
            latch.countDown();
        });

        try {
            boolean completed = latch.await(5000, TimeUnit.MILLISECONDS);
            if (!completed) {
                ApiServer.sendResponse(exchange, 408, ApiResponse.jsonError(408, "Step timeout"));
                return;
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            ApiServer.sendResponse(exchange, 500, ApiResponse.jsonError(500, "Interrupted"));
            return;
        }

        JsonObject result = resultRef.get();
        if (result != null) {
            ApiServer.sendResponse(exchange, 200, ApiResponse.jsonData(result));
        } else {
            ApiServer.sendResponse(exchange, 500, ApiResponse.jsonError(500, "Failed to get observation"));
        }
    }
}
