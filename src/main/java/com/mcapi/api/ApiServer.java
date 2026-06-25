package com.mcapi.api;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.mcapi.McApiMod;
import com.mcapi.api.handlers.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import net.minecraft.server.MinecraftServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.*;
import net.minecraft.client.Minecraft;

public class ApiServer {
    private static final ApiServer INSTANCE = new ApiServer();
    private static final int DEFAULT_PORT = 25566;

    private HttpServer server;
    private int port = DEFAULT_PORT;
    private String authToken = ""; // loaded from -Dmcapi.key system property at runtime
    private final BlockingQueue<QueuedCommand> commandQueue = new LinkedBlockingQueue<>();
    private final BlockingQueue<QueuedClientCommand> clientCommandQueue = new LinkedBlockingQueue<>();
    private boolean isRunning = false;

    private ApiServer() {}

    public static ApiServer getInstance() {
        return INSTANCE;
    }

    public int getPort() { return port; }

    public void start() {
        if (isRunning) return;
        try {
            port = Integer.parseInt(System.getProperty("mcapi.port", String.valueOf(DEFAULT_PORT)));
            authToken = System.getProperty("mcapi.key", "");

            server = HttpServer.create(new InetSocketAddress(port), 0);
            server.setExecutor(Executors.newFixedThreadPool(4));

            // Register API endpoints
            server.createContext("/api/", new RootHandler());
            server.createContext("/api/block/break", new BlockHandler.BreakHandler());
            server.createContext("/api/block/place", new BlockHandler.PlaceHandler());
            server.createContext("/api/block/get", new BlockHandler.GetHandler());
            server.createContext("/api/block/interact", new BlockHandler.InteractHandler());
            server.createContext("/api/player/teleport", new PlayerHandler.TeleportHandler());
            server.createContext("/api/player/look", new PlayerHandler.LookHandler());
            server.createContext("/api/player/position", new PlayerHandler.PositionHandler());
            server.createContext("/api/player/jump", new PlayerHandler.JumpHandler());
            server.createContext("/api/player/swing", new PlayerHandler.SwingHandler());
            server.createContext("/api/player/list", new PlayerHandler.ListHandler());
            server.createContext("/api/inventory/get", new InventoryHandler.GetHandler());
            server.createContext("/api/inventory/set", new InventoryHandler.SetHandler());
            server.createContext("/api/inventory/select", new InventoryHandler.SelectHandler());
            server.createContext("/api/inventory/drop", new InventoryHandler.DropHandler());
            server.createContext("/api/chat/send", new ChatHandler.SendHandler());
            server.createContext("/api/world/time", new WorldHandler.TimeHandler());
            server.createContext("/api/world/weather", new WorldHandler.WeatherHandler());
            server.createContext("/api/settings/gamerule", new SettingsHandler.GameRuleHandler());
            server.createContext("/api/settings/difficulty", new SettingsHandler.DifficultyHandler());
            server.createContext("/api/command", new CommandHandler());

            server.createContext("/api/client/input", new ClientInputHandler());
            server.createContext("/api/client/click_button", new ClientUIHandler());
            server.createContext("/api/client/settings", new ClientSettingsHandler());
            server.createContext("/api/client/debug", new ClientDebugHandler());
            server.createContext("/api/script", new ScriptHandler());
            server.createContext("/api/cancel", new CancelHandler());
            server.start();
            isRunning = true;
            McApiMod.LOGGER.info("API Server started on port {}", port);
        } catch (Exception e) {
            McApiMod.LOGGER.error("Failed to start API server", e);
        }
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
            server = null;
            isRunning = false;
            McApiMod.LOGGER.info("API Server stopped.");
        }
    }

    public void queueCommand(QueuedCommand cmd) {
        commandQueue.offer(cmd);
    }

    public void processQueuedCommands(MinecraftServer server) {
        QueuedCommand cmd;
        while ((cmd = commandQueue.poll()) != null) {
            try {
                cmd.execute(server);
            } catch (Exception e) {
                McApiMod.LOGGER.error("Error executing queued command", e);
            }
        }
    }

    public void queueClientCommand(QueuedClientCommand cmd) {
        clientCommandQueue.offer(cmd);
    }

    public void processQueuedClientCommands(Minecraft client) {
        QueuedClientCommand cmd;
        while ((cmd = clientCommandQueue.poll()) != null) {
            try {
                cmd.execute(client);
            } catch (Exception e) {
                McApiMod.LOGGER.error("Error executing queued client command", e);
            }
        }
    }

    public boolean checkAuth(HttpExchange exchange) {
        if (authToken.isEmpty()) return true;
        String auth = exchange.getRequestHeaders().getFirst("Authorization");
        return auth != null && auth.equals("Bearer " + authToken);
    }

    public static String readBody(HttpExchange exchange) throws IOException {
        InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8);
        BufferedReader br = new BufferedReader(isr);
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            sb.append(line);
        }
        return sb.toString();
    }

    public static JsonObject parseBody(String body) {
        if (body == null || body.isEmpty()) return new JsonObject();
        try {
            return JsonParser.parseString(body).getAsJsonObject();
        } catch (Exception e) {
            return new JsonObject();
        }
    }

    public static void sendResponse(HttpExchange exchange, int status, String response) {
        try {
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(status, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        } catch (IOException e) {
            McApiMod.LOGGER.error("Error sending HTTP response", e);
        }
    }

    static class RootHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!INSTANCE.checkAuth(exchange)) {
                sendResponse(exchange, 401, ApiResponse.jsonError(401, "Unauthorized"));
                return;
            }
            String path = exchange.getRequestURI().getPath();
            if (path.equals("/api/") || path.equals("/api")) {
                JsonObject endpoints = new JsonObject();
                endpoints.addProperty("block/break", "POST - Break a block at position");
                endpoints.addProperty("block/place", "POST - Place a block at position");
                endpoints.addProperty("block/get", "GET - Get block type at position");
                endpoints.addProperty("block/interact", "POST - Interact with a block");
                endpoints.addProperty("player/teleport", "POST - Teleport player");
                endpoints.addProperty("player/look", "POST - Set player look direction");
                endpoints.addProperty("player/position", "GET - Get player position");
                endpoints.addProperty("player/jump", "POST - Make player jump");
                endpoints.addProperty("player/swing", "POST - Swing player hand");
                endpoints.addProperty("player/list", "GET - List online players");
                endpoints.addProperty("inventory/get", "GET - Get inventory contents");
                endpoints.addProperty("inventory/set", "POST - Set inventory slot");
                endpoints.addProperty("inventory/select", "POST - Select hotbar slot");
                endpoints.addProperty("inventory/drop", "POST - Drop item from slot");
                endpoints.addProperty("chat/send", "POST - Send chat message");
                endpoints.addProperty("world/time", "POST - Get/set world time");
                endpoints.addProperty("world/weather", "POST - Get/set weather");
                endpoints.addProperty("settings/gamerule", "POST - Get/set game rule");
                endpoints.addProperty("settings/difficulty", "POST - Get/set difficulty");
                endpoints.addProperty("command", "POST - Run any Minecraft command");
                endpoints.addProperty("client/input", "POST - Send key inputs (supports all keys)");
                endpoints.addProperty("client/click_button", "POST - Click a UI button by text");
                endpoints.addProperty("client/settings", "POST - Change client settings");
                endpoints.addProperty("client/debug", "GET - Get F3 debug info (fps, biome, xyz, etc.)");
                endpoints.addProperty("script", "POST - Run multiple commands as a macro script");
                endpoints.addProperty("cancel", "POST - Cancel all running tasks and held keys");
                String json = ApiResponse.jsonData(endpoints);
                sendResponse(exchange, 200, json);
            } else {
                sendResponse(exchange, 404, ApiResponse.jsonError(404, "Endpoint not found"));
            }
        }
    }

    static class CommandHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!INSTANCE.checkAuth(exchange)) {
                sendResponse(exchange, 401, ApiResponse.jsonError(401, "Unauthorized"));
                return;
            }
            if (!"POST".equals(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, ApiResponse.jsonError(405, "Method not allowed"));
                return;
            }
            JsonObject body = parseBody(readBody(exchange));
            String command = body.has("command") ? body.get("command").getAsString() : "";

            if (command.isEmpty()) {
                sendResponse(exchange, 400, ApiResponse.jsonError(400, "Missing 'command' field"));
                return;
            }

            INSTANCE.queueCommand((server) -> {
                server.getCommands().performPrefixedCommand(server.createCommandSourceStack(), command);
            });

            sendResponse(exchange, 200, ApiResponse.jsonSuccess("Command queued: " + command));
        }
    }
}
