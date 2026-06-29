(function() {
const SECTIONS = {};

SECTIONS['getting-started'] = {
  title: 'Getting Started',
  pages: [
    {
      id: 'getting-started.auth',
      title: 'Authentication & Configuration',
      content: `
<h2 id="auth">Authentication (Required)</h2>
<div class="alert alert-warn">All API requests require authentication via Bearer token.</div>

<p>Provide your token via the <code>Authorization</code> header:</p>
<pre><code>-H "Authorization: Bearer &lt;your_token&gt;"</code></pre>

<p>If you did not set <code>-Dmcapi.key=&lt;token&gt;</code> in JVM arguments, the mod generates a random 64-character hex token on startup and prints it to the log:</p>
<pre><code>mcapi.key not provided! Generated random auth token: &lt;your_token&gt;</code></pre>

<h3 id="jvm-props">JVM Configuration Properties</h3>
<table>
  <tr><th>Property</th><th>Default</th><th>Description</th></tr>
  <tr><td><code>-Dmcapi.key=&lt;token&gt;</code></td><td>Auto-generated</td><td>Bearer token for authentication</td></tr>
  <tr><td><code>-Dmcapi.port=25566</code></td><td><code>25566</code></td><td>HTTP server port</td></tr>
  <tr><td><code>-Dmcapi.host=127.0.0.1</code></td><td><code>127.0.0.1</code></td><td>Bind address (use <code>0.0.0.0</code> for LAN/external)</td></tr>
</table>

<h3 id="security-limits">Security Limits</h3>
<table class="param-table">
  <tr><td>Rate limit</td><td>60 requests/second per IP</td></tr>
  <tr><td>Max body size</td><td>1 MB</td></tr>
  <tr><td>Token comparison</td><td>Constant-time (<code>MessageDigest.isEqual()</code>)</td></tr>
  <tr><td>Input validation</td><td>Block/item IDs validated against <code>namespace:path</code> format</td></tr>
  <tr><td>Default bind</td><td>localhost only</td></tr>
</table>
`
    },
    {
      id: 'getting-started.usage',
      title: 'How to Use',
      content: `
<h2 id="request-structure">Request Structure</h2>
<p>Every API call requires 4 elements:</p>
<ol>
  <li><strong>HTTP Method:</strong> <code>GET</code> (retrieve data) or <code>POST</code> (perform action)</li>
  <li><strong>Endpoint (URL):</strong> The command path</li>
  <li><strong>Headers:</strong> <code>Authorization: Bearer &lt;token&gt;</code> (required) + <code>Content-Type: application/json</code> for POST</li>
  <li><strong>Body (Payload):</strong> JSON data (on terminal, wrap JSON in single quotes <code>'...'</code>)</li>
</ol>

<h2 id="list-endpoints">List All Endpoints</h2>
<pre><code>curl -H "Authorization: Bearer &lt;token&gt;" http://localhost:25566/api/</code></pre>

<p>The root endpoint returns a JSON list of all available API endpoints.</p>

<h2 id="installation">Installation</h2>
<ol>
  <li>Install <a href="https://fabricmc.net/">Fabric Loader</a> for Minecraft 1.21.11</li>
  <li>Download the <code>mc-api-mod.jar</code> and place it in <code>.minecraft/mods/</code></li>
  <li>Launch the game! The HTTP server starts automatically</li>
</ol>

<h3 id="build-from-source">Build from Source</h3>
<pre><code>git clone https://github.com/DuyAnh662/mc-api-mod.git
cd mc-api-mod
./gradlew build</code></pre>
<p>The built JAR will be in <code>build/libs/</code>.</p>
`
    }
  ]
};

SECTIONS['api-reference'] = {
  title: 'API Reference',
  pages: [
    {
      id: 'api.client',
      title: 'Client Commands',
      content: `
<h2 id="client-input">2.1 Simulate Key Press</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/client/input</span>
  <div class="endpoint-desc">Press one or more keyboard keys. Supports all keys including special keys.</div>
</div>

<h4>Parameters</h4>
<table class="param-table">
  <tr><th>Parameter</th><th>Type</th><th>Required</th><th>Description</th></tr>
  <tr><td><code>keys</code></td><td>String array</td><td>Yes</td><td>List of keys to press</td></tr>
  <tr><td><code>duration</code></td><td>Number (ms)</td><td>No</td><td>How long to hold keys (default: 0 = press and release immediately)</td></tr>
</table>

<h4>Examples</h4>

<p><strong>Walk forward for 1 second:</strong></p>
<pre><code>curl -X POST http://localhost:25566/api/client/input \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"keys": ["w"], "duration": 1000}'</code></pre>

<p><strong>Sprint (Ctrl + W) for 2 seconds:</strong></p>
<pre><code>curl -X POST http://localhost:25566/api/client/input \\
     -H "Content-Type: application/json" \\
     -d '{"keys": ["ctrl", "w"], "duration": 2000}'</code></pre>

<p><strong>Open F3 Debug screen:</strong></p>
<pre><code>curl -X POST http://localhost:25566/api/client/input \\
     -H "Content-Type: application/json" \\
     -d '{"keys": ["f3"]}'</code></pre>

<p><strong>Press Escape:</strong></p>
<pre><code>curl -X POST http://localhost:25566/api/client/input \\
     -H "Content-Type: application/json" \\
     -d '{"keys": ["esc"]}'</code></pre>

<h3 id="key-table">Full Key Name Table</h3>
<p>Type the short name, case-insensitive.</p>
<table>
  <tr><th>Group</th><th>Key Names</th><th>Example</th></tr>
  <tr><td><strong>Letters</strong></td><td><code>a</code> to <code>z</code></td><td><code>"a"</code>, <code>"w"</code>, <code>"s"</code></td></tr>
  <tr><td><strong>Numbers</strong></td><td><code>0</code> to <code>9</code></td><td><code>"1"</code>, <code>"5"</code></td></tr>
  <tr><td><strong>Function</strong></td><td><code>f1</code> to <code>f25</code></td><td><code>"f3"</code>, <code>"f11"</code></td></tr>
  <tr><td><strong>Modifiers</strong></td><td><code>shift</code>, <code>lshift</code>, <code>rshift</code>, <code>ctrl</code>, <code>lctrl</code>, <code>rctrl</code>, <code>alt</code>, <code>lalt</code>, <code>ralt</code>, <code>win</code></td><td><code>"ctrl"</code>, <code>"shift"</code></td></tr>
  <tr><td><strong>Arrows</strong></td><td><code>up</code>, <code>down</code>, <code>left</code>, <code>right</code></td><td><code>"up"</code>, <code>"down"</code></td></tr>
  <tr><td><strong>Navigation</strong></td><td><code>pageup</code>, <code>pagedown</code>, <code>home</code>, <code>end</code></td><td><code>"pageup"</code></td></tr>
  <tr><td><strong>Whitespace</strong></td><td><code>space</code>, <code>tab</code>, <code>enter</code>, <code>backspace</code></td><td><code>"space"</code>, <code>"tab"</code></td></tr>
  <tr><td><strong>Delete/Insert</strong></td><td><code>delete</code> / <code>del</code>, <code>insert</code> / <code>ins</code></td><td><code>"del"</code></td></tr>
  <tr><td><strong>Special</strong></td><td><code>esc</code> / <code>escape</code>, <code>capslock</code> / <code>caps</code>, <code>numlock</code>, <code>scrolllock</code>, <code>printscreen</code> / <code>prtsc</code>, <code>pause</code>, <code>menu</code></td><td><code>"esc"</code></td></tr>
  <tr><td><strong>Symbols</strong></td><td><code>minus</code> / <code>-</code>, <code>equal</code> / <code>=</code>, <code>lbracket</code> / <code>[</code>, <code>rbracket</code> / <code>]</code>, <code>backslash</code> / <code>\\</code>, <code>semicolon</code> / <code>;</code>, <code>apostrophe</code> / <code>'</code>, <code>grave</code> / <code>backtick</code>, <code>comma</code> / <code>,</code>, <code>period</code> / <code>.</code>, <code>slash</code> / <code>/</code></td><td><code>"-"</code>, <code>"."</code></td></tr>
  <tr><td><strong>Numpad</strong></td><td><code>numpad0</code>–<code>numpad9</code> (or <code>kp0</code>–<code>kp9</code>), <code>numpad_add</code>, <code>numpad_subtract</code>, <code>numpad_multiply</code>, <code>numpad_divide</code>, <code>numpad_enter</code>, <code>numpad_decimal</code></td><td><code>"numpad5"</code></td></tr>
  <tr><td><strong>Mouse</strong></td><td><code>mouse_left</code> / <code>mouse1</code>, <code>mouse_right</code> / <code>mouse2</code>, <code>mouse_middle</code> / <code>mouse3</code>, <code>mouse4</code>, <code>mouse5</code></td><td><code>"mouse_left"</code></td></tr>
</table>

<h2 id="click-button">2.2 Click UI Button</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/client/click_button</span>
  <div class="endpoint-desc">Find a button on the current screen and click it.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/client/click_button \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"button_text": "singleplayer"}'</code></pre>

<h2 id="client-settings">2.3 Change Client Settings</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/client/settings</span>
  <div class="endpoint-desc">Quickly change display configuration.</div>
</div>

<h4>Parameters</h4>
<table class="param-table">
  <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
  <tr><td><code>fov</code></td><td>Number</td><td>Field of view (30-110)</td></tr>
  <tr><td><code>renderDistance</code></td><td>Number</td><td>Render distance in chunks</td></tr>
  <tr><td><code>simulationDistance</code></td><td>Number</td><td>Simulation distance</td></tr>
  <tr><td><code>gamma</code></td><td>Number</td><td>Brightness (0-1)</td></tr>
</table>

<pre><code>curl -X POST http://localhost:25566/api/client/settings \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"fov": 90, "renderDistance": 12}'</code></pre>

<h2 id="client-debug">2.4 Get Debug / F3 Info</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/client/debug</span>
  <div class="endpoint-desc">Get information from the F3 Debug screen without opening F3.</div>
</div>

<h4>Query Parameters</h4>
<table class="param-table">
  <tr><th>Parameter</th><th>Description</th></tr>
  <tr><td><code>fields</code></td><td>Comma-separated list: <code>fps</code>, <code>days</code>, <code>xyz</code>, <code>chunk</code>, <code>dimension</code>, <code>biome</code>. Empty = all.</td></tr>
</table>

<h4>Examples</h4>
<pre><code># Get all info
curl -H "Authorization: Bearer &lt;token&gt;" -X GET http://localhost:25566/api/client/debug

# Get FPS only
curl -H "Authorization: Bearer &lt;token&gt;" -X GET "http://localhost:25566/api/client/debug?fields=fps"

# Get FPS and days played
curl -H "Authorization: Bearer &lt;token&gt;" -X GET "http://localhost:25566/api/client/debug?fields=fps,days"</code></pre>
`
    },
    {
      id: 'api.player',
      title: 'Player Commands',
      content: `
<h2 id="player-teleport">3.1 Teleport</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/player/teleport</span>
  <div class="endpoint-desc">Teleport the player to specific coordinates.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/player/teleport \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"x": 100, "y": 70, "z": 200}'</code></pre>

<h2 id="player-look">3.2 Look Direction</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/player/look</span>
  <div class="endpoint-desc">Set absolute (yaw/pitch) or relative (deltaYaw/deltaPitch) look direction.</div>
</div>

<h4>Parameters</h4>
<table class="param-table">
  <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
  <tr><td><code>yaw</code></td><td>Number</td><td>Absolute horizontal direction. 0=South, 90=West, 180=North, 270=East</td></tr>
  <tr><td><code>pitch</code></td><td>Number</td><td>Absolute vertical direction. -90=up, 0=straight, 90=down</td></tr>
  <tr><td><code>deltaYaw</code></td><td>Number</td><td>Relative horizontal rotation. Positive=right, Negative=left</td></tr>
  <tr><td><code>deltaPitch</code></td><td>Number</td><td>Relative vertical rotation. Positive=down, Negative=up</td></tr>
</table>

<h4>Examples</h4>
<pre><code># Set absolute look direction
curl -X POST http://localhost:25566/api/player/look \\
     -H "Content-Type: application/json" \\
     -d '{"yaw": 90.0, "pitch": 0.0}'

# Turn right 90 degrees
curl -X POST http://localhost:25566/api/player/look \\
     -H "Content-Type: application/json" \\
     -d '{"deltaYaw": 90.0}'

# Look up 45° and turn left 30°
curl -X POST http://localhost:25566/api/player/look \\
     -H "Content-Type: application/json" \\
     -d '{"deltaYaw": -30.0, "deltaPitch": -45.0}'

# Spin 360 degrees
curl -X POST http://localhost:25566/api/player/look \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"deltaYaw": 360}'</code></pre>

<h2 id="player-jump-swing">3.3 Jump & Swing</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/player/jump</span>
  <div class="endpoint-desc">Make the player jump.</div>
</div>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/player/swing</span>
  <div class="endpoint-desc">Swing the player's hand.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/player/jump \\
     -H "Authorization: Bearer &lt;token&gt;"

curl -X POST http://localhost:25566/api/player/swing \\
     -H "Authorization: Bearer &lt;token&gt;"</code></pre>

<h2 id="player-position-list">3.4 Get Position & Player List</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/player/position</span>
  <div class="endpoint-desc">Get player position and rotation.</div>
</div>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/player/list</span>
  <div class="endpoint-desc">List all online players with position, health, dimension.</div>
</div>

<pre><code>curl -H "Authorization: Bearer &lt;token&gt;" -X GET http://localhost:25566/api/player/position

curl -H "Authorization: Bearer &lt;token&gt;" -X GET http://localhost:25566/api/player/list</code></pre>

<h2 id="player-position-post">3.5 Set Position</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/player/position</span>
  <div class="endpoint-desc">Update player position data.</div>
</div>
`
    },
    {
      id: 'api.block',
      title: 'Block Commands',
      content: `
<h2 id="block-place">4.1 Place Block</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/block/place</span>
  <div class="endpoint-desc">Place a block at specific coordinates.</div>
</div>

<h4>Parameters</h4>
<table class="param-table">
  <tr><th>Parameter</th><th>Type</th><th>Required</th><th>Description</th></tr>
  <tr><td><code>x</code></td><td>Number</td><td>Yes</td><td>X coordinate</td></tr>
  <tr><td><code>y</code></td><td>Number</td><td>Yes</td><td>Y coordinate</td></tr>
  <tr><td><code>z</code></td><td>Number</td><td>Yes</td><td>Z coordinate</td></tr>
  <tr><td><code>block</code></td><td>String</td><td>Yes</td><td>Block ID (e.g., <code>minecraft:diamond_block</code>)</td></tr>
</table>

<pre><code>curl -X POST http://localhost:25566/api/block/place \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"x": 10, "y": 64, "z": 10, "block": "minecraft:diamond_block"}'</code></pre>

<h2 id="block-break">4.2 Break Block</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/block/break</span>
  <div class="endpoint-desc">Break a block at specific coordinates.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/block/break \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"x": 10, "y": 64, "z": 10}'</code></pre>

<h2 id="block-interact">4.3 Interact with Block</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/block/interact</span>
  <div class="endpoint-desc">Right-click a block (open chests, doors, etc.).</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/block/interact \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"x": 10, "y": 64, "z": 10}'</code></pre>

<h2 id="block-get">4.4 Get Block Info</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/block/get</span>
  <div class="endpoint-desc">Get information about a block at specific coordinates.</div>
</div>

<pre><code>curl -H "Authorization: Bearer &lt;token&gt;" "http://localhost:25566/api/block/get?x=10&y=64&z=10"</code></pre>
`
    },
    {
      id: 'api.inventory',
      title: 'Inventory Commands',
      content: `
<h2 id="inv-select">5.1 Select Hotbar Slot</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/inventory/select</span>
  <div class="endpoint-desc">Switch held item (Hotbar slot 0-8).</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/inventory/select \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"slot": 2}'</code></pre>

<h2 id="inv-set">5.2 Set Item in Slot</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/inventory/set</span>
  <div class="endpoint-desc">Set an item in a specific inventory slot.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/inventory/set \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"slot": 0, "item": "minecraft:netherite_sword", "count": 1}'</code></pre>

<h2 id="inv-drop">5.3 Drop Item</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/inventory/drop</span>
  <div class="endpoint-desc">Drop items from a specific slot.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/inventory/drop \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"slot": 0, "all": true}'</code></pre>

<h2 id="inv-get">5.4 Get Inventory Contents</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/inventory/get</span>
  <div class="endpoint-desc">Get full inventory contents.</div>
</div>

<pre><code>curl -H "Authorization: Bearer &lt;token&gt;" -X GET http://localhost:25566/api/inventory/get</code></pre>
`
    },
    {
      id: 'api.world',
      title: 'World & Server',
      content: `
<h2 id="world-time">6.1 Set Time</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/world/time</span>
  <div class="endpoint-desc">Change world time (0-24000).</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/world/time \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"time": 1000}'</code></pre>

<h2 id="world-weather">6.2 Set Weather</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/world/weather</span>
  <div class="endpoint-desc">Change weather (clear/rain/thunder).</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/world/weather \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"weather": "thunder", "duration": 6000}'</code></pre>

<h2 id="world-get">6.3 Get World State</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/world/time</span>
  <div class="endpoint-desc">Get current world time.</div>
</div>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/world/weather</span>
  <div class="endpoint-desc">Get current weather state.</div>
</div>

<h2 id="command">6.4 Run Minecraft Command</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/command</span>
  <div class="endpoint-desc">Run any Minecraft server command.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/command \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"command": "kill @e[type=zombie]"}'</code></pre>

<h2 id="chat">6.5 Send Chat Message</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/chat/send</span>
  <div class="endpoint-desc">Broadcast a chat message to all players.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/chat/send \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"message": "Hello Server!"}'</code></pre>

<h2 id="gamerule">6.6 Game Rules & Difficulty</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/settings/gamerule</span>
  <div class="endpoint-desc">Set a game rule.</div>
</div>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/settings/difficulty</span>
  <div class="endpoint-desc">Set game difficulty.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/settings/gamerule \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"rule": "keepInventory", "value": "true"}'

curl -X POST http://localhost:25566/api/settings/difficulty \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"difficulty": "hard"}'</code></pre>

<h4>Difficulty Values</h4>
<table>
  <tr><th>Value</th><th>Description</th></tr>
  <tr><td><code>peaceful</code></td><td>No hostile mobs, health regen</td></tr>
  <tr><td><code>easy</code></td><td>Less damage, fewer mobs</td></tr>
  <tr><td><code>normal</code></td><td>Standard gameplay</td></tr>
  <tr><td><code>hard</code></td><td>More damage, mobs can break doors</td></tr>
</table>
`
    },
    {
      id: 'api.script',
      title: 'Script System',
      content: `
<h2 id="script">7.1 Run Script</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/script</span>
  <div class="endpoint-desc">Execute multiple commands sequentially in JSON or ultra-short text format.</div>
</div>

<h3>JSON Syntax</h3>
<pre><code>curl -X POST http://localhost:25566/api/script \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '[
        {"action": "key", "keys": ["w", "ctrl"], "duration": 2000},
        {"action": "delay", "duration": 500},
        {"action": "look", "deltaYaw": 90},
        {"action": "chat", "message": "Done spinning!"},
        {"action": "command", "command": "time set day"}
      ]'</code></pre>

<h3>Text Syntax (Ultra-short)</h3>
<pre><code>curl -X POST http://localhost:25566/api/script \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -d 'key w,ctrl 2000
delay 500
look 90 0
chat Done spinning!
command time set day'</code></pre>

<h3>Supported Actions</h3>
<table>
  <tr><th>Action</th><th>JSON Syntax</th><th>Text Syntax</th><th>Description</th></tr>
  <tr>
    <td><code>key</code></td>
    <td><code>{"action":"key", "keys":["w","ctrl"], "duration":1000}</code></td>
    <td><code>key w,ctrl 1000</code></td>
    <td>Press keys</td>
  </tr>
  <tr>
    <td><code>delay</code></td>
    <td><code>{"action":"delay", "duration":500}</code></td>
    <td><code>delay 500</code></td>
    <td>Wait N ms</td>
  </tr>
  <tr>
    <td><code>look</code></td>
    <td><code>{"action":"look", "deltaYaw":90}</code></td>
    <td><code>look 90 0</code></td>
    <td>Rotate camera</td>
  </tr>
  <tr>
    <td><code>chat</code></td>
    <td><code>{"action":"chat", "message":"Hi"}</code></td>
    <td><code>chat Hi</code></td>
    <td>Send chat message</td>
  </tr>
  <tr>
    <td><code>command</code></td>
    <td><code>{"action":"command", "command":"time set day"}</code></td>
    <td><code>command time set day</code></td>
    <td>Run MC command</td>
  </tr>
</table>

<h3>Auto-mining Bot Example</h3>
<pre><code>curl -X POST http://localhost:25566/api/script \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -d 'key w 500
key mouse_left 200
delay 100
key w 500
key mouse_left 200'</code></pre>

<h2 id="cancel">7.2 Cancel All Commands</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/api/cancel</span>
  <div class="endpoint-desc">Immediately stop all scripts, held keys, and pending commands.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/api/cancel \\
     -H "Authorization: Bearer &lt;token&gt;"</code></pre>

<h4>Use Case</h4>
<pre><code># Start walking for 60 seconds
curl -X POST http://localhost:25566/api/client/input \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"keys": ["w"], "duration": 60000}'

# 5 seconds later, cancel!
curl -X POST http://localhost:25566/api/cancel \\
     -H "Authorization: Bearer &lt;token&gt;"</code></pre>
`
    },
    {
      id: 'api.ai',
      title: 'AI Endpoints',
      content: `
<div class="alert alert-info">These endpoints transform MC-API into an AI training environment like OpenAI Gym / MineRL.</div>

<p>The core loop for AI agents:</p>
<pre><code>GET /observation  →  AI decides action  →  POST /action  →  [game tick]  →  GET /observation ...</code></pre>
<p>Or the combined step:</p>
<pre><code>POST /step {actions}  →  {observation}</code></pre>

<h2 id="session">8.1 Create Session</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/session</span>
  <div class="endpoint-desc">Create a new AI session for tracking multiple agents.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/session \\
     -H "Authorization: Bearer &lt;token&gt;"</code></pre>

<h4>Response</h4>
<pre><code>{
  "success": true,
  "message": "Session created",
  "data": { "session_id": "sess_...", "created_at": 1712345678000 }
}</code></pre>

<h2 id="observation">8.2 Get Observation</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/observation</span>
  <div class="endpoint-desc">Returns the full structured observation of the current game state.</div>
</div>

<pre><code>curl -H "Authorization: Bearer &lt;token&gt;" http://localhost:25566/observation</code></pre>

<h4>Response Structure</h4>
<pre><code>{
  "success": true,
  "message": "ok",
  "data": {
    "protocol": 1,
    "tick": 34100,
    "world": {
      "time": 12000,
      "day": 5,
      "is_day": true,
      "weather": "clear",
      "dimension": 0
    },
    "player": {
      "position": [120.5, 64.0, -42.3],
      "rotation": { "yaw": 90.0, "pitch": -20.0, "facing": "West" },
      "velocity": [0.0, 0.0, 0.0],
      "status": [20, 15, 20, 5, 300],
      "flags": [1, 0, 0, 0, 0, 0]
    },
    "camera": { "fov": 70, "matrix": [16, 9] },
    "inventory": {
      "slots": [[3, 5, 64], [17, 1, 32], ...],
      "selected_slot": 3
    },
    "target": { "block_id": 56, "distance": 4.5, "face": 1 },
    "viewport_blocks": [[5, 1, 1], [3, 3, 4], ...],
    "viewport_entities": [[54, 3.2, 0.0, 5.1, 180, 0, 20, 6.0], ...],
    "screen": {
      "id": "minecraft:title",
      "title": "Minecraft",
      "type": "menu",
      "pause_game": false,
      "components": [
        { "id": 0, "type": "button", "text": "Singleplayer", "enabled": true, "visible": true, "focused": false }
      ],
      "navigation": ["Main Menu"]
    }
  }
}</code></pre>

<h2 id="action">8.3 Send Actions</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/action</span>
  <div class="endpoint-desc">Send one or more actions to execute on the current game tick.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/action \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"actions": [{"type": "jump"}, {"type": "swing"}]}'</code></pre>

<h4>Supported Action Types</h4>
<table>
  <tr><th>Type</th><th>Parameters</th><th>Description</th></tr>
  <tr><td><code>key</code></td><td><code>keys: ["w","ctrl"]</code>, <code>duration?: 1000</code></td><td>Press/release keyboard keys</td></tr>
  <tr><td><code>select_slot</code></td><td><code>slot: 2</code></td><td>Select hotbar slot (0-8)</td></tr>
  <tr><td><code>place</code></td><td><code>face: "up"/"down"/"north"/"south"/"east"/"west"</code></td><td>Place block on targeted face</td></tr>
  <tr><td><code>break</code></td><td>(none)</td><td>Break the targeted block</td></tr>
  <tr><td><code>interact</code></td><td>(none)</td><td>Right-click the targeted block</td></tr>
  <tr><td><code>jump</code></td><td>(none)</td><td>Make the player jump</td></tr>
  <tr><td><code>swing</code></td><td>(none)</td><td>Swing the player's hand</td></tr>
  <tr><td><code>look</code></td><td><code>yaw/pitch</code> or <code>deltaYaw/deltaPitch</code></td><td>Set look direction</td></tr>
  <tr><td><code>craft</code></td><td><code>recipe: "minecraft:chest"</code>, <code>mode: "craft_once"</code></td><td>Craft a recipe</td></tr>
  <tr><td><code>chat</code></td><td><code>message: "hello"</code></td><td>Send a chat message</td></tr>
  <tr><td><code>command</code></td><td><code>command: "/say hello"</code></td><td>Run a Minecraft command</td></tr>
  <tr><td><code>click_button</code></td><td><code>button_text: "Singleplayer"</code></td><td>Click a UI button</td></tr>
</table>

<h2 id="step">8.4 Combined Step</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/step</span>
  <div class="endpoint-desc">Combined action + observation. Like <code>env.step(action)</code> in OpenAI Gym.</div>
</div>

<pre><code>curl -X POST http://localhost:25566/step \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"actions": [{"type": "jump"}]}'</code></pre>

<h4>Response</h4>
<pre><code>{
  "success": true,
  "message": "ok",
  "data": {
    "tick": 34101,
    "observation": { ... }
  }
}</code></pre>

<h2 id="stream">8.5 Stream Observations</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/stream</span>
  <div class="endpoint-desc">Server-Sent Events (SSE) — pushes a new observation every game tick (~50ms).</div>
</div>

<pre><code>curl -N -H "Authorization: Bearer &lt;token&gt;" http://localhost:25566/stream</code></pre>

<p>Output format (SSE):</p>
<pre><code>data: {"protocol":1,"tick":34100,...}

data: {"protocol":1,"tick":34101,...}

data: {"protocol":1,"tick":34102,...}
...</code></pre>

<h2 id="close">8.6 Close Session</h2>
<div class="endpoint">
  <span class="badge badge-post">POST</span>
  <span class="endpoint-url">/close</span>
  <div class="endpoint-desc">Close an AI session and cancel all running tasks.</div>
</div>

<pre><code># Close specific session
curl -X POST http://localhost:25566/close \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"session_id": "sess_..."}'

# Cancel all tasks globally
curl -X POST http://localhost:25566/close \\
     -H "Authorization: Bearer &lt;token&gt;"</code></pre>

<h2 id="screenshot">8.7 Screenshot Capture</h2>
<div class="endpoint">
  <span class="badge badge-get">GET</span>
  <span class="endpoint-url">/api/client/screenshot</span>
  <div class="endpoint-desc">Capture game window as base64 JPEG, optimized for YOLO detection.</div>
</div>

<h4>Query Parameters</h4>
<table class="param-table">
  <tr><th>Parameter</th><th>Type</th><th>Default</th><th>Description</th></tr>
  <tr><td><code>width</code></td><td>int</td><td>640</td><td>Target width (64-1920)</td></tr>
  <tr><td><code>height</code></td><td>int</td><td>360</td><td>Target height (36-1080)</td></tr>
  <tr><td><code>quality</code></td><td>int</td><td>85</td><td>JPEG quality (10-100)</td></tr>
</table>

<h4>Example</h4>
<pre><code>curl -H "Authorization: Bearer &lt;token&gt;" http://localhost:25566/api/client/screenshot</code></pre>

<h4>Python + YOLO Example</h4>
<pre><code>import requests, base64, cv2, numpy as np
from ultralytics import YOLO

r = requests.get("http://localhost:25566/api/client/screenshot",
                 headers={"Authorization": "Bearer &lt;token&gt;"})
img = cv2.imdecode(np.frombuffer(base64.b64decode(
    r.json()["data"]["image"]), np.uint8), cv2.IMREAD_COLOR)
# Run YOLO on img
model = YOLO("yolo26n.pt")
results = model(img)</code></pre>
`
    }
  ]
};

SECTIONS['observation-schema'] = {
  title: 'Observation Schema',
  pages: [
    {
      id: 'obs.overview',
      title: 'Schema Overview',
      content: `
<h2 id="top-level">1. Top Level</h2>
<pre><code>{
  "success": true,
  "message": "ok",
  "data": {
    "protocol": 1,
    "tick": 34100,
    "world": { ... },
    "player": { ... },
    "camera": { ... },
    "inventory": { ... },
    "target": { ... },
    "viewport_blocks": [ ... ],
    "viewport_entities": [ ... ],
    "screen": { ... }
  }
}</code></pre>

<h3 id="field-descriptions">Field Descriptions</h3>
<table>
  <tr><th>Field</th><th>Description</th></tr>
  <tr><td><code>protocol</code></td><td>Protocol version for forward compatibility (currently 1)</td></tr>
  <tr><td><code>tick</code></td><td>Minecraft tick counter (20 ticks = 1 second)</td></tr>
  <tr><td><code>world.time</code></td><td>World day time (0-24000). 0=dawn, 6000=noon, 12000=dusk, 18000=midnight</td></tr>
  <tr><td><code>world.day</code></td><td>Days played</td></tr>
  <tr><td><code>world.is_day</code></td><td>Whether it's daytime (time &lt; 13000)</td></tr>
  <tr><td><code>world.weather</code></td><td><code>"clear"</code>, <code>"rain"</code>, or <code>"thunder"</code></td></tr>
  <tr><td><code>world.dimension</code></td><td>0=Overworld, 1=Nether, 2=End</td></tr>
  <tr><td><code>player.position</code></td><td>[x, y, z] coordinates</td></tr>
  <tr><td><code>player.rotation</code></td><td>yaw, pitch, and cardinal facing direction</td></tr>
  <tr><td><code>player.velocity</code></td><td>[x, y, z] movement vector</td></tr>
  <tr><td><code>player.status</code></td><td>[health, food, saturation, armor, air]</td></tr>
  <tr><td><code>player.flags</code></td><td>[on_ground, sprinting, sneaking, swimming, flying, sleeping] (0/1)</td></tr>
  <tr><td><code>camera.fov</code></td><td>Current field of view (30-110)</td></tr>
  <tr><td><code>camera.matrix</code></td><td>Viewport ray grid [width=16, height=9] = 144 rays (288 values as [depth, blockId] pairs)</td></tr>
  <tr><td><code>inventory.slots</code></td><td>Sparse array [slot_index, item_id, count] (only non-empty)</td></tr>
  <tr><td><code>inventory.selected_slot</code></td><td>Currently held hotbar slot (0-8)</td></tr>
  <tr><td><code>target.block_id</code></td><td>Block ID the crosshair is pointing at</td></tr>
  <tr><td><code>target.distance</code></td><td>Distance to targeted block</td></tr>
  <tr><td><code>target.face</code></td><td>Face of targeted block (0=Up,1=Down,2=North,3=South,4=West,5=East)</td></tr>
  <tr><td><code>viewport_blocks</code></td><td>RLE: [[count, depth, blockId], ...] — runs of identical rays. Depth=1-32 (distance to nearest solid), blockId=numeric block ID of that block (0 if no block found)</td></tr>
  <tr><td><code>viewport_entities</code></td><td>Visible entities in frustum (FOV-filtered) [type, relX, relY, relZ, yaw, pitch, health, distance]</td></tr>
  <tr><td><code>screen</code></td><td>Current UI screen info (only present when a screen is open)</td></tr>
</table>
`
    },
    {
      id: 'obs.player',
      title: 'Player State',
      content: `
<h2 id="player-state">Player State Details</h2>

<h3 id="player-position">position</h3>
<pre><code>[ x, y, z ]   // 3 floats</code></pre>
<ul>
  <li><code>y &lt; -64</code> = void (dying)</li>
  <li><code>y ≈ 63</code> = sea level</li>
  <li><code>y = 62–70</code> = typical ground level</li>
  <li>Caves at y=-32 to y=0</li>
  <li>Deepslate starts at y=0 and below</li>
</ul>

<h3 id="player-rotation">rotation</h3>
<table>
  <tr><th>Field</th><th>Range</th><th>Description</th></tr>
  <tr><td><code>yaw</code></td><td>-180 to 180</td><td>0=South, 90=West, ±180=North, -90=East</td></tr>
  <tr><td><code>pitch</code></td><td>-90 to 90</td><td>-90=up, 0=horizon, 90=down</td></tr>
  <tr><td><code>facing</code></td><td>—</td><td>Cardinal direction: South/West/North/East</td></tr>
</table>

<h3 id="player-velocity">velocity</h3>
<pre><code>[ vx, vy, vz ]   // 3 floats, blocks/tick</code></pre>
<ul>
  <li>All ≈ 0 = standing still</li>
  <li><code>vy &gt; 0</code> = moving up (jumping)</li>
  <li><code>vy &lt; 0</code> = falling</li>
  <li>If <code>vy &lt; -0.5</code> and <code>flags[0] == 0</code> → falling (danger!)</li>
</ul>

<h3 id="player-status">status — Vital Signs</h3>
<table>
  <tr><th>Index</th><th>Field</th><th>Range</th><th>Critical</th></tr>
  <tr><td>0</td><td>health</td><td>0-20</td><td>≤ 5 danger, = 0 dead</td></tr>
  <tr><td>1</td><td>food</td><td>0-20</td><td>≤ 6 can't sprint, = 0 starving</td></tr>
  <tr><td>2</td><td>saturation</td><td>0-20</td><td>> 0 means food won't decrease yet</td></tr>
  <tr><td>3</td><td>armor</td><td>0-20+</td><td>Damage reduction</td></tr>
  <tr><td>4</td><td>air</td><td>0-300</td><td>&lt; 300 = underwater, = 0 drowning</td></tr>
</table>

<h3 id="player-flags">flags — Binary State</h3>
<table>
  <tr><th>Index</th><th>Flag</th><th>1 means</th></tr>
  <tr><td>0</td><td>on_ground</td><td>Touching ground (can jump)</td></tr>
  <tr><td>1</td><td>sprinting</td><td>Moving faster (costs food)</td></tr>
  <tr><td>2</td><td>sneaking</td><td>Moving slower, won't fall off edges</td></tr>
  <tr><td>3</td><td>swimming</td><td>In water/lava</td></tr>
  <tr><td>4</td><td>flying</td><td>Elytra gliding</td></tr>
  <tr><td>5</td><td>sleeping</td><td>In bed (skipping night)</td></tr>
</table>
`
    },
    {
      id: 'obs.inventory',
      title: 'Inventory',
      content: `
<h2 id="inventory-slots">Inventory Slots</h2>
<p>Sparse slots <code>[slot_index, item_id, count]</code> (only non-empty).</p>

<p>Only slots that contain items are included. Empty slots are omitted.</p>

<ul>
  <li><code>slot_index</code>: 0-8 = hotbar, 9-35 = main inv, 36 = boots, 37 = leggings, 38 = chestplate, 39 = helmet, 40 = offhand</li>
  <li><code>item_id</code>: numeric ID from <code>BuiltInRegistries.ITEM</code> (dynamic per session)</li>
  <li><code>count</code>: stack size (1-99, max depends on item)</li>
  <li><code>selected_slot</code>: currently held hotbar slot (0-8)</li>
</ul>

<div class="alert alert-warn"><strong>Note:</strong> Item/block numeric IDs are <strong>dynamic</strong> — they depend on registry loading order at runtime. They are consistent within a single game session but may differ between launches. For reliable identification, use namespaced IDs (<code>minecraft:stone</code>).</div>
`
    },
    {
      id: 'obs.target',
      title: 'Target & Viewport',
      content: `
<h2 id="target">Target — Crosshair Target</h2>
<table>
  <tr><th>Field</th><th>Type</th><th>Range</th><th>Description</th></tr>
  <tr><td><code>block_id</code></td><td>int</td><td>0+</td><td>Targeted block ID (0 = nothing/air/far)</td></tr>
  <tr><td><code>distance</code></td><td>float</td><td>0+</td><td>Euclidean distance to block center</td></tr>
  <tr><td><code>face</code></td><td>int</td><td>0-5</td><td>Which side of the block</td></tr>
</table>

<h4>Block Face Index</h4>
<table>
  <tr><th>face</th><th>Side</th></tr>
  <tr><td>0</td><td>Top (↑)</td></tr>
  <tr><td>1</td><td>Bottom (↓)</td></tr>
  <tr><td>2</td><td>North</td></tr>
  <tr><td>3</td><td>South</td></tr>
  <tr><td>4</td><td>West</td></tr>
  <tr><td>5</td><td>East</td></tr>
</table>

<h2 id="viewport-blocks">Viewport Blocks — Depth-Map Vision</h2>
<p>RLE array <code>[[count, depth, blockId], ...]</code> — consecutive identical rays merged into runs. Each run: count=number of consecutive rays in this run, depth=distance in blocks (1–32) to the first non-air block (32=no solid within range), blockId=numeric block ID of that surface block (0 if depth=32).</p>
<ul>
  <li><code>width</code>: 0 (left) to 15 (right)</li>
  <li><code>height</code>: 0 (bottom of frustum) to 8 (top)</li>
</ul>

<h2 id="viewport-entities">Viewport Entities — Nearby Creatures</h2>
<p>Up to <strong>16 entities</strong> within the player's view frustum (FOV-filtered, not radius-based), each with 8 values. Only visible/filtered entities are returned (no empty padding):</p>
<pre><code>[type_id, relX, relY, relZ, yaw, pitch, health, distance]</code></pre>

<table>
  <tr><th>Index</th><th>Field</th><th>Description</th></tr>
  <tr><td>0</td><td>type_id</td><td>Entity type ID (0-127, stable across sessions)</td></tr>
  <tr><td>1-3</td><td>relX, relY, relZ</td><td>Position relative to player</td></tr>
  <tr><td>4</td><td>yaw</td><td>Entity yaw</td></tr>
  <tr><td>5</td><td>pitch</td><td>Entity pitch</td></tr>
  <tr><td>6</td><td>health</td><td>Entity health (0 for non-living)</td></tr>
  <tr><td>7</td><td>distance</td><td>Euclidean distance from player</td></tr>
</table>
`
    },
    {
      id: 'obs.screen',
      title: 'Screen Observation',
      content: `
<h2 id="screen">Screen — UI State</h2>
<p>Only present when a UI screen is open (inventory, chest, crafting table, pause menu, etc.).</p>

<h3 id="screen-fields">Common Fields</h3>
<table>
  <tr><th>Field</th><th>Type</th><th>Description</th></tr>
  <tr><td><code>id</code></td><td>string</td><td>Screen identifier (e.g., <code>minecraft:crafting</code>)</td></tr>
  <tr><td><code>title</code></td><td>string</td><td>Screen title text</td></tr>
  <tr><td><code>type</code></td><td>string</td><td>Always <code>"menu"</code></td></tr>
  <tr><td><code>pause_game</code></td><td>bool</td><td>Whether game is paused</td></tr>
</table>

<h3 id="screen-components">Components</h3>
<p>Array of interactive widgets on the screen:</p>
<table>
  <tr><th>Field</th><th>Type</th><th>Description</th></tr>
  <tr><td><code>id</code></td><td>int</td><td>Sequential index</td></tr>
  <tr><td><code>type</code></td><td>string</td><td><code>"button"</code> / <code>"textbox"</code> / <code>"slider"</code> / <code>"custom"</code></td></tr>
  <tr><td><code>text</code></td><td>string</td><td>Display text</td></tr>
  <tr><td><code>enabled</code></td><td>bool</td><td>Can be interacted with</td></tr>
  <tr><td><code>visible</code></td><td>bool</td><td>Is shown</td></tr>
  <tr><td><code>focused</code></td><td>bool</td><td>Has keyboard focus</td></tr>
  <tr><td><code>value</code></td><td>string/float</td><td>Textbox content or slider value (0-1)</td></tr>
</table>

<h3 id="screen-navigation">Navigation</h3>
<pre><code>[ "Parent Menu", "Current Screen" ]</code></pre>

<h3 id="screen-ids">Screen ID Reference</h3>
<table>
  <tr><th>Screen ID</th><th>Screen</th><th>How to Open</th></tr>
  <tr><td><code>minecraft:title</code></td><td>Title screen</td><td>Start game</td></tr>
  <tr><td><code>minecraft:select_world</code></td><td>World selection</td><td>Click Singleplayer</td></tr>
  <tr><td><code>minecraft:multiplayer</code></td><td>Server list</td><td>Click Multiplayer</td></tr>
  <tr><td><code>minecraft:inventory</code></td><td>Player inventory</td><td>Press E</td></tr>
  <tr><td><code>minecraft:creative_inventory</code></td><td>Creative menu</td><td>Press E (creative)</td></tr>
  <tr><td><code>minecraft:crafting</code></td><td>Crafting table</td><td>Right-click crafting table</td></tr>
  <tr><td><code>minecraft:furnace</code></td><td>Furnace</td><td>Right-click furnace</td></tr>
  <tr><td><code>minecraft:blast_furnace</code></td><td>Blast furnace</td><td>Right-click blast furnace</td></tr>
  <tr><td><code>minecraft:smoker</code></td><td>Smoker</td><td>Right-click smoker</td></tr>
  <tr><td><code>minecraft:brewing_stand</code></td><td>Brewing stand</td><td>Right-click brewing stand</td></tr>
  <tr><td><code>minecraft:enchantment</code></td><td>Enchantment table</td><td>Right-click enchant table</td></tr>
  <tr><td><code>minecraft:anvil</code></td><td>Anvil</td><td>Right-click anvil</td></tr>
  <tr><td><code>minecraft:grindstone</code></td><td>Grindstone</td><td>Right-click grindstone</td></tr>
  <tr><td><code>minecraft:cartography_table</code></td><td>Cartography table</td><td>Right-click cartography table</td></tr>
  <tr><td><code>minecraft:stonecutter</code></td><td>Stonecutter</td><td>Right-click stonecutter</td></tr>
  <tr><td><code>minecraft:loom</code></td><td>Loom</td><td>Right-click loom</td></tr>
  <tr><td><code>minecraft:smithing</code></td><td>Smithing table</td><td>Right-click smithing table</td></tr>
  <tr><td><code>minecraft:villager_trades</code></td><td>Villager trading</td><td>Right-click villager</td></tr>
  <tr><td><code>minecraft:horse_inventory</code></td><td>Horse inventory</td><td>Right-click horse</td></tr>
  <tr><td><code>minecraft:container</code></td><td>Chest/barrel/shulker</td><td>Right-click container</td></tr>
  <tr><td><code>minecraft:pause</code></td><td>Pause menu</td><td>Press Esc</td></tr>
  <tr><td><code>minecraft:death</code></td><td>Death screen</td><td>Player dies</td></tr>
  <tr><td><code>minecraft:options</code></td><td>Options</td><td>From pause/title</td></tr>
  <tr><td><code>minecraft:video_settings</code></td><td>Video settings</td><td>Options → Video</td></tr>
  <tr><td><code>minecraft:sound_settings</code></td><td>Sound settings</td><td>Options → Audio</td></tr>
  <tr><td><code>minecraft:controls</code></td><td>Controls</td><td>Options → Controls</td></tr>
  <tr><td><code>minecraft:keybinds</code></td><td>Key binds</td><td>Controls → Key Binds</td></tr>
  <tr><td><code>minecraft:language</code></td><td>Language</td><td>Options → Language</td></tr>
  <tr><td><code>minecraft:advancements</code></td><td>Advancements</td><td>Press L</td></tr>
  <tr><td><code>minecraft:credits</code></td><td>End credits</td><td>Beat the game</td></tr>
  <tr><td><code>minecraft:create_world</code></td><td>Create new world</td><td>Title → Singleplayer → Create</td></tr>
  <tr><td><code>minecraft:edit_world</code></td><td>Edit world</td><td>Select world → Edit</td></tr>
  <tr><td><code>minecraft:recipe_book</code></td><td>Recipe book</td><td>In inventory/crafting</td></tr>
</table>
`
    }
  ]
};

SECTIONS['ai-guide'] = {
  title: 'AI Agent Guide',
  pages: [
    {
      id: 'ai-guide.core',
      title: 'Core Loop',
      content: `
<h2 id="core-loop">The Core Loop</h2>
<pre><code>┌──────────────────┐     ┌──────────────┐     ┌────────────┐
│  OBSERVE         │ ──> │   THINK /    │ ──> │    ACT     │
│  GET /observation│     │   DECIDE     │     │  POST /step│
│  or /stream      │     │              │     │  or /action│
└──────────────────┘     └──────────────┘     └────────────┘
        ^                                      │
        └──────────────────────────────────────┘
                repeat every tick (~50ms)</code></pre>

<h3>Two Modes</h3>
<ul>
  <li><strong>Step mode:</strong> <code>POST /step</code> with actions → returns observation after one tick. Like <code>env.step(action)</code> in Gym.</li>
  <li><strong>Stream mode:</strong> <code>GET /stream</code> (SSE) → pushes observations every tick. Send <code>/action</code> separately.</li>
</ul>

<h2 id="observation-json">Observation JSON — Field-by-Field</h2>

<h3 id="world">world — The Environment</h3>
<pre><code>{
  "time": 12000,
  "day": 5,
  "is_day": true,
  "weather": "clear",
  "dimension": 0
}</code></pre>

<h4>AI Logic:</h4>
<ul>
  <li>If <code>is_day == false</code> and you have no bed/tools → consider building shelter</li>
  <li>If <code>weather == "thunder"</code> → seek shelter or equip helmet</li>
  <li>If <code>dimension == 1</code> (Nether) → need fire resistance</li>
  <li>If <code>dimension == 2</code> (End) → need slow falling, ender pearls</li>
</ul>

<h3 id="player-interp">player — Who You Are</h3>

<h4>position</h4>
<ul>
  <li><code>y &lt; -64</code> = void (dying!)</li>
  <li><code>y ≈ 63</code> = sea level</li>
  <li>Ground level is typically y=62 to y=70</li>
</ul>

<h4>status — Vital Signs</h4>
<table>
  <tr><th>Index</th><th>Field</th><th>Critical threshold</th></tr>
  <tr><td>0</td><td>Health</td><td>≤ 5 (danger, flee/eat)</td></tr>
  <tr><td>1</td><td>Food</td><td>≤ 6 (can't sprint), = 0 (taking damage)</td></tr>
  <tr><td>4</td><td>Air</td><td>&lt; 100 (underwater, surface NOW)</td></tr>
</table>

<h4>AI Logic:</h4>
<ul>
  <li><code>health &lt; 10</code> → prioritize healing (eat food, avoid fights)</li>
  <li><code>food &lt; 10</code> → need to eat soon</li>
  <li><code>food == 0</code> → starving, take damage every 4 seconds</li>
  <li><code>air &lt; 100</code> and underwater → surface NOW</li>
  <li><code>armor == 0</code> and combat → consider crafting armor</li>
</ul>

<h3 id="inventory-interp">inventory — What You Carry</h3>
<ul>
  <li>Slots are sparse: <code>[slot_index, item_id, count]</code> — only non-empty slots are included</li>
  <li><code>selected_slot</code> tells you which hotbar slot is currently held (0-8)</li>
  <li>To equip armor: look for slot_index 36 (boots), 37 (leggings), 38 (chestplate), 39 (helmet)</li>
  <li>Item ID <code>0</code> should never appear (empty slots are omitted)</li>
</ul>

<h3 id="target-interp">target — What You're Looking At</h3>
<ul>
  <li>If <code>block_id == 0</code> → looking at nothing (sky/air/far away)</li>
  <li><code>distance &lt;= 4.5</code> → within reach (can break/place/interact)</li>
  <li>Use <code>face</code> to know where block will be placed</li>
</ul>

<h3 id="viewport-interp">viewport_blocks — Depth-Map Vision</h3>
<ul>
  <li><strong>RLE format:</strong> Data is run-length encoded — each element is <code>[count, depth, blockId]</code>. Expand by repeating each triplet <code>count</code> times to get the full 144-ray grid (16 wide × 9 tall).</li>
  <li><strong>Depth perception:</strong> Each ray has depth (distance to surface) + blockId (what surface is made of). Small depth values (1–3) = nearby wall. Check blockId to pick the right tool (pickaxe for stone, shovel for dirt). Large depth values (20–32) = open space.</li>
  <li><strong>Find paths:</strong> Look for rays with large depth values (20+) at center — these are clear paths</li>
  <li><strong>Avoid danger:</strong> If all rays in a region show small values (1–3), you're boxed in — turn around</li>
</ul>

<h3 id="entities-interp">viewport_entities — Nearby Creatures</h3>
<ul>
  <li>Calculate absolute position: <code>[player.x + relX, player.y + relY, player.z + relZ]</code></li>
  <li><code>distance &lt; 3</code> → close combat range</li>
  <li><code>distance 3-10</code> → ranged attack range</li>
  <li><code>distance &gt; 10</code> → far, may not have noticed you yet</li>
  <li><strong>Priority:</strong> Hostile close (&lt; 5) → flee/fight | Passive animals → food | Neutrals → avoid provoking</li>
</ul>

<h3 id="screen-interp">screen — UI State</h3>
<ul>
  <li>If <code>screen</code> is absent → you are in-game with no UI open</li>
  <li>If <code>screen.id == "minecraft:pause"</code> → game is paused, press Esc or click "Resume"</li>
  <li>If <code>screen.id == "minecraft:death"</code> → you died! Click "Respawn"</li>
  <li>To close any screen: send <code>{"type": "key", "keys": ["esc"]}</code></li>
</ul>
`
    },
    {
      id: 'ai-guide.actions',
      title: 'Action Reference',
      content: `
<h2 id="action-ref">Action Reference — Complete Control</h2>
<p>Each action is an object in the <code>actions</code> array sent to <code>POST /action</code> or <code>POST /step</code>.</p>

<h3>Movement</h3>
<table>
  <tr><th>Action</th><th>Effect</th><th>AI Logic</th></tr>
  <tr><td><code>{"type":"key","keys":["w"]}</code></td><td>Walk forward</td><td>Move toward target</td></tr>
  <tr><td><code>{"type":"key","keys":["w","ctrl"]}</code></td><td>Sprint forward</td><td>Faster but costs food</td></tr>
  <tr><td><code>{"type":"jump"}</code></td><td>Single jump</td><td>Jump over obstacles</td></tr>
  <tr><td><code>{"type":"key","keys":["shift"]}</code></td><td>Sneak</td><td>Don't fall off edges</td></tr>
  <tr><td><code>{"type":"key","keys":["w"],"duration":1000}</code></td><td>Walk 1 sec</td><td>Timed movement</td></tr>
</table>

<h3>Looking (Aiming)</h3>
<table>
  <tr><th>Action</th><th>Effect</th></tr>
  <tr><td><code>{"type":"look","yaw":90,"pitch":0}</code></td><td>Absolute: face West</td></tr>
  <tr><td><code>{"type":"look","deltaYaw":90}</code></td><td>Relative: turn right 90°</td></tr>
  <tr><td><code>{"type":"look","deltaPitch":-45}</code></td><td>Relative: look up 45°</td></tr>
</table>

<h3>Block Interaction</h3>
<table>
  <tr><th>Action</th><th>Effect</th><th>Requirements</th></tr>
  <tr><td><code>{"type":"break"}</code></td><td>Break targeted block</td><td>Within reach (&lt; 4.5), correct tool</td></tr>
  <tr><td><code>{"type":"place","face":"up"}</code></td><td>Place block above target</td><td>Block in held slot, reachable</td></tr>
  <tr><td><code>{"type":"interact"}</code></td><td>Right-click target</td><td>Open chest/furnace/door</td></tr>
  <tr><td><code>{"type":"swing"}</code></td><td>Attack entity</td><td>Entity in range</td></tr>
</table>

<h3>Inventory</h3>
<table>
  <tr><th>Action</th><th>Effect</th></tr>
  <tr><td><code>{"type":"select_slot","slot":2}</code></td><td>Switch to hotbar slot 2</td></tr>
  <tr><td><code>{"type":"craft","recipe":"minecraft:crafting_table"}</code></td><td>Craft recipe</td></tr>
</table>

<h3>Communication</h3>
<table>
  <tr><th>Action</th><th>Effect</th></tr>
  <tr><td><code>{"type":"chat","message":"Hello!"}</code></td><td>Send chat message</td></tr>
  <tr><td><code>{"type":"command","command":"/time set day"}</code></td><td>Run console command</td></tr>
</table>

<h3>UI Navigation</h3>
<table>
  <tr><th>Action</th><th>Effect</th></tr>
  <tr><td><code>{"type":"click_button","button_text":"Singleplayer"}</code></td><td>Click button</td></tr>
  <tr><td><code>{"type":"key","keys":["esc"]}</code></td><td>Close screen / go back</td></tr>
  <tr><td><code>{"type":"key","keys":["e"]}</code></td><td>Open/close inventory</td></tr>
</table>

<h3>Combat Movement Combo</h3>
<pre><code>curl -X POST http://localhost:25566/action \\
     -H "Authorization: Bearer &lt;token&gt;" \\
     -H "Content-Type: application/json" \\
     -d '{"actions": [
       {"type":"key","keys":["w"],"duration":200},
       {"type":"jump"},
       {"type":"swing"}
     ]}'</code></pre>
`
    },
    {
      id: 'ai-guide.workflows',
      title: 'Workflows',
      content: `
<h2 id="workflows">Complete Workflows — Mastering Minecraft</h2>

<h3>Getting In-Game (from Title Screen)</h3>
<pre><code>Step 1: OBSERVE → screen.id == "minecraft:title"
Step 2: ACT → click_button "singleplayer"
Step 3: OBSERVE → screen.id == "minecraft:select_world"
Step 4: ACT → click_button "My World" (or your world name)
Step 5: OBSERVE → screen is gone (in-game!)</code></pre>

<h3>Basic Survival — First 5 Minutes</h3>
<pre><code>1. OBSERVE → check status [20, 20, 20, 0, 300], look around
2. ACT → look down at ground
3. OBSERVE → target is a tree/log
4. ACT → break (punch tree)
5. REPEAT steps 3-4 until you have 4+ logs
6. OBSERVE → inventory has logs
7. ACT → craft "minecraft:crafting_table"
8. Craft wooden pickaxe, then cobblestone tools</code></pre>

<h3>Mining Strategy</h3>
<pre><code>1. Look down, break ground → create staircase down
2. At y=11 (optimal diamond level): start branch mining
3. Pattern: mine 2-high tunnel, leave 3 blocks between tunnels
4. When you hear lava: stop, noise means nearby caves
5. Check target.block_id periodically for ores</code></pre>

<h3>Combat Strategy</h3>
<p><strong>Against melee mobs (zombies, spiders):</strong></p>
<pre><code>1. Keep distance of 3-4 blocks
2. Strafe sideways (alternate a/d)
3. Attack (swing) when mob is close
4. If health &lt; 5: flee, eat, heal</code></pre>

<p><strong>Against ranged mobs (skeletons):</strong></p>
<pre><code>1. Zigzag approach (w + a then w + d)
2. Close distance quickly
3. Attack in melee range</code></pre>

<p><strong>Against creepers:</strong></p>
<pre><code>1. Back away (s key) while looking at it
2. Attack, then immediately back away
3. Never let it get closer than 2 blocks</code></pre>

<h3>Building a Shelter</h3>
<pre><code>1. Find flat ground near spawn
2. Check inventory for blocks (dirt, cobblestone, wood)
3. Place 5×5×3 structure:
   - Walls 2 blocks high
   - Doorway in one wall
   - Torches inside
4. Craft bed for spawn point</code></pre>

<h3>Farming & Sustainability</h3>
<pre><code>1. Craft hoe (2 sticks + 2 planks/cobblestone)
2. Find water source
3. Till dirt near water (right-click with hoe)
4. Plant seeds (from breaking grass)
5. Wait for crops to grow (check day counter)</code></pre>

<h2 id="navigation">Screen-Navigation State Machine</h2>
<pre><code>TITLE → select "Singleplayer"
  → WORLD_SELECT → click world name
    → IN_GAME → play...
      → ESC → PAUSE
        → "Save & Exit" → TITLE
        → "Resume" → IN_GAME
      → DEATH → "Respawn" → IN_GAME
    → ESC (from world select) → TITLE</code></pre>

<h2 id="error-recovery">Error Recovery</h2>
<table>
  <tr><th>Symptom</th><th>Probable Cause</th><th>Recovery</th></tr>
  <tr><td><code>tick</code> not increasing</td><td>Game frozen/paused</td><td>Press Esc, check screen, resume</td></tr>
  <tr><td>All <code>viewport_blocks</code> = 32</td><td>In void/loading (no solids detected)</td><td>Move to loaded area</td></tr>
  <tr><td><code>screen.id == "minecraft:death"</code></td><td>You died</td><td>Click "Respawn", retrieve items</td></tr>
  <tr><td><code>target.block_id</code> always 0</td><td>Looking at sky/too far</td><td>Look down or move closer</td></tr>
  <tr><td>Inventory all [0,0]</td><td>Not in game</td><td>Navigate from title screen to world</td></tr>
  <tr><td>Action returns "timeout"</td><td>Server busy</td><td>Retry after 1 second</td></tr>
  <tr><td><code>screen.id == "minecraft:pause"</code></td><td>World paused</td><td>Click "Resume" or Esc</td></tr>
  <tr><td>Can't connect to port 25566</td><td>Mod not loaded</td><td>Restart Minecraft</td></tr>
</table>

<h2 id="strategies">Advanced AI Strategies</h2>

<h3>Pathfinding (without a map)</h3>
<p>Use <code>viewport_blocks</code> depth-map to find clear paths:</p>
<ol>
  <li>Check center rays (w=7,8, h=4) for large depth values</li>
  <li>If depth ≥ 20 → path is clear for at least 20 blocks</li>
  <li>If depth ≤ 3 → obstacle very close, turn</li>
  <li>Scan across all 9 height rows to detect elevation changes (stairs, hills)</li>
</ol>

<h3>Resource Location</h3>
<table>
  <tr><th>Resource</th><th>Y Level</th></tr>
  <tr><td>Iron</td><td>y=15 to y=32</td></tr>
  <tr><td>Diamond</td><td>y=-64 to y=16 (most common at y=-59)</td></tr>
  <tr><td>Coal</td><td>y=0 to y=96</td></tr>
  <tr><td>Ancient Debris (Nether)</td><td>y=8 to y=22</td></tr>
</table>

<h3>Prioritization Matrix</h3>
<table>
  <tr><th>Situation</th><th>Priority Action</th></tr>
  <tr><td>Health &lt; 5</td><td>Flee, eat food</td></tr>
  <tr><td>Food &lt; 6</td><td>Eat, find/farm food</td></tr>
  <tr><td>Night + no bed</td><td>Build shelter, light area</td></tr>
  <tr><td>See valuable ore</td><td>Mark position, mine</td></tr>
  <tr><td>See hostile mob</td><td>Assess: can I fight? If not, flee</td></tr>
  <tr><td>Low on tools</td><td>Craft replacements</td></tr>
  <tr><td>Full inventory</td><td>Return to base, store items</td></tr>
  <tr><td>Near lava</td><td>Place water (if available), or avoid</td></tr>
</table>
`
    },
    {
      id: 'ai-guide.cheatsheet',
      title: 'Quick Reference',
      content: `
<h2 id="cheatsheet">Quick Reference Cheat Sheet</h2>

<h3>Observation Fields</h3>
<table>
  <tr><th>Path</th><th>Type</th><th>What I Know</th></tr>
  <tr><td><code>tick</code></td><td>int</td><td>Game time in ticks (÷20 = seconds)</td></tr>
  <tr><td><code>world.time</code></td><td>int</td><td>0-24000 day-night cycle</td></tr>
  <tr><td><code>world.day</code></td><td>int</td><td>Total days played</td></tr>
  <tr><td><code>world.weather</code></td><td>string</td><td>clear / rain / thunder</td></tr>
  <tr><td><code>world.dimension</code></td><td>int</td><td>0=Overworld, 1=Nether, 2=End</td></tr>
  <tr><td><code>player.position</code></td><td>[x,y,z]</td><td>Where I am</td></tr>
  <tr><td><code>player.rotation.yaw</code></td><td>float</td><td>Where I'm looking horizontally</td></tr>
  <tr><td><code>player.rotation.pitch</code></td><td>float</td><td>Where I'm looking vertically</td></tr>
  <tr><td><code>player.status[0]</code></td><td>int</td><td>Health (0-20)</td></tr>
  <tr><td><code>player.status[1]</code></td><td>int</td><td>Food (0-20)</td></tr>
  <tr><td><code>player.status[4]</code></td><td>int</td><td>Air (0-300)</td></tr>
  <tr><td><code>player.flags[0]</code></td><td>0/1</td><td>On ground</td></tr>
  <tr><td><code>inventory.slots</code></td><td>[[idx,id,count],...]</td><td>Sparse slots (only non-empty)</td></tr>
  <tr><td><code>inventory.selected_slot</code></td><td>int</td><td>Current hotbar slot (0-8)</td></tr>
  <tr><td><code>target.block_id</code></td><td>int</td><td>Block I'm aiming at (0=none)</td></tr>
  <tr><td><code>target.distance</code></td><td>float</td><td>Distance to target</td></tr>
  <tr><td><code>target.face</code></td><td>int</td><td>Face of targeted block</td></tr>
  <tr><td><code>viewport_blocks</code></td><td>RLE array</td><td>RLE [[count,depth,blockId],...] — runs of identical rays</td></tr>
  <tr><td><code>viewport_entities[i]</code></td><td>[8 vals]</td><td>Nearby entities</td></tr>
  <tr><td><code>screen.id</code></td><td>string</td><td>Current UI screen (if any)</td></tr>
</table>

<h3>Essential Actions</h3>
<table>
  <tr><th>What I Want</th><th>Action</th></tr>
  <tr><td>Move forward</td><td><code>{"type":"key","keys":["w"]}</code></td></tr>
  <tr><td>Sprint</td><td><code>{"type":"key","keys":["w","ctrl"]}</code></td></tr>
  <tr><td>Jump</td><td><code>{"type":"jump"}</code></td></tr>
  <tr><td>Turn</td><td><code>{"type":"look","deltaYaw":90}</code></td></tr>
  <tr><td>Break block</td><td><code>{"type":"break"}</code></td></tr>
  <tr><td>Place block</td><td><code>{"type":"place","face":"up"}</code></td></tr>
  <tr><td>Interact</td><td><code>{"type":"interact"}</code></td></tr>
  <tr><td>Attack</td><td><code>{"type":"swing"}</code></td></tr>
  <tr><td>Select slot</td><td><code>{"type":"select_slot","slot":2}</code></td></tr>
  <tr><td>Craft</td><td><code>{"type":"craft","recipe":"minecraft:chest"}</code></td></tr>
  <tr><td>Chat</td><td><code>{"type":"chat","message":"hi"}</code></td></tr>
  <tr><td>Command</td><td><code>{"type":"command","command":"/time set day"}</code></td></tr>
  <tr><td>Click UI</td><td><code>{"type":"click_button","button_text":"Singleplayer"}</code></td></tr>
  <tr><td>Close screen</td><td><code>{"type":"key","keys":["esc"]}</code></td></tr>
  <tr><td>Open inventory</td><td><code>{"type":"key","keys":["e"]}</code></td></tr>
  <tr><td>Look at ground</td><td><code>{"type":"look","pitch":70}</code></td></tr>
</table>
`
    }
  ]
};

SECTIONS['registry'] = {
  title: 'Registry Reference',
  pages: [
    {
      id: 'registry.basics',
      title: 'Basics & Layout',
      content: `
<h2 id="registry-intro">Registry Reference</h2>
<div class="alert alert-warn"><strong>Important:</strong> Numeric IDs from <code>BuiltInRegistries.getId()</code> are <strong>dynamic</strong> (assigned at runtime order). They are consistent within a single game session but may differ between launches or mod loads. Use namespaced IDs (<code>minecraft:stone</code>) for stable identification.</div>

<h3>Dimension IDs</h3>
<table>
  <tr><th>ID</th><th>Dimension</th></tr>
  <tr><td>0</td><td>Overworld</td></tr>
  <tr><td>1</td><td>Nether</td></tr>
  <tr><td>2</td><td>End</td></tr>
</table>

<h3>Facing Directions (Yaw Range)</h3>
<table>
  <tr><th>Direction</th><th>Yaw Range</th></tr>
  <tr><td>South</td><td>-45° to 45°</td></tr>
  <tr><td>West</td><td>45° to 135°</td></tr>
  <tr><td>North</td><td>135° to 225°</td></tr>
  <tr><td>East</td><td>225° to 315°</td></tr>
</table>

<h3>Block Face Indices</h3>
<table>
  <tr><th>ID</th><th>Face</th></tr>
  <tr><td>0</td><td>Up (top)</td></tr>
  <tr><td>1</td><td>Down (bottom)</td></tr>
  <tr><td>2</td><td>North</td></tr>
  <tr><td>3</td><td>South</td></tr>
  <tr><td>4</td><td>West</td></tr>
  <tr><td>5</td><td>East</td></tr>
</table>

<h3>Weather Values</h3>
<table>
  <tr><th>Value</th><th>Meaning</th></tr>
  <tr><td><code>"clear"</code></td><td>No precipitation</td></tr>
  <tr><td><code>"rain"</code></td><td>Raining</td></tr>
  <tr><td><code>"thunder"</code></td><td>Thunderstorm (rain + lightning)</td></tr>
</table>

<h3>Cardinal Directions (for place action)</h3>
<pre><code>"up"    = positive Y
"down"  = negative Y
"north" = negative Z
"south" = positive Z
"west"  = negative X
"east"  = positive X</code></pre>

<h3>Inventory Slot Layout</h3>
<table>
  <tr><th>Index Range</th><th>Section</th><th>Count</th></tr>
  <tr><td>0-8</td><td>Hotbar</td><td>9</td></tr>
  <tr><td>9-35</td><td>Main inventory</td><td>27</td></tr>
  <tr><td>36-39</td><td>Armor (boots→legs→chest→helmet)</td><td>4</td></tr>
  <tr><td>40</td><td>Offhand</td><td>1</td></tr>
</table>

<h3>Viewport Blocks Array</h3>
<ul>
  <li>Size: 288 values = 144 [depth, blockId] pairs (16 wide × 9 tall)</li>
  <li>Index: depth at <code>(height * 16 + width) * 2</code>, blockId at <code>(height * 16 + width) * 2 + 1</code></li>
  <li>depth = 1–32 (distance to nearest solid), blockId = surface block ID (0 if depth=32)</li>
</ul>

<h3>Viewport Entities Array</h3>
<ul>
  <li>Up to 16 entities, each: <code>[type_id, relX, relY, relZ, yaw, pitch, health, distance]</code></li>
  <li>Empty: <code>[0, 0, 0, 0, 0, 0, 0, 0]</code></li>
</ul>
`
    },
    {
      id: 'registry.entities',
      title: 'Entity IDs',
      content: `
<h2 id="entity-ids">Entity Registry — Complete 0–127</h2>
<p>Entity type IDs from the vanilla Minecraft 1.21.11 <code>BuiltInRegistries.ENTITY_TYPE</code>. Registry order may shift with mods or updates. For runtime lookup, use <code>GET /api/registry/entities</code>.</p>
<table>
  <tr><th>ID</th><th>Entity</th><th>Notes</th><th>ID</th><th>Entity</th><th>Notes</th></tr>
  <tr><td>0</td><td>Allay</td><td>—</td><td>1</td><td>Area Effect Cloud</td><td>—</td></tr>
  <tr><td>2</td><td>Armadillo</td><td>—</td><td>3</td><td>Armor Stand</td><td>—</td></tr>
  <tr><td>4</td><td>Arrow</td><td>Projectile</td><td>5</td><td>Axolotl</td><td>—</td></tr>
  <tr><td>6</td><td>Bat</td><td>—</td><td>7</td><td>Bee</td><td>Neutral</td></tr>
  <tr><td>8</td><td><strong>Blaze</strong></td><td>Hostile, Nether</td><td>9</td><td>Block Display</td><td>—</td></tr>
  <tr><td>10</td><td>Boat</td><td>—</td><td>11</td><td><strong>Bogged</strong></td><td>Hostile</td></tr>
  <tr><td>12</td><td><strong>Breeze</strong></td><td>Hostile</td><td>13</td><td>Breeze Wind Charge</td><td>—</td></tr>
  <tr><td>14</td><td>Camel</td><td>—</td><td>15</td><td>Cat</td><td>—</td></tr>
  <tr><td>16</td><td><strong>Cave Spider</strong></td><td>Hostile</td><td>17</td><td>Chest Boat</td><td>—</td></tr>
  <tr><td>18</td><td>Chest Minecart</td><td>—</td><td>19</td><td>Chicken</td><td>Food source</td></tr>
  <tr><td>20</td><td>Cod</td><td>—</td><td>21</td><td>Minecart with Command Block</td><td>—</td></tr>
  <tr><td>22</td><td>Cow</td><td>Food/leather</td><td>23</td><td><strong>Creeper</strong></td><td>Hostile, explodes</td></tr>
  <tr><td>24</td><td>Dolphin</td><td>—</td><td>25</td><td>Donkey</td><td>Rideable</td></tr>
  <tr><td>26</td><td>Dragon Fireball</td><td>—</td><td>27</td><td><strong>Drowned</strong></td><td>Hostile</td></tr>
  <tr><td>28</td><td>Egg</td><td>—</td><td>29</td><td><strong>Elder Guardian</strong></td><td>Hostile</td></tr>
  <tr><td>30</td><td>End Crystal</td><td>—</td><td>31</td><td><strong>Ender Dragon</strong></td><td><strong>Boss</strong></td></tr>
  <tr><td>32</td><td>Ender Pearl</td><td>—</td><td>33</td><td>Enderman</td><td>Neutral</td></tr>
  <tr><td>34</td><td>Endermite</td><td>Neutral</td><td>35</td><td><strong>Evoker</strong></td><td>Hostile</td></tr>
  <tr><td>36</td><td>Evoker Fangs</td><td>—</td><td>37</td><td>Experience Bottle</td><td>—</td></tr>
  <tr><td>38</td><td>Experience Orb</td><td>—</td><td>39</td><td>Eye of Ender</td><td>—</td></tr>
  <tr><td>40</td><td>Falling Block</td><td>—</td><td>41</td><td>Firework Rocket</td><td>—</td></tr>
  <tr><td>42</td><td>Fox</td><td>—</td><td>43</td><td>Frog</td><td>—</td></tr>
  <tr><td>44</td><td>Furnace Minecart</td><td>—</td><td>45</td><td><strong>Ghast</strong></td><td>Hostile, Nether</td></tr>
  <tr><td>46</td><td><strong>Giant</strong></td><td>Hostile</td><td>47</td><td>Glow Item Frame</td><td>—</td></tr>
  <tr><td>48</td><td>Glow Squid</td><td>—</td><td>49</td><td>Goat</td><td>—</td></tr>
  <tr><td>50</td><td><strong>Guardian</strong></td><td>Hostile, water</td><td>51</td><td><strong>Hoglin</strong></td><td>Hostile, Nether</td></tr>
  <tr><td>52</td><td>Hopper Minecart</td><td>—</td><td>53</td><td>Horse</td><td>Rideable</td></tr>
  <tr><td>54</td><td><strong>Husk</strong></td><td>Hostile</td><td>55</td><td><strong>Illusioner</strong></td><td>Hostile</td></tr>
  <tr><td>56</td><td>Interaction</td><td>—</td><td>57</td><td>Iron Golem</td><td>Neutral</td></tr>
  <tr><td>58</td><td>Item (dropped)</td><td>—</td><td>59</td><td>Item Display</td><td>—</td></tr>
  <tr><td>60</td><td>Item Frame</td><td>—</td><td>61</td><td>Ominous Item Spawner</td><td>—</td></tr>
  <tr><td>62</td><td>Ghast Fireball</td><td>—</td><td>63</td><td>Leash Knot</td><td>—</td></tr>
  <tr><td>64</td><td>Lightning Bolt</td><td>—</td><td>65</td><td>Llama</td><td>Carries chests</td></tr>
  <tr><td>66</td><td>Llama Spit</td><td>—</td><td>67</td><td><strong>Magma Cube</strong></td><td>Hostile, Nether</td></tr>
  <tr><td>68</td><td>Marker</td><td>—</td><td>69</td><td>Minecart</td><td>—</td></tr>
  <tr><td>70</td><td>Mooshroom</td><td>—</td><td>71</td><td>Mule</td><td>Rideable</td></tr>
  <tr><td>72</td><td>Ocelot</td><td>—</td><td>73</td><td>Painting</td><td>—</td></tr>
  <tr><td>74</td><td>Panda</td><td>—</td><td>75</td><td>Parrot</td><td>—</td></tr>
  <tr><td>76</td><td><strong>Phantom</strong></td><td>Hostile</td><td>77</td><td>Pig</td><td>Food source</td></tr>
  <tr><td>78</td><td>Piglin</td><td>Neutral</td><td>79</td><td><strong>Piglin Brute</strong></td><td>Hostile, Nether</td></tr>
  <tr><td>80</td><td><strong>Pillager</strong></td><td>Hostile, raids</td><td>81</td><td>Polar Bear</td><td>Neutral</td></tr>
  <tr><td>82</td><td>Potion</td><td>—</td><td>83</td><td>Pufferfish</td><td>—</td></tr>
  <tr><td>84</td><td>Rabbit</td><td>—</td><td>85</td><td><strong>Ravager</strong></td><td>Hostile, raids</td></tr>
  <tr><td>86</td><td>Salmon</td><td>—</td><td>87</td><td>Sheep</td><td>Wool/mutton</td></tr>
  <tr><td>88</td><td><strong>Shulker</strong></td><td>Hostile, End</td><td>89</td><td>Shulker Bullet</td><td>—</td></tr>
  <tr><td>90</td><td><strong>Silverfish</strong></td><td>Hostile</td><td>91</td><td><strong>Skeleton</strong></td><td>Hostile, ranged</td></tr>
  <tr><td>92</td><td>Skeleton Horse</td><td>—</td><td>93</td><td><strong>Slime</strong></td><td>Hostile</td></tr>
  <tr><td>94</td><td>Blaze Fireball</td><td>—</td><td>95</td><td>Sniffer</td><td>—</td></tr>
  <tr><td>96</td><td>Snow Golem</td><td>—</td><td>97</td><td>Snowball</td><td>—</td></tr>
  <tr><td>98</td><td>Minecart with Spawner</td><td>—</td><td>99</td><td>Spectral Arrow</td><td>—</td></tr>
  <tr><td>100</td><td><strong>Spider</strong></td><td>Hostile</td><td>101</td><td>Squid</td><td>—</td></tr>
  <tr><td>102</td><td><strong>Stray</strong></td><td>Hostile</td><td>103</td><td>Strider</td><td>Nether, rideable</td></tr>
  <tr><td>104</td><td>Tadpole</td><td>—</td><td>105</td><td>Text Display</td><td>—</td></tr>
  <tr><td>106</td><td>Primed TNT</td><td>—</td><td>107</td><td>Minecart with TNT</td><td>—</td></tr>
  <tr><td>108</td><td>Trader Llama</td><td>—</td><td>109</td><td>Trident</td><td>—</td></tr>
  <tr><td>110</td><td>Tropical Fish</td><td>—</td><td>111</td><td>Turtle</td><td>—</td></tr>
  <tr><td>112</td><td><strong>Vex</strong></td><td>Hostile</td><td>113</td><td>Villager</td><td>Trading</td></tr>
  <tr><td>114</td><td><strong>Vindicator</strong></td><td>Hostile</td><td>115</td><td>Wandering Trader</td><td>—</td></tr>
  <tr><td>116</td><td><strong>Warden</strong></td><td>Hostile, blind</td><td>117</td><td>Wind Charge</td><td>—</td></tr>
  <tr><td>118</td><td>Witch</td><td>Hostile</td><td>119</td><td><strong>Wither</strong></td><td><strong>Boss</strong></td></tr>
  <tr><td>120</td><td><strong>Wither Skeleton</strong></td><td>Hostile, Nether</td><td>121</td><td>Wither Skull</td><td>—</td></tr>
  <tr><td>122</td><td>Wolf</td><td>Neutral</td><td>123</td><td><strong>Zoglin</strong></td><td>Hostile</td></tr>
  <tr><td>124</td><td><strong>Zombie</strong></td><td>Hostile, common</td><td>125</td><td>Zombie Horse</td><td>—</td></tr>
  <tr><td>126</td><td><strong>Zombie Villager</strong></td><td>Hostile</td><td>127</td><td>Zombified Piglin</td><td>Neutral, Nether</td></tr>
</table>
<p>Empty slot = all zeros <code>[0, 0, 0, 0, 0, 0, 0, 0]</code>. Bold = hostile toward player. For runtime lookup, call <code>GET /api/registry/entities</code>.</p>
`
    },
    {
      id: 'registry.blocks-items',
      title: 'Common Blocks & Items',
      content: `
<h2 id="common-blocks">Common Block & Item Namespaced IDs</h2>

<h3>Stone & Minerals</h3>
<table>
  <tr><th>Namespaced ID</th><th>Block</th></tr>
  <tr><td>minecraft:stone</td><td>Stone</td></tr>
  <tr><td>minecraft:cobblestone</td><td>Cobblestone</td></tr>
  <tr><td>minecraft:deepslate</td><td>Deepslate</td></tr>
  <tr><td>minecraft:granite</td><td>Granite</td></tr>
  <tr><td>minecraft:diorite</td><td>Diorite</td></tr>
  <tr><td>minecraft:andesite</td><td>Andesite</td></tr>
  <tr><td>minecraft:tuff</td><td>Tuff</td></tr>
  <tr><td>minecraft:obsidian</td><td>Obsidian</td></tr>
  <tr><td>minecraft:bedrock</td><td>Bedrock</td></tr>
  <tr><td>minecraft:dirt</td><td>Dirt</td></tr>
  <tr><td>minecraft:grass_block</td><td>Grass Block</td></tr>
  <tr><td>minecraft:gravel</td><td>Gravel</td></tr>
  <tr><td>minecraft:sand</td><td>Sand</td></tr>
</table>

<h3>Ores</h3>
<table>
  <tr><th>Namespaced ID</th><th>Ore</th></tr>
  <tr><td>minecraft:coal_ore</td><td>Coal Ore</td></tr>
  <tr><td>minecraft:iron_ore</td><td>Iron Ore</td></tr>
  <tr><td>minecraft:copper_ore</td><td>Copper Ore</td></tr>
  <tr><td>minecraft:gold_ore</td><td>Gold Ore</td></tr>
  <tr><td>minecraft:diamond_ore</td><td>Diamond Ore</td></tr>
  <tr><td>minecraft:emerald_ore</td><td>Emerald Ore</td></tr>
  <tr><td>minecraft:redstone_ore</td><td>Redstone Ore</td></tr>
  <tr><td>minecraft:lapis_ore</td><td>Lapis Lazuli Ore</td></tr>
  <tr><td>minecraft:nether_quartz_ore</td><td>Nether Quartz Ore</td></tr>
  <tr><td>minecraft:ancient_debris</td><td>Ancient Debris</td></tr>
</table>

<h3>Wood</h3>
<table>
  <tr><th>Namespaced ID</th><th>Block</th></tr>
  <tr><td>minecraft:oak_log</td><td>Oak Log</td></tr>
  <tr><td>minecraft:oak_planks</td><td>Oak Planks</td></tr>
  <tr><td>minecraft:spruce_log</td><td>Spruce Log</td></tr>
  <tr><td>minecraft:birch_log</td><td>Birch Log</td></tr>
  <tr><td>minecraft:jungle_log</td><td>Jungle Log</td></tr>
  <tr><td>minecraft:acacia_log</td><td>Acacia Log</td></tr>
  <tr><td>minecraft:dark_oak_log</td><td>Dark Oak Log</td></tr>
  <tr><td>minecraft:mangrove_log</td><td>Mangrove Log</td></tr>
  <tr><td>minecraft:cherry_log</td><td>Cherry Log</td></tr>
</table>

<h3>Important Items</h3>
<table>
  <tr><th>Namespaced ID</th><th>Item</th></tr>
  <tr><td>minecraft:diamond</td><td>Diamond</td></tr>
  <tr><td>minecraft:iron_ingot</td><td>Iron Ingot</td></tr>
  <tr><td>minecraft:gold_ingot</td><td>Gold Ingot</td></tr>
  <tr><td>minecraft:netherite_ingot</td><td>Netherite Ingot</td></tr>
  <tr><td>minecraft:stick</td><td>Stick</td></tr>
  <tr><td>minecraft:bone</td><td>Bone</td></tr>
  <tr><td>minecraft:string</td><td>String</td></tr>
  <tr><td>minecraft:leather</td><td>Leather</td></tr>
  <tr><td>minecraft:flint</td><td>Flint</td></tr>
</table>

<h3>Tools & Weapons</h3>
<table>
  <tr><th>Namespaced ID</th><th>Item</th></tr>
  <tr><td>minecraft:wooden_sword</td><td>Wooden Sword</td></tr>
  <tr><td>minecraft:stone_sword</td><td>Stone Sword</td></tr>
  <tr><td>minecraft:iron_sword</td><td>Iron Sword</td></tr>
  <tr><td>minecraft:diamond_sword</td><td>Diamond Sword</td></tr>
  <tr><td>minecraft:netherite_sword</td><td>Netherite Sword</td></tr>
  <tr><td>minecraft:bow</td><td>Bow</td></tr>
  <tr><td>minecraft:crossbow</td><td>Crossbow</td></tr>
  <tr><td>minecraft:trident</td><td>Trident</td></tr>
  <tr><td>minecraft:shield</td><td>Shield</td></tr>
  <tr><td>minecraft:wooden_pickaxe</td><td>Wooden Pickaxe</td></tr>
  <tr><td>minecraft:stone_pickaxe</td><td>Stone Pickaxe</td></tr>
  <tr><td>minecraft:iron_pickaxe</td><td>Iron Pickaxe</td></tr>
  <tr><td>minecraft:diamond_pickaxe</td><td>Diamond Pickaxe</td></tr>
  <tr><td>minecraft:netherite_pickaxe</td><td>Netherite Pickaxe</td></tr>
</table>

<h3>Food</h3>
<table>
  <tr><th>Namespaced ID</th><th>Item</th></tr>
  <tr><td>minecraft:apple</td><td>Apple</td></tr>
  <tr><td>minecraft:golden_apple</td><td>Golden Apple</td></tr>
  <tr><td>minecraft:bread</td><td>Bread</td></tr>
  <tr><td>minecraft:cooked_beef</td><td>Steak</td></tr>
  <tr><td>minecraft:cooked_porkchop</td><td>Cooked Porkchop</td></tr>
  <tr><td>minecraft:cooked_chicken</td><td>Cooked Chicken</td></tr>
  <tr><td>minecraft:carrot</td><td>Carrot</td></tr>
  <tr><td>minecraft:baked_potato</td><td>Baked Potato</td></tr>
</table>
`
    },
    {
      id: 'registry.screens',
      title: 'Screen IDs',
      content: `
<h2 id="screen-ids">Screen ID Reference</h2>
<p>Identifiers returned in <code>screen.id</code> when a UI is open.</p>

<table>
  <tr><th>Screen ID</th><th>Screen</th></tr>
  <tr><td><code>minecraft:title</code></td><td>Title screen</td></tr>
  <tr><td><code>minecraft:select_world</code></td><td>World selection</td></tr>
  <tr><td><code>minecraft:multiplayer</code></td><td>Server list</td></tr>
  <tr><td><code>minecraft:inventory</code></td><td>Player inventory</td></tr>
  <tr><td><code>minecraft:creative_inventory</code></td><td>Creative menu</td></tr>
  <tr><td><code>minecraft:crafting</code></td><td>Crafting table</td></tr>
  <tr><td><code>minecraft:furnace</code></td><td>Furnace</td></tr>
  <tr><td><code>minecraft:blast_furnace</code></td><td>Blast furnace</td></tr>
  <tr><td><code>minecraft:smoker</code></td><td>Smoker</td></tr>
  <tr><td><code>minecraft:brewing_stand</code></td><td>Brewing stand</td></tr>
  <tr><td><code>minecraft:enchantment</code></td><td>Enchantment table</td></tr>
  <tr><td><code>minecraft:anvil</code></td><td>Anvil</td></tr>
  <tr><td><code>minecraft:grindstone</code></td><td>Grindstone</td></tr>
  <tr><td><code>minecraft:cartography_table</code></td><td>Cartography table</td></tr>
  <tr><td><code>minecraft:stonecutter</code></td><td>Stonecutter</td></tr>
  <tr><td><code>minecraft:loom</code></td><td>Loom</td></tr>
  <tr><td><code>minecraft:smithing</code></td><td>Smithing table</td></tr>
  <tr><td><code>minecraft:villager_trades</code></td><td>Villager trading</td></tr>
  <tr><td><code>minecraft:horse_inventory</code></td><td>Horse inventory</td></tr>
  <tr><td><code>minecraft:container</code></td><td>Chest/barrel/shulker</td></tr>
  <tr><td><code>minecraft:pause</code></td><td>Pause menu</td></tr>
  <tr><td><code>minecraft:death</code></td><td>Death screen</td></tr>
  <tr><td><code>minecraft:options</code></td><td>Options</td></tr>
  <tr><td><code>minecraft:video_settings</code></td><td>Video settings</td></tr>
  <tr><td><code>minecraft:sound_settings</code></td><td>Sound settings</td></tr>
  <tr><td><code>minecraft:controls</code></td><td>Controls</td></tr>
  <tr><td><code>minecraft:keybinds</code></td><td>Key binds</td></tr>
  <tr><td><code>minecraft:language</code></td><td>Language</td></tr>
  <tr><td><code>minecraft:advancements</code></td><td>Advancements</td></tr>
  <tr><td><code>minecraft:recipe_book</code></td><td>Recipe book</td></tr>
  <tr><td><code>minecraft:credits</code></td><td>End credits</td></tr>
  <tr><td><code>minecraft:create_world</code></td><td>Create new world</td></tr>
  <tr><td><code>minecraft:edit_world</code></td><td>Edit world settings</td></tr>
  <tr><td><code>minecraft:realms</code></td><td>Realms</td></tr>
  <tr><td><code>minecraft:world_loading</code></td><td>World loading screen</td></tr>
  <tr><td><code>minecraft:jigsaw</code></td><td>Jigsaw block</td></tr>
  <tr><td><code>minecraft:structure_block</code></td><td>Structure block</td></tr>
</table>
`
    },
    {
      id: 'registry.keys',
      title: 'Key Aliases',
      content: `
<h2 id="key-aliases">Key Alias Reference</h2>
<p>Use in <code>{"type":"key","keys":["alias1","alias2"]}</code>. Supports multi-key (e.g. <code>["w","ctrl"]</code> for sprint).</p>

<h3>Letters & Numbers</h3>
<table>
  <tr><th>Alias</th><th>Key</th></tr>
  <tr><td><code>a</code>–<code>z</code></td><td>Letter keys (lowercase)</td></tr>
  <tr><td><code>0</code>–<code>9</code></td><td>Number row keys</td></tr>
  <tr><td><code>1</code>–<code>9</code></td><td>Hotbar slots 1–9</td></tr>
</table>

<h3>Movement</h3>
<table>
  <tr><th>Alias</th><th>Action</th></tr>
  <tr><td><code>w</code></td><td>Walk forward</td></tr>
  <tr><td><code>s</code></td><td>Walk backward</td></tr>
  <tr><td><code>a</code></td><td>Strafe left</td></tr>
  <tr><td><code>d</code></td><td>Strafe right</td></tr>
  <tr><td><code>space</code></td><td>Jump</td></tr>
  <tr><td><code>shift</code></td><td>Sneak</td></tr>
  <tr><td><code>ctrl</code></td><td>Sprint</td></tr>
  <tr><td><code>q</code></td><td>Drop held item</td></tr>
  <tr><td><code>e</code></td><td>Open/close inventory</td></tr>
  <tr><td><code>f</code></td><td>Swap offhand / place</td></tr>
</table>

<h3>Modifier</h3>
<table>
  <tr><th>Alias</th><th>Modifier</th></tr>
  <tr><td><code>shift</code></td><td>Shift (sneak)</td></tr>
  <tr><td><code>ctrl</code></td><td>Control (sprint)</td></tr>
  <tr><td><code>alt</code></td><td>Alt</td></tr>
</table>

<h3>Function Keys</h3>
<table>
  <tr><th>Alias</th><th>Action</th></tr>
  <tr><td><code>f1</code>–<code>f25</code></td><td>Function keys F1 through F25</td></tr>
  <tr><td><code>f2</code></td><td>Screenshot</td></tr>
  <tr><td><code>f3</code></td><td>Debug screen</td></tr>
  <tr><td><code>f5</code></td><td>Toggle perspective</td></tr>
  <tr><td><code>f11</code></td><td>Toggle fullscreen</td></tr>
</table>

<h3>Mouse</h3>
<table>
  <tr><th>Alias</th><th>Button</th></tr>
  <tr><td><code>mouse_left</code></td><td>Left click (attack/break)</td></tr>
  <tr><td><code>mouse_right</code></td><td>Right click (use/interact)</td></tr>
  <tr><td><code>mouse_middle</code></td><td>Middle click (pick block)</td></tr>
</table>

<h3>Navigation</h3>
<table>
  <tr><th>Alias</th><th>Key</th></tr>
  <tr><td><code>esc</code></td><td>Escape / close screen</td></tr>
  <tr><td><code>tab</code></td><td>Tab (cycle focus)</td></tr>
  <tr><td><code>enter</code></td><td>Enter / Return</td></tr>
  <tr><td><code>backspace</code></td><td>Backspace</td></tr>
  <tr><td><code>delete</code></td><td>Delete</td></tr>
  <tr><td><code>up</code></td><td>Arrow up</td></tr>
  <tr><td><code>down</code></td><td>Arrow down</td></tr>
  <tr><td><code>left</code></td><td>Arrow left</td></tr>
  <tr><td><code>right</code></td><td>Arrow right</td></tr>
</table>

<h3>Numpad</h3>
<table>
  <tr><th>Alias</th><th>Key</th></tr>
  <tr><td><code>numpad0</code>–<code>numpad9</code></td><td>Numpad digits</td></tr>
  <tr><td><code>numpad_add</code></td><td>Numpad +</td></tr>
  <tr><td><code>numpad_sub</code></td><td>Numpad -</td></tr>
  <tr><td><code>numpad_mul</code></td><td>Numpad *</td></tr>
  <tr><td><code>numpad_div</code></td><td>Numpad /</td></tr>
  <tr><td><code>numpad_enter</code></td><td>Numpad Enter</td></tr>
</table>
<p><strong>Note:</strong> Key names are case-insensitive. Use <code>duration</code> (ms) to hold a key down.</p>
`
    },
    {
      id: 'registry.actions',
      title: 'Action Types',
      content: `
<h2 id="action-types">Action Types Reference</h2>
<p>All 12 action types for <code>POST /action</code> and <code>POST /step</code>.</p>

<table>
  <tr><th>Type</th><th>Required</th><th>Optional</th><th>Effect</th></tr>
  <tr><td><code>key</code></td><td><code>keys: string[]</code></td><td><code>duration: int</code> (ms)</td><td>Press keys (tap if no duration, hold-and-release if duration set). Supports multi-key combos.</td></tr>
  <tr><td><code>select_slot</code></td><td><code>slot: int</code> (0–8)</td><td>—</td><td>Switch hotbar slot.</td></tr>
  <tr><td><code>place</code></td><td>—</td><td><code>face: string</code> (up/down/north/south/west/east)</td><td>Place block on the targeted block's face. Default: up.</td></tr>
  <tr><td><code>break</code></td><td>—</td><td>—</td><td>Mine the targeted block (survival: sends start destroy packet).</td></tr>
  <tr><td><code>interact</code></td><td>—</td><td>—</td><td>Right-click the targeted block (open chest, button, etc.).</td></tr>
  <tr><td><code>jump</code></td><td>—</td><td>—</td><td>Player jumps from ground.</td></tr>
  <tr><td><code>swing</code></td><td>—</td><td>—</td><td>Swing arm (visual only, no block interaction).</td></tr>
  <tr><td><code>look</code></td><td>—</td><td><code>yaw</code>/<code>pitch</code> (absolute) or <code>deltaYaw</code>/<code>deltaPitch</code> (relative)</td><td>Set camera direction. Absolute overrides relative; pitch clamped ±90.</td></tr>
  <tr><td><code>craft</code></td><td><code>recipe: string</code></td><td><code>mode: string</code> (reserved)</td><td>Unlock and give the recipe via <code>/recipe give</code>.</td></tr>
  <tr><td><code>chat</code></td><td><code>message: string</code></td><td>—</td><td>Broadcast system message to all players.</td></tr>
  <tr><td><code>command</code></td><td><code>command: string</code></td><td>—</td><td>Execute server command (without leading <code>/</code>).</td></tr>
  <tr><td><code>click_button</code></td><td><code>button_text: string</code></td><td>—</td><td>Click any on-screen button whose text contains the string.</td></tr>
</table>
`
    }
  ]
};

SECTIONS['changelog'] = {
  title: 'Changelog',
  content: `
<h1 id="changelog">Changelog</h1>

<h2 id="v122">v1.2.2 — Depth-Map with Surface Block IDs</h2>

<h3>Enhancements</h3>
<ul>
  <li><strong>viewport_blocks now returns [depth, blockId] pairs</strong> — Previously a flat depth-only array (144 ints). Now each of the 144 rays produces two values: depth (1-32 = distance to nearest solid) and the numeric block ID of that surface block (0 if clear). Total 288 ints.
  </li>
  <li>AI can now distinguish stone vs. dirt vs. water at each ray without a separate API call.</li>
</ul>

<h3>Bug Fixes</h3>
<ul>
  <li><strong>Fixed stride in viewport_blocks doc</strong> — Index formula corrected from depth * 288 to depth * 144 (each depth layer has 16×9 = 144 cells, not 288).</li>
  <li><strong>viewport_entities no longer pads empty slots</strong> — Removed 16-slot fixed-size padding. Returns only actual visible entities (0-16 elements).</li>
</ul>

<h2 id="v121">v1.2.1 — Registry Endpoints + Bug Fixes + Doc Sync</h2>

<h3>New Features</h3>
<ul>
  <li><strong>Registry Dump Endpoints</strong> — Runtime entity/item ID lookup:
    <ul>
      <li><code>GET /api/registry/entities</code> — Full entity type registry (<code>BuiltInRegistries.ENTITY_TYPE</code>) with namespaced names</li>
      <li><code>GET /api/registry/items</code> — Full item registry (<code>BuiltInRegistries.ITEM</code>) with namespaced names</li>
      <li>Response: <code>{"id": 0, "name": "minecraft:allay"}, ...</code></li>
    </ul>
  </li>
</ul>

<h3>Bug Fixes</h3>
<ul>
  <li><strong>world.time clamp</strong> — <code>GET /observation</code> now returns <code>world.time</code> in 0-24000 range (was raw tick value)</li>
  <li><strong>viewport_entities FOV filter</strong> — Entities outside the player's horizontal field of view are now excluded</li>
  <li><strong>Entity ID table corrected</strong> — All entity IDs now match real <code>BuiltInRegistries.ENTITY_TYPE</code> registry order (0-127, added 8 missing entries)</li>
  <li><strong>Doc site sync</strong> — HTML docs (<code>content-en.js</code>, <code>content-vi.js</code>) updated with corrected entity tables, registry endpoints, and FOV notes</li>
</ul>

<h3>Improvements</h3>
<ul>
  <li>Doc tables now reference <code>GET /api/registry/entities</code> for runtime lookup</li>
  <li>All observation schema docs updated to reflect 0-127 entity range</li>
  <li>Vietnamese docs fully synced</li>
</ul>

<h2 id="v120">v1.2.0 — AI Endpoints + Observation Schema + Security Fixes</h2>

<h3>New Features</h3>
<ul>
  <li><strong>AI-Friendly Endpoints (OpenAI Gym style)</strong> — 6 new endpoints for RL agents:
    <ul>
      <li><code>POST /session</code> — Create/reuse AI session</li>
      <li><code>GET /observation</code> — Full structured game observation</li>
      <li><code>POST /action</code> — Send actions (12 types)</li>
      <li><code>POST /step</code> — Combined action + observation (<code>env.step()</code>)</li>
      <li><code>GET /stream</code> — SSE streaming of observations per tick</li>
      <li><code>POST /close</code> — Close session and cancel tasks</li>
    </ul>
  </li>
  <li><strong>Observation Schema</strong> — Fixed-size JSON for ML tensor compatibility:
    <ul>
      <li><code>viewport_blocks</code>: 144 depth values (16×9 depth-map)</li>
      <li><code>viewport_entities</code>: Up to 16 entities</li>
      <li><code>inventory.slots</code>: 41 fixed slots as <code>[item_id, count]</code></li>
      <li><code>player.status</code>: [health, food, saturation, armor, air]</li>
      <li><code>player.flags</code>: 6 binary state indicators</li>
      <li><code>target</code>: Crosshair target with block_id, distance, face</li>
    </ul>
  </li>
  <li><strong>Screen Observation</strong> — 37 known screen mappings</li>
  <li><strong>12 Action Types</strong>: key, select_slot, place, break, interact, jump, swing, look, craft, chat, command, click_button</li>
  <li><strong>AI Agent Guide</strong> — Comprehensive documentation</li>
</ul>

<h3>Bug Fixes</h3>
<ul>
  <li>Server no longer stops on world exit (allows title-screen operations)</li>
  <li>ObservationHandler async response crash fixed (CountDownLatch)</li>
  <li>Frustum block scanning fixed (cross product calculation)</li>
  <li>Screen ID shows human-readable names (not obfuscated class names)</li>
  <li>World name matching is now case-insensitive</li>
</ul>

<h3>Security</h3>
<ul>
  <li>Constant-time token comparison (<code>MessageDigest.isEqual()</code>)</li>
  <li>Block/item IDs validated against regex</li>
  <li>1 MB max request body</li>
  <li>60 req/s rate limiting per IP</li>
  <li>TaskManager thread pool 4→8 threads (DoS mitigation)</li>
</ul>

<h3>Improvements</h3>
<ul>
  <li>Slot bounds checking (hotbar 0-8, inventory 0-35)</li>
  <li>Client-side interactions use <code>client.gameMode</code></li>
  <li>Inventory API uses standard methods instead of reflection</li>
  <li>Complete documentation update</li>
</ul>

<h2 id="v110">v1.1.1 — Initial Release</h2>
<ul>
  <li>Core HTTP REST API for Minecraft control</li>
  <li>Block manipulation (break, place, interact, get)</li>
  <li>Player control (teleport, look, jump, swing)</li>
  <li>Inventory management (get, set, select, drop)</li>
  <li>World control (time, weather)</li>
  <li>Settings (game rules, difficulty)</li>
  <li>Client simulation (keyboard input, UI clicks, settings)</li>
  <li>Chat and command execution</li>
  <li>Script/macro system</li>
  <li>Bearer token authentication</li>
  <li>Rate limiting and security measures</li>
</ul>
`
};

docsData.en.sections = Object.assign(docsData.en.sections, SECTIONS);
})();
