import { PlayerCharacter } from "../../firestore/characters";
import { useCharacter } from "../../firestore/wiki/character";
import { Tab } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import React from "react";

export function CharacterTab({
  id,
  data,
}: {
  id: string;
  data: PlayerCharacter | undefined;
}) {
  const [characterRecord] = useCharacter(
    data?.systemId || "",
    data?.deckId || "",
    data?.characterId || ""
  );
  const characterData = characterRecord?.data();
  return (
    <Tab
      component={RouterLink}
      to={`/tables/${id}/chronicles/${id}`}
      value={id}
      label={characterData?.name}
    />
  );
}
