import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../firebase";
import { firestore } from "firebase/app";
import { useCallback, useState } from "react";

const collectionGroup = (systemId: string) =>
  db?.collectionGroup("wiki_character");
const collection = (systemId: string, deckId: string) =>
  systemId && deckId
    ? db
        ?.collection("wiki")
        .doc(systemId)
        .collection("deck")
        .doc(deckId)
        .collection("wiki_character")
    : undefined;

export interface Character {
  name: string;
  removed: boolean;
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
