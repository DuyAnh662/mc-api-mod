package com.mcapi.api;

import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SessionManager {
    private static final SessionManager INSTANCE = new SessionManager();
    private static final SecureRandom RANDOM = new SecureRandom();
    private final Map<String, Session> sessions = new ConcurrentHashMap<>();

    private SessionManager() {}

    public static SessionManager getInstance() {
        return INSTANCE;
    }

    public Session createSession() {
        String id = generateSessionId();
        Session session = new Session(id);
        sessions.put(id, session);
        return session;
    }

    public Session getSession(String id) {
        return sessions.get(id);
    }

    public boolean closeSession(String id) {
        Session session = sessions.remove(id);
        if (session != null) {
            TaskManager.getInstance().cancelAll();
            return true;
        }
        return false;
    }

    private String generateSessionId() {
        byte[] bytes = new byte[16];
        RANDOM.nextBytes(bytes);
        return "sess_" + HexFormat.of().formatHex(bytes);
    }

    public static class Session {
        private final String id;
        private final long createdAt;
        private long lastTick;

        Session(String id) {
            this.id = id;
            this.createdAt = System.currentTimeMillis();
            this.lastTick = 0;
        }

        public String getId() { return id; }
        public long getCreatedAt() { return createdAt; }
        public long getLastTick() { return lastTick; }
        public void setLastTick(long tick) { this.lastTick = tick; }
    }
}
