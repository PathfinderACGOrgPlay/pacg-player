import { Card } from "../src/firestore/wiki/card";
import process from "process";
import Jimp from "jimp";

const adventures = require("../src/oldData/adventures.json");
const classDecks = require("../src/oldData/classDecks.json");
const wikiDump = require("./wiki.json");
// const admin = require("firebase-admin");
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

const types = ["Item", "Ally", "Armor", "Weapon", "Blessing", "Spell"];

function getNextCard(
  oldJson: any,
  deck: string,
  adventure: string,
  cards: string[]
) {
  if (cards.length === 0) {
    return Promise.resolve([]);
  }
  const card = cards.pop();
  const cardObj = oldJson.Decks[adventure][card];
  const traits = cardObj.Description.split(",")
    .map((v) => v.trim())
    .filter((v) => v !== adventure && v !== deck);
  const type = traits.find((v) => types.indexOf(v) !== -1) || "";
  return getCardImage(oldJson, cardObj.deck, cardObj.x, cardObj.y)
    .then((image) => {
      return {
        name: card,
        image,
        traits: traits.filter((v) => v !== type),
        subDeck: adventure,
        type,
        removed: false,
      };
    })
    .then((res) =>
      getNextCard(oldJson, deck, adventure, cards).then((res2) => [
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
    Object.keys(oldJson.Decks[adventure])
  ).then((res) =>
    getNextAdventure(oldJson, deck, adventures).then((res2) => res.concat(res2))
  );
}

function getCardImage(oldJson: any, deck: string, x: number, y: number) {
  return Jimp.read(oldJson.DeckImages[deck].url).then((image) => {
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
        .getBase64Async("image/png");
    } catch (e) {
      return Promise.resolve("");
    }
  });
}

function getCards(oldJson: any, deck: string): Promise<Card[]> {
  if (!oldJson.DeckImages) {
    return Promise.resolve([]);
  }
  return getNextAdventure(oldJson, deck, Object.keys(oldJson.Decks));
}

function importNextDeck(wikiId: string, decks: any, deckIds: string[]) {
  if (decks.length === 0) {
    return {};
  }
  const deckId = deckIds.pop();
  let name = decks[deckId].name;
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
  return getCards(oldJson, decks[deckId].name)
    .then((cards) => {
      return {
        [`wiki/${wikiId}/deck`]: Object.keys(decks).reduce((acc, deckId) => {
          acc[deckId] = {
            ...decks[deckId],
            subCollection: {
              [`wiki/${wikiId}/deck/${deckId}/card`]: cards,
              ...decks[deckId].subCollection,
            },
          };
          return acc;
        }, {}),
      };
    })
    .then((result) => {
      firestoreService.restore(
        {
          wiki: {
            [wikiId]: {
              ...wikiDump.wiki[wikiId],
              subCollection: {
                ...result,
              },
            },
          },
        },
        {
          dates: [],
          geos: [],
          refs: [],
          nested: true,
        }
      );
    })
    .then(() => importNextDeck(wikiId, decks, deckIds));
}

const wikiId = Object.keys(wikiDump.wiki)[0];
const decks = wikiDump.wiki[wikiId].subCollection[`wiki/${wikiId}/deck`];
importNextDeck(wikiId, decks, Object.keys(decks));

process.on("unhandledRejection", (up) => {
  throw up;
});
