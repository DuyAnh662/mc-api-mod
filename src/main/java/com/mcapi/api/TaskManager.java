package com.mcapi.api;

import net.minecraft.client.KeyMapping;
import com.mojang.blaze3d.platform.InputConstants;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ScheduledFuture;

public class TaskManager {
    private static final TaskManager INSTANCE = new TaskManager();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(8);
    private final ExecutorService immediatePool = Executors.newCachedThreadPool();
    private final List<Future<?>> activeTasks = new CopyOnWriteArrayList<>();
    private final List<InputConstants.Key> activeKeys = new CopyOnWriteArrayList<>();

    private TaskManager() {}

    public static TaskManager getInstance() {
        return INSTANCE;
    }

    public Future<?> schedule(Runnable task, long delayMs) {
        Future<?> future = scheduler.schedule(() -> {
            try {
                task.run();
            } finally {
                // Task is done, though it might not be easy to remove it from the list here without a self-reference.
                // It's okay, cancelAll will just clear everything.
            }
        }, delayMs, TimeUnit.MILLISECONDS);
        activeTasks.add(future);
        return future;
    }

    public Future<?> submit(Runnable task) {
        Future<?> future = immediatePool.submit(task);
        activeTasks.add(future);
        return future;
    }

    public ScheduledFuture<?> scheduleAtFixedRate(Runnable task, long initialDelayMs, long periodMs) {
        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(() -> {
            try {
                task.run();
            } catch (Exception e) {
                // Allow scheduled tasks to continue even after exceptions
            }
        }, initialDelayMs, periodMs, TimeUnit.MILLISECONDS);
        activeTasks.add(future);
        return future;
    }
    
    public void trackKey(InputConstants.Key key) {
        activeKeys.add(key); // Allow duplicates so overlapping scripts don't cancel each other
    }
    
    public void untrackKey(InputConstants.Key key) {
        activeKeys.remove(key); // Removes only one instance
    }

    public List<InputConstants.Key> getActiveKeys() {
        return activeKeys;
    }

    public void cancelAll() {
        for (Future<?> future : activeTasks) {
            if (!future.isDone() && !future.isCancelled()) {
                future.cancel(true);
            }
        }
        activeTasks.clear();
        
        // Release all tracked keys
        ApiServer.getInstance().queueClientCommand((client) -> {
            for (InputConstants.Key key : activeKeys) {
                KeyMapping.set(key, false);
            }
            activeKeys.clear();
        });
    }
}
