package com.mcapi;

import com.mcapi.api.ApiServer;
import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerLifecycleEvents;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerTickEvents;
import net.minecraft.server.MinecraftServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class McApiMod implements ModInitializer {
    public static final String MOD_ID = "mcapi";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);
    public static MinecraftServer SERVER;

    @Override
    public void onInitialize() {
        LOGGER.info("Initializing Minecraft API Mod...");

        ServerLifecycleEvents.SERVER_STARTING.register(server -> {
            SERVER = server;
            LOGGER.info("Minecraft server starting, API will be available soon...");
        });

        ServerLifecycleEvents.SERVER_STARTED.register(server -> {
            SERVER = server;
            ApiServer.getInstance().start();
            LOGGER.info("Minecraft API Mod is ready! HTTP API available on port {}", ApiServer.getInstance().getPort());
        });

        // Don't stop API server on world exit – keep alive for title-screen operations.
        // Server is stopped only on CLIENT_STOPPING (Minecraft window close).
        // ServerLifecycleEvents.SERVER_STOPPING.register(server -> {
        //     ApiServer.getInstance().stop();
        //     LOGGER.info("Minecraft API Mod stopped.");
        // });

        ServerTickEvents.START_SERVER_TICK.register(server -> {
            ApiServer.getInstance().processQueuedCommands(server);
        });
    }
}
