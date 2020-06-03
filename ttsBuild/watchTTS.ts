import { TabletopSimulatorClient } from "ttstk-channels/dist/src/TabletopSimulatorClient";
import { buildTTSLua } from "./buildTTSLua";

const chokidar = require("chokidar");

const client = new TabletopSimulatorClient();

const watch = chokidar.watch(["gameCore/**/*.lua", "tts/**/*.lua"]);

function run() {
  buildTTSLua().then((v) =>
    client.SaveAndPlayAsync(
      Object.keys(v).map((w) => ({
        guid: w,
        name: w,
        script: v[w],
        ui: "",
      }))
    )
  );
}

watch.on("add", run);
watch.on("change", run);
