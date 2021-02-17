import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db } from "../../firebase";
import firebase from "firebase/app";
import { useCallback, useState } from "react";

const collection = () => db?.collection("wiki");

export interface CardSystem {
  name: string;
  logo?: string;
  cardTypes?: string[];
  traits?: string[];
  removed: boolean;
}

export function useCardSystems(deleted?: boolean) {
  return useCollection(
    (deleted
      ? collection()
      : collection()?.where("removed", "==", false)
    )?.orderBy("name")
  ) as [
    firebase.firestore.QuerySnapshot<CardSystem> | undefined,
    boolean,
    Error | undefined
  ];
}

export function useCardSystem(systemId: string) {
  return useDocument(systemId ? collection()?.doc(systemId) : null) as [
    firebase.firestore.DocumentSnapshot<CardSystem> | undefined,
    boolean,
    Error | undefined
  ];
}

export function useCreateCardSystem() {
  return useCallback(
    () =>
      collection()?.add({
        name: "New Card System",
        removed: false,
      }),
    []
  );
}

export function useUpdateCardSystem(
  id: string
): [(sys: CardSystem) => Promise<void>, Error | undefined] {
  const [updateError, setUpdateError] = useState<Error | undefined>();

  return [
    useCallback(
      (sys: CardSystem) => collection()?.doc(id).set(sys).catch(setUpdateError),
      [id]
    ),
    updateError,
  ];
}
