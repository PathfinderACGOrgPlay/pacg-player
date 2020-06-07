import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as jsondiffpatch from "jsondiffpatch";

const firestore = admin.firestore();
const diff = jsondiffpatch.create();

export const wikiCreate = functions.firestore
  .document("/wiki/{document=**}")
  .onCreate((snap, context) => {
    if (snap.ref.path.match(/\/audit\/[^/]*/)) {
      return snap;
    }
    return firestore
      .collection(`${snap.ref.path}/audit`)
      .add({
        type: "create",
        date: new Date(),
      })
      .then(() => snap);
  });

export const wikiUpdate = functions.firestore
  .document("/wiki/{document=**}")
  .onUpdate((change, context) => {
    if (change.after.ref.path.match(/\/audit\/[^/]*/)) {
      return change.after;
    }
    return firestore
      .collection(`${change.after.ref.path}/audit`)
      .add({
        type: "update",
        date: new Date(),
        diff: diff.diff(change.before.data(), change.after.data()),
      })
      .then(() => change.after);
  });
