import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db, useUser } from "../firebase";
import { firestore } from "firebase/app";
import { useCallback, useState } from "react";
import { getCharacterList, PlayerCharacter } from "./characters";

export interface Table {
  name: string;
  managers: string[];
  players: string[];
  characters: string[];
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
        players: [],
        characters: [],
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

function distinct<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index;
}

function addCharacter(
  table: Table,
  characterId: string,
  character: PlayerCharacter
): Table {
  return {
    ...table,
    players: table.players.concat([character.uid]).filter(distinct),
    characters: table.characters.concat([characterId]).filter(distinct),
  };
}

export function useAddTableCharacterByOrgPlayId(
  id: string
): [(id: string) => Promise<void>, Error | undefined] {
  const [updateError, setUpdateError] = useState<Error | undefined>();

  return [
    useCallback(
      (charId: string) =>
        Promise.all([
          db?.collection("tables").doc(id).get(),
          db
            ?.collection("account_characters")
            .where("orgPlayId", "==", charId)
            .get(),
        ])
          .then(([table, characters]) => {
            if (!characters.docs.length) {
              throw new Error("Character Not Found!");
            }
            if (characters.docs.length > 1) {
              throw new Error("Multiple Characters Found!");
            }
            return db
              ?.collection("tables")
              .doc(id)
              .set(
                addCharacter(
                  table.data() as Table,
                  characters.docs[0].id,
                  characters.docs[0].data() as PlayerCharacter
                )
              );
          })
          .catch(setUpdateError),
      [id]
    ),
    updateError,
  ];
}

export function useRemoveTableCharacterByDeckId(
  id: string
): [(id: string) => Promise<void>, Error | undefined] {
  const [updateError, setUpdateError] = useState<Error | undefined>();

  return [
    useCallback(
      (charId: string) =>
        db
          .collection("tables")
          .doc(id)
          .get()
          .then((v) => {
            return Promise.all([
              v,
              getCharacterList(
                (v as firestore.DocumentSnapshot<Table>).data()?.characters ||
                  []
              ),
            ]);
          })
          .then(([table, characters]) => {
            const charPlayer = characters.find((v) => v.id === charId)?.data()
              ?.uid;
            if (!charPlayer) {
              throw new Error("Character Not Found!");
            }
            let players = table.data()?.players || ([] as string[]);
            if (
              !characters.find(
                (v) => v.data()?.uid === charPlayer && v.id !== charId
              )
            ) {
              players = players.filter((v: string) => v !== charPlayer);
            }
            return db
              ?.collection("tables")
              .doc(id)
              .set({
                ...table.data(),
                characters: characters
                  .map((v) => v.id)
                  .filter((v) => v !== charId),
                players,
              });
          })
          .catch(setUpdateError),
      [id]
    ),
    updateError,
  ];
}

export function useAddTableCharacterByDeckId(
  id: string
): [(id: string) => Promise<void>, Error | undefined] {
  const [updateError, setUpdateError] = useState<Error | undefined>();

  return [
    useCallback(
      (charId: string) =>
        Promise.all([
          db?.collection("tables").doc(id).get(),
          db?.collection("account_characters").doc(charId).get(),
        ])
          .then(([table, character]) => {
            if (!character) {
              throw new Error("Character Not Found!");
            }
            return db
              ?.collection("tables")
              .doc(id)
              .set(
                addCharacter(
                  table.data() as Table,
                  charId,
                  character.data() as PlayerCharacter
                )
              );
          })
          .catch(setUpdateError),
      [id]
    ),
    updateError,
  ];
}
