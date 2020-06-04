import { stat, Stats, writeFile } from "fs";
import axios from "axios";
import { exec, ExecOptions } from "child_process";
import { readFile } from "./util";

function runCmd(command: string, options: ExecOptions) {
  return new Promise<string>((res, rej) => {
    exec(command, options, (err, stdout, stderr) => {
      if (stderr) {
        console.error(stderr);
      }
      if (err) {
        rej(err);
      } else {
        res(stdout);
      }
    });
  });
}

function prepare() {
  return new Promise<Stats>((res, rej) => {
    stat("./ttsBuild/amalg.lua", (err, stats) => {
      if (err) {
        rej(err);
      } else {
        res(stats);
      }
    });
  })
    .catch(() => {
      return axios
        .get(
          "https://raw.githubusercontent.com/siffiejoe/lua-amalg/master/src/amalg.lua"
        )
        .then((v) => {
          return new Promise((res, rej) => {
            writeFile("./ttsBuild/amalg.lua", v.data, (err) => {
              if (err) {
                rej(err);
              } else {
                res();
              }
            });
          });
        });
    })
    .then(() => runCmd(`lua ./ttsBuild/getPackagePath.lua`, {}));
}

export function buildLua(cwd: string, file: string, debug?: boolean) {
  return Promise.all([prepare(), readFile(cwd + "/" + file)])
    .then(([packagePath, contents]) => {
      const regexp = RegExp('require\\("([^"]*)"\\)', "g");
      let match: RegExpExecArray;
      const deps: string[] = [];
      while ((match = regexp.exec(contents)) !== null) {
        deps.push(match[1]);
      }
      return runCmd(
        `lua ../ttsBuild/amalg.lua ${debug ? "-d" : ""} -s ${file} ${deps.join(
          " "
        )}`,
        {
          cwd,
          env: {
            ...process.env,
            LUA_PATH: `..\\gameCore\\?.lua;common\\?.lua;` + packagePath,
          },
        }
      );
    })
    .then((result) => {
      return `
            local modules = {}
            local moduleCache = {}
            function require(module)
                if moduleCache[module] == nil then
                    if modules[module] == nil then
                      assert(false, "Module not found, make sure it's required at the top of the object's lua file " .. module)
                    end
                    moduleCache[module] = modules[module]()
                end
                return moduleCache[module]
            end
            ${result.replace(/package\.preload/g, "modules")}
        `;
    });
}

process.on("unhandledRejection", (up) => {
  throw up;
});
