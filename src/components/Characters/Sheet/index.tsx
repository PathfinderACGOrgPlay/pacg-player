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
import { DeckDropdown } from "../../Wiki/Common/DeckDropdown";
import { CharacterDropdown } from "../../Wiki/Common/CharacterDropdown";

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
            <DeckDropdown
              systemId={data?.systemId || ""}
              value={data?.deckId || ""}
              setValue={(value) =>
                update({
                  deckId: value,
                  ...resetValues,
                })
              }
            />
          </FormControl>
        </Grid>
        <Grid item lg={6}>
          <FormControl className={styles.fill}>
            <InputLabel id="character-deck-label">Character</InputLabel>
            <CharacterDropdown
              systemId={data?.systemId || ""}
              deckId={data?.deckId || ""}
              value={data?.characterId || ""}
              setValue={(value) =>
                update({
                  characterId: value,
                  ...resetValues,
                })
              }
            />
          </FormControl>
        </Grid>
      </Grid>
      {data && data.characterId && data.deckId ? (
        <CharacterSheet data={data} update={update} disabled={disabled} />
      ) : null}
    </>
  );
}
