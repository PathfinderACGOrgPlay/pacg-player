import glob from "glob";
import { buildLua } from "./buildLua";

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
        files.map((v) => buildLua("./tts", files, false).then((w) => [v, w]))
      )
    )
    .then((files) =>
      files.reduce((acc, v) => {
        acc[v[0]] = v[1];
        return acc;
      }, {})
    );
}
