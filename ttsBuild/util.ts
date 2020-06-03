import fs from "fs";

export function readFile(path: string) {
  return new Promise<string>((res, rej) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        rej(err);
      } else {
        res(data.toString());
      }
    });
  });
}
