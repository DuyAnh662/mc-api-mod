package com.mcapi;

import com.mcapi.api.ApiServer;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientLifecycleEvents;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.minecraft.client.Minecraft;

public class McApiClient implements ClientModInitializer {
    public static Minecraft CLIENT;

    @Override
    public void onInitializeClient() {
        McApiMod.LOGGER.info("Initializing Minecraft API Client Mod...");

        ClientLifecycleEvents.CLIENT_STARTED.register(client -> {
            CLIENT = client;
            // The API server should be started once. We will handle ensuring it doesn't double-start in ApiServer.
            ApiServer.getInstance().start();
            McApiMod.LOGGER.info("Minecraft API Client Mod is ready! HTTP API available.");
        });

        ClientLifecycleEvents.CLIENT_STOPPING.register(client -> {
            ApiServer.getInstance().stop();
        });

        ClientTickEvents.START_CLIENT_TICK.register(client -> {
            ApiServer.getInstance().processQueuedClientCommands(client);
        });
    }
}
