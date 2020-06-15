const Module = require("module");
const _require = Module.prototype.require;
Module.prototype.require = function reallyNeedRequire(name: string) {
  if (name === "react-firebase-hooks/firestore") {
    return {
      useCollection: () => [],
      useDocument: () => [],
    };
  }
  if (name === "react-firebase-hooks/auth") {
    return {
      useAuthState: () => null,
    };
  }
  if (
    [
      "firebase/app",
      "firebase/performance",
      "firebase/analytics",
      "firebase/auth",
      "firebase/firestore",
    ].indexOf(name) !== -1
  ) {
    return {};
  }
  // @ts-ignore
  return _require.call(this, name);
};

// @ts-ignore
process.env.FIREBASE_FUNCTIONS = true;

// eslint-disable-next-line import/first
import * as admin from "firebase-admin";

admin.initializeApp();

export * from "./rawInfo";
export * from "./deck";
export * from "./firebase";
export * from "./character";
