import { useCommonStyles } from "./common";
import { Checkboxes } from "./Checkboxes";
import React from "react";
import { Typography } from "@material-ui/core";

export function DeckList({
  cardsList,
  extraCardsText,
  values,
  setValues,
  disabled,
}: {
  cardsList: {
    [key: string]: {
      base: number;
      add: number;
    };
  };
  extraCardsText: { [key: string]: string };
  values?: { [type: string]: boolean[] };
  setValues(values?: { [type: string]: boolean[] }): void;
  disabled: boolean;
}) {
  const commonStyles = useCommonStyles();
  return (
    <>
      <Typography className={commonStyles.center}>Deck List</Typography>
      <Typography className={commonStyles.center}>
        <b>Favored Card Type:</b> {extraCardsText.FavoredCardType}
      </Typography>
      {Object.keys(cardsList).map((v) => (
        <div className={commonStyles.columns}>
          <Typography className={commonStyles.column1}>{v}</Typography>
          <Typography className={commonStyles.column2}>
            {cardsList[v].base || "-"}
          </Typography>
          <Checkboxes
            count={cardsList[v].add}
            values={values?.[v] || []}
            update={(idx, checked) => {
              const newValues = { ...(values || {}) };
              newValues[v] = { ...(newValues[v] || []) };
              newValues[v][idx] = checked;
              setValues(newValues);
            }}
            prefix=""
            base={cardsList[v].base + 1}
            disabled={disabled}
          />
        </div>
      ))}
      {Object.keys(extraCardsText)
        .filter((v) => v !== "FavoredCardType")
        .map((v) => (
          <Typography key={v}>
            {v}: {extraCardsText[v]}
          </Typography>
        ))}
    </>
  );
}
