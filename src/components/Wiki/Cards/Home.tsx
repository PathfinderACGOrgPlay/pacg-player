import React, { useState } from "react";
import {
  Container,
  Grid,
  Link,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  CardMedia,
} from "@material-ui/core";
import { SystemDropdown } from "../Common/SystemDropdown";
import { Link as RouterLink, useHistory } from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import { DeckDropdown } from "../Common/DeckDropdown";
import { CharacterDropdown } from "../Common/CharacterDropdown";
import { Character, useCharacters } from "../../../firestore/wiki/character";
import { ErrorDisplay } from "../../Common/ErrorDisplay";
import { useDeck, useDecks } from "../../../firestore/wiki/deck";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  image: {
    float: "left",
    width: 100,
    height: 96,
    backgroundSize: "contain",
    marginTop: theme.spacing(1),
  },
  card: {
    cursor: "pointer",
  },
}));

export function Home() {
  const [systemId, setSystemId] = useState("");
  const [decks, loading, error] = useDecks(systemId);

  return (
    <Container>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <SystemDropdown fullWidth value={systemId} setValue={setSystemId} />
        </Grid>
        <Grid item xs={8} />
        <Grid item xs={1}>
          <Link component={RouterLink} to="/wiki/cards/edit">
            <EditIcon />
          </Link>
        </Grid>
      </Grid>
      <br />
      {loading ? <CircularProgress /> : null}
      <ErrorDisplay label="Failed to load decks" error={error} />
      <Grid container spacing={3}>
        {decks?.docs.map((v) => (
          <Grid item xs={6}>
            <Link component={RouterLink} to={`/wiki/cards/${systemId}/${v.id}`}>
              {v.data().name}
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
