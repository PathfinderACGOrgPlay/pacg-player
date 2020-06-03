import {TabletopSimulatorClient} from "ttstk-channels/dist/src/TabletopSimulatorClient";
import {buildLua} from "./buildLua";
import glob from "glob";

const chokidar = require("chokidar");

const client = new TabletopSimulatorClient();

const watch = chokidar.watch(["gameCore/**/*.lua", "tts/**/*.lua"]);

function run() {
    glob("**/*.lua", {cwd: "./tts"}, (err, files) => {
        Promise.all(files.map((v) => buildLua("./tts", files, false).then((w) => [v, w]))).then((v) =>
            client.SaveAndPlayAsync(v.map((w) => [
                    {
                        guid: w[0],
                        name: w[0],
                        script: w[1],
                        ui: "",
                    },
                ])
            );
    });
}

watch.on("add", run);
watch.on("change", run);
