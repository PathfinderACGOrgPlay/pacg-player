import {stat, Stats, writeFile} from 'fs';
import axios from 'axios';
import {exec, ExecOptions} from 'child_process';


function runCmd(command: string, options: ExecOptions) {
    return new Promise<string>((res, rej) => {
        exec(command, options, (err, stdout, stderr) => {
            if(stderr) {
                console.error(stderr);
            }
            if(err) {
                rej(err);
            } else {
                res(stdout);
            }
        })
    })
}

export function buildLua(cwd: string, files: string[], debug?: boolean) {
    return new Promise<Stats>((res, rej) => {
        stat("./build/amalg.lua", (err, stats) => {
            if(err) {
                rej(err)
            } else {
                res(stats)
            }
        })
    }).catch(() => {
        return axios.get("https://raw.githubusercontent.com/siffiejoe/lua-amalg/master/src/amalg.lua").then((v) => {
            return new Promise((res, rej) => {
                writeFile("./build/amalg.lua", v.data, (err) => {
                    if(err) {
                        rej(err);
                    } else {
                        res();
                    }
                })
            })
        })
    }).then(() => runCmd(`lua ./build/getPackagePath.lua`, {})).then((packagePath) => {
        return runCmd(`lua ../build/amalg.lua ${debug ? "-d" : ""} -s ${files.join(" -s ")} GameCore`, {
            cwd,
            env: {
                ...process.env,
                LUA_PATH: `..\\gameCore\\?.lua;` + packagePath
            }
        });
    }).then((result) => {
        return `
            local modules = {}
            local moduleCache = {}
            function require(module)
                if moduleCache[module] == nil then
                    moduleCache[module] = modules[module]()
                end
                return moduleCache[module]
            end
            ${result.replace(/package\.preload/g, "modules")}
        `;
    });
}

process.on('unhandledRejection', up => {
    throw up;
});