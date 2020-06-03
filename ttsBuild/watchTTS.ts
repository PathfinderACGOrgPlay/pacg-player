import { TabletopSimulatorClient } from "ttstk-channels/dist/src/TabletopSimulatorClient";
import { TabletopSimulatorService } from "ttstk-channels/dist/src/TabletopSimulatorService";
import { buildTTSLua } from "./buildTTSLua";

const chokidar = require("chokidar");

const client = new TabletopSimulatorClient();
const service = new TabletopSimulatorService();
let saving = false;

service.Open();
service.on("newgamemessage", setup);
service.on("returnvaluemessage", (id, value) => {
  if (typeof value === "string") {
    let parsed = { isTTSDebug: false };
    try {
      parsed = JSON.parse(value);
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => {
      if (!parsed.isTTSDebug) {
        client.ExecuteLuaAsync(
          "broadcastToAll('FAILED TO START DEV SERVER! Make sure you load save #9999', {1,0,0})"
        );
      } else {
        client.ExecuteLuaAsync(
          'broadcastToAll("Starting development server", {0,1,0})'
        );
        watch.on("add", run);
        watch.on("change", run);
        run();
      }
    }, 100);
  }
});

const watch = chokidar.watch(["gameCore/**/*.lua", "tts/**/*.lua"]);

function run() {
  buildTTSLua().then((v) => {
    saving = true;
    return client.SaveAndPlayAsync(
      Object.keys(v).map((w) => {
        const name = w.replace(/.lua$/, "").split(".");
        const guid = name[name.length - 1];
        if (guid === "-1") {
          v[w][0] += "\nlocal isTTSDebug = true";
        }
        return {
          guid: guid,
          name: name.slice(0, name.length - 1).join("."),
          script: v[w][0],
          ui: v[w][1],
        };
      })
    );
  });
}

function setup() {
  if (!saving) {
    watch.off("add", run);
    watch.off("change", run);
    client.ExecuteLuaAsync("return Global.script_state");
  } else {
    saving = false;
  }
}
setup();
