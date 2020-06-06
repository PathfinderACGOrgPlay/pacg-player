import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db } from "../firebase";
import { firestore } from "firebase";
import { getCharacter, PlayerCharacter } from "./characters";
import { useCallback, useState } from "react";

export interface ChronicleSheet {
  uid: string;
  characterId: string;
  table: string;
  scenario: string;
  tier?: string;
  xp?: string;
  date?: firestore.Timestamp;
  eventNumber?: string;
  coordinatorOP?: string;
  reported?: boolean;
  reward?: {
    received: boolean;
    text?: string;
    noneReplayed?: boolean;
    noneFailed?: boolean;
  };
  heroPoint?: {
    skill?: boolean;
    power?: boolean;
    card?: boolean;
    noSpend?: boolean;
    used?: number;
    remaining?: number;
  };
  deckUpgrade?: {
    one?: string;
    two?: string;
    three?: string;
  };
  notes?: string;
}

export function useChronicleSheet(id: string) {
  return useDocument(db.collection("chronicles").doc(id)) as [
    firestore.DocumentSnapshot<PlayerCharacter> | undefined,
    boolean,
    Error | undefined
  ];
}

export function useChronicleSheetsForCharacter(id: string) {
  return useCollection(
    db.collection("chronicles").where("characterId", "==", id)
  ) as [
    firestore.QuerySnapshot<ChronicleSheet> | undefined,
    boolean,
    Error | undefined
  ];
}

export function useChronicleSheetsForTable(id: string) {
  return useCollection(
    db.collection("chronicles").where("table", "==", id)
  ) as [
    firestore.QuerySnapshot<ChronicleSheet> | undefined,
    boolean,
    Error | undefined
  ];
}

export function useCreateChronicleSheet(
  characterId: string,
  table: string = ""
) {
  return useCallback(
    (scenario: string = "") =>
      getCharacter(characterId).then((char) => {
        const charData = char.data();

        if (!charData) {
          throw new Error("Failed to find character");
        }

        const newSheet: ChronicleSheet = {
          uid: charData?.uid,
          characterId,
          table,
          scenario,
        };

        return db.collection("chronicles").add(newSheet);
      }),
    [characterId, table]
  );
}

export function useUpdateChronicleSheet(
  id: string
): [(sheet: ChronicleSheet) => Promise<void>, Error | undefined] {
  const [updateError, setUpdateError] = useState<Error | undefined>();

  return [
    useCallback(
      (sheet: ChronicleSheet) =>
        db?.collection("chronicles").doc(id).set(sheet).catch(setUpdateError),
      [id]
    ),
    updateError,
  ];
}
