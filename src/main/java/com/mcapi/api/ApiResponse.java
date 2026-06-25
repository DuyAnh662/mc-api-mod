package com.mcapi.api;

import com.google.gson.JsonObject;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class ApiResponse {
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    private final int status;
    private final boolean success;
    private final String message;
    private final JsonObject data;

    public ApiResponse(int status, boolean success, String message) {
        this(status, success, message, null);
    }

    public ApiResponse(int status, boolean success, String message, JsonObject data) {
        this.status = status;
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public int getStatus() { return status; }
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public JsonObject getData() { return data; }

    public String toJson() {
        JsonObject obj = new JsonObject();
        obj.addProperty("success", success);
        obj.addProperty("message", message);
        if (data != null) {
            obj.add("data", data);
        }
        return GSON.toJson(obj);
    }

    public static ApiResponse ok(String message) {
        return new ApiResponse(200, true, message);
    }

    public static ApiResponse ok(String message, JsonObject data) {
        return new ApiResponse(200, true, message, data);
    }

    public static ApiResponse badRequest(String message) {
        return new ApiResponse(400, false, message);
    }

    public static ApiResponse notFound(String message) {
        return new ApiResponse(404, false, message);
    }

    public static ApiResponse error(String message) {
        return new ApiResponse(500, false, message);
    }

    public static ApiResponse notImplemented(String message) {
        return new ApiResponse(501, false, message);
    }

    public static String jsonError(int status, String message) {
        JsonObject obj = new JsonObject();
        obj.addProperty("success", false);
        obj.addProperty("message", message);
        return GSON.toJson(obj);
    }

    public static String jsonSuccess(String message) {
        JsonObject obj = new JsonObject();
        obj.addProperty("success", true);
        obj.addProperty("message", message);
        return GSON.toJson(obj);
    }

    public static String jsonData(JsonObject data) {
        JsonObject obj = new JsonObject();
        obj.addProperty("success", true);
        obj.addProperty("message", "ok");
        obj.add("data", data);
        return GSON.toJson(obj);
    }
}
