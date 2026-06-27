package com.mcapi.api;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.components.AbstractSliderButton;
import net.minecraft.client.gui.components.AbstractWidget;
import net.minecraft.client.gui.components.Button;
import net.minecraft.client.gui.components.ChatComponent;
import net.minecraft.client.gui.components.EditBox;
import net.minecraft.client.gui.components.events.GuiEventListener;
import net.minecraft.client.gui.narration.NarratableEntry;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.resources.language.I18n;
import net.minecraft.network.chat.Component;

import java.util.ArrayList;
import java.util.List;

public class ScreenObserver {

    public static JsonObject observe() {
        Minecraft client = Minecraft.getInstance();
        Screen screen = client.screen;
        JsonObject screenObj = new JsonObject();

        if (screen == null) return screenObj;

        screenObj.addProperty("id", resolveScreenId(screen));
        screenObj.addProperty("title", screen.getTitle().getString());
        screenObj.addProperty("type", "menu");
        screenObj.addProperty("pause_game", screen.isPauseScreen());

        JsonArray components = new JsonArray();
        List<GuiEventListener> listeners = new ArrayList<>(screen.children());
        int id = 0;

        for (GuiEventListener listener : listeners) {
            if (listener instanceof AbstractWidget widget) {
                JsonObject comp = new JsonObject();
                comp.addProperty("id", id++);
                comp.addProperty("text", widget.getMessage().getString());
                comp.addProperty("enabled", widget.isActive());
                comp.addProperty("visible", widget.visible);

                boolean isFocused = false;
                if (screen.getFocused() != null && screen.getFocused() == listener) {
                    isFocused = true;
                }
                comp.addProperty("focused", isFocused);

                if (listener instanceof EditBox editBox) {
                    comp.addProperty("type", "textbox");
                    comp.addProperty("value", editBox.getValue());
                } else if (listener instanceof AbstractSliderButton slider) {
                    comp.addProperty("type", "slider");
                    comp.addProperty("value", getSliderValue(slider));
                    comp.addProperty("min", 0);
                    comp.addProperty("max", 1);
                } else if (listener instanceof Button) {
                    comp.addProperty("type", "button");
                } else {
                    comp.addProperty("type", "custom");
                }

                components.add(comp);
            }
        }

        screenObj.add("components", components);

        JsonArray navigation = new JsonArray();
        navigation.add(getScreenName(screen));
        screenObj.add("navigation", navigation);

        return screenObj;
    }

    private static double getSliderValue(AbstractSliderButton slider) {
        try {
            var field = AbstractSliderButton.class.getDeclaredField("value");
            field.setAccessible(true);
            return field.getDouble(slider);
        } catch (Exception e) {
            return 0.5;
        }
    }

    private static String getScreenName(Screen screen) {
        String title = screen.getTitle().getString();
        if (title.isEmpty()) {
            String clsName = screen.getClass().getSimpleName();
            clsName = clsName.replace("Screen", "");
            StringBuilder result = new StringBuilder();
            for (char c : clsName.toCharArray()) {
                if (Character.isUpperCase(c) && !result.isEmpty()) {
                    result.append(' ');
                }
                result.append(c);
            }
            return result.toString().trim();
        }
        return title;
    }

    private static final java.util.Map<String, String> KNOWN_SCREENS = new java.util.HashMap<>();
    static {
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.TitleScreen", "minecraft:title");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.PauseScreen", "minecraft:pause");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.OptionsScreen", "minecraft:options");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.VideoSettingsScreen", "minecraft:video_settings");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.SoundOptionsScreen", "minecraft:sound_settings");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.ControlsScreen", "minecraft:controls");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.KeyBindsScreen", "minecraft:keybinds");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.LanguageScreen", "minecraft:language");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.CreateWorldScreen", "minecraft:create_world");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.EditWorldScreen", "minecraft:edit_world");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.worldselection.SelectWorldScreen", "minecraft:select_world");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.multiplayer.JoinMultiplayerScreen", "minecraft:multiplayer");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.multiplayer.AddServerScreen", "minecraft:add_server");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.DirectJoinServerScreen", "minecraft:direct_connect");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.advancements.AdvancementsScreen", "minecraft:advancements");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.RecipeBookScreen", "minecraft:recipe_book");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.InventoryScreen", "minecraft:inventory");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.CreativeModeInventoryScreen", "minecraft:creative_inventory");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.CraftingScreen", "minecraft:crafting");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.FurnaceScreen", "minecraft:furnace");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.BlastFurnaceScreen", "minecraft:blast_furnace");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.SmokerScreen", "minecraft:smoker");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.BrewingStandScreen", "minecraft:brewing_stand");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.EnchantmentScreen", "minecraft:enchantment");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.AnvilScreen", "minecraft:anvil");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.GrindstoneScreen", "minecraft:grindstone");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.CartographyTableScreen", "minecraft:cartography_table");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.StonecutterScreen", "minecraft:stonecutter");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.LoomScreen", "minecraft:loom");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.SmithingScreen", "minecraft:smithing");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.MerchantScreen", "minecraft:villager_trades");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.HorseInventoryScreen", "minecraft:horse_inventory");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.inventory.AbstractContainerScreen", "minecraft:container");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.CreditsScreen", "minecraft:credits");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.DeathScreen", "minecraft:death");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.SleepInMultiplayerScreen", "minecraft:sleep");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.DemoIntroScreen", "minecraft:demo");
        KNOWN_SCREENS.put("net.minecraft.client.gui.screens.Screen", "minecraft:generic");
    }

    private static String resolveScreenId(Screen screen) {
        String fullName = screen.getClass().getName();
        String known = KNOWN_SCREENS.get(fullName);
        if (known != null) return known;

        String lower = fullName.toLowerCase();
        if (lower.contains("inventory") || lower.contains("container")) return "minecraft:container";
        if (lower.contains("menu") || lower.contains("screen")) return "minecraft:menu";
        if (lower.contains("options") || lower.contains("settings")) return "minecraft:options";

        String simple = screen.getClass().getSimpleName().toLowerCase()
                .replace("screen", "")
                .replace('$', '_');
        return "minecraft:" + simple;
    }
}
