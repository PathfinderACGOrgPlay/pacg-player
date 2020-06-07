import { CharacterSheet } from "../../Characters/Sheet/CharacterSheet";
import React from "react";
import { PlayerCharacter } from "../../../firestore/characters";
import { RouteComponentProps } from "react-router";
import { Container } from "@material-ui/core";

const dummyPc: PlayerCharacter = {
  uid: "",
  name: "",
};

export function Character({
  match: {
    params: { systemId, deckId, id },
  },
}: RouteComponentProps<{ systemId: string; deckId: string; id: string }>) {
  return (
    <Container>
      <CharacterSheet
        data={{ ...dummyPc, systemId, deckId, characterId: id }}
        disabled
        update={() => {}}
      />
    </Container>
  );
}
