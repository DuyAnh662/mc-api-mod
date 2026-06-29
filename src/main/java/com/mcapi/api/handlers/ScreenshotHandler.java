package com.mcapi.api.handlers;

import com.google.gson.JsonObject;
import com.mcapi.api.ApiResponse;
import com.mcapi.api.ApiServer;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

public class ScreenshotHandler implements HttpHandler {

    private static final int DEFAULT_WIDTH = 640;
    private static final int DEFAULT_HEIGHT = 360;
    private static final int DEFAULT_QUALITY = 85;

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

        String query = exchange.getRequestURI().getRawQuery();
        int targetW = DEFAULT_WIDTH;
        int targetH = DEFAULT_HEIGHT;
        int quality = DEFAULT_QUALITY;

        if (query != null) {
            for (String param : query.split("&")) {
                String[] parts = param.split("=", 2);
                if (parts.length != 2) continue;
                try {
                    switch (parts[0]) {
                        case "width" -> targetW = Integer.parseInt(parts[1]);
                        case "height" -> targetH = Integer.parseInt(parts[1]);
                        case "quality" -> quality = Integer.parseInt(parts[1]);
                    }
                } catch (NumberFormatException ignored) {}
            }
        }

        targetW = Math.max(64, Math.min(1920, targetW));
        targetH = Math.max(36, Math.min(1080, targetH));
        quality = Math.max(10, Math.min(100, quality));
        int finalW = targetW;
        int finalH = targetH;

        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<String> imgRef = new AtomicReference<>();
        AtomicReference<Integer> origWRef = new AtomicReference<>();
        AtomicReference<Integer> origHRef = new AtomicReference<>();
        AtomicReference<String> errorRef = new AtomicReference<>();

        ApiServer.getInstance().queueClientCommand((client) -> {
            var renderTarget = client.getMainRenderTarget();
            int ow = renderTarget.width;
            int oh = renderTarget.height;
            origWRef.set(ow);
            origHRef.set(oh);

            net.minecraft.client.Screenshot.takeScreenshot(renderTarget, (nativeImg) -> {
                try {
                    BufferedImage image = new BufferedImage(nativeImg.getWidth(), nativeImg.getHeight(), BufferedImage.TYPE_3BYTE_BGR);
                    for (int y = 0; y < nativeImg.getHeight(); y++) {
                        for (int x = 0; x < nativeImg.getWidth(); x++) {
                            int abgr = nativeImg.getPixel(x, y);
                            int b = abgr & 0xFF;
                            int g = (abgr >> 8) & 0xFF;
                            int r = (abgr >> 16) & 0xFF;
                            int rgb = (r << 16) | (g << 8) | b;
                            image.setRGB(x, y, rgb);
                        }
                    }
                    nativeImg.close();

                    BufferedImage resized = resizeImage(image, finalW, finalH);

                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    ImageIO.write(resized, "jpeg", baos);
                    imgRef.set(Base64.getEncoder().encodeToString(baos.toByteArray()));
                } catch (Exception e) {
                    errorRef.set(e.getMessage());
                } finally {
                    latch.countDown();
                }
            });
        });

        try {
            boolean completed = latch.await(5000, TimeUnit.MILLISECONDS);
            if (!completed) {
                ApiServer.sendResponse(exchange, 408, ApiResponse.jsonError(408, "Screenshot timeout"));
                return;
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            ApiServer.sendResponse(exchange, 500, ApiResponse.jsonError(500, "Interrupted"));
            return;
        }

        if (errorRef.get() != null) {
            ApiServer.sendResponse(exchange, 500, ApiResponse.jsonError(500, "Screenshot failed: " + errorRef.get()));
            return;
        }

        String base64 = imgRef.get();
        if (base64 == null) {
            ApiServer.sendResponse(exchange, 500, ApiResponse.jsonError(500, "No image data"));
            return;
        }

        JsonObject data = new JsonObject();
        data.addProperty("width", targetW);
        data.addProperty("height", targetH);
        data.addProperty("original_width", origWRef.get());
        data.addProperty("original_height", origHRef.get());
        data.addProperty("format", "jpeg");
        data.addProperty("quality", quality);
        data.addProperty("image", base64);

        ApiServer.sendResponse(exchange, 200, ApiResponse.jsonData(data));
    }

    private static BufferedImage resizeImage(BufferedImage src, int targetW, int targetH) {
        BufferedImage resized = new BufferedImage(targetW, targetH, BufferedImage.TYPE_3BYTE_BGR);
        Graphics2D g = resized.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.drawImage(src, 0, 0, targetW, targetH, null);
        g.dispose();
        return resized;
    }
}
