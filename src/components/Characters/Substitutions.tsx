import React from "react";
import classDecks from "../../oldData/classDecks.json";
import adventures from "../../oldData/adventures.json";
import { RouteComponentProps } from "react-router";
import {
  PlayerCharacter,
  useAccountCharacter,
  useUpdateAccountCharacter,
} from "../../firestore/characters";
import { useUser } from "../../firebase";
import {
  Container,
  Grid,
  makeStyles,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  fill: {
    width: "100%",
  },
}));

const core = adventures["Core Set"];
const crimson = adventures["Curse of the Crimson Throne"];

function findCards(set: typeof core | typeof crimson, cardName: string) {
  return (Object.keys(set.Decks) as (keyof typeof set.Decks)[]).reduce(
    (acc, v) => {
      if ((set.Decks[v] as any)[cardName]) {
        acc.push(v);
      }
      return acc;
    },
    [] as string[]
  );
}

function DeckSubstitutions({
  deck,
  update,
  values,
  disabled,
}: {
  deck?: string;
  values: { [adventure: string]: { [cards: string]: [string, string] } };
  update(values: {
    [adventure: string]: { [cards: string]: [string, string] };
  }): void;
  disabled: boolean;
}) {
  const cards = classDecks[deck as keyof typeof classDecks];
  const styles = useStyles();
  if (!cards) {
    return null;
  }

  return (
    <div>
      {(Object.keys(cards.Decks) as (keyof typeof cards.Decks)[]).map((v) => {
        const replacables = Object.keys(cards.Decks[v]!)
          .map((w) => {
            const coreCards = findCards(core, w);
            const crimsonCards = findCards(crimson, w);
            if (!coreCards.length && !crimsonCards.length) {
              return null;
            }
            return (
              <Grid container>
                <Grid item lg={6}>
                  <Typography>{w}</Typography>
                </Grid>
                <Grid item lg={6}>
                  <Select
                    value={
                      values[v]?.[w]
                        ? `${values[v][w][0]}/${values[v][w][1]}`
                        : ""
                    }
                    onChange={(e) =>
                      update({
                        ...values,
                        [v]: {
                          ...values[v],
                          [w]: (e.target.value as string).split("/") as [
                            string,
                            string
                          ],
                        },
                      })
                    }
                    disabled={disabled}
                    className={styles.fill}
                  >
                    <MenuItem value="">&nbsp;</MenuItem>
                    {coreCards.map((v) => (
                      <MenuItem value={`Core/${v}`} key={`Core/${v}`}>
                        Core / {v}
                      </MenuItem>
                    ))}
                    {crimsonCards.map((v) => (
                      <MenuItem value={`Crimson/${v}`} key={`Crimson/${v}`}>
                        Crimson / {v}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              </Grid>
            );
          })
          .filter((v) => v);

        if (!replacables.length) {
          return null;
        }
        return (
          <>
            <Typography variant="h6" component="h4">
              {v}
            </Typography>
            {replacables}
          </>
        );
      })}
    </div>
  );
}

export function Substitutions({
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
    <Container>
      {updateError ? <div>{updateError}</div> : null}
      <br />
      <Grid container spacing={3}>
        <Grid item lg={4}>
          <Typography>{data?.deckOne}&nbsp;</Typography>
          <hr />
          <DeckSubstitutions
            disabled={disabled}
            deck={data?.deckOne}
            values={data?.deckOneSubstitutions || {}}
            update={(v) => update({ deckOneSubstitutions: v })}
          />
        </Grid>
        <Grid item lg={4}>
          <Typography>{data?.deckTwo}&nbsp;</Typography>
          <hr />
          <DeckSubstitutions
            disabled={disabled}
            deck={data?.deckTwo}
            values={data?.deckTwoSubstitutions || {}}
            update={(v) => update({ deckTwoSubstitutions: v })}
          />
        </Grid>
        <Grid item lg={4}>
          <Typography>{data?.deckThree}&nbsp;</Typography>
          <hr />
          <DeckSubstitutions
            disabled={disabled}
            deck={data?.deckThree}
            values={data?.deckThreeSubstitutions || {}}
            update={(v) => update({ deckThreeSubstitutions: v })}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
