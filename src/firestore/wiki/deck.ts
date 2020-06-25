import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db } from "../../firebase";
import { firestore } from "firebase/app";
import { useCallback, useState } from "react";

const collection = (systemId: string) =>
  systemId
    ? db?.collection("wiki").doc(systemId).collection("deck")
    : undefined;

export interface Deck {
  name: string;
  logo?: string;
  subDecks: string[];
  removed: boolean;
}

export function useDecks(systemId: string, deleted?: boolean) {
  return useCollection(
    (deleted
      ? collection(systemId)
      : collection(systemId)?.where("removed", "==", false)
    )?.orderBy("name")
  ) as [firestore.QuerySnapshot<Deck> | undefined, boolean, Error | undefined];
}

export function useCreateDeck(systemId: string) {
  return useCallback(
    () =>
      collection(systemId)?.add({
        name: "New Deck",
        removed: false,
      }),
    [systemId]
  );
}

export function useUpdateDeck(
  systemId: string,
  id: string
): [(sys: Deck) => Promise<void> | undefined, Error | undefined] {
  const [updateError, setUpdateError] = useState<Error | undefined>();

  return [
    useCallback(
      (sys: Deck) =>
        collection(systemId)?.doc(id).set(sys).catch(setUpdateError),
      [id, systemId]
    ),
    updateError,
  ];
}

export function useDeck(systemId: string, id: string) {
  return useDocument(id ? collection(systemId)?.doc(id) : null) as [
    firestore.DocumentSnapshot<Deck> | undefined,
    boolean,
    Error | undefined
  ];
}
