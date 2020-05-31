import React from "react";
import { Container } from "@material-ui/core";
import { RouteComponentProps } from "react-router";
import { useAccountCharacter } from "../../firestore/characters";

export function Character({
  match: {
    params: { id },
  },
}: RouteComponentProps<{ id: string }>) {
  const [character] = useAccountCharacter(id);

  return <Container>{JSON.stringify(character?.data())}</Container>;
}
