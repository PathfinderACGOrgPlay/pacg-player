import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db, useUser } from "../firebase";
import { firestore } from "firebase/app";
import { useCallback, useState } from "react";

export interface Table {
  name: string;
  managers: string[];
  players: string[];
}

export function useManagedTables() {
  const user = useUser();

  return useCollection(
    db.collection("tables").where("managers", "array-contains", user.uid)
  ) as [firestore.QuerySnapshot<Table> | undefined, boolean, Error | undefined];
}

export function usePlayingTables() {
  const user = useUser();

  return useCollection(
    db.collection("tables").where("players", "array-contains", user.uid)
  ) as [firestore.QuerySnapshot<Table> | undefined, boolean, Error | undefined];
}

export function useTable(id: string) {
  return useDocument(db.collection("tables").doc(id)) as [
    firestore.DocumentSnapshot<Table> | undefined,
    boolean,
    Error | undefined
  ];
}

export function useCreateTable() {
  const user = useUser();

  return useCallback(
    () =>
      db.collection("tables").add({
        name: "New Table",
        managers: [user.uid],
      }),
    [user]
  );
}

export function useUpdateTable(
  id: string
): [(table: Table) => Promise<void>, Error | undefined] {
  const [updateError, setUpdateError] = useState<Error | undefined>();

  return [
    useCallback(
      (table: Table) =>
        db?.collection("tables").doc(id).set(table).catch(setUpdateError),
      [id]
    ),
    updateError,
  ];
}
