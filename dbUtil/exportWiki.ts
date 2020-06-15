const firestoreService = require("firestore-export-import");
const serviceAccount = require("./serviceAccountKey.json");
const fs = require("fs");

firestoreService.initializeApp(
  serviceAccount,
  "https://test-pacs-player-site.firebaseio.com"
);

// Start exporting your data
if (fs.existsSync("dbUtil/wiki.json")) {
  console.log("backup exists, skipping");
  process.exit(0);
}
firestoreService
  .backup("wiki")
  .then((data) => fs.writeFileSync("dbUtil/wiki.json", JSON.stringify(data)));
