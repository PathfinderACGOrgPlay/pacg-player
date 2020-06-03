import fs, { Stats } from "fs";

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
    () => {
      return new Promise<string>((res, rej) => {
        fs.readFile(xmlPath, (err, data) => {
          if (err) {
            rej(err);
          } else {
            res(data.toString());
          }
        });
      });
    },
    () => ""
  );
}
