import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import React, { useEffect } from "react";
import { ErrorDisplay } from "../../Common/ErrorDisplay";
import { selectLoadingComponent } from "../../Common/selectLoadingComponent";
import { useCharacters } from "../../../firestore/wiki/character";

export function CharacterDropdown({
  systemId,
  deckId,
  fullWidth,
  value,
  setValue,
}: {
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
      <FormControl fullWidth={fullWidth}>
        <InputLabel id="character-label">Character</InputLabel>
        <Select
          labelId="character-label"
          id="character-select"
          value={loading ? "" : value}
          onChange={(e) => setValue(e.target.value as string)}
          IconComponent={selectLoadingComponent(loading)}
        >
          <MenuItem value="">&nbsp;</MenuItem>
          {filteredCharacters?.map((v) => (
            <MenuItem value={v.id} key={v.id}>
              {v.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}
