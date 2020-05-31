import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { useUser } from "../firebase";
import firebase from "firebase";

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
    firebase.firestore().collection("player_decks").where("uid", "==", user.uid)
  ) as [
    firebase.firestore.QuerySnapshot<PlayerCharacter> | undefined,
    boolean,
    Error | undefined
  ];
}

export function useAccountCharacter(id: string) {
  return useDocument(
    firebase.firestore().collection("player_decks").doc(id)
  ) as [
    firebase.firestore.DocumentSnapshot<PlayerCharacter> | undefined,
    boolean,
    Error | undefined
  ];
}
