import { Card } from "../src/firestore/wiki/card";
import process from "process";
import Jimp from "jimp";
import { Deck } from "../src/firestore/wiki/deck";

const start = process.argv[2] || 0;
const skip = process.argv[3] || 0;

const adventures = require("../src/oldData/adventures.json");
const classDecks = require("../src/oldData/classDecks.json");
const admin = require("firebase-admin");
// @ts-ignore
import DocumentReference = firebase.firestore.DocumentReference;
// const firebase = require("@firebase/testing");
// const db = firebase
//   .initializeAdminApp({ projectId: "test-pacs-player-site" })
//   .firestore();
//
// var Module = require("module");
// var _require = Module.prototype.require;
// Module.prototype.require = function reallyNeedRequire(name) {
//   if (name === "firebase-admin") {
//     return { firestore: () => db };
//   }
//   var nameToLoad = Module._resolveFilename(name, this);
//   return _require.call(this, nameToLoad);
// };

const firestoreService = require("firestore-export-import");
const serviceAccount = require("./serviceAccountKey.json");

firestoreService.initializeApp(
  serviceAccount,
  "https://test-pacs-player-site.firebaseio.com"
);

const types = [
  "Item",
  "Ally",
  "Armor",
  "Weapon",
  "Blessing",
  "Spell",
  "Location",
  "Villian",
  "Loot",
  "Scenario",
  "Monster",
  "Ship",
  "Character",
  "Barrier",
  "Adventure Path",
  "Henchman",
  "Adventure",
  "Role",
  "Story Bane",
  "Scourge",
  "Wildcard",
  "Player Reference",
  "Story Bane List",
  "Cohort",
  "Supporter",
  "Story Bane Roster",
  "Troop",
  "Mythic Path",
];

function getNextCard(
  oldJson: any,
  deck: string,
  adventure: string,
  cards: string[],
  deckImages: { [key: string]: Promise<Jimp> }
) {
  if (cards.length === 0) {
    return Promise.resolve([]);
  }
  const card = cards.pop();
  const cardObj = oldJson.Decks[adventure][card];
  const traits = cardObj.Description.split(",")
    .map((v) => v.trim())
    .filter(
      (v) => v && v !== adventure && v !== deck && v !== "Skull & Shackles"
    );
  let type = traits.find((v) => types.indexOf(v) !== -1) || "";
  if (type === "Villian") {
    type = "Villian";
  }
  if (!type && traits.length) {
    throw new Error(`Type Not Found: ${traits.join(",")}`);
  }
  return getCardImage(oldJson, cardObj.deck, cardObj.x, cardObj.y, deckImages)
    .then((image) => {
      return {
        name: card,
        image,
        traits: traits.filter((v) => v !== type),
        subDeck: adventure,
        type,
        count: cardObj.count || 1,
        removed: false,
      };
    })
    .then((res) =>
      getNextCard(oldJson, deck, adventure, cards, deckImages).then((res2) => [
        res,
        ...res2,
      ])
    );
}

function getNextAdventure(oldJson: any, deck: string, adventures: string[]) {
  if (adventures.length === 0) {
    return Promise.resolve([]);
  }
  const adventure = adventures.pop();
  return getNextCard(
    oldJson,
    deck,
    adventure,
    Object.keys(oldJson.Decks[adventure]),
    {}
  ).then((res) =>
    getNextAdventure(oldJson, deck, adventures).then((res2) => res.concat(res2))
  );
}

function getCardImage(
  oldJson: any,
  deck: string,
  x: number,
  y: number,
  deckImages: { [key: string]: Promise<Jimp> }
) {
  if (!deckImages[deck]) {
    deckImages[deck] = Jimp.read(oldJson.DeckImages[deck].url);
  }
  return deckImages[deck].then((image) => {
    const imageWidth = image.getWidth();
    const cardWidth = imageWidth / oldJson.DeckImages[deck].width;
    const imageHeight = image.getHeight();
    const cardHeight = imageHeight / oldJson.DeckImages[deck].height;
    try {
      return image
        .clone()
        .crop(
          Math.min(y * cardWidth, imageWidth - cardWidth),
          Math.min(x * cardHeight, imageHeight - cardHeight),
          cardWidth,
          cardHeight
        )
        .getBufferAsync(Jimp.MIME_JPEG);
    } catch (e) {
      return Promise.resolve(null);
    }
  });
}

function getCards(oldJson: any, deck: string): Promise<Card[]> {
  if (!oldJson.DeckImages) {
    return Promise.resolve([]);
  }
  return getNextAdventure(oldJson, deck, Object.keys(oldJson.Decks));
}
const bucket = admin.storage().bucket("gs://test-pacs-player-site.appspot.com");
function importNextDeck(decks: DocumentReference<Deck>[]) {
  if (decks.length === 0) {
    return {};
  }
  const ref = decks.pop();
  for (let i = 0; i < skip; i++) {
    decks.pop();
  }
  // @ts-ignore
  return Promise.all([ref.get(), ref.collection("card").listDocuments()])
    .then(([doc, cards]) => {
      const data = doc.data();
      let name = data.name;
      if (cards.length) {
        console.log(
          `${new Date().toISOString()} ${name} ${ref.path} has cards, skipping`
        );
        return importNextDeck(decks);
      }
      let oldJson = {};
      if (name === "Goblins Burn! Class Deck") {
        name = "Goblin's Burn! Deck";
      }
      if (name === "Goblins Fight! Class Deck") {
        name = "Goblin's Fight! Deck";
      }
      if (name === "Skull & Shackles") {
        name = "Skull And Shackles";
      }
      if (adventures[name]) {
        oldJson = adventures[name];
        delete adventures[name];
      } else if (classDecks[name]) {
        oldJson = classDecks[name];
        delete classDecks[name];
      }
      console.log(
        `${new Date().toISOString()} Building cards for ${name} ${ref.path}`
      );
      return getCards(oldJson, name).then((cards) => {
        if (cards.length) {
          console.log(
            `${new Date().toISOString()} Writing ${
              cards.length
            } cards for ${name} ${ref.path}`
          );
          return Promise.all(
            cards.map((card) => {
              const doc = ref.collection("card").doc();
              const file = bucket.file(`/cards/${doc.id}`);
              return file
                .save(card.image, { contentType: "image/jpeg" })
                .then(() =>
                  file.getSignedUrl({ action: "read", expires: "01-01-2099" })
                )
                .then((url) => {
                  card.image = url;
                  return doc.set(card);
                });
            })
          ).then(() => {
            console.log(`${new Date().toISOString()} ${name} ${ref.path} Done`);
          });
        }
      });
    })
    .then(() => importNextDeck(decks));
}

//importNextDeck(wikiId, decks, Object.keys(decks));

admin
  .firestore()
  .collection("wiki")
  .listDocuments()
  .then((v) => v[0].collection("deck").listDocuments())
  .then((arr) => {
    for (let i = 0; i < start; i++) {
      arr.pop();
    }
    return importNextDeck(arr);
  });
// .then((v) => {
//   return Promise.all(v.map((w) => w.collection("card").listDocuments()));
// })
// .then((v) => {
//   return Promise.all(
//     v.map((w) =>
//       Promise.all(
//         w.map((x) => Promise.all([w.delete(),
//           x
//             .collection("audit")
//             .listDocuments()
//             .then((v) => Promise.all(v.map((w) => w.delete())))
//         ]))
//       )
//     )
//   );
// });

process.on("unhandledRejection", (up) => {
  throw up;
});
