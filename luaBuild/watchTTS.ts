import {TabletopSimulatorClient} from "ttstk-channels/dist/src/TabletopSimulatorClient";
import {buildLua} from "./buildLua";

const chokidar = require('chokidar');

const client = new TabletopSimulatorClient();

const watch = chokidar.watch(["gameCore/**/*.lua", "tts/**/*.lua"])
function run() {
    buildLua("./tts", ["Main.lua"], false).then((v) =>
        client.SaveAndPlayAsync([{
            guid: "-1",
            name: "Global",
            script: v,
            ui: ""
        }]));
}
watch.on("add", run);
watch.on("change", run);