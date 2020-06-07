import {
  PlayerCharacter,
  useAccountCharacters,
  useCreateAccountCharacter,
} from "../../firestore/characters";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  makeStyles,
  Container,
  Grid,
  Button,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useDeck } from "../../firestore/wiki/deck";
import { ErrorDisplay } from "../Common/ErrorDisplay";
import { useCharacter } from "../../firestore/wiki/character";

const useStyles = makeStyles((theme) => ({
  card: {
    cursor: "pointer",
  },
}));

function CharacterDisplay({
  id,
  character,
}: {
  id: string;
  character: PlayerCharacter;
}) {
  const [deck, , deckError] = useDeck(
    character.systemId || "",
    character.deckId || ""
  );
  const [char, , charError] = useCharacter(
    character.systemId || "",
    character.deckId || "",
    character.characterId || ""
  );
  const styles = useStyles();
  const history = useHistory();

  return (
    <Grid item lg={6}>
      <ErrorDisplay label="Failed to load deck" error={deckError} />
      <ErrorDisplay label="Failed to load character" error={charError} />
      <Card
        className={styles.card}
        onClick={() => history.push(`/characters/${id}`)}
      >
        <CardContent>
          <Typography variant="h4" component="h2">
            {character.name}
          </Typography>
          <Typography variant="h5" component="h2">
            {deck?.data()?.name}
            {char?.data()?.name ? <> - {char?.data()?.name}</> : null}
          </Typography>
          <Typography variant="h6" component="h2">
            {character.deckOne}
            {character.deckTwo ? <> - {character.deckTwo}</> : null}
            {character.deckThree ? <> - {character.deckThree}</> : null}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

export function Home() {
  const [characters, , error] = useAccountCharacters();
  const createAccountCharacter = useCreateAccountCharacter();
  const [createError, setCreateError] = useState<string | undefined>();

  return (
    <Container>
      <Grid container spacing={3}>
        {error ? <div>Failed to read decks: {error.message}</div> : null}
        {createError ? <div>{createError}</div> : null}
        {characters?.docs.map((v) => (
          <CharacterDisplay key={v.id} id={v.id} character={v.data()} />
        ))}
        <Grid item lg={12}>
          <Button
            onClick={() => {
              createAccountCharacter().catch(function (error) {
                console.error("Error creating deck: ", error);
                setCreateError("Error creating deck: " + error.message);
              });
            }}
          >
            Create Character
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
