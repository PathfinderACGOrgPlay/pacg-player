import { TabletopSimulatorClient } from "ttstk-channels/dist/src/TabletopSimulatorClient";
import { TabletopSimulatorService } from "ttstk-channels/dist/src/TabletopSimulatorService";
import { buildTTSLua } from "./buildTTSLua";

const chokidar = require("chokidar");

const client = new TabletopSimulatorClient();
const service = new TabletopSimulatorService();
service.Open();

const watch = chokidar.watch(["gameCore/**/*.lua", "tts/**/*.lua"]);

function run() {
  buildTTSLua().then((v) => {
    return client.SaveAndPlayAsync(
      Object.keys(v).map((w) => {
        const name = w.replace(/.lua$/, "").split(".");
        const guid = name[name.length - 1];
        return {
          guid: guid,
          name: name.slice(0, name.length - 1).join("."),
          script: v[w],
          ui: "",
        };
      })
    );
  });
}

watch.on("add", run);
watch.on("change", run);
