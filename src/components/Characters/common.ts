import { Card, Card as CardType } from "../../firestore/wiki/card";
import firebase from "firebase/app";
import { useMemo } from "react";

export function useAdventureInfo(
  cardList: firebase.firestore.QuerySnapshot<Card> | undefined,
  removeCardIds: string[]
) {
  return useMemo(() => {
    const cardsObjects = cardList?.docs.map((v) => ({
      id: v.id,
      data: v.data(),
    }));
    const adventures =
      cardsObjects &&
      [...new Set(cardsObjects.map((v) => v.data.subDeck || "Other"))].sort(
        (a, b) => {
          if (a === "Adventure B") {
            return -1;
          }
          if (b === "Adventure B") {
            return 1;
          }
          if (a === "Level 0") {
            return -1;
          }
          if (b === "Level 0") {
            return 1;
          }
          if (a.startsWith("Adventure")) {
            a = a.replace("Adventure", "`````");
          }
          if (a.startsWith("Level")) {
            a = a.replace("Level", "`````");
          }
          if (b.startsWith("Adventure")) {
            b = b.replace("Adventure", "`````");
          }
          if (b.startsWith("Level")) {
            b = b.replace("Level", "`````");
          }
          return a.localeCompare(b);
        }
      );
    const cardsByAdventure =
      adventures &&
      new Map(
        adventures.map((v) => [v, [] as { id: string; data: CardType }[]])
      );
    const cardsById = new Map();
    cardsObjects?.forEach((v) => {
      const newCount =
        (v.data.count || 1) - removeCardIds.filter((w) => w === v.id).length;
      if (newCount > 0) {
        cardsByAdventure!
          .get(v.data.subDeck || "Other")!
          .push({ ...v, data: { ...v.data, count: newCount } });
      }
      cardsById.set(v.id, v);
    });

    return { adventures, cardsByAdventure, cardsById };
  }, [cardList, removeCardIds]);
}
