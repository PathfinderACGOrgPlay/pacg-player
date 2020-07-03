import React from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";

export function Checkboxes({
  count,
  update,
  values,
  prefix,
  namePrefix,
  base,
  disabled,
}: {
  count: number;
  update?(idx: number, value: boolean): void;
  values?: boolean[];
  prefix: string;
  namePrefix?: string;
  base: number;
  disabled?: boolean;
}) {
  values = values || [];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(
      <FormControlLabel
        key={i}
        control={
          <Checkbox
            checked={values[i] || false}
            onChange={() => update && update(i, !!values && !values[i])}
            name={`${namePrefix || prefix}-${i}`}
            disabled={
              disabled ||
              (i > 0 && !values[i - 1]) ||
              (i < count - 1 && values[i + 1])
            }
          />
        }
        label={`${prefix}${i + base}`}
      />
    );
  }
  return <>{result}</>;
}
