import React, { ChangeEvent, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Card, useCard, useUpdateCard } from "../../../firestore/wiki/card";
import {
  CircularProgress,
  Container,
  TextField,
  Button,
  Grid,
  InputAdornment,
  IconButton,
} from "@material-ui/core";
import { ErrorDisplay } from "../../Common/ErrorDisplay";
import { useDebounceUpdate } from "../../Common/useDebounceUpdate";
import { Link as RouterLink } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import PublishIcon from "@material-ui/icons/Publish";
import {
  useCardSystem,
  useUpdateCardSystem,
} from "../../../firestore/wiki/card-systems";
import { AutoInsertDropdown } from "../Common/AutoInsertDropdown";
import { useDeck, useUpdateDeck } from "../../../firestore/wiki/deck";
import {UploadField} from "../../Common/UploadField";

const useStyles = makeStyles((theme) => ({
  cardImage: {
    maxWidth: 600,
    marginRight: theme.spacing(3),
  },
  body: {
    flex: "1 1 auto",
  },
  container: {
    display: "flex",
  },
}));

export function CardEdit({
  match: {
    params: { systemId, deckId, cardId },
  },
}: RouteComponentProps<{ systemId: string; deckId: string; cardId: string }>) {
  const styles = useStyles();
  const [card, loading, error] = useCard(systemId, deckId, cardId);
  const [updateCard, updateError] = useUpdateCard(systemId, deckId, cardId);
  const [system, systemLoading, systemError] = useCardSystem(systemId);
  const [deck, deckLoading, deckError] = useDeck(systemId, deckId);
  const [updateSystem, updateSystemError] = useUpdateCardSystem(systemId);
  const [updateDeck, updateDeckError] = useUpdateDeck(systemId, deckId);
  const systemData = system?.data();
  const deckData = deck?.data();
  const cardTypes = (systemData?.cardTypes || []).filter((v) => v);
  const traits = (systemData?.traits || []).filter((v) => v);
  const subDecks = (deckData?.subDecks || []).filter((v) => v);

  function update(values: Partial<Card>) {
    if (data) {
      updateCard({
        ...data,
        ...values,
      });
    }
  }

  const data = card?.data();

  return (
    <Container>
      <br />
      <ErrorDisplay label="Failed to load card" error={error} />
      <ErrorDisplay label="Failed to load card system" error={systemError} />
      <ErrorDisplay label="Failed to load deck" error={deckError} />
      <ErrorDisplay label="Failed to update card" error={updateError} />
      <ErrorDisplay
        label="Failed to update dropdown options"
        error={updateSystemError}
      />
      <ErrorDisplay
        label="Failed to update dropdown options"
        error={updateDeckError}
      />
      {loading ? <CircularProgress /> : null}
      <div className={styles.container}>
        {data?.image ? (
          <img src={data?.image} className={styles.cardImage} alt="" />
        ) : null}
        <div className={styles.body}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                id="name"
                fullWidth
                label="Name"
                {...useDebounceUpdate(
                  data?.name || "",
                  (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
                  (name) => update({ name })
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <AutoInsertDropdown
                id="level-select"
                options={subDecks}
                label="Adventure / Level"
                value={data?.subDeck || ""}
                onChange={(subDeck: string) => update({ subDeck })}
                onAddOption={(type: string) => {
                  if (deckData) {
                    updateDeck({
                      ...deckData,
                      subDecks: [...subDecks, type].sort(),
                    });
                  }
                }}
                loading={deckLoading}
              />
            </Grid>
            <Grid item xs={6}>
              <AutoInsertDropdown
                id="type-select"
                options={cardTypes}
                label="Card Type"
                value={data?.type || ""}
                onChange={(type: string) => update({ type })}
                onAddOption={(type: string) => {
                  if (systemData) {
                    updateSystem({
                      ...systemData,
                      cardTypes: [...cardTypes, type].sort(),
                    });
                  }
                }}
                loading={systemLoading}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="count"
                fullWidth
                type="number"
                label="Count"
                {...useDebounceUpdate(
                  data?.count?.toString() || "",
                  (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
                  (count) => update({ count: parseInt(count, 10) })
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <AutoInsertDropdown
                id="traits-select"
                options={traits}
                label="Traits"
                multiple
                value={data?.traits || []}
                onChange={(traits: string[]) => update({ traits })}
                onAddOption={(type: string) => {
                  if (systemData) {
                    updateSystem({
                      ...systemData,
                      traits: [...traits, type].sort(),
                    });
                  }
                }}
                loading={systemLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <UploadField
                id="image"
                fullWidth
                label="Image"
                {...useDebounceUpdate(
                  data?.image || "",
                  (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
                  (image) => update({ image })
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="powers"
                fullWidth
                multiline
                label="Powers"
                {...useDebounceUpdate(
                  data?.powers || "",
                  (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
                  (powers) => update({ powers })
                )}
              />
            </Grid>
          </Grid>
        </div>
      </div>
      <br />
      <br />
      <Button component={RouterLink} to={`/wiki/cards/${systemId}/${deckId}`}>
        Back
      </Button>
    </Container>
  );
}
