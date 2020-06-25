import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db } from "../../firebase";
import { firestore } from "firebase/app";
import { useCallback, useState } from "react";

const collectionGroup = (systemId: string) =>
  db?.collectionGroup("wiki_character").where("systemId", "==", systemId);
const collection = (systemId: string, deckId: string) =>
  systemId && deckId
    ? db
        ?.collection("wiki")
        .doc(systemId)
        .collection("deck")
        .doc(deckId)
        .collection("wiki_character")
    : undefined;

export interface Skill {
  die: string;
  order?: number;
  feats: number;
  skills: { [key: string]: number };
}

export interface OldPower {
  optional: boolean;
  texts: string[];
}

export interface PowerText {
  optional: boolean;
  text: string;
  id: string;
}

export interface Power {
  texts: PowerText[];
  id: string;
}

export interface Powers {
  powers: OldPower[] | Power[];
  handSize: {
    base: number;
    add: number;
  };
  proficiencies: {
    name: string;
    optional: boolean;
  }[];
}

export interface CardListRow {
  base: number;
  add: number;
  order?: number;
}

export interface Character {
  name: string;
  description?: string;
  removed: boolean;
  image: string;
  traits: string[];
  skills: { [key: string]: Skill };
  base: Powers;
  roles: (Powers & { name: string })[];
  cardsList: {
    [key: string]: CardListRow;
  };
  favoredCardType?: string;
  extraCardsText: { [key: string]: string };
}

function randomString(length: number, chars: string) {
  var result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

export function makeId() {
  return randomString(
    5,
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  );
}

function isPowerArr(powers: OldPower[] | Power[]): powers is Power[] {
  return !powers.length || !!(powers[0] as Power).id;
}

export function upConvertPowers(
  powers: OldPower[] | Power[] | undefined
): [Power[] | undefined, boolean] {
  if (!powers || isPowerArr(powers)) {
    return [powers, false];
  } else {
    return [
      powers.map((v) => ({
        id: makeId(),
        texts: v.texts.reduce((acc, w, i) => {
          if (i === 0) {
            acc.push({
              text: w.replace(/\($/, ""),
              optional: v.optional,
              id: makeId(),
            });
          } else {
            const [left, right] = w.split(")");
            acc.push({ text: left, optional: true, id: makeId() });
            if (right) {
              acc.push({
                text: right.replace(/\($/, ""),
                optional: false,
                id: makeId(),
              });
            }
          }
          return acc;
        }, [] as PowerText[]),
      })),
      true,
    ];
  }
}

export function useCharacters(
  systemId: string,
  deckId?: string,
  deleted?: boolean
) {
  const start = deckId
    ? collection(systemId, deckId)
    : collectionGroup(systemId);

  return useCollection(
    (deleted ? start : start?.where("removed", "==", false))?.orderBy("name")
  ) as [
    firestore.QuerySnapshot<Character> | undefined,
    boolean,
    Error | undefined
  ];
}

export function useCreateCharacter(systemId: string, deckId: string) {
  return useCallback(
    () =>
      collection(systemId, deckId)?.add({
        name: "New Character",
        removed: false,
        systemId,
        image: "",
        traits: [],
        skills: {},
        base: {
          powers: [],
          handSize: {
            base: 0,
            add: 0,
          },
          proficiencies: [],
        },
        roles: [],
        cardsList: {},
        extraCardsText: {},
      }),
    [deckId, systemId]
  );
}

export function useUpdateCharacter(
  systemId: string,
  deckId: string,
  id: string
): [(sys: Character) => Promise<void> | undefined, Error | undefined] {
  const [updateError, setUpdateError] = useState<Error | undefined>();

  return [
    useCallback(
      (sys: Character) =>
        collection(systemId, deckId)?.doc(id).set(sys).catch(setUpdateError),
      [deckId, id, systemId]
    ),
    updateError,
  ];
}

export function useCharacter(systemId: string, deckId: string, id: string) {
  return useDocument(id ? collection(systemId, deckId)?.doc(id) : null) as [
    firestore.DocumentSnapshot<Character> | undefined,
    boolean,
    Error | undefined
  ];
}
