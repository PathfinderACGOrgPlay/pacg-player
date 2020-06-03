import { CharacterType, useCommonStyles } from "./common";
import { Checkboxes } from "./Checkboxes";
import React from "react";
import { Typography } from "@material-ui/core";

export function DeckList({
  cardsList,
  values,
  setValues,
  disabled,
}: {
  cardsList: CharacterType["cardsList"];
  values?: { [type: string]: boolean[] };
  setValues(values?: { [type: string]: boolean[] }): void;
  disabled: boolean;
}) {
  const commonStyles = useCommonStyles();
  const { favoredCardType, cohort, special, ...rest } = cardsList;
  return (
    <>
      <Typography className={commonStyles.center}>Deck List</Typography>
      <Typography className={commonStyles.center}>
        <b>Favored Card Type:</b> {favoredCardType}
      </Typography>
      {(Object.keys(rest) as (keyof typeof rest)[]).map((v) => (
        <div className={commonStyles.columns}>
          <Typography className={commonStyles.column1}>{v}</Typography>
          <Typography className={commonStyles.column2}>
            {rest[v].base || "-"}
          </Typography>
          <Checkboxes
            count={rest[v].add}
            values={values?.[v] || []}
            update={(idx, checked) => {
              const newValues = { ...(values || {}) };
              newValues[v] = { ...(newValues[v] || []) };
              newValues[v][idx] = checked;
              setValues(newValues);
            }}
            prefix=""
            base={rest[v].base + 1}
            disabled={disabled}
          />
        </div>
      ))}
      {special ? <Typography>Special: {special}</Typography> : null}
      {cohort ? <Typography>Cohort: {cohort}</Typography> : null}
    </>
  );
}
