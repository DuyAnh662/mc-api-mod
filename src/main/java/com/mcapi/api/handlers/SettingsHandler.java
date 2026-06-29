package com.mcapi.api.handlers;

import com.google.gson.JsonObject;
import com.mcapi.api.ApiServer;
import com.mcapi.api.ApiResponse;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import net.minecraft.world.Difficulty;

import java.io.IOException;
import java.util.regex.Pattern;

public class SettingsHandler {

    private static final Pattern GAMERULE_PATTERN = Pattern.compile("^[a-zA-Z0-9_]+$");
    private static final Pattern GAMERULE_VALUE = Pattern.compile("^[a-zA-Z0-9_./-]+$");

    public static class GameRuleHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!ApiServer.getInstance().checkAuth(exchange)) {
                ApiServer.sendResponse(exchange, 401, ApiResponse.jsonError(401, "Unauthorized"));
                return;
            }
            String method = exchange.getRequestMethod();
            var body = ApiServer.parseBody(ApiServer.readBody(exchange));

            if ("POST".equals(method)) {
                if (!body.has("rule") || !body.has("value")) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing 'rule' or 'value'"));
                    return;
                }
                String rule = body.get("rule").getAsString();
                String value = body.get("value").getAsString();

                if (!GAMERULE_PATTERN.matcher(rule).matches() || !GAMERULE_VALUE.matcher(value).matches()) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Invalid gamerule name or value format"));
                    return;
                }

                // Use the /gamerule command to set game rules - works across all MC versions
                ApiServer.getInstance().queueCommand((server) -> {
                    server.getCommands().performPrefixedCommand(
                            server.createCommandSourceStack(),
                            "gamerule " + rule + " " + value
                    );
                    JsonObject data = new JsonObject();
                    data.addProperty("rule", rule);
                    data.addProperty("value", value);
                    ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Game rule set", data).toJson());
                });
                ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Game rule update queued"));

            } else if ("GET".equals(method)) {
                String rule = body.has("rule") ? body.get("rule").getAsString() : "";

                if (!rule.isEmpty()) {
                    // Query a specific game rule via command
                    ApiServer.getInstance().queueCommand((server) -> {
                        // Use command to query - result will be in chat
                        server.getCommands().performPrefixedCommand(
                                server.createCommandSourceStack(),
                                "gamerule " + rule
                        );
                        JsonObject data = new JsonObject();
                        data.addProperty("rule", rule);
                        data.addProperty("queried", true);
                        ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Game rule queried", data).toJson());
                    });
                } else {
                    // List all game rules via command
                    ApiServer.getInstance().queueCommand((server) -> {
                        JsonObject data = new JsonObject();
                        data.addProperty("info", "Use /gamerule command in-game to see all rules, or query specific rules with ?rule=<name>");
                        ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Game rules info", data).toJson());
                    });
                }
                ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Game rule query queued"));

            } else {
                ApiServer.sendResponse(exchange, 405, ApiResponse.jsonError(405, "Method not allowed"));
            }
        }
    }

    public static class DifficultyHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!ApiServer.getInstance().checkAuth(exchange)) {
                ApiServer.sendResponse(exchange, 401, ApiResponse.jsonError(401, "Unauthorized"));
                return;
            }
            String method = exchange.getRequestMethod();
            var body = ApiServer.parseBody(ApiServer.readBody(exchange));

            if ("POST".equals(method)) {
                if (!body.has("difficulty")) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing 'difficulty' (peaceful, easy, normal, hard)"));
                    return;
                }
                String diff = body.get("difficulty").getAsString();

                ApiServer.getInstance().queueCommand((server) -> {
                    Difficulty difficulty = switch (diff.toLowerCase()) {
                        case "peaceful" -> Difficulty.PEACEFUL;
                        case "easy" -> Difficulty.EASY;
                        case "normal" -> Difficulty.NORMAL;
                        case "hard" -> Difficulty.HARD;
                        default -> null;
                    };

                    if (difficulty == null) {
                        ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Invalid difficulty: use peaceful, easy, normal, or hard"));
                        return;
                    }

                    server.setDifficulty(difficulty, true);

                    JsonObject data = new JsonObject();
                    data.addProperty("difficulty", diff.toLowerCase());
                    ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Difficulty set", data).toJson());
                });
                ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Difficulty update queued"));

            } else if ("GET".equals(method)) {
                ApiServer.getInstance().queueCommand((server) -> {
                    JsonObject data = new JsonObject();
                    data.addProperty("difficulty", server.getWorldData().getDifficulty().getId());
                    data.addProperty("difficultyName", server.getWorldData().getDifficulty().getSerializedName());
                    data.addProperty("isHardcore", server.isHardcore());
                    ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Current difficulty", data).toJson());
                });
                ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Difficulty query queued"));

            } else {
                ApiServer.sendResponse(exchange, 405, ApiResponse.jsonError(405, "Method not allowed"));
            }
        }
    }
}
