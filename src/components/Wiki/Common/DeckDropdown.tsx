import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import React, { useEffect } from "react";
import { ErrorDisplay } from "../../Common/ErrorDisplay";
import { selectLoadingComponent } from "../../Common/selectLoadingComponent";
import { useDecks } from "../../../firestore/wiki/deck";

export function DeckDropdown({
  systemId,
  fullWidth,
  value,
  setValue,
}: {
  systemId: string;
  fullWidth?: boolean;
  value: string;
  setValue(value: string): void;
}) {
  const [decks, loading, error] = useDecks(systemId);

  useEffect(() => {
    if (
      !loading &&
      decks &&
      decks.docs.length &&
      value &&
      !decks.docs.find((v) => v.id === value)
    ) {
      setValue("");
    }
  }, [loading, setValue, decks, value]);

  return (
    <>
      <ErrorDisplay label="Failed to load decks" error={error} />
      <FormControl fullWidth={fullWidth}>
        <InputLabel id="deck-label">Deck</InputLabel>
        <Select
          labelId="deck-label"
          id="deck-select"
          value={value}
          onChange={(e) => setValue(e.target.value as string)}
          IconComponent={selectLoadingComponent(loading)}
        >
          <MenuItem value="">&nbsp;</MenuItem>
          {decks?.docs.map((v) => (
            <MenuItem value={v.id} key={v.id}>
              {v.data().name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}
