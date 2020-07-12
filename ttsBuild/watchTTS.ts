import { TabletopSimulatorClient } from "ttstk-channels/dist/src/TabletopSimulatorClient";
import { TabletopSimulatorService } from "ttstk-channels/dist/src/TabletopSimulatorService";
import { buildTTSLua } from "./buildTTSLua";
import fs from "fs";

const chokidar = require("chokidar");

const client = new TabletopSimulatorClient();
// @ts-ignore
client.REMOTE_DOMAIN = "172.23.0.1";
const service = new TabletopSimulatorService();
// @ts-ignore
const origHandle = service.HandleMessage;
// @ts-ignore
service.HandleMessage = function (data) {
  try {
    return origHandle.apply(this, [data]);
  } catch {}
};
let saving = false;

service.Open();
service.on("newgamemessage", setup);
service.on("returnvaluemessage", (id, value) => {
  console.log(id, value);
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
service.on(
  "errormessage",
  (message: string, guid: string, errorMessagePrefix: string) => {
    console.log({ message, guid, errorMessagePrefix });
  }
);

const watch = chokidar.watch([
  "gameCore/**/*.lua",
  "tts/**/*.lua",
  "tts/**/*.xml",
]);

function run() {
  console.log("Change detected, building");
  buildTTSLua().then((v) => {
    saving = true;
    return client.SaveAndPlayAsync(
      Object.keys(v).map((w) => {
        const name = w.replace(/.lua$/, "").split(".");
        const guid = name[name.length - 1];
        if (guid === "-1") {
          v[w][0] += "\nlocal isTTSDebug = true";
        }
        fs.writeFile("luaCache/" + w, v[w][0], () => {});
        fs.writeFile(
          "luaCache/" + w.replace(/.lua$/, ".xml"),
          v[w][1],
          console.log
        );
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
    console.log("Sending message");
    client.ExecuteLuaAsync("return Global.script_state");
  } else {
    saving = false;
  }
}
setup();
