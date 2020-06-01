import React, { Fragment } from "react";
import {
  Container,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import { RouteComponentProps } from "react-router";
import {
  Card,
  PlayerCharacter,
  useAccountCharacter,
  useUpdateAccountCharacter,
} from "../../firestore/characters";
import classDecks from "../../oldData/classDecks.json";

const useStyles = makeStyles((theme) => ({
  fill: {
    width: "100%",
  },
  center: {
    textAlign: "center",
  },
}));

function CardList({
  deck,
  updateDeck,
  number,
  cards,
  updateCards,
}: {
  deck: string;
  updateDeck(value: string): void;
  number: number;
  cards: Card[];
  updateCards(cards: Card[]): void;
}) {
  const styles = useStyles();

  function update<K extends keyof Card>(
    index: number,
    field: K,
    value: Card[K]
  ) {
    cards = [...cards];
    cards[index] = cards[index]
      ? { ...cards[index] }
      : {
          deck: "",
          card: "",
        };

    cards[index][field] = value;
    if (cards[index].deck === "") {
      cards.splice(index, 1);
    }
    updateCards(cards);
  }

  const deckList = classDecks[deck as keyof typeof classDecks];
  const adventures = deckList
    ? Object.keys(deckList)
        .sort((a, b) => {
          if (a === "Adventure B") {
            return -1;
          }
          if (b === "Adventure B") {
            return 1;
          }
          if (a === "Level 0") {
            return -1;
          }
          if (b === "Level 0") {
            return 1;
          }
          if (a.startsWith("Adventure")) {
            a = a.replace("Adventure", "`````");
          }
          if (a.startsWith("Level")) {
            a = a.replace("Level", "`````");
          }
          if (b.startsWith("Adventure")) {
            b = b.replace("Adventure", "`````");
          }
          if (b.startsWith("Level")) {
            b = b.replace("Level", "`````");
          }
          return a.localeCompare(b);
        })
        .map((v) => (
          <MenuItem value={v} key={v}>
            {v}
          </MenuItem>
        ))
    : [];

  cards = deckList ? [...cards, { deck: "", card: "" }] : cards;

  return (
    <FormControl className={styles.fill}>
      <InputLabel id={`deck-${number}-label`}>Deck {number}</InputLabel>
      <Select
        labelId={`deck-${number}-label`}
        id={`deck-${number}-select`}
        value={deck}
        onChange={(e) => updateDeck(e.currentTarget.value as string)}
      >
        <MenuItem value="">&nbsp;</MenuItem>
        {Object.keys(classDecks)
          .sort()
          .map((v) => (
            <MenuItem value={v} key={v}>
              {v}
            </MenuItem>
          ))}
      </Select>
      <br />
      <Grid container spacing={3}>
        <Grid item lg={6}>
          <Typography className={styles.center}>Adventure / Level</Typography>
        </Grid>
        <Grid item lg={6}>
          <Typography className={styles.center}>Card</Typography>
        </Grid>
        {cards.map((v, i) => (
          <Fragment key={i}>
            <Grid item lg={6}>
              <Typography className={styles.center}>
                <Select
                  id={`deck-${number}-card-${i}-select`}
                  className={styles.fill}
                >
                  <MenuItem value="">&nbsp;</MenuItem>
                  {adventures}
                </Select>
              </Typography>
            </Grid>
            <Grid item lg={6}>
              <Typography className={styles.center}>Card</Typography>
            </Grid>
          </Fragment>
        ))}
      </Grid>
    </FormControl>
  );
}

export function Cards({
  match: {
    params: { id },
  },
}: RouteComponentProps<{ id: string }>) {
  const [character] = useAccountCharacter(id);
  const data = character?.data();
  const [updateAccountCharacter, updateError] = useUpdateAccountCharacter(id);

  function update(values: Partial<PlayerCharacter>) {
    let oldValues = character?.data();
    if (oldValues) {
      updateAccountCharacter({
        ...oldValues,
        ...values,
      });
    }
  }

  return (
    <Grid container spacing={3}>
      {updateError ? (
        <Grid item lg={12}>
          {updateError}
        </Grid>
      ) : null}
      <Grid item lg={4}>
        <CardList
          deck={data?.deckOne || ""}
          updateDeck={(deckOne) => update({ deckOne })}
          cards={data?.cardsOne || []}
          updateCards={(cardsOne) => update({ cardsOne })}
          number={1}
        />
      </Grid>
      <Grid item lg={4}>
        <CardList
          deck={data?.deckTwo || ""}
          updateDeck={(deckTwo) => update({ deckTwo })}
          cards={data?.cardsTwo || []}
          updateCards={(cardsTwo) => update({ cardsTwo })}
          number={2}
        />
      </Grid>
      <Grid item lg={4}>
        <CardList
          deck={data?.deckThree || ""}
          updateDeck={(deckThree) => update({ deckThree })}
          cards={data?.cardsThree || []}
          updateCards={(cardsThree) => update({ cardsThree })}
          number={3}
        />
      </Grid>
    </Grid>
  );
}
