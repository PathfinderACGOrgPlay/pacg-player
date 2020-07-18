import { MenuItem, TextField } from "@material-ui/core";
import React, { useEffect } from "react";
import { ErrorDisplay } from "../../Common/ErrorDisplay";
import { selectLoadingComponent } from "../../Common/selectLoadingComponent";
import { useCharacters } from "../../../firestore/wiki/character";

export function CharacterDropdown({
  id,
  systemId,
  deckId,
  fullWidth,
  value,
  setValue,
}: {
  id: string;
  systemId: string;
  deckId?: string;
  fullWidth?: boolean;
  value: string;
  setValue(value: string): void;
}) {
  const [characters, loading, error] = useCharacters(systemId, deckId);

  useEffect(() => {
    if (
      !loading &&
      characters &&
      characters.docs.length &&
      value &&
      !characters.docs.find((v) => v.id === value)
    ) {
      setValue("");
    }
  }, [loading, setValue, characters, value]);

  const filteredCharacters = deckId
    ? characters?.docs.map((v) => ({ id: v.id, name: v.data().name }))
    : characters?.docs
        .map((v) => ({ id: v.data().name, name: v.data().name }))
        .filter((v, i, arr) => arr.findIndex((w) => v.id === w.id) === i);

  return (
    <>
      <ErrorDisplay label="Failed to load characters" error={error} />
      <TextField
        fullWidth={fullWidth}
        label="Character"
        id={id}
        value={loading ? "" : value}
        onChange={(e) => setValue(e.target.value as string)}
        SelectProps={{ IconComponent: selectLoadingComponent(loading) }}
      >
        <MenuItem value="">&nbsp;</MenuItem>
        {filteredCharacters?.map((v) => (
          <MenuItem value={v.id} key={v.id}>
            {v.name}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
}
