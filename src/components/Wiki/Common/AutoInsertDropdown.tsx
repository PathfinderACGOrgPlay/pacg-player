import { TextField } from "@material-ui/core";
import { useDebounceUpdate } from "../../Common/useDebounceUpdate";
import React, { ChangeEvent } from "react";
import { selectLoadingComponent } from "../../Common/selectLoadingComponent";
import { Autocomplete, createFilterOptions } from "@material-ui/lab";

const filter = createFilterOptions<string>();

export function AutoInsertDropdown({
  id,
  options,
  label,
  multiple,
  onAddOption,
  onChange,
  value,
  loading,
}: {
  id: string;
  options: string[];
  label: string;
  value: string | string[];
  onChange(newValue: string | string[]): void;
  onAddOption(newValue: string): void;
  multiple?: boolean;
  loading?: boolean;
}) {
  return (
    <Autocomplete
      id={id}
      filterOptions={(options, params) => {
        const filtered: (string | { label: string; value: string })[] = filter(
          options as string[],
          params
        );

        // Suggest the creation of a new value
        if (params.inputValue !== "") {
          filtered.push({
            label: `Add "${params.inputValue}"`,
            value: params.inputValue,
          });
        }

        return (filtered as unknown) as string[];
      }}
      options={options}
      getOptionLabel={(option) =>
        ((option as unknown) as { label: string }).label || (option as string)
      }
      clearOnBlur
      selectOnFocus
      handleHomeEndKeys
      freeSolo
      multiple={multiple}
      renderInput={(params) => <TextField {...params} label={label} />}
      value={value}
      onChange={(e, newValue) => {
        let val: string | string[];
        if (multiple) {
          val = (newValue as string[]).map((v) => {
            const newVal =
              ((v as unknown) as { value: string }).value || (v as string);
            if (options.indexOf(newVal) === -1) {
              onAddOption(newVal);
            }
            return newVal;
          });
        } else {
          val =
            (newValue &&
              (((newValue as unknown) as { value: string }).value ||
                (newValue as string))) ||
            "";
          if (val && options.indexOf(val) === -1) {
            onAddOption(val);
          }
        }
        onChange(val || (multiple ? [] : ""));
      }}
      popupIcon={selectLoadingComponent(!!loading)}
    />
  );
}
