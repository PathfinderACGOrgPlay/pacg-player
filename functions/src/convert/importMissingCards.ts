import Jimp from "jimp";
import admin from "firebase-admin";
import { getDecks } from "./getDecks";
import { firestore } from "firebase-admin";
import { Deck } from "../../../src/firestore/wiki/deck";
import { Card } from "../../../src/firestore/wiki/card";

let deckData: {
  [deck: string]: { [card: string]: { Description: string } };
} = {};

const decksPromise = getDecks().then((v) => {
  deckData = v;
});

export function importMissingCards() {
  console.log("importMissingCards");

  return decksPromise
    .then((v) =>
      admin
        .firestore()
        .collection("wiki")
        .doc("Vm2bdLJuAnw8SRxYB0A5")
        .collection("deck")
        .listDocuments()
    )
    .then((arr) => {
      return importNextDeck(arr as any);
    })
    .then(() => {
      console.log(Object.keys(deckData));
    })
    .then(() => {
      console.log("importMissingCards done");
    });
}

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
  "Armoe",
  "Trader",
  "Support",
  "Barge",
];

function getNextCard(
  oldJson: any,
  deck: string,
  adventure: string,
  cards: string[],
  deckImages: { [key: string]: Promise<Jimp> }
): Promise<Card[]> {
  if (cards.length === 0) {
    return Promise.resolve([]);
  }
  const card = cards.pop()!;
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
  if (type === "Armoe") {
    type = "Armor";
  }
  if (!type && traits.length) {
    throw new Error(`Type Not Found: ${traits.join(",")}`);
  }
  return getCardImage(oldJson, cardObj.deck, cardObj.x, cardObj.y, deckImages)
    .then(
      (image: any): Card => {
        return {
          name: card,
          image,
          traits: traits.filter((v) => v !== type),
          subDeck: adventure,
          type,
          count: cardObj.count || 1,
          removed: false,
        };
      }
    )
    .then((res) =>
      getNextCard(oldJson, deck, adventure, cards, deckImages).then((res2) => [
        res,
        ...res2,
      ])
    );
}

function getNextAdventure(
  oldJson: any,
  deck: string,
  adventures: string[]
): Promise<Card[]> {
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const bucket = admin.storage().bucket("gs://adventurecard-game.appspot.com");
function importNextDeck(decks: firestore.DocumentReference<Deck>[]): any {
  if (decks.length === 0) {
    return {};
  }
  const ref = decks.pop()!;
  // @ts-ignore
  return Promise.all([ref.get(), ref.collection("card").listDocuments()])
    .then(([doc, cards]) => {
      const data = doc.data();
      let name = data!.name;
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
      if (deckData[name]) {
        oldJson = deckData[name];
        delete deckData[name];
      }
      if (cards.length) {
        return importNextDeck(decks);
      }
      if (!oldJson) {
        return importNextDeck(decks);
      }
      return getCards(oldJson, name).then((cards): any => {
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
                .getMetadata()
                .then((v) => {
                  if (!v) {
                    return file.save(card.image, { contentType: "image/jpeg" });
                  }
                  return Promise.resolve();
                })
                .then(() => {
                  delete card.image;
                  return file.getSignedUrl({
                    action: "read",
                    expires: "01-01-2099",
                  });
                })
                .then((url) => {
                  card.image = url as any;
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
