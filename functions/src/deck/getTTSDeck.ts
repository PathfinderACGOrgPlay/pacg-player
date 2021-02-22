import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import type { PlayerCharacter } from "../../../src/firestore/characters";
import type { Character } from "../../../src/firestore/wiki/character";
import type { Deck } from "../../../src/firestore/wiki/deck";
import { getCheckboxesRoles, getDeckInfoObject, getHash } from "../util";
import { getMarkupData } from "../character/getMarkup";
import { markupDataToJson } from "../character";

const firestore = admin.firestore();

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

interface DeckInfoData {
  cards: {
    [systemId: string]: {
      [deckId: string]: {
        [afterId: string]: Promise<admin.firestore.QuerySnapshot>;
      };
    };
  };
  deckInfo: {
    [systemId: string]: {
      [deckId: string]: {
        [afterId: string]: ReturnType<typeof getDeckInfoObject>;
      };
    };
  };
}

function getCardDeckInfo(
  systemId: string,
  deckId: string | undefined,
  cardId: string,
  deckInfoData: DeckInfoData,
  afterId?: string
): Promise<ReturnType<typeof getDeckInfoObject> | null> {
  if (!deckId) {
    return Promise.resolve(null);
  }
  if (!deckInfoData.cards[systemId]) {
    deckInfoData.cards[systemId] = {};
    deckInfoData.deckInfo[systemId] = {};
  }
  if (!deckInfoData.cards[systemId][deckId]) {
    deckInfoData.cards[systemId][deckId] = {};
    deckInfoData.deckInfo[systemId][deckId] = {};
  }
  if (!deckInfoData.cards[systemId][deckId][afterId ?? ""]) {
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
    deckInfoData.cards[systemId][deckId][afterId ?? ""] = query.limit(70).get();
  }
  return deckInfoData.cards[systemId][deckId][afterId ?? ""].then((snap) => {
    if (snap.docs.find((v) => v.id === cardId)) {
      if (!deckInfoData.deckInfo[systemId][deckId][afterId ?? ""]) {
        deckInfoData.deckInfo[systemId][deckId][
          afterId ?? ""
        ] = getDeckInfoObject(snap);
      }
      return deckInfoData.deckInfo[systemId][deckId][afterId ?? ""];
    }
    if (snap.docs.length) {
      return Promise.resolve(
        snap.docs.length >= 70
          ? getCardDeckInfo(
              systemId,
              deckId,
              cardId,
              deckInfoData,
              snap.docs[snap.docs.length - 1].id
            )
          : null
      );
    } else {
      return null;
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
  const deckInfoData: DeckInfoData = { deckInfo: {}, cards: {} };
  const additionalCards = Promise.all([
    data.deckOneSubstitutions
      ? Promise.all(
          Object.values(data.deckOneSubstitutions).map((v) =>
            Promise.all([
              ...v,
              getCardDeckInfo(data.systemId!, v[0], v[1], deckInfoData),
            ])
          )
        )
      : Promise.resolve([]),
    data.deckTwoSubstitutions
      ? Promise.all(
          Object.values(data.deckTwoSubstitutions).map((v) =>
            Promise.all([
              ...v,
              getCardDeckInfo(data.systemId!, v[0], v[1], deckInfoData),
            ])
          )
        )
      : Promise.resolve([]),
    data.deckThreeSubstitutions
      ? Promise.all(
          Object.values(data.deckThreeSubstitutions).map((v) =>
            Promise.all([
              ...v,
              getCardDeckInfo(data.systemId!, v[0], v[1], deckInfoData),
            ])
          )
        )
      : Promise.resolve([]),
  ]);
  return Promise.all([
    wikiCharacter,
    deck,
    checkboxes,
    roles,
    cards,
    additionalCards,
    getMarkupData(
      data.systemId!,
      data.deckId!,
      data.characterId!,
      -1,
      !!data.dark
    ),
  ] as const)
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
      ] as const);
    })
    .then(
      ([
        wikiCharacter,
        deck,
        checkboxes,
        roles,
        cards,
        additionalCards,
        baseMarkupData,
        rolesMarkupData,
      ]) => ({
        wikiCharacter: wikiCharacter && {
          name: wikiCharacter.name,
          description: wikiCharacter.description,
          image: wikiCharacter.image,
        },
        deck: deck && {
          name: deck.name,
        },
        checkboxes,
        roles,
        cards,
        deckOneSubstitutions: data.deckOneSubstitutions,
        deckTwoSubstitutions: data.deckTwoSubstitutions,
        deckThreeSubstitutions: data.deckThreeSubstitutions,
        characterData: data && {
          systemId: data.systemId,
          deckId: data.deckId,
          characterId: data.characterId,
          baseHash: getHash(markupDataToJson(baseMarkupData)),
          roleHashes: rolesMarkupData.map((v) => getHash(markupDataToJson(v))),
        },
        additionalCards: additionalCards.reduce(
          (acc, v) =>
            v.reduce((acc, [deckId, cardId, deckInfo]) => {
              if (deckInfo) {
                if (!acc[deckId]) {
                  acc[deckId] = {};
                }
                const index = deckInfo.info.findIndex((v) => v.id === cardId);
                acc[deckId][cardId] = {
                  width: deckInfo.width,
                  height: deckInfo.height,
                  count: deckInfo.count,
                  index,
                  hash: deckInfo.hash,
                  info: deckInfo.info[index],
                };
              }
              return acc;
            }, acc),
          {} as {
            [key: string]: {
              [key: string]: {
                width: number;
                height: number;
                count: number;
                index: number;
                hash: string;
                info: ReturnType<typeof getDeckInfoObject>["info"][0];
              };
            };
          }
        ),
      })
    );
}

export const getTTSDeck = functions
  .runWith({
    memory: "512MB",
  })
  .https.onRequest((request, response) => {
    const splitPath = request.path.split("/");
    firestore
      .collection("account_characters")
      .doc(splitPath[splitPath.length - 1])
      .get()
      .then((doc: any) => {
        if (!(doc && doc.exists)) {
          return response
            .status(404)
            .send({ error: "Unable to find the deck" });
        }
        return addMetadata(doc.data()).then((v) => {
          console.log(process.memoryUsage());
          return response.status(200).send(v);
        });
      })
      .catch((err: any) => {
        console.error(err.stack);
        return response
          .status(404)
          .send({ error: "Unable to retrieve the deck" });
      });
  });

export const getTTSDeckByOrgPlayId = functions
  .runWith({
    memory: "512MB",
  })
  .https.onRequest((request, response) => {
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
        console.error(err.stack);
        return response
          .status(404)
          .send({ error: "Unable to retrieve the deck" });
      });
  });
