package com.mcapi.api.handlers;

import com.google.gson.JsonObject;
import com.mcapi.api.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

public class StreamHandler implements HttpHandler {
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

        exchange.getResponseHeaders().set("Content-Type", "text/event-stream; charset=UTF-8");
        exchange.getResponseHeaders().set("Cache-Control", "no-cache");
        exchange.getResponseHeaders().set("Connection", "keep-alive");
        exchange.sendResponseHeaders(200, 0);

        OutputStream os = exchange.getResponseBody();

        try {
            while (!Thread.currentThread().isInterrupted()) {
                CountDownLatch latch = new CountDownLatch(1);
                AtomicReference<JsonObject> obsRef = new AtomicReference<>();

                ApiServer.getInstance().queueClientCommand((client) -> {
                    JsonObject obs = ObservationProvider.generateObservation();
                    var screen = ScreenObserver.observe();
                    if (screen != null && !screen.isEmpty() && screen.has("id") && !screen.get("id").getAsString().isEmpty()) {
                        obs.add("screen", screen);
                    }
                    obsRef.set(obs);
                    latch.countDown();
                });

                try {
                    boolean done = latch.await(100, TimeUnit.MILLISECONDS);
                    if (done) {
                        JsonObject obs = obsRef.get();
                        if (obs != null) {
                            String data = "data: " + obs.toString() + "\n\n";
                            os.write(data.getBytes(StandardCharsets.UTF_8));
                            os.flush();
                        }
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        } catch (IOException e) {
            // Client disconnected - end SSE stream
        } finally {
            try {
                os.close();
            } catch (IOException ignored) {}
        }
    }
}
