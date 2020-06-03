import glob from "glob";
import { buildLua } from "./buildLua";
import { getXml } from "./getXml";

export function buildTTSLua() {
  return new Promise<string[]>((res, rej) => {
    glob("*.lua", { cwd: "./tts" }, (err, files) => {
      if (err) {
        rej(err);
      } else {
        res(files);
      }
    });
  })
    .then((files) =>
      Promise.all(
        files.map((v) => {
          return Promise.all([
            buildLua("./tts", [v], false),
            getXml(v),
          ]).then((w) => [v, ...w]);
        })
      )
    )
    .then((files) =>
      files.reduce((acc, v) => {
        acc[v[0]] = [v[1], v[2]];
        return acc;
      }, {} as { [filename: string]: [string, string] })
    );
}
