import {buildLua} from "./buildLua";
import {TabletopSimulatorClient} from 'ttstk-channels/dist/src/TabletopSimulatorClient';

const client = new TabletopSimulatorClient();
buildLua("./tts", ["Main.lua"], false).then((v) =>
    client.SaveAndPlayAsync([{
        guid: "-1",
        name: "Global",
        script: v,
        ui: ""
    }]))