import { Checkbox, FormControlLabel, Typography } from "@material-ui/core";
import { Checkboxes } from "./Checkboxes";
import React, { ReactNode, useMemo } from "react";
import { useCharacterStyles } from "./common";
import {
  Powers as PowersType,
  upConvertPowers,
} from "../../../firestore/wiki/character";
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  powerMargin: {
    marginLeft: 3,
    marginRight: 0,
  },
  checkName: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    marginLeft: 0,
    marginRight: 0,
    width: "10em",
    display: "inline-block",
  },
  powerText: {
    display: "inline",
    position: "relative",

    "& .MuiFormControlLabel-label": {
      color: theme.palette.text.primary,
    },

    "& .MuiIconButton-root": {
      padding: 0,
    },
  },
  leftParen: {
    display: "inline-block",
    marginLeft: -27,
    marginRight: 21,
  },
}));

function CheckOrLabel({
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

export function Powers({
  powers,
  allowCharacterEdit,
}: {
  powers: PowersType | undefined;
  allowCharacterEdit: boolean | undefined;
  wikiMode: boolean | undefined;
}) {
  const characterStyles = useCharacterStyles();
  const styles = useStyles();

  const [powersText, upConvert] = useMemo(
    () => upConvertPowers(powers?.powers),
    [powers]
  );

  return (
    <>
      <div className={characterStyles.listItem}>
        <Typography className={characterStyles.listName}>Hand Size</Typography>
        <Typography className={characterStyles.listBase}>
          {powers?.handSize.base}
        </Typography>
        <Checkboxes
          count={powers?.handSize.add || 0}
          prefix=""
          base={(powers?.handSize.base || 0) + 1}
          disabled={!allowCharacterEdit}
        />
      </div>
      <div className={characterStyles.listItem}>
        <Typography className={characterStyles.listName} component="span">
          Proficient With
        </Typography>
        {powers?.proficiencies.map((v) => (
          <CheckOrLabel
            key={v.name}
            optional={v.optional}
            text={v.name}
            name={`proficiency-${v}`}
            allowCharacterEdit={allowCharacterEdit}
          />
        ))}
      </div>
      {powersText?.map((v) => (
        <div className={characterStyles.listItem} key={v.id}>
          {v.texts.map((w, i) => (
            <CheckOrLabel
              className={`${styles.powerText} ${styles.powerMargin}`}
              key={w.id}
              optional={w.optional}
              text={
                w.optional && i !== 0 ? (
                  <>
                    <div className={styles.leftParen}>(</div>
                    {w.text})
                  </>
                ) : (
                  w.text
                )
              }
              name={`power-${w.id}`}
              allowCharacterEdit={allowCharacterEdit}
            />
          ))}
        </div>
      ))}
    </>
  );
}
