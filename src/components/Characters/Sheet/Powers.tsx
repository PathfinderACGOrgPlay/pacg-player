import React from "react";
import { useCommonStyles } from "./common";
import { Checkbox, FormControlLabel, Typography } from "@material-ui/core";
import { Checkboxes } from "./Checkboxes";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  powersCheck: {
    padding: theme.spacing(0.25),
  },
  firstRule: {
    marginTop: 0,
  },
}));

export function Powers({
  powers,
  powerCheckboxesValues,
  updatePowerCheckboxes,
  proficiencies,
  proficienciesValues,
  updateProficienciesValues,
  handSize,
  handSizeValues,
  updateHandSizeValues,
  disabled,
}: {
  powers: string[][];
  powerCheckboxesValues?: boolean[][];
  updatePowerCheckboxes(values: boolean[][]): void;
  proficiencies: { name: string; optional: boolean }[];
  proficienciesValues?: { [key: string]: boolean };
  updateProficienciesValues(values: { [key: string]: boolean }): void;
  handSize: { base: number; add: number };
  handSizeValues?: boolean[];
  updateHandSizeValues(values: boolean[]): void;
  disabled?: boolean;
}) {
  const commonStyles = useCommonStyles();
  const styles = useStyles();

  return (
    <>
      <div className={commonStyles.columns}>
        <Typography className={commonStyles.column1}>Hand Size</Typography>
        <Typography className={commonStyles.column2}>
          {handSize.base}
        </Typography>
        <Checkboxes
          count={handSize.add}
          values={handSizeValues || []}
          update={(idx, checked) => {
            const next = { ...(handSizeValues || []) };
            next[idx] = checked;
            updateHandSizeValues(next);
          }}
          prefix=""
          base={handSize.base + 1}
          disabled={disabled}
        />
      </div>
      <div className={commonStyles.columns}>
        <Typography className={commonStyles.column1}>Proficiencies</Typography>
        {proficiencies?.map((v) =>
          v.optional ? (
            <FormControlLabel
              key={v.name}
              control={
                <Checkbox
                  checked={proficienciesValues?.[v.name]}
                  onChange={() =>
                    updateProficienciesValues({
                      ...proficienciesValues,
                      [v.name]: !proficienciesValues?.[v.name],
                    })
                  }
                  disabled={disabled}
                  name={`proficiencies-${v.name}`}
                />
              }
              label={v.name}
            />
          ) : (
            <Typography className={commonStyles.column}>{v.name}</Typography>
          )
        )}
      </div>
      <hr className={styles.firstRule} />
      {powers.map((v, i) => (
        <Typography>
          {v.map((w, j) => (
            <>
              {j !== 0 ? (
                <Checkbox
                  className={styles.powersCheck}
                  disabled={disabled}
                  size="small"
                  checked={powerCheckboxesValues?.[i]?.[j - 1] || false}
                  onChange={() => {
                    const newPowers = { ...(powerCheckboxesValues || []) };
                    newPowers[i] = { ...(newPowers[i] || []) };
                    newPowers[i][j - 1] = !newPowers[i][j - 1];
                    updatePowerCheckboxes(newPowers);
                  }}
                />
              ) : null}
              {w}
            </>
          ))}
          <hr />
        </Typography>
      ))}
    </>
  );
}
