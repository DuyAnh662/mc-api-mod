package com.mcapi.api.handlers;

import com.google.gson.JsonObject;
import com.mcapi.api.ApiServer;
import com.mcapi.api.ApiResponse;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import net.minecraft.core.registries.BuiltInRegistries;

import java.io.IOException;

public class RegistryHandler {

    public static class EntitiesHandler implements HttpHandler {
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

            JsonObject entities = new JsonObject();
            for (var entry : BuiltInRegistries.ENTITY_TYPE) {
                int id = BuiltInRegistries.ENTITY_TYPE.getId(entry);
                var key = BuiltInRegistries.ENTITY_TYPE.getKey(entry);
                if (id >= 0 && key != null) {
                    entities.addProperty(String.valueOf(id), key.toString());
                }
            }

            JsonObject data = new JsonObject();
            data.add("entities", entities);
            ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Entity registry dump", data).toJson());
        }
    }

    public static class ItemsHandler implements HttpHandler {
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

            JsonObject items = new JsonObject();
            for (var entry : BuiltInRegistries.ITEM) {
                int id = BuiltInRegistries.ITEM.getId(entry);
                var key = BuiltInRegistries.ITEM.getKey(entry);
                if (id >= 0 && key != null) {
                    items.addProperty(String.valueOf(id), key.toString());
                }
            }

            JsonObject data = new JsonObject();
            data.add("items", items);
            ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Item registry dump", data).toJson());
        }
    }
}
