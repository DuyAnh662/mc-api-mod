package com.mcapi.api;

import net.minecraft.client.Minecraft;

@FunctionalInterface
public interface QueuedClientCommand {
    void execute(Minecraft client) throws Exception;
}
