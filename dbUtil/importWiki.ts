const admin = require("firebase-admin");
const firebase = require("@firebase/testing");
const db = firebase
  .initializeAdminApp({ projectId: "test-pacs-player-site" })
  .firestore();

var Module = require("module");
var _require = Module.prototype.require;
Module.prototype.require = function reallyNeedRequire(name) {
  if (name === "firebase-admin") {
    return { firestore: () => db };
  }
  var nameToLoad = Module._resolveFilename(name, this);
  return _require.call(this, nameToLoad);
};

const firestoreService = require("firestore-export-import");
const serviceAccount = require("./serviceAccountKey.json");

// firestoreService.initializeApp(
//   serviceAccount,
//   "https://test-pacs-player-site.firebaseio.com"
// );

console.log = () => {};
firestoreService.restore("dbUtil/wiki.json", {
  dates: [],
  geos: [],
  refs: [],
  nested: true,
});
