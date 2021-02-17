import { buildTTSLua } from "./buildTTSLua";
import { readFile } from "./util";
import fs from "fs";
import { serialize } from "bson";

Promise.all([buildTTSLua(), readFile("./tts/save.json")]).then(
  ([scripts, save]) => {
    const saveData = JSON.parse(save);
    const { "Global.-1.lua": Global, ...other } = scripts;
    saveData.LuaScript = Global[0];
    saveData.XmlUI = Global[1];
    Object.keys(other).forEach((v) => {
      const name = v.split(".");
      const guid = name[name.length - 2];
      const object = saveData.ObjectStates.find((v) => v.GUID === guid);
      if (object) {
        object.LuaScript = other[v][0];
        object.XmlUI = other[v][1];
      }
    });
    return Promise.all([
      new Promise<void>((res, rej) => {
        fs.writeFile("build/save.json", JSON.stringify(saveData), (err) => {
          if (err) {
            rej(err);
          } else {
            res();
          }
        });
      }),
      new Promise<void>((res, rej) => {
        fs.writeFile("build/save.bson", serialize(saveData), (err) => {
          if (err) {
            rej(err);
          } else {
            res();
          }
        });
      }),
    ]);
  }
);
