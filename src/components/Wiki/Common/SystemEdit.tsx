import {
  Button,
  Typography,
  CircularProgress,
  TextField,
  FormControlLabel,
  Switch,
  CardContent,
  Card,
  Grid,
  FormGroup,
  Checkbox,
} from "@material-ui/core";
import {
  CardSystem,
  useCardSystems,
  useCreateCardSystem,
  useUpdateCardSystem,
} from "../../../firestore/wiki/card-systems";
import React, { ChangeEvent, ComponentType, useState, Fragment } from "react";
import { ErrorDisplay } from "../../Common/ErrorDisplay";
import { useDebounceUpdate } from "../../Common/useDebounceUpdate";
import { makeStyles } from "@material-ui/core/styles";
import {
  Deck,
  useCreateDeck,
  useDecks,
  useUpdateDeck,
} from "../../../firestore/wiki/deck";
import { removeRecoverAdornment } from "./removeRecoverAdornment";
import { UploadField } from "../../Common/UploadField";

const useStyles = makeStyles((theme) => ({
  removedSwitch: {
    float: "right",
  },
}));

function DeckField({
  systemId,
  deckId,
  deck,
}: {
  systemId: string;
  deckId: string;
  deck: Deck;
}) {
  const [update, updateError] = useUpdateDeck(systemId, deckId);
  return (
    <>
      <ErrorDisplay error={updateError} label="Failed to update deck" />
      <Grid container spacing={2}>
        <Grid item lg={4}>
          <TextField
            fullWidth
            id={`deck-name-${systemId}-${deckId}`}
            label="Deck Name"
            {...useDebounceUpdate(
              deck.name,
              (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
              (name) => update({ ...deck, name })
            )}
            InputProps={{
              endAdornment: removeRecoverAdornment(deck.removed, () =>
                update({ ...deck, removed: !deck.removed })
              ),
            }}
          />
        </Grid>
        <Grid item lg={4}>
          <UploadField
            fullWidth
            id={`logo-${systemId}-${deckId}`}
            label="System Logo"
            potentialFilePath={`/system/${systemId}/deck/logo/${deckId}`}
            {...useDebounceUpdate(
              deck.logo,
              (logo: string) => logo,
              (logo) => update({ ...deck, logo })
            )}
          />
        </Grid>
        <Grid item lg={4}>
          <FormGroup className="checkbox" row>
            <FormControlLabel
              control={
                <Checkbox
                  name={`isClassDeck-${systemId}-${deckId}`}
                  checked={deck.isClassDeck || false}
                  onChange={() =>
                    update({ ...deck, isClassDeck: !deck.isClassDeck })
                  }
                />
              }
              label="Is Class Deck"
              labelPlacement="end"
            />
          </FormGroup>
        </Grid>
      </Grid>
      <br />
    </>
  );
}

function System({
  system,
  id,
  DeckSubEdit,
}: {
  system: CardSystem;
  id: string;
  DeckSubEdit?: ComponentType<{ systemId: string; deckId: string }>;
}) {
  const [update, updateError] = useUpdateCardSystem(id);
  const [showRemoved, setShowRemoved] = useState(false);
  const [decks, loading] = useDecks(id, { deleted: showRemoved });
  const styles = useStyles();
  const createDeck = useCreateDeck(id);

  return (
    <Card>
      <CardContent>
        <ErrorDisplay error={updateError} label="Failed to update system" />
        <TextField
          fullWidth
          id={`name-${id}`}
          label="System Name"
          {...useDebounceUpdate(
            system.name,
            (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
            (name) => update({ ...system, name })
          )}
          InputProps={{
            endAdornment: removeRecoverAdornment(system.removed, () =>
              update({ ...system, removed: !system.removed })
            ),
          }}
        />
        <UploadField
          fullWidth
          id={`logo-${id}`}
          label="System Logo"
          potentialFilePath={`/system/logo/${id}`}
          {...useDebounceUpdate(
            system.logo,
            (logo: string) => logo,
            (logo) => update({ ...system, logo })
          )}
        />

        <Typography variant="h5">
          Decks
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
        {decks?.docs.map((v) =>
          DeckSubEdit ? (
            <Fragment key={v.id}>
              <Card variant="outlined">
                <CardContent>
                  <DeckField systemId={id} deckId={v.id} deck={v.data()} />
                  <DeckSubEdit systemId={id} deckId={v.id} />
                </CardContent>
              </Card>
              <br />
            </Fragment>
          ) : (
            <DeckField key={v.id} systemId={id} deckId={v.id} deck={v.data()} />
          )
        )}
        <Button onClick={() => createDeck()}>Create</Button>
      </CardContent>
    </Card>
  );
}

export function SystemEdit({
  DeckSubEdit,
}: {
  DeckSubEdit?: ComponentType<{ systemId: string; deckId: string }>;
}) {
  const createCardSystem = useCreateCardSystem();
  const [showRemoved, setShowRemoved] = useState(false);
  const [systems, loading, error] = useCardSystems(showRemoved);
  const styles = useStyles();

  return (
    <>
      {loading ? <CircularProgress /> : null}
      <ErrorDisplay error={error} label="Failed to load systems" />
      <Typography variant="h5">
        Systems
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
      </Typography>
      <br />
      {systems?.docs.map((v) => (
        <>
          <System
            key={v.id}
            id={v.id}
            system={v.data()}
            DeckSubEdit={DeckSubEdit}
          />
          <br />
        </>
      ))}
      <Button onClick={() => createCardSystem()}>Create</Button>
    </>
  );
}
