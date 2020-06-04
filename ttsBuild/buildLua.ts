import { stat, Stats, writeFile } from "fs";
import axios from "axios";
import { exec, ExecOptions } from "child_process";
import process from "process";
import { bundle } from "luabundle";

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

export function buildLua(cwd: string, file: string, debug?: boolean) {
  return bundle(cwd + "/" + file, {
    paths: [
      process.cwd() + "/tts/?",
      process.cwd() + "/tts/?.lua",
      process.cwd() + "/?",
      process.cwd() + "/?.lua",
    ],
  });
}

process.on("unhandledRejection", (up) => {
  throw up;
});
