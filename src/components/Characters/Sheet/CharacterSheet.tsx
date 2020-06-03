import React from "react";
import { PlayerCharacter } from "../../../firestore/characters";
import { Grid, TextField } from "@material-ui/core";
import characters from "../../../oldData/characters.json";
import { makeStyles } from "@material-ui/core/styles";
import { CharacterType } from "./common";
import { Skills } from "./Skills";
import { DeckList } from "./DeckList";

const useStyles = makeStyles((theme) => ({
  fill: {
    width: "100%",
  },
}));

export function CharacterSheet({
  data,
  disabled,
  update,
}: {
  data: PlayerCharacter;
  disabled: boolean;
  update(data: Partial<PlayerCharacter>): void;
}) {
  const styles = useStyles();
  const character: CharacterType = (characters as any)[data.character!]?.[
    data.characterDeck!
  ];

  if (!character) {
    return null;
  }

  return (
    <>
      <br />
      <Grid container spacing={3}>
        <Grid item lg={4}>
          <TextField
            id="traits"
            label="Traits"
            defaultValue={character.traits.join("   ")}
            className={styles.fill}
            InputProps={{
              readOnly: true,
            }}
          />
          <br />
          <br />
          <Skills data={data} disabled={disabled} update={update} />
        </Grid>
        <Grid item lg={5}></Grid>
        <Grid item lg={3}>
          <DeckList
            cardsList={character.cardsList}
            values={data!.deckList}
            setValues={(v) => update({ deckList: v })}
            disabled={disabled}
          />
        </Grid>
      </Grid>
    </>
  );
}
