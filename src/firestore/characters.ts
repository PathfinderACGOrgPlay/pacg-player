import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db, useUser } from "../firebase";
import { firestore } from "firebase/app";
import { useCallback, useEffect, useState } from "react";

export interface Card {
  deck: string;
  card: string;
}

export interface PlayerCharacter {
  uid: string;
  name: string;
  systemId?: string;
  deckId?: string;
  characterId?: string;
  orgPlayId?: string;
  deckOne?: string;
  deckOneSubstitutions?: {
    [adventure: string]: { [cards: string]: [string, string] };
  };
  cardsOne?: Card[];
  deckTwo?: string;
  deckTwoSubstitutions?: {
    [adventure: string]: { [cards: string]: [string, string] };
  };
  cardsTwo?: Card[];
  deckThree?: string;
  deckThreeSubstitutions?: {
    [adventure: string]: { [cards: string]: [string, string] };
  };
  cardsThree?: Card[];
  Strength?: boolean[];
  Dexterity?: boolean[];
  Constitution?: boolean[];
  Intelligence?: boolean[];
  Wisdom?: boolean[];
  Charisma?: boolean[];
  handSize?: boolean[];
  proficiencies?: { [label: string]: boolean };
  powers?: boolean[][];
  role?: number;
  deckList?: { [type: string]: boolean[] };
  roleHandSize?: boolean[];
  roleProficiencies?: { [label: string]: boolean };
  rolePowers?: boolean[][];
  chronicleOrder?: string[];
}

export function useAccountCharacters() {
  const user = useUser();

  return useCollection(
    db.collection("account_characters").where("uid", "==", user.uid)
  ) as [
    firestore.QuerySnapshot<PlayerCharacter> | undefined,
    boolean,
    Error | undefined
  ];
}

export function getCharacter(id: string) {
  return db.collection("account_characters").doc(id).get() as Promise<
    firestore.DocumentSnapshot<PlayerCharacter>
  >;
}

export function useAccountCharacter(id: string) {
  return useDocument(
    id ? db.collection("account_characters").doc(id) : null
  ) as [
    firestore.DocumentSnapshot<PlayerCharacter> | undefined,
    boolean,
    Error | undefined
  ];
}

export function getCharacterList(ids: string[]) {
  return Promise.all(ids.map((v) => getCharacter(v)));
}

export function useAccountCharacterList(
  ids: string[]
): [
  firestore.DocumentSnapshot<PlayerCharacter>[] | undefined,
  boolean,
  Error | undefined
] {
  const [documents, setDocuments] = useState<
    firestore.DocumentSnapshot<PlayerCharacter>[] | undefined
  >(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    getCharacterList(ids)
      .then((docs) => {
        setError(undefined);
        setDocuments(docs);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setDocuments(undefined);
        setLoading(false);
      });
  }, [ids]);

  return [documents, loading, error];
}

export function useCreateAccountCharacter() {
  const user = useUser();

  return useCallback(
    () =>
      db.collection("account_characters").add({
        uid: user.uid,
        name: "New Deck",
      }),
    [user]
  );
}

export function useUpdateAccountCharacter(
  id: string
): [(char: PlayerCharacter) => Promise<void>, Error | undefined] {
  const [updateError, setUpdateError] = useState<Error | undefined>();

  return [
    useCallback(
      (char: PlayerCharacter) =>
        db
          ?.collection("account_characters")
          .doc(id)
          .set(char)
          .catch(setUpdateError),
      [id]
    ),
    updateError,
  ];
}

export function useDeleteAccountCharacter(
  id: string
): [() => Promise<void>, Error | undefined] {
  const [deleteError, setDeleteError] = useState<Error | undefined>();

  return [
    useCallback(
      () =>
        db
          ?.collection("account_characters")
          .doc(id)
          .delete()
          .catch(setDeleteError),
      [id]
    ),
    deleteError,
  ];
}
