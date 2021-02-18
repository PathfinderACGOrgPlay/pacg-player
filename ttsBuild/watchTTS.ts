import { TabletopSimulatorClient } from "ttstk-channels/dist/src/TabletopSimulatorClient";
import { TabletopSimulatorService } from "ttstk-channels/dist/src/TabletopSimulatorService";
import { buildTTSLua } from "./buildTTSLua";
import fs from "fs";
const { spawn, exec } = require("child_process");

const chokidar = require("chokidar");

new Promise((res, rej) => {
  fs.readFile("/proc/version", (err, data) => {
    if (err) {
      rej(err);
    } else {
      res(data);
    }
  });
})
  .then((v) => v.toString())
  .then((version) => {
    if (version.indexOf("microsoft")) {
      return new Promise((res, rej) => {
        exec(
          "ipconfig.exe | awk -v a=$WSL_ip_line '{if (NR==a) print $NF}' | tr -d \"\\r\"",
          (error, stdout, stderr) => {
            if (error) {
              rej(error);
            } else if (stderr) {
              rej(new Error(stderr));
            } else {
              res(stdout.trim());
            }
          }
        );
      });
    }

    return null;
  })
  .then((clientIp) => {
    const client = new TabletopSimulatorClient();
    const service = new TabletopSimulatorService();

    if (clientIp) {
      // @ts-ignore
      client.REMOTE_DOMAIN = clientIp;
      // @ts-ignore
      service.LISTENER_DOMAIN = "0.0.0.0";

      exec(
        'powershell.exe -Command "Start-Process cmd \\"/c netsh.exe ' +
          [
            "interface",
            "portproxy",
            "add",
            "v4tov4",
            "listenport=39999",
            `listenaddress=${clientIp}`,
            "connectport=39999",
            "connectaddress=127.0.0.1",
          ].join(" ") +
          '\\" -Verb RunAs"'
      );

      function onExit() {
        return new Promise((res, rej) => {
          exec(
            'powershell.exe -Command "Start-Process cmd \\"/c netsh.exe ' +
              [
                "interface",
                "portproxy",
                "delete",
                "v4tov4",
                "listenport=39999",
                `listenaddress=${clientIp}`,
              ].join(" ") +
              '\\" -Verb RunAs"',
            (error, stdout, stderr) => {
              if (error) {
                rej(error);
              } else if (stderr) {
                rej(new Error(stderr));
              } else {
                res(stdout.trim());
              }
            }
          );
        });
      }
      function exit() {
        onExit().then((output) => {
          console.log(output);
          process.exit(0);
        });
      }
      process.on("beforeExit", onExit);
      process.on("SIGTERM", exit);
      process.on("SIGINT", exit);
    }

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
        setTimeout(() => {
          client.ExecuteLuaAsync(
            'broadcastToAll("Starting development server", {0,1,0})'
          );
          watch.on("add", run);
          watch.on("change", run);
          run();
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
  });
