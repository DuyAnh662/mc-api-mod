package com.mcapi.api.handlers;

import com.google.gson.JsonObject;
import com.mcapi.api.ApiResponse;
import com.mcapi.api.ApiServer;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import net.minecraft.core.BlockPos;

import java.io.IOException;

public class ClientDebugHandler implements HttpHandler {
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

        // Parse query params (e.g. ?fields=fps,days,xyz)
        String query = exchange.getRequestURI().getQuery();
        String[] fields = null;
        if (query != null && query.startsWith("fields=")) {
            fields = query.substring(7).split(",");
        }

        final String[] requestedFields = fields;

        ApiServer.getInstance().queueClientCommand((client) -> {
            JsonObject data = new JsonObject();
            
            boolean all = requestedFields == null;

            if (all || contains(requestedFields, "fps")) {
                data.addProperty("fps", client.getFps());
            }

            if (client.level != null && client.player != null) {
                BlockPos pos = client.player.blockPosition();

                if (all || contains(requestedFields, "days")) {
                    data.addProperty("daysPlayed", client.level.getDayTime() / 24000L);
                }
                if (all || contains(requestedFields, "xyz")) {
                    data.addProperty("x", client.player.getX());
                    data.addProperty("y", client.player.getY());
                    data.addProperty("z", client.player.getZ());
                }
                if (all || contains(requestedFields, "chunk")) {
                    data.addProperty("chunkX", pos.getX() >> 4);
                    data.addProperty("chunkY", pos.getY() >> 4);
                    data.addProperty("chunkZ", pos.getZ() >> 4);
                }
                if (all || contains(requestedFields, "dimension")) {
                    data.addProperty("dimension", client.level.dimension().location().toString());
                }
                if (all || contains(requestedFields, "biome")) {
                    var biomeEntry = client.level.getBiome(pos);
                    biomeEntry.unwrapKey().ifPresent(key -> data.addProperty("biome", key.location().toString()));
                }
            }

            ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Debug info", data).toJson());
        });
    }

    private boolean contains(String[] arr, String val) {
        if (arr == null) return false;
        for (String s : arr) {
            if (s.trim().equalsIgnoreCase(val)) return true;
        }
        return false;
    }
}
