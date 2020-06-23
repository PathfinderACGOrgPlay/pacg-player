import { CharacterSheet } from "../../Common/CharacterSheet";
import React from "react";
import { RouteComponentProps } from "react-router";
import { Container } from "@material-ui/core";

export function Character({
  match: {
    params: { systemId, deckId, id },
  },
}: RouteComponentProps<{ systemId: string; deckId: string; id: string }>) {
  return (
    <Container>
      <CharacterSheet
        wikiMode
        systemId={systemId}
        deckId={deckId}
        characterId={id}
      />
    </Container>
  );
}
