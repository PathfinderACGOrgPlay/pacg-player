import React from "react";
import { Grid } from "@material-ui/core";
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
import { ErrorDisplay } from "../Common/ErrorDisplay";

export function Sheet({
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

  if (!data) {
    return null;
  }
  return (
    <>
      <br />
      <ErrorDisplay label="Failed to update character" error={updateError} />
      <Grid container spacing={3}>
        <Grid item lg={4}>
          <SystemDropdown
            fullWidth
            id="player-character-system"
            value={data?.systemId || ""}
            setValue={(value) =>
              update({
                systemId: value,
              })
            }
          />
        </Grid>
        <Grid item lg={4}>
          <DeckDropdown
            fullWidth
            systemId={data?.systemId || ""}
            value={data?.deckId || ""}
            setValue={(value) =>
              update({
                deckId: value,
              })
            }
            id="player-character-deck"
          />
        </Grid>
        <Grid item lg={4}>
          <CharacterDropdown
            fullWidth
            systemId={data?.systemId || ""}
            deckId={data?.deckId || ""}
            value={data?.characterId || ""}
            setValue={(value) =>
              update({
                characterId: value,
              })
            }
            id="player-character-character"
          />
        </Grid>
      </Grid>
      {data && data.systemId && data.characterId && data.deckId ? (
        <CharacterSheet
          systemId={data.systemId}
          deckId={data.deckId}
          characterId={data.characterId}
          allowCharacterEdit={!disabled}
          characterData={data}
          updateCharacterData={updateAccountCharacter}
        />
      ) : null}
    </>
  );
}
