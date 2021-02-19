import React, { Fragment, ReactElement, useMemo } from "react";
import {
  CircularProgress,
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
import { useUser } from "../../firebase";
import { DeckDropdown } from "../Wiki/Common/DeckDropdown";
import { useCards, Card as CardType } from "../../firestore/wiki/card";

const useStyles = makeStyles((theme) => ({
  fill: {
    width: "100%",
  },
  center: {
    textAlign: "center",
  },
}));

function CardList({
  systemId,
  disabled,
  deck,
  updateDeck,
  number,
  cards,
  updateCards,
}: {
  systemId: string;
  disabled: boolean;
  deck: string;
  updateDeck(value: string): void;
  number: number;
  cards: Card[];
  updateCards(cards: Card[]): void;
}) {
  const [cardList, loading, error] = useCards(systemId, deck);
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

  const displayCards = cardList ? [...cards, { deck: "", card: "" }] : cards;
  const cardsObjects = cardList?.docs.map((v) => ({
    id: v.id,
    data: v.data(),
  }));
  const adventures =
    cardsObjects &&
    [...new Set(cardsObjects.map((v) => v.data.subDeck || "Other"))].sort(
      (a, b) => {
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
      }
    );
  const cardsByAdventure =
    adventures &&
    new Map(adventures.map((v) => [v, [] as { id: string; data: CardType }[]]));
  const cardsById = new Map();
  cardsObjects?.forEach((v) => {
    const newCount =
      (v.data.count || 1) - cards.filter((w) => w.card === v.id).length;
    if (newCount > 0) {
      cardsByAdventure!
        .get(v.data.subDeck || "Other")!
        .push({ ...v, data: { ...v.data, count: newCount } });
    }
    cardsById.set(v.id, v);
  });

  return (
    <>
      <br />
      <DeckDropdown
        fullWidth
        systemId={systemId}
        value={deck || ""}
        setValue={updateDeck}
        id={`deck-${number}-select`}
        label={`Deck ${number}`}
        options={{ isClassDeck: true }}
      />
      <br />
      <br />
      <Grid container spacing={3}>
        <Grid item lg={6}>
          <Typography className={styles.center}>Adventure / Level</Typography>
        </Grid>
        <Grid item lg={6}>
          <Typography className={styles.center}>Card</Typography>
        </Grid>
        {error ? <div>Failed to read cards: {error.message}</div> : null}
        {loading ? (
          <CircularProgress />
        ) : (
          displayCards.map((v, i) => (
            <Fragment key={i}>
              <Grid item lg={6}>
                <FormControl className={styles.fill}>
                  <Select
                    disabled={disabled}
                    labelId={`deck-card-${i}-${number}-label`}
                    id={`deck-${number}-card-${i}-select`}
                    value={v.deck}
                    onChange={(e) =>
                      update(i, "deck", e.target.value as string)
                    }
                  >
                    <MenuItem value="">&nbsp;</MenuItem>
                    {adventures?.map((v) => (
                      <MenuItem value={v} key={v}>
                        {v}
                      </MenuItem>
                    ))}
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
                    onChange={(e) =>
                      update(i, "card", e.target.value as string)
                    }
                  >
                    <MenuItem value="">&nbsp;</MenuItem>
                    {cardsByAdventure
                      ?.get(v.deck)
                      ?.filter((w) => w.id !== v.card)
                      .concat(
                        cardsById.get(v.card)
                          ? [
                              {
                                data: {
                                  ...cardsById.get(v.card).data,
                                  count: 1,
                                },
                                id: v.card,
                              },
                            ]
                          : []
                      )
                      .sort((a, b) =>
                        (a.data.name || "").localeCompare(b.data.name || "")
                      )
                      .map((v) => (
                        <MenuItem value={v.id} key={v.id}>
                          {v.data.name}
                          {(v.data.count || 0) > 1 ? ` (${v.data.count})` : ""}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            </Fragment>
          ))
        )}
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
          systemId={data?.systemId || ""}
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
          systemId={data?.systemId || ""}
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
          systemId={data?.systemId || ""}
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
