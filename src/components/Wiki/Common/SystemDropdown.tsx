import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import React, { useEffect } from "react";
import { useCardSystems } from "../../../firestore/wiki/card-systems";
import { ErrorDisplay } from "../../Common/ErrorDisplay";
import { selectLoadingComponent } from "../../Common/selectLoadingComponent";

export function SystemDropdown({
  fullWidth,
  value,
  setValue,
}: {
  fullWidth?: boolean;
  value: string;
  setValue(value: string): void;
}) {
  const [systems, loading, error] = useCardSystems();

  useEffect(() => {
    if (
      !loading &&
      systems &&
      systems.docs.length &&
      (!value || !systems.docs.find((v) => v.id === value))
    ) {
      setValue(systems.docs[0].id);
    }
  }, [loading, setValue, systems, value]);

  return (
    <>
      <ErrorDisplay label="Failed to load systems" error={error} />
      <FormControl fullWidth={fullWidth}>
        <InputLabel id="system-label">System</InputLabel>
        <Select
          labelId="system-label"
          id="system-select"
          value={loading ? "" : value}
          onChange={(e) => setValue(e.target.value as string)}
          IconComponent={selectLoadingComponent(loading)}
        >
          {systems?.docs.map((v) => (
            <MenuItem value={v.id} key={v.id}>
              {v.data().name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}
