import React, { ReactNode } from "react";
import { Checkbox, FormControlLabel, Typography } from "@material-ui/core";
import { useStyles } from "./Powers";

export function CheckOrLabel({
  optional,
  text,
  name,
  allowCharacterEdit,
  className,
}: {
  optional: boolean;
  text: ReactNode;
  name: string;
  allowCharacterEdit: boolean | undefined;
  className?: string;
}) {
  const styles = useStyles();

  return optional ? (
    <FormControlLabel
      className={className}
      control={
        <Checkbox
          checked={false}
          onChange={() => {}}
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
