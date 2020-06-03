import React from "react";
import { PlayerCharacter } from "../../../firestore/characters";
import {
  AppBar,
  Button,
  Grid,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@material-ui/core";
import characters from "../../../oldData/characters.json";
import { makeStyles } from "@material-ui/core/styles";
import { CharacterType, roleResetValues, useCommonStyles } from "./common";
import { Skills } from "./Skills";
import { DeckList } from "./DeckList";
import { Powers } from "./Powers";
import { Role } from "./Role";

const useStyles = makeStyles((theme) => ({
  roleSelect: {
    flexGrow: 1,
    maxWidth: "100%",
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
  const commonStyles = useCommonStyles();
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
            className={commonStyles.fill}
            InputProps={{
              readOnly: true,
            }}
          />
          <br />
          <br />
          <Skills data={data} disabled={disabled} update={update} />
        </Grid>
        <Grid item lg={5}>
          <Typography className={commonStyles.center}>Powers</Typography>
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
        <AppBar position="static" color="default">
          <Tabs value={data.role}>
            <Tab
              value={0}
              label={character.roles[0].name}
              className={styles.roleSelect}
              onClick={() => {
                update({
                  role: data!.role === 0 ? 2 : 0,
                  ...roleResetValues,
                });
              }}
            />
            <Tab
              value={1}
              label={character.roles[1].name}
              className={styles.roleSelect}
              onClick={() => {
                update({
                  role: data!.role === 1 ? 2 : 1,
                  ...roleResetValues,
                });
              }}
            />
          </Tabs>
        </AppBar>
        <Grid item lg={6}>
          <Role
            role={character.roles[0].powers}
            disabled={disabled || data.role !== 0}
            deck={data}
            update={update}
          />
        </Grid>
        <Grid item lg={6}>
          <Role
            role={character.roles[1].powers}
            disabled={disabled || data.role !== 1}
            deck={data}
            update={update}
          />
        </Grid>
      </Grid>
    </>
  );
}
