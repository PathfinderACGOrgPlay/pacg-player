import React from "react";
import { RouteComponentProps } from "react-router";
import {
  PlayerCharacter,
  useAccountCharacter,
  useUpdateAccountCharacter,
} from "../../firestore/characters";
import { useUser } from "../../firebase";
import {
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  makeStyles,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import { useCards } from "../../firestore/wiki/card";
import { useDeck } from "../../firestore/wiki/deck";
import { ErrorDisplay } from "../Common/ErrorDisplay";

const useStyles = makeStyles((theme) => ({
  fill: {
    width: "100%",
  },
}));

const coreId = "lK9Llwwx3lmNZ7gdLp54";
const crimsonId = "Mimv8s5r0BxJMUIxOpfQ";

function DeckSubstitutions({
  coreCards,
  crimsonCards,
  systemId,
  deck,
  update,
  values,
  disabled,
}: {
  coreCards?: Map<string, string>;
  crimsonCards?: Map<string, string>;
  systemId?: string;
  deck?: string;
  values: { [cardId: string]: [string, string] };
  update(values: { [cardId: string]: [string, string] }): void;
  disabled: boolean;
}) {
  const [deckData, deckLoading, deckError] = useDeck(systemId, deck);
  const [cardList, cardListLoading, cardListError] = useCards(systemId, deck);
  const styles = useStyles();

  return (
    <div>
      <ErrorDisplay error={deckError} label="Failed to load deck" />
      <ErrorDisplay error={cardListError} label="Failed to load card list" />
      {deckLoading || cardListLoading ? <CircularProgress /> : null}
      <Typography>{deckData?.data()?.name}&nbsp;</Typography>
      <hr />
      {deckData?.data()?.isCoreSet
        ? "This deck is based on the Core Set or Curse of the Crimson Throne"
        : cardList?.docs
            .map((v) => ({ id: v.id, data: v.data() }))
            .filter(
              (v) =>
                coreCards?.has(v.data.name) ?? crimsonCards?.has(v.data.name)
            )
            .map((v) => {
              return (
                <Grid container>
                  <Grid item lg={6}>
                    <Typography>{v.data.name}</Typography>
                  </Grid>
                  <Grid item lg={6}>
                    <Select
                      value={JSON.stringify(values[v.id])}
                      onChange={(e) => {
                        if (e.target.value) {
                          update({
                            ...values,
                            [v.id]: JSON.parse(e.target.value as string) as [
                              string,
                              string
                            ],
                          });
                        } else {
                          const newValues = { ...values };
                          delete newValues[v.id];
                          update(newValues);
                        }
                      }}
                      disabled={disabled}
                      className={styles.fill}
                    >
                      <MenuItem value={undefined}>&nbsp;</MenuItem>
                      {coreCards?.has(v.data.name) ? (
                        <MenuItem
                          value={JSON.stringify([
                            coreId,
                            coreCards!.get(v.data.name)!,
                          ])}
                        >
                          Core Set
                        </MenuItem>
                      ) : null}
                      {crimsonCards?.has(v.data.name) ? (
                        <MenuItem
                          value={JSON.stringify([
                            crimsonId,
                            crimsonCards!.get(v.data.name)!,
                          ])}
                        >
                          Curse of the Crimson Throne
                        </MenuItem>
                      ) : null}
                    </Select>
                  </Grid>
                </Grid>
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
  const [coreCardList, coreCardListLoading, coreCardListError] = useCards(
    data?.systemId,
    coreId
  );
  const coreCards = coreCardList?.docs.reduce((acc, v) => {
    acc.set(v.data().name, v.id);
    if (v.data().name === "Shortsword") {
      acc.set("Short Sword", v.id);
    }
    return acc;
  }, new Map<string, string>());
  const [
    crimsonCardList,
    crimsonCardListLoading,
    crimsonCardListError,
  ] = useCards(data?.systemId, crimsonId);
  const crimsonCards = crimsonCardList?.docs.reduce((acc, v) => {
    acc.set(v.data().name, v.id);
    if (v.data().name === "Shortsword") {
      acc.set("Short Sword", v.id);
    }
    return acc;
  }, new Map<string, string>());

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
      <br />
      Per the Pathfinder® Adventure Card Society™ Guide "if your Class Deck box
      contains boons that have the same name as boons in the <i>Core Set</i> or
      the <i>Curse of the Crimson Throne Adventure Path</i>, in between
      scenarios, you may replace these boons with the Core or Curse versions."
      If you would like to make those substitutions use this tab
      <br />
      <br />
      <ErrorDisplay error={updateError} label="Failed to update substitions" />
      <ErrorDisplay error={coreCardListError} label="Failed to Core Set" />
      <ErrorDisplay
        error={crimsonCardListError}
        label="Failed to Curse of the Crimson Throne"
      />
      {crimsonCardListLoading || coreCardListLoading ? (
        <CircularProgress />
      ) : null}
      <br />
      <Grid container spacing={3}>
        <Grid item lg={4}>
          <DeckSubstitutions
            coreCards={coreCards}
            crimsonCards={crimsonCards}
            systemId={data?.systemId}
            disabled={disabled}
            deck={data?.deckOne}
            values={data?.deckOneSubstitutions || {}}
            update={(v) => update({ deckOneSubstitutions: v })}
          />
        </Grid>
        <Grid item lg={4}>
          <DeckSubstitutions
            coreCards={coreCards}
            crimsonCards={crimsonCards}
            systemId={data?.systemId}
            disabled={disabled}
            deck={data?.deckTwo}
            values={data?.deckTwoSubstitutions || {}}
            update={(v) => update({ deckTwoSubstitutions: v })}
          />
        </Grid>
        <Grid item lg={4}>
          <DeckSubstitutions
            coreCards={coreCards}
            crimsonCards={crimsonCards}
            systemId={data?.systemId}
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
