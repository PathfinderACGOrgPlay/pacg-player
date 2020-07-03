import React from "react";
import {
  useCharacter,
  useUpdateCharacter,
} from "../../../firestore/wiki/character";
import { useCardSystem } from "../../../firestore/wiki/card-systems";
import { useDeck } from "../../../firestore/wiki/deck";
import { CharacterSheetRenderer } from "./SharedWithFunctions/CharacterSheetRenderer";
import { UploadField } from "../UploadField";
import { Container } from "@material-ui/core";

export function CharacterSheet({
  wikiMode,
  allowCharacterEdit,
  systemId,
  deckId,
  characterId,
}: {
  wikiMode?: boolean;
  allowCharacterEdit?: boolean;
  systemId: string;
  deckId: string;
  characterId: string;
}) {
  const [system, , systemError] = useCardSystem(systemId);
  const systemData = system?.data();
  const [deck, , deckError] = useDeck(systemId, deckId);
  const deckData = deck?.data();
  const [character, loading, error] = useCharacter(
    systemId,
    deckId,
    characterId
  );
  const characterRawData = character?.data();

  const [updateCharacter, updateError] = useUpdateCharacter(
    systemId,
    deckId,
    characterId
  );

  return (
    <Container>
      <br />
      <CharacterSheetRenderer
        wikiMode={wikiMode}
        allowCharacterEdit={allowCharacterEdit}
        characterRawData={characterRawData}
        deckData={deckData}
        systemData={systemData}
        loading={loading}
        error={error}
        deckError={deckError}
        systemError={systemError}
        updateCharacter={updateCharacter}
        updateError={updateError}
        UploadField={UploadField}
      />
    </Container>
  );
}
