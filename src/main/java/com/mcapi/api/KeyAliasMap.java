package com.mcapi.api;

import com.mojang.blaze3d.platform.InputConstants;
import java.util.HashMap;
import java.util.Map;

/**
 * Maps simple, human-readable key names to GLFW InputConstants key identifiers.
 * Usage: KeyAliasMap.resolve("f3") -> InputConstants.Key for F3
 */
public class KeyAliasMap {
    private static final Map<String, String> ALIASES = new HashMap<>();

    static {
        // ===== Letters A-Z =====
        for (char c = 'a'; c <= 'z'; c++) {
            ALIASES.put(String.valueOf(c), "key.keyboard." + c);
        }

        // ===== Numbers 0-9 =====
        for (int i = 0; i <= 9; i++) {
            ALIASES.put(String.valueOf(i), "key.keyboard." + i);
        }

        // ===== Function Keys F1-F25 =====
        for (int i = 1; i <= 25; i++) {
            ALIASES.put("f" + i, "key.keyboard.f" + i);
        }

        // ===== Modifier Keys =====
        ALIASES.put("shift", "key.keyboard.left.shift");
        ALIASES.put("lshift", "key.keyboard.left.shift");
        ALIASES.put("rshift", "key.keyboard.right.shift");
        ALIASES.put("ctrl", "key.keyboard.left.control");
        ALIASES.put("lctrl", "key.keyboard.left.control");
        ALIASES.put("rctrl", "key.keyboard.right.control");
        ALIASES.put("control", "key.keyboard.left.control");
        ALIASES.put("alt", "key.keyboard.left.alt");
        ALIASES.put("lalt", "key.keyboard.left.alt");
        ALIASES.put("ralt", "key.keyboard.right.alt");
        ALIASES.put("super", "key.keyboard.left.win");
        ALIASES.put("win", "key.keyboard.left.win");
        ALIASES.put("lwin", "key.keyboard.left.win");
        ALIASES.put("rwin", "key.keyboard.right.win");

        // ===== Navigation Keys =====
        ALIASES.put("up", "key.keyboard.up");
        ALIASES.put("down", "key.keyboard.down");
        ALIASES.put("left", "key.keyboard.left");
        ALIASES.put("right", "key.keyboard.right");
        ALIASES.put("pageup", "key.keyboard.page.up");
        ALIASES.put("pagedown", "key.keyboard.page.down");
        ALIASES.put("home", "key.keyboard.home");
        ALIASES.put("end", "key.keyboard.end");

        // ===== Whitespace & Editing =====
        ALIASES.put("space", "key.keyboard.space");
        ALIASES.put("tab", "key.keyboard.tab");
        ALIASES.put("enter", "key.keyboard.enter");
        ALIASES.put("return", "key.keyboard.enter");
        ALIASES.put("backspace", "key.keyboard.backspace");
        ALIASES.put("delete", "key.keyboard.delete");
        ALIASES.put("del", "key.keyboard.delete");
        ALIASES.put("insert", "key.keyboard.insert");
        ALIASES.put("ins", "key.keyboard.insert");

        // ===== Special Keys =====
        ALIASES.put("esc", "key.keyboard.escape");
        ALIASES.put("escape", "key.keyboard.escape");
        ALIASES.put("capslock", "key.keyboard.caps.lock");
        ALIASES.put("caps", "key.keyboard.caps.lock");
        ALIASES.put("numlock", "key.keyboard.num.lock");
        ALIASES.put("scrolllock", "key.keyboard.scroll.lock");
        ALIASES.put("printscreen", "key.keyboard.print.screen");
        ALIASES.put("prtsc", "key.keyboard.print.screen");
        ALIASES.put("pause", "key.keyboard.pause");
        ALIASES.put("menu", "key.keyboard.menu");

        // ===== Punctuation & Symbols =====
        ALIASES.put("minus", "key.keyboard.minus");
        ALIASES.put("-", "key.keyboard.minus");
        ALIASES.put("equal", "key.keyboard.equal");
        ALIASES.put("equals", "key.keyboard.equal");
        ALIASES.put("=", "key.keyboard.equal");
        ALIASES.put("lbracket", "key.keyboard.left.bracket");
        ALIASES.put("[", "key.keyboard.left.bracket");
        ALIASES.put("rbracket", "key.keyboard.right.bracket");
        ALIASES.put("]", "key.keyboard.right.bracket");
        ALIASES.put("backslash", "key.keyboard.backslash");
        ALIASES.put("\\", "key.keyboard.backslash");
        ALIASES.put("semicolon", "key.keyboard.semicolon");
        ALIASES.put(";", "key.keyboard.semicolon");
        ALIASES.put("apostrophe", "key.keyboard.apostrophe");
        ALIASES.put("'", "key.keyboard.apostrophe");
        ALIASES.put("quote", "key.keyboard.apostrophe");
        ALIASES.put("grave", "key.keyboard.grave.accent");
        ALIASES.put("`", "key.keyboard.grave.accent");
        ALIASES.put("comma", "key.keyboard.comma");
        ALIASES.put(",", "key.keyboard.comma");
        ALIASES.put("period", "key.keyboard.period");
        ALIASES.put(".", "key.keyboard.period");
        ALIASES.put("slash", "key.keyboard.slash");
        ALIASES.put("/", "key.keyboard.slash");

        // ===== Numpad =====
        for (int i = 0; i <= 9; i++) {
            ALIASES.put("numpad" + i, "key.keyboard.keypad." + i);
            ALIASES.put("kp" + i, "key.keyboard.keypad." + i);
            ALIASES.put("np" + i, "key.keyboard.keypad." + i);
        }
        ALIASES.put("numpad_add", "key.keyboard.keypad.add");
        ALIASES.put("numpad_subtract", "key.keyboard.keypad.subtract");
        ALIASES.put("numpad_multiply", "key.keyboard.keypad.multiply");
        ALIASES.put("numpad_divide", "key.keyboard.keypad.divide");
        ALIASES.put("numpad_enter", "key.keyboard.keypad.enter");
        ALIASES.put("numpad_decimal", "key.keyboard.keypad.decimal");
        ALIASES.put("numpad_equal", "key.keyboard.keypad.equal");
        ALIASES.put("kp_add", "key.keyboard.keypad.add");
        ALIASES.put("kp_sub", "key.keyboard.keypad.subtract");
        ALIASES.put("kp_mul", "key.keyboard.keypad.multiply");
        ALIASES.put("kp_div", "key.keyboard.keypad.divide");
        ALIASES.put("kp_enter", "key.keyboard.keypad.enter");
        ALIASES.put("kp_decimal", "key.keyboard.keypad.decimal");

        // ===== Mouse Buttons =====
        ALIASES.put("mouse_left", "key.mouse.left");
        ALIASES.put("mouse_right", "key.mouse.right");
        ALIASES.put("mouse_middle", "key.mouse.middle");
        ALIASES.put("mouse1", "key.mouse.left");
        ALIASES.put("mouse2", "key.mouse.right");
        ALIASES.put("mouse3", "key.mouse.middle");
        ALIASES.put("mouse4", "key.mouse.4");
        ALIASES.put("mouse5", "key.mouse.5");
    }

    /**
     * Resolves a user-friendly key name to an InputConstants.Key.
     * Accepts: "f3", "shift", "ctrl", "w", "space", "up", "mouse_left", etc.
     * Also accepts raw GLFW names like "key.keyboard.f3" directly.
     */
    public static InputConstants.Key resolve(String input) {
        String lower = input.trim().toLowerCase();

        // If user already provided full key name, use directly
        if (lower.startsWith("key.")) {
            return InputConstants.getKey(lower);
        }

        // Look up in alias map
        String mapped = ALIASES.get(lower);
        if (mapped != null) {
            return InputConstants.getKey(mapped);
        }

        // Fallback: try key.keyboard.<input>
        return InputConstants.getKey("key.keyboard." + lower);
    }

    /**
     * Returns a copy of all registered aliases for documentation purposes.
     */
    public static Map<String, String> getAllAliases() {
        return new HashMap<>(ALIASES);
    }
}
