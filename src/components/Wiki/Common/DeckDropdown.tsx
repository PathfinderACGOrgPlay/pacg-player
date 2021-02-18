import { MenuItem, TextField } from "@material-ui/core";
import React, { useEffect } from "react";
import { ErrorDisplay } from "../../Common/ErrorDisplay";
import { selectLoadingComponent } from "../../Common/selectLoadingComponent";
import { useDecks } from "../../../firestore/wiki/deck";

export function DeckDropdown({
  id,
  systemId,
  fullWidth,
  value,
  setValue,
  label = "Deck",
}: {
  id: string;
  systemId: string;
  fullWidth?: boolean;
  value: string;
  label?: string;
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
      <TextField
        id={id}
        fullWidth={fullWidth}
        label={label}
        select
        value={loading ? "" : value}
        onChange={(e) => setValue(e.target.value as string)}
        SelectProps={{ IconComponent: selectLoadingComponent(loading) }}
      >
        <MenuItem value="">&nbsp;</MenuItem>
        {decks?.docs.map((v) => (
          <MenuItem value={v.id} key={v.id}>
            {v.data().name}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
}
