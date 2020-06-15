// @ts-ignore
process.env.FIREBASE_FUNCTIONS = true;

// eslint-disable-next-line import/first
import * as admin from "firebase-admin";

admin.initializeApp();

export * from "./rawInfo";
export * from "./deck";
export * from "./firebase";
export * from "./character";
