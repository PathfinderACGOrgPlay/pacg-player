import React from "react";
import { FormControl, Grid, InputLabel, makeStyles } from "@material-ui/core";
import { RouteComponentProps } from "react-router";
import {
  PlayerCharacter,
  useAccountCharacter,
  useUpdateAccountCharacter,
} from "../../firestore/characters";
import { useUser } from "../../firebase";
import { DeckDropdown } from "../Wiki/Common/DeckDropdown";
import { CharacterDropdown } from "../Wiki/Common/CharacterDropdown";
import { CharacterSheet } from "../Common/CharacterSheet";
import { SystemDropdown } from "../Wiki/Common/SystemDropdown";

const useStyles = makeStyles((theme) => ({
  fill: {
    width: "100%",
  },
}));

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

  if (!data) {
    return null;
  }
  return (
    <>
      <br />
      {updateError ? <div>{updateError}</div> : null}
      <Grid container spacing={3}>
        <Grid item lg={4}>
          <FormControl className={styles.fill}>
            <InputLabel id="character-deck-label">System</InputLabel>
            <SystemDropdown
              value={data?.systemId || ""}
              setValue={(value) =>
                update({
                  systemId: value,
                })
              }
            />
          </FormControl>
        </Grid>
        <Grid item lg={4}>
          <FormControl className={styles.fill}>
            <InputLabel id="character-deck-label">Deck</InputLabel>
            <DeckDropdown
              systemId={data?.systemId || ""}
              value={data?.deckId || ""}
              setValue={(value) =>
                update({
                  deckId: value,
                })
              }
            />
          </FormControl>
        </Grid>
        <Grid item lg={4}>
          <FormControl className={styles.fill}>
            <InputLabel id="character-deck-label">Character</InputLabel>
            <CharacterDropdown
              systemId={data?.systemId || ""}
              deckId={data?.deckId || ""}
              value={data?.characterId || ""}
              setValue={(value) =>
                update({
                  characterId: value,
                })
              }
            />
          </FormControl>
        </Grid>
      </Grid>
      {data && data.systemId && data.characterId && data.deckId ? (
        <CharacterSheet
          systemId={data.systemId}
          deckId={data.deckId}
          characterId={data.characterId}
          allowCharacterEdit={!disabled}
          characterData={data}
          updateCharacterData={(v) => {
            console.log(v);
            return updateAccountCharacter(v);
          }}
        />
      ) : null}
    </>
  );
}
