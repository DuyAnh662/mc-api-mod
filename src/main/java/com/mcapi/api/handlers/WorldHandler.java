package com.mcapi.api.handlers;

import com.google.gson.JsonObject;
import com.mcapi.api.ApiServer;
import com.mcapi.api.ApiResponse;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import net.minecraft.server.level.ServerLevel;

import java.io.IOException;

public class WorldHandler {

    public static class TimeHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!ApiServer.getInstance().checkAuth(exchange)) {
                ApiServer.sendResponse(exchange, 401, ApiResponse.jsonError(401, "Unauthorized"));
                return;
            }
            String method = exchange.getRequestMethod();
            var body = ApiServer.parseBody(ApiServer.readBody(exchange));

            if ("POST".equals(method)) {
                if (!body.has("time")) {
                    ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing 'time' field"));
                    return;
                }
                long time = body.get("time").getAsLong();

                ApiServer.getInstance().queueCommand((server) -> {
                    ServerLevel level = server.overworld();
                    level.clockManager().setTotalTicks(
                        level.registryAccess().lookupOrThrow(net.minecraft.core.registries.Registries.WORLD_CLOCK)
                            .getOrThrow(net.minecraft.world.clock.WorldClocks.OVERWORLD),
                        time
                    );

                    JsonObject data = new JsonObject();
                    data.addProperty("time", time);
                    ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Time set", data).toJson());
                });

                ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Time update queued"));
            } else if ("GET".equals(method)) {
                ApiServer.getInstance().queueCommand((server) -> {
                    ServerLevel level = server.overworld();
                    long dayTime = level.getOverworldClockTime();
                    long timeOfDay = dayTime % 24000;
                    JsonObject data = new JsonObject();
                    data.addProperty("time", dayTime);
                    data.addProperty("dayTime", timeOfDay);
                    // Day: 0-12999, Night: 13000-23999
                    data.addProperty("isDay", timeOfDay >= 0 && timeOfDay < 13000);
                    data.addProperty("isNight", timeOfDay >= 13000);
                    ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Current time", data).toJson());
                });

                ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Time query queued"));
            } else {
                ApiServer.sendResponse(exchange, 405, ApiResponse.jsonError(405, "Method not allowed"));
            }
        }
    }

    public static class WeatherHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!ApiServer.getInstance().checkAuth(exchange)) {
                ApiServer.sendResponse(exchange, 401, ApiResponse.jsonError(401, "Unauthorized"));
                return;
            }
            String method = exchange.getRequestMethod();
            var body = ApiServer.parseBody(ApiServer.readBody(exchange));

            if ("POST".equals(method)) {
                String weather = body.has("weather") ? body.get("weather").getAsString() : "";
                int duration = body.has("duration") ? body.get("duration").getAsInt() : 6000;

                ApiServer.getInstance().queueCommand((server) -> {
                    ServerLevel level = server.overworld();

                    var weatherData = level.getWeatherData();
                    switch (weather.toLowerCase()) {
                        case "clear":
                            weatherData.setClearWeatherTime(duration);
                            weatherData.setRainTime(0);
                            weatherData.setThunderTime(0);
                            weatherData.setRaining(false);
                            weatherData.setThundering(false);
                            break;
                        case "rain":
                            weatherData.setClearWeatherTime(0);
                            weatherData.setRainTime(duration);
                            weatherData.setThunderTime(0);
                            weatherData.setRaining(true);
                            weatherData.setThundering(false);
                            break;
                        case "thunder":
                        case "storm":
                            weatherData.setClearWeatherTime(0);
                            weatherData.setRainTime(duration);
                            weatherData.setThunderTime(duration);
                            weatherData.setRaining(true);
                            weatherData.setThundering(true);
                            break;
                        default:
                            ApiServer.sendResponse(exchange, 400, ApiResponse.jsonError(400, "Invalid weather: " + weather + " (use clear, rain, or thunder)"));
                            return;
                    }

                    JsonObject data = new JsonObject();
                    data.addProperty("weather", weather);
                    data.addProperty("duration", duration);
                    ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Weather set", data).toJson());
                });

                ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Weather update queued"));
            } else if ("GET".equals(method)) {
                ApiServer.getInstance().queueCommand((server) -> {
                    ServerLevel level = server.overworld();
                    JsonObject data = new JsonObject();
                    data.addProperty("isRaining", level.isRaining());
                    data.addProperty("isThundering", level.isThundering());
                    data.addProperty("rainLevel", level.getRainLevel(1.0f));
                    data.addProperty("thunderLevel", level.getThunderLevel(1.0f));
                    ApiServer.sendResponse(exchange, 200, ApiResponse.ok("Current weather", data).toJson());
                });

                ApiServer.sendResponse(exchange, 202, ApiResponse.jsonSuccess("Weather query queued"));
            } else {
                ApiServer.sendResponse(exchange, 405, ApiResponse.jsonError(405, "Method not allowed"));
            }
        }
    }
}
