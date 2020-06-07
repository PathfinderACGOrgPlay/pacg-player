import {
  Button,
  CircularProgress,
  Container,
  FormControlLabel,
  Switch,
  Typography,
  TextField,
} from "@material-ui/core";
import React, { ChangeEvent, useState } from "react";
import { SystemEdit } from "../Common/SystemEdit";
import { makeStyles } from "@material-ui/core/styles";
import { ErrorDisplay } from "../../Common/ErrorDisplay";
import {
  Character,
  useCharacters,
  useCreateCharacter,
  useUpdateCharacter,
} from "../../../firestore/wiki/character";
import { removeRecoverAdornment } from "../Common/removeRecoverAdornment";
import { useDebounceUpdate } from "../../Common/useDebounceUpdate";

const useStyles = makeStyles((theme) => ({
  removedSwitch: {
    float: "right",
  },
}));

function CharacterField({
  systemId,
  deckId,
  characterId,
  character,
}: {
  systemId: string;
  deckId: string;
  characterId: string;
  character: Character;
}) {
  const [update, updateError] = useUpdateCharacter(
    systemId,
    deckId,
    characterId
  );
  return (
    <>
      <ErrorDisplay error={updateError} label="Failed to update character" />
      <TextField
        fullWidth
        id={`deck-name-${systemId}-${deckId}`}
        label="Character Name"
        {...useDebounceUpdate(
          character.name,
          (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
          (name) => update({ ...character, name })
        )}
        InputProps={{
          endAdornment: removeRecoverAdornment(character.removed, () =>
            update({ ...character, removed: !character.removed })
          ),
        }}
      />
    </>
  );
}

function DeckSubEdit({
  systemId,
  deckId,
}: {
  systemId: string;
  deckId: string;
}) {
  const [showRemoved, setShowRemoved] = useState(false);
  const [decks, loading, decksError] = useCharacters(systemId, deckId);
  const styles = useStyles();
  const createCharacter = useCreateCharacter(systemId, deckId);

  return (
    <>
      <ErrorDisplay label="Failed to load decks" error={decksError} />
      <Typography variant="h5">
        Characters
        <FormControlLabel
          className={styles.removedSwitch}
          control={
            <Switch
              checked={showRemoved}
              onChange={(e) => setShowRemoved(e.currentTarget.checked)}
            />
          }
          label="Show Removed"
        />
        {loading ? <CircularProgress /> : null}
      </Typography>
      <br />
      {decks?.docs.map((v) => (
        <CharacterField
          key={v.id}
          systemId={systemId}
          deckId={deckId}
          characterId={v.id}
          character={v.data()}
        />
      ))}
      <Button onClick={() => createCharacter()}>Create</Button>
    </>
  );
}

export function Edit() {
  return (
    <Container>
      <SystemEdit DeckSubEdit={DeckSubEdit} />
    </Container>
  );
}
