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
  fromBase: boolean;
}

export interface Power {
  texts: PowerText[];
  id: string;
  fromBase: boolean;
}

export interface Powers<TPower = OldPower[] | Power[]> {
  powers: TPower;
  handSize: {
    base: number;
    add: number;
  };
  proficiencies:
    | {
        name: string;
        optional: boolean;
      }[]
    | undefined;
}

export interface CardListRow {
  base: number;
  add: number;
  order?: number;
}

export interface Character<TPower = OldPower[] | Power[]> {
  name: string;
  description?: string;
  removed: boolean;
  image: string;
  traits: string[];
  skills: { [key: string]: Skill };
  base: Powers<TPower>;
  roles: (Powers<TPower> & { name: string })[];
  cardsList: {
    [key: string]: CardListRow;
  };
  favoredCardType?: string;
  extraCardsText: { [key: string]: string };
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
