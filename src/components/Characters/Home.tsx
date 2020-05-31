import { useAccountCharacters } from "../../firestore/characters";
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  makeStyles,
  Container,
  Grid,
  Link,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  card: {
    cursor: "pointer",
  },
}));

export function Home() {
  const [characters, _, error] = useAccountCharacters();
  const styles = useStyles();
  const history = useHistory();

  return (
    <Container>
      <Grid container spacing={3}>
        {error ? <div>Failed to read decks: {error.message}</div> : null}
        {characters?.docs.map((v) => (
          <Grid item lg={6} key={v.id}>
            <Card
              className={styles.card}
              onClick={() => history.push(`/characters/${v.id}`)}
            >
              <CardContent>
                <Typography variant="h4" component="h2">
                  {v.data().name}
                </Typography>
                <Typography variant="h5" component="h2">
                  {v.data().characterDeck} - {v.data().character}
                </Typography>
                <Typography variant="h6" component="h2">
                  {v.data().deckOne}
                  {v.data().deckTwo ? <> - {v.data().deckTwo}</> : null}
                  {v.data().deckThree ? <> - {v.data().deckThree}</> : null}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
