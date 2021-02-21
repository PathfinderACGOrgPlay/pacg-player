import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { PlayerCharacter } from "../../../src/firestore/characters";
import { Character } from "../../../src/firestore/wiki/character";
import { Deck } from "../../../src/firestore/wiki/deck";
import { getCheckboxesRoles, getDeckInfoObject, getHash } from "../util";
import { getMarkupData } from "../character/getMarkup";
import { markupDataToJson } from "../character";

const firestore = admin.firestore();

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

function getCards(
  systemId: string,
  deckId: string | undefined,
  afterId?: string
): Promise<ReturnType<typeof getDeckInfoObject>[]> {
  if (!deckId) {
    return Promise.resolve([]);
  }
  let query = firestore
    .collection("wiki")
    .doc(systemId)
    .collection("deck")
    .doc(deckId)
    .collection("card")
    .orderBy(admin.firestore.FieldPath.documentId())
    .where("removed", "==", false);
  if (afterId) {
    query = query.startAfter(afterId);
  }
  return query
    .limit(70)
    .get()
    .then((snap) => {
      if (snap.docs.length) {
        return Promise.resolve(
          snap.docs.length >= 70
            ? getCards(systemId, deckId, snap.docs[snap.docs.length - 1].id)
            : []
        ).then((next) => {
          return [getDeckInfoObject(snap), ...next];
        });
      } else {
        return [];
      }
    });
}

function addMetadata(data: PlayerCharacter) {
  let wikiCharacter = Promise.resolve<null | Character>(null);
  let deck = Promise.resolve<null | Deck>(null);
  let checkboxes = Promise.resolve<null | any>(null);
  let roles = Promise.resolve<null | any>(null);
  let cards = Promise.resolve<null | any>(null);
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
    cards = Promise.all([
      data.deckOne
        ? firestore
            .collection("wiki")
            .doc(data.systemId)
            .collection("deck")
            .doc(data.deckOne)
            .get()
            .then((v) => v.data() as Deck)
        : null,
      getCards(data.systemId, data.deckOne),
      data.deckTwo
        ? firestore
            .collection("wiki")
            .doc(data.systemId)
            .collection("deck")
            .doc(data.deckTwo)
            .get()
            .then((v) => v.data() as Deck)
        : null,
      getCards(data.systemId, data.deckTwo),
      data.deckThree
        ? firestore
            .collection("wiki")
            .doc(data.systemId)
            .collection("deck")
            .doc(data.deckThree)
            .get()
            .then((v) => v.data() as Deck)
        : null,
      getCards(data.systemId, data.deckThree),
    ]).then(([deckOne, cardsOne, deckTwo, cardsTwo, deckThree, cardsThree]) => {
      return {
        one: {
          deck: {
            ...deckOne,
            id: data.deckOne,
          },
          selected: data.cardsOne?.map((v) => v.card) || [],
          cards: cardsOne,
        },
        two: {
          deck: {
            ...deckTwo,
            id: data.deckTwo,
          },
          selected: data.cardsTwo?.map((v) => v.card) || [],
          cards: cardsTwo,
        },
        three: {
          deck: {
            ...deckThree,
            id: data.deckThree,
          },
          selected: data.cardsThree?.map((v) => v.card) || [],
          cards: cardsThree,
        },
      };
    });
    const chkRole = getCheckboxesRoles(
      data.systemId,
      data.deckId,
      data.characterId,
      data.role ?? -1
    );
    checkboxes = chkRole.then((v) => v.checkboxes);
    roles = chkRole.then((v) => v.roles);
  }
  return Promise.all([
    wikiCharacter,
    deck,
    checkboxes,
    roles,
    cards,
    getMarkupData(data.systemId!, data.deckId!, data.characterId!, -1, false),
  ])
    .then((items) => {
      return Promise.all([
        ...items,
        Promise.all(
          items[0]!.roles.map((_, i) =>
            getMarkupData(
              data.systemId!,
              data.deckId!,
              data.characterId!,
              i,
              false
            )
          )
        ),
      ]);
    })
    .then(
      ([
        wikiCharacter,
        deck,
        checkboxes,
        roles,
        cards,
        baseMarkupData,
        rolesMarkupData,
      ]) => ({
        wikiCharacter,
        deck,
        checkboxes,
        roles,
        cards,
        characterData: {
          ...data,
          baseHash: getHash(markupDataToJson(baseMarkupData)),
          roleHashes: rolesMarkupData.map((v) => getHash(markupDataToJson(v))),
        },
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
