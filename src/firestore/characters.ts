import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db, useUser } from "../firebase";
import { firestore } from "firebase";
import { useCallback } from "react";

export interface Card {
  deck: string;
  card: string;
}

export interface PlayerCharacter {
  id: string;
  uid: string;
  name: string;
  orgPlayId: string;
  deckOne: string;
  deckOneSubstitutions?: {
    [adventure: string]: { [cards: string]: [string, string] };
  };
  cardsOne: Card[];
  deckTwo: string;
  deckTwoSubstitutions?: {
    [adventure: string]: { [cards: string]: [string, string] };
  };
  cardsTwo: Card[];
  deckThree: string;
  deckThreeSubstitutions?: {
    [adventure: string]: { [cards: string]: [string, string] };
  };
  cardsThree: Card[];
  character: string;
  characterDeck: string;
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
}

export function useAccountCharacters() {
  const user = useUser();

  return useCollection(
    db.collection("player_decks").where("uid", "==", user.uid)
  ) as [
    firestore.QuerySnapshot<PlayerCharacter> | undefined,
    boolean,
    Error | undefined
  ];
}

export function useAccountCharacter(id: string) {
  return useDocument(db.collection("player_decks").doc(id)) as [
    firestore.DocumentSnapshot<PlayerCharacter> | undefined,
    boolean,
    Error | undefined
  ];
}

export function useCreateAccountCharacter() {
  const user = useUser();

  return useCallback(
    () =>
      db.collection("player_decks").add({
        uid: user.uid,
        name: "New Deck",
      }),
    [user]
  );
}
