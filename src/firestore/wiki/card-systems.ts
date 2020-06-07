import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db, useUser } from "../../firebase";
import { firestore } from "firebase/app";
import { useCallback, useEffect, useState } from "react";

const collection = () => db?.collection("wiki");

export interface CardSystem {
  name: string;
  removed: boolean;
}

export function useCardSystems(deleted?: boolean) {
  return useCollection(
    (deleted
      ? collection()
      : collection()?.where("removed", "==", false)
    )?.orderBy("name")
  ) as [
    firestore.QuerySnapshot<CardSystem> | undefined,
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
