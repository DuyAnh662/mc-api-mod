package com.mcapi.api;

import net.minecraft.server.MinecraftServer;

@FunctionalInterface
public interface QueuedCommand {
    void execute(MinecraftServer server) throws Exception;
}
