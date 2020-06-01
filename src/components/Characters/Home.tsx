import {
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

const useStyles = makeStyles((theme) => ({
  card: {
    cursor: "pointer",
  },
}));

export function Home() {
  const [characters, , error] = useAccountCharacters();
  const styles = useStyles();
  const history = useHistory();
  const createAccountCharacter = useCreateAccountCharacter();
  const [createError, setCreateError] = useState<string | undefined>();

  return (
    <Container>
      <Grid container spacing={3}>
        {error ? <div>Failed to read decks: {error.message}</div> : null}
        {createError ? <div>{createError}</div> : null}
        {characters?.docs.map((v) => {
          const data = v.data();
          return (
            <Grid item lg={6} key={v.id}>
              <Card
                className={styles.card}
                onClick={() => history.push(`/characters/${v.id}`)}
              >
                <CardContent>
                  <Typography variant="h4" component="h2">
                    {data.name}
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {data.characterDeck}
                    {data.character ? <> - {data.character}</> : null}
                  </Typography>
                  <Typography variant="h6" component="h2">
                    {data.deckOne}
                    {data.deckTwo ? <> - {data.deckTwo}</> : null}
                    {data.deckThree ? <> - {data.deckThree}</> : null}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
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
