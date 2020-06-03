import React from "react";
import { PlayerCharacter } from "../../../firestore/characters";
import { Grid, TextField, Typography } from "@material-ui/core";
import characters from "../../../oldData/characters.json";
import { makeStyles } from "@material-ui/core/styles";
import { CharacterType, useCommonStyles } from "./common";
import { Skills } from "./Skills";
import { DeckList } from "./DeckList";
import { Powers } from "./Powers";

export function CharacterSheet({
  data,
  disabled,
  update,
}: {
  data: PlayerCharacter;
  disabled: boolean;
  update(data: Partial<PlayerCharacter>): void;
}) {
  const styles = useCommonStyles();
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
        <Grid item lg={5}>
          <Typography className={styles.center}>Powers</Typography>
          <Powers
            powers={character.powers.powers}
            powerCheckboxesValues={data.powers}
            updatePowerCheckboxes={(values) => update({ powers: values })}
            proficiencies={character.powers.proficiencies}
            proficienciesValues={data.proficiencies}
            updateProficienciesValues={(values) =>
              update({ proficiencies: values })
            }
            handSize={character.powers.handSize}
            handSizeValues={data.handSize}
            updateHandSizeValues={(values) => update({ handSize: values })}
            disabled={disabled}
          />
        </Grid>
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
