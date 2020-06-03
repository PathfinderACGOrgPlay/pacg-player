import React from "react";
import {
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
} from "@material-ui/core";
import { RouteComponentProps } from "react-router";
import {
  PlayerCharacter,
  useAccountCharacter,
  useUpdateAccountCharacter,
} from "../../../firestore/characters";
import { resetValues } from "./common";
import characters from "../../../oldData/characters.json";
import { CharacterSheet } from "./CharacterSheet";
import { useUser } from "../../../firebase";

const useStyles = makeStyles((theme) => ({
  fill: {
    width: "100%",
  },
}));

const characterNames = Object.keys(characters).sort();
const boxNames = [
  ...characterNames.reduce((acc, v) => {
    Object.keys((characters as any)[v]).forEach(acc.add.bind(acc));
    return acc;
  }, new Set()),
].sort() as string[];

export function Sheet({
  match: {
    params: { id },
  },
}: RouteComponentProps<{ id: string }>) {
  const [character] = useAccountCharacter(id);
  const styles = useStyles();
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
    <>
      <br />
      {updateError ? <div>{updateError}</div> : null}
      <Grid container spacing={3}>
        <Grid item lg={6}>
          <FormControl className={styles.fill}>
            <InputLabel id="character-deck-label">Deck</InputLabel>
            <Select
              labelId={`character-deck-label`}
              id={`character-deck-select`}
              value={data?.characterDeck || ""}
              onChange={(e) =>
                update({
                  characterDeck: e.target.value as string,
                  ...resetValues,
                })
              }
              disabled={disabled}
            >
              <MenuItem value="">&nbsp;</MenuItem>
              {boxNames
                .filter(
                  (v) =>
                    !data?.character || (characters as any)[data.character]?.[v]
                )
                .map((v) => (
                  <MenuItem value={v} key={v}>
                    {v}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item lg={6}>
          <FormControl className={styles.fill}>
            <InputLabel id="character-deck-label">Character</InputLabel>
            <Select
              labelId={`character-deck-label`}
              id={`character-deck-select`}
              value={data?.character || ""}
              onChange={(e) =>
                update({
                  character: e.target.value as string,
                  ...resetValues,
                })
              }
              disabled={disabled}
            >
              <MenuItem value="">&nbsp;</MenuItem>
              {characterNames
                .filter(
                  (v) =>
                    !data?.characterDeck ||
                    (characters as any)[v]?.[data.characterDeck]
                )
                .map((v) => (
                  <MenuItem value={v} key={v}>
                    {v}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      {data && data.character && data.characterDeck ? (
        <CharacterSheet data={data} update={update} disabled={disabled} />
      ) : null}
    </>
  );
}
