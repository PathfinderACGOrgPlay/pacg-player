import { buildTTSLua } from "./buildTTSLua";
import { readFile } from "./util";
import fs from "fs";

Promise.all([buildTTSLua(), readFile(process.argv[2])]).then(
  ([scripts, save]) => {
    const saveData = JSON.parse(save);
    const { "Global.-1.lua": Global, ...other } = scripts;
    saveData.LuaScript = "";
    saveData.LuaScriptState = "";
    saveData.XmlUI = "";
    Object.keys(other).forEach((v) => {
      const name = v.split(".");
      const guid = name[name.length - 2];
      const object = saveData.ObjectStates.find((v) => v.GUID === guid);
      if (object) {
        object.LuaScript = "";
        object.XmlUI = "";
      }
    });
    return new Promise((res, rej) => {
      fs.writeFile(
        "tts/save.json",
        JSON.stringify(saveData, null, 4),
        (err) => {
          if (err) {
            rej(err);
          } else {
            res();
          }
        }
      );
    });
  }
);
