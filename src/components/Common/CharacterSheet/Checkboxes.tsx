import React from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";

export function Checkboxes({
  count,
  prefix,
  namePrefix,
  base,
  disabled,
  playerValue,
  updatePlayerValue,
}: {
  count: number;
  prefix: string;
  namePrefix?: string;
  base: number;
  disabled?: boolean;
  playerValue: number | undefined;
  updatePlayerValue?(value: number): void;
}) {
  playerValue = playerValue ?? -1;
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(
      <FormControlLabel
        key={i}
        control={
          <Checkbox
            checked={playerValue >= i}
            onChange={
              updatePlayerValue &&
              (() => {
                if (playerValue! >= i) {
                  updatePlayerValue(i - 1);
                } else {
                  updatePlayerValue(i);
                }
              })
            }
            name={`${namePrefix || prefix}-${i}`}
            disabled={disabled}
          />
        }
        label={`${prefix}${i + base}`}
      />
    );
  }
  return <>{result}</>;
}
