import fs, { Stats } from "fs";
import { readFile } from "./util";

export function getXml(file: string) {
  const xmlPath = "./tts" + file.replace(/.lua$/, ".xml");
  return new Promise<Stats>((res, rej) => {
    fs.stat(xmlPath, (err, stats) => {
      if (err) {
        rej(err);
      } else {
        res(stats);
      }
    });
  }).then(
    () => readFile(xmlPath),
    () => ""
  );
}
