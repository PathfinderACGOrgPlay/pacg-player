import React, { ReactNode } from "react";
import { Checkbox, FormControlLabel, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  checkName: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    marginLeft: 0,
    marginRight: 0,
    width: "10em",
    display: "inline-block",
  },
}));

export function CheckOrLabel({
  optional,
  text,
  name,
  allowCharacterEdit,
  className,
  checked,
  setChecked,
}: {
  optional: boolean;
  text: ReactNode;
  name: string;
  allowCharacterEdit: boolean | undefined;
  className?: string;
  checked?: boolean;
  setChecked?(newValue: boolean): void;
}) {
  const styles = useStyles();

  return optional ? (
    <FormControlLabel
      className={className}
      control={
        <Checkbox
          checked={checked}
          onChange={setChecked && (() => setChecked(!checked))}
          name={name}
          disabled={!allowCharacterEdit}
        />
      }
      label={text}
    />
  ) : (
    <Typography className={`${className || ""} ${styles.checkName}`}>
      {text}
    </Typography>
  );
}
