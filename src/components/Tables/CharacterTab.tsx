import {
  PlayerCharacter,
  useAccountCharacter,
} from "../../firestore/characters";
import { useCharacter } from "../../firestore/wiki/character";
import { Tab } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import React from "react";

export function CharacterTab({
  tableId,
  subPath,
  characterId,
}: {
  tableId: string;
  subPath: string;
  characterId: string;
}) {
  const [pcRecord] = useAccountCharacter(characterId);
  const pcData = pcRecord?.data();
  const [characterRecord] = useCharacter(
    pcData?.systemId || "",
    pcData?.deckId || "",
    pcData?.characterId || ""
  );
  const characterData = characterRecord?.data();
  return (
    <Tab
      component={RouterLink}
      to={`/tables/${tableId}/${subPath}/${characterId}`}
      label={characterData?.name}
    />
  );
}
