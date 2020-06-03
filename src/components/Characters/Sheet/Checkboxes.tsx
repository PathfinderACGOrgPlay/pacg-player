import React from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";

export function Checkboxes({
  count,
  update,
  values,
  prefix,
  base,
  disabled,
}: {
  count: number;
  update(idx: number, value: boolean): void;
  values: boolean[];
  prefix: string;
  base: number;
  disabled?: boolean;
}) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(
      <FormControlLabel
        key={i}
        control={
          <Checkbox
            checked={values[i] || false}
            onChange={() => update(i, !values[i])}
            name={`${prefix}-${i}-${base}`}
            disabled={disabled || (i > 0 && !values[i - 1])}
          />
        }
        label={`${prefix}${i + base}`}
      />
    );
  }
  return <>{result}</>;
}
