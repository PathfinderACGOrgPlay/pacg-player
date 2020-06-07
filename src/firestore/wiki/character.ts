import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db } from "../../firebase";
import { firestore } from "firebase/app";
import { useCallback, useState } from "react";
import { PlayerCharacter } from "../characters";

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

interface Skill {
  die: string;
  order: number;
  feats: number;
  skills: { [key: string]: number };
}

export interface Powers {
  powers: { optional: boolean; texts: string[] }[];
  handSize: {
    base: number;
    add: number;
  };
  proficiencies: {
    name: string;
    optional: boolean;
  }[];
}

export interface Character {
  name: string;
  removed: boolean;
  image: string;
  traits: string[];
  skills: { [key: string]: Skill };
  base: Powers;
  roles: (Powers & { name: string })[];
  cardsList: {
    [key: string]: {
      base: number;
      add: number;
    };
  };
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
