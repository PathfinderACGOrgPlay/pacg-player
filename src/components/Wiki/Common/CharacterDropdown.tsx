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

  return (
    <>
      <ErrorDisplay label="Failed to load characters" error={error} />
      <FormControl fullWidth={fullWidth}>
        <InputLabel id="character-label">Character</InputLabel>
        <Select
          labelId="character-label"
          id="character-select"
          value={value}
          onChange={(e) => setValue(e.target.value as string)}
          IconComponent={selectLoadingComponent(loading)}
        >
          <MenuItem value="">&nbsp;</MenuItem>
          {characters?.docs.map((v) => (
            <MenuItem value={v.id} key={v.id}>
              {v.data().name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}
