import { RouteComponentProps } from "react-router";
import {
  useAccountCharacter,
  useUpdateAccountCharacter,
} from "../../firestore/characters";
import { useUser } from "../../firebase";
import { ErrorDisplay } from "../Common/ErrorDisplay";
import React from "react";
import {
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { DeckDropdown } from "../Wiki/Common/DeckDropdown";
import { useCards } from "../../firestore/wiki/card";
import { useAdventureInfo } from "./common";

function AdditionalCard({
  index,
  systemId,
  update,
  cardDetails,
  disabled,
}: {
  index: number;
  systemId: string | undefined;
  update: (newData: {
    deckId?: string;
    subDeck?: string;
    cardId?: string;
  }) => void;
  cardDetails: { deckId?: string; subDeck?: string; cardId?: string };
  disabled: boolean;
}) {
  const [cardList, loading, error] = useCards(systemId, cardDetails.deckId);

  const { adventures, cardsByAdventure } = useAdventureInfo(cardList, []);

  return (
    <>
      <ErrorDisplay error={error} label="Failed to load cards" />
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <DeckDropdown
            fullWidth
            disabled={disabled}
            systemId={systemId}
            value={cardDetails.deckId || ""}
            setValue={(deckId) => {
              update({
                ...cardDetails,
                deckId,
              });
            }}
            id={`additionalCard-${index}-deck`}
            label={`Deck ${index}`}
          />
        </Grid>
        <Grid item xs={4}>
          {loading ? (
            <CircularProgress />
          ) : (
            <FormControl fullWidth>
              <InputLabel id={`additionalCard-${index}-subDeck-label`}>
                Adventure / Level
              </InputLabel>
              <Select
                disabled={disabled}
                labelId={`additionalCard-${index}-subDeck-label`}
                id={`additionalCard-${index}-subDeck`}
                value={cardDetails.subDeck || ""}
                onChange={(e) => {
                  update({
                    ...cardDetails,
                    subDeck: e.target.value as string,
                  });
                }}
              >
                <MenuItem value="">&nbsp;</MenuItem>
                {adventures?.map((v) => (
                  <MenuItem value={v} key={v}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Grid>
        <Grid item xs={4}>
          {loading ? (
            <CircularProgress />
          ) : (
            <FormControl fullWidth>
              <InputLabel id={`additionalCard-${index}-card-label`}>
                Card
              </InputLabel>
              <Select
                disabled={disabled}
                labelId={`additionalCard-${index}-card-label`}
                id={`additionalCard-${index}-card`}
                value={cardDetails.cardId || ""}
                onChange={(e) => {
                  update({
                    ...cardDetails,
                    cardId: e.target.value as string,
                  });
                }}
              >
                <MenuItem value="">&nbsp;</MenuItem>
                {cardsByAdventure?.get(cardDetails.subDeck || "")?.map((v) => (
                  <MenuItem value={v.id} key={v.id}>
                    {v.data.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Grid>
      </Grid>
    </>
  );
}

export function AdditionalCards({
  match: {
    params: { id },
  },
}: RouteComponentProps<{ id: string }>) {
  const [character] = useAccountCharacter(id);
  const data = character?.data();
  const [updateAccountCharacter, updateError] = useUpdateAccountCharacter(id);
  const user = useUser();
  const disabled = user?.uid !== data?.uid;
  const items = [...(data?.additionalCards || []), {}];

  return (
    <>
      <br />
      <ErrorDisplay label="Character Update" error={updateError} />
      This page allows you to add any additional cards from any set to your
      deck. This is not typical but can be used for many non-standard
      situations.
      <br />
      <br />
      {items.map((v, i) => (
        <AdditionalCard
          index={i}
          key={i}
          cardDetails={v}
          disabled={disabled}
          systemId={data?.systemId}
          update={(newData: {
            deckId?: string;
            subDeck?: string;
            cardId?: string;
          }) => {
            if (data) {
              void updateAccountCharacter({
                ...data,
                additionalCards: items
                  .map((v, j) => {
                    if (i === j) {
                      return newData;
                    }
                    return v;
                  })
                  .filter((v) => v.deckId),
              });
            }
          }}
        />
      ))}
    </>
  );
}
