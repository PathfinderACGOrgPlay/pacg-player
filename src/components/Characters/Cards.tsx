import React, { Fragment, ReactElement } from "react";
import {
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
import { useUser } from "../../firebase";

const useStyles = makeStyles((theme) => ({
  fill: {
    width: "100%",
  },
  center: {
    textAlign: "center",
  },
}));

function CardList({
  disabled,
  deck,
  updateDeck,
  number,
  cards,
  updateCards,
}: {
  disabled: boolean;
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

  const deckList = classDecks[deck as keyof typeof classDecks]?.Decks;
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
  const cardLists =
    deckList &&
    Object.keys(deckList).reduce((acc, v) => {
      // @ts-ignore
      acc[v] = Object.keys(deckList[v])
        .sort()
        .map((w) => {
          // @ts-ignore
          const count = deckList[v][w].count || 1;
          const setCount = cards.filter((x) => x.deck === v && x.card === w)
            .length;
          if (count === 1 && setCount > 0) {
            return null;
          }
          const displayCount = count - setCount;
          return [
            w,
            <MenuItem value={w} key={w}>
              {w}
              {displayCount > 1 ? <> ({displayCount})</> : null}
            </MenuItem>,
          ];
        })
        .filter((v) => v);
      return acc;
    }, {} as { [key: string]: [string, ReactElement][] });

  const displayCards = deckList ? [...cards, { deck: "", card: "" }] : cards;

  return (
    <>
      <br />
      <FormControl className={styles.fill}>
        <InputLabel id={`deck-${number}-label`}>Deck {number}</InputLabel>
        <Select
          disabled={disabled}
          labelId={`deck-${number}-label`}
          id={`deck-${number}-select`}
          value={deck}
          onChange={(e) => updateDeck(e.target.value as string)}
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
      </FormControl>
      <br />
      <br />
      <Grid container spacing={3}>
        <Grid item lg={6}>
          <Typography className={styles.center}>Adventure / Level</Typography>
        </Grid>
        <Grid item lg={6}>
          <Typography className={styles.center}>Card</Typography>
        </Grid>
        {displayCards.map((v, i) => (
          <Fragment key={i}>
            <Grid item lg={6}>
              <FormControl className={styles.fill}>
                <Select
                  disabled={disabled}
                  labelId={`deck-card-${i}-${number}-label`}
                  id={`deck-${number}-card-${i}-select`}
                  value={v.deck}
                  onChange={(e) => update(i, "deck", e.target.value as string)}
                >
                  <MenuItem value="">&nbsp;</MenuItem>
                  {adventures}
                </Select>
              </FormControl>
            </Grid>
            <Grid item lg={6}>
              <FormControl className={styles.fill}>
                <Select
                  disabled={disabled}
                  labelId={`deck-card-${i}-${number}-label`}
                  id={`deck-${number}-card-${i}-select`}
                  value={v.card}
                  onChange={(e) => update(i, "card", e.target.value as string)}
                >
                  <MenuItem value="">&nbsp;</MenuItem>
                  {(v.deck &&
                    [
                      [
                        v.card,
                        <MenuItem value={v.card} key="selected">
                          {v.card}
                        </MenuItem>,
                      ] as [string, ReactElement],
                      ...cardLists[v.deck].filter((w) => w[0] !== v.card),
                    ].sort((a, b) => a[0].localeCompare(b[0]))) ||
                    null}
                </Select>
              </FormControl>
            </Grid>
          </Fragment>
        ))}
      </Grid>
    </>
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
  const user = useUser();
  const disabled = user?.uid !== data?.uid;

  function update(values: Partial<PlayerCharacter>) {
    if (data) {
      updateAccountCharacter({
        ...data,
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
          disabled={disabled}
          deck={data?.deckOne || ""}
          updateDeck={(deckOne) => update({ deckOne })}
          cards={data?.cardsOne || []}
          updateCards={(cardsOne) => update({ cardsOne })}
          number={1}
        />
      </Grid>
      <Grid item lg={4}>
        <CardList
          disabled={disabled}
          deck={data?.deckTwo || ""}
          updateDeck={(deckTwo) => update({ deckTwo })}
          cards={data?.cardsTwo || []}
          updateCards={(cardsTwo) => update({ cardsTwo })}
          number={2}
        />
      </Grid>
      <Grid item lg={4}>
        <CardList
          disabled={disabled}
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
