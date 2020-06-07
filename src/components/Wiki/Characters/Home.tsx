import React, { useState } from "react";
import { Container, Grid, Link } from "@material-ui/core";
import { SystemDropdown } from "../Common/SystemDropdown";
import { Link as RouterLink } from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import { DeckDropdown } from "../Common/DeckDropdown";
import { CharacterDropdown } from "../Common/CharacterDropdown";

export function Home() {
  const [systemId, setSystemId] = useState("");
  const [deckId, setDeckId] = useState("");
  const [characterId, setCharacterId] = useState("");

  return (
    <Container>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <SystemDropdown fullWidth value={systemId} setValue={setSystemId} />
        </Grid>
        <Grid item xs={3}>
          <DeckDropdown
            systemId={systemId}
            fullWidth
            value={deckId}
            setValue={setDeckId}
          />
        </Grid>
        <Grid item xs={3}>
          <CharacterDropdown
            systemId={systemId}
            deckId={deckId}
            fullWidth
            value={characterId}
            setValue={setCharacterId}
          />
        </Grid>
        <Grid item xs={2} />
        <Grid item xs={1}>
          <Link component={RouterLink} to="/wiki/characters/edit">
            <EditIcon />
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
}
