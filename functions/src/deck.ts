import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { PlayerCharacter } from "../../src/firestore/characters";
import { Character } from "../../src/firestore/wiki/character";
import { Deck } from "../../src/firestore/wiki/deck";
import puppeteer from "puppeteer";
import { getMarkup } from "./character/getMarkup";

const firestore = admin.firestore();

function getCheckboxes(systemId: string, deckId: string, characterId: string) {
  return Promise.all([
    puppeteer
      .launch({
        defaultViewport: {
          width: 1280,
          height: 1280,
        },
      })
      .then((browser) => browser.newPage().then((page) => ({ browser, page }))),
    getMarkup(systemId, deckId, characterId, false),
  ])
    .then(([data, html]) => data.page.setContent(html).then(() => data))
    .then((data) =>
      data.page
        .$$eval("input[type=checkbox]", (eles) =>
          eles.map((v) => {
            const rect = v.getBoundingClientRect();
            return [
              (v as HTMLInputElement).name,
              rect.x,
              rect.y,
              rect.width,
              rect.height,
            ];
          })
        )
        .then((result) => ({ ...data, result }))
    )
    .then((data) => {
      return data.browser.close().then(() =>
        data.result.reduce((acc, v) => {
          const idx = (v[0] as string).split("-");
          const ele = idx.reduce((acc2, w) => {
            if (!acc2[w]) {
              acc2[w] = {};
            }
            return acc2[w];
          }, acc);
          ele.x = (v[1] as number) + (v[3] as number) / 2;
          ele.y = (v[2] as number) + (v[4] as number) / 2;
          return acc;
        }, {} as any)
      );
    });
}

// function substituteCards(
//   box: typeof classDecks["Alchemist Class Deck"],
//   subs: { [adventure: string]: { [cards: string]: [string, string] } }
// ) {
//   const insertedImages: any = {};
//   box.Decks = { ...box.Decks };
//   box.DeckImages = { ...box.DeckImages };
//   (Object.keys(subs) as (keyof typeof box.Decks)[]).forEach((adventureName) => {
//     if (box.Decks[adventureName]) {
//       box.Decks[adventureName] = { ...box.Decks[adventureName] } as any;
//       const deck = box.Decks[adventureName] as any;
//       Object.keys(subs[adventureName]).forEach((card) => {
//         if (deck[card]) {
//           const source =
//             subs[adventureName][card][0] === "Core"
//               ? adventures["Core Set"]
//               : adventures["Curse of the Crimson Throne"];
//           const sourceCard = (source.Decks as any)[
//             subs[adventureName][card][1]
//           ]?.[card];
//
//           if (sourceCard) {
//             const sourceDeck = (source.DeckImages as any)[sourceCard.deck];
//
//             if (!insertedImages[sourceDeck.url]) {
//               const newId = Object.keys(box.DeckImages).length.toString();
//               (box.DeckImages as any)[newId] = sourceDeck;
//               insertedImages[sourceDeck.url] = newId;
//             }
//
//             deck[card].Description = deck[card].Description + ", Substitution";
//             deck[card].deck = insertedImages[sourceDeck.url];
//             deck[card].x = sourceCard.x;
//             deck[card].y = sourceCard.y;
//           }
//         }
//       });
//     }
//   });
//   return box;
// }

function addMetadata(data: PlayerCharacter) {
  const boxes: any = {};

  // if (data.deckOne && (classDecks as any)[data.deckOne]) {
  //   boxes[data.deckOne] = (classDecks as any)[data.deckOne];
  //
  //   if (data.deckOneSubstitutions) {
  //     boxes[data.deckOne] = substituteCards(
  //       boxes[data.deckOne],
  //       data.deckOneSubstitutions
  //     );
  //   }
  // }
  // if (data.deckTwo && (classDecks as any)[data.deckTwo]) {
  //   boxes[data.deckTwo] = (classDecks as any)[data.deckTwo];
  //
  //   if (data.deckTwoSubstitutions) {
  //     boxes[data.deckTwo] = substituteCards(
  //       boxes[data.deckTwo],
  //       data.deckTwoSubstitutions
  //     );
  //   }
  // }
  // if (data.deckThree && (classDecks as any)[data.deckThree]) {
  //   boxes[data.deckThree] = (classDecks as any)[data.deckThree];
  //
  //   if (data.deckThreeSubstitutions) {
  //     boxes[data.deckThree] = substituteCards(
  //       boxes[data.deckThree],
  //       data.deckThreeSubstitutions
  //     );
  //   }
  // }

  let wikiCharacter = Promise.resolve<null | Character>(null);
  let deck = Promise.resolve<null | Deck>(null);
  let checkboxes = Promise.resolve<null | any>(null);
  if (data.systemId && data.characterId && data.deckId) {
    wikiCharacter = firestore
      .collection("wiki")
      .doc(data.systemId)
      .collection("deck")
      .doc(data.deckId)
      .collection("wiki_character")
      .doc(data.characterId)
      .get()
      .then((v) => v.data() as Character);
    deck = firestore
      .collection("wiki")
      .doc(data.systemId)
      .collection("deck")
      .doc(data.deckId)
      .get()
      .then((v) => v.data() as Deck);
    checkboxes = getCheckboxes(data.systemId, data.deckId, data.characterId);
  }
  return Promise.all([wikiCharacter, deck, checkboxes]).then(
    ([wikiCharacter, deck, checkboxes]) => ({
      wikiCharacter,
      deck,
      checkboxes,
      characterData: data,
    })
  );
}

export const getTTSDeck = functions.https.onRequest((request, response) => {
  firestore
    .collection("account_characters")
    .doc(request.path.substr(1))
    .get()
    .then((doc: any) => {
      if (!(doc && doc.exists)) {
        return response.status(404).send({ error: "Unable to find the deck" });
      }
      return addMetadata(doc.data()).then((v) => response.status(200).send(v));
    })
    .catch((err: any) => {
      console.error(err);
      return response
        .status(404)
        .send({ error: "Unable to retrieve the deck" });
    });
});

export const getTTSDeckByOrgPlayId = functions.https.onRequest(
  (request, response) => {
    firestore
      .collection("account_characters")
      .where("orgPlayId", "==", request.path.substr(1))
      .get()
      .then((doc) => {
        if (!(doc && doc.docs[0])) {
          return response
            .status(404)
            .send({ error: "Unable to find the deck" });
        }
        const data = doc.docs[0].data() as PlayerCharacter;
        return addMetadata(data).then((v) => response.status(200).send(v));
      })
      .catch((err: any) => {
        console.error(err);
        return response
          .status(404)
          .send({ error: "Unable to retrieve the deck" });
      });
  }
);
