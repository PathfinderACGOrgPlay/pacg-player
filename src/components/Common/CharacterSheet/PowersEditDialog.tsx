import { makeStyles } from "@material-ui/core/styles";
import {
  Character,
  Power,
  Powers,
  PowerText,
  upConvertPowers,
} from "../../../firestore/wiki/character";
import React, { useMemo, useState } from "react";
import {
  ButtonGroup,
  Chip,
  DialogContent,
  FormLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  AppBar,
  Toolbar,
} from "@material-ui/core";
import { Checkboxes } from "./Checkboxes";
import { useCharacterStyles } from "./common";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import { CheckOrLabel } from "./CheckOrLabel";
import DeleteIcon from "@material-ui/icons/Delete";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import CloseIcon from "@material-ui/icons/Close";
import { usePowerStyles } from "./usePowerStyles";

const useStyles = makeStyles((theme) => ({
  baseLabel: {
    marginTop: theme.spacing(3),
    display: "block",
  },
  profInput: {
    width: "200px !important",
  },
  content: {
    display: "flex",
    flexDirection: "row",
  },
  convertWarning: {
    textAlign: "center",
  },
  header: {
    position: "relative",
  },
}));

const useTextStyles = makeStyles((theme) => ({
  hover: {
    backgroundColor: "rgba(0,0,0,0.5)",
  },
}));

function PowerTextEdit({
  text,
  nextText,
  index,
  hover,
  setHover,
}: {
  text: PowerText;
  nextText: PowerText | undefined;
  index: number;
  hover: string | null;
  setHover(id: string | null): void;
}) {
  const powerStyles = usePowerStyles();
  const styles = useTextStyles();
  const [selfHover, setSelfHover] = useState(false);

  return (
    <CheckOrLabel
      className={[
        powerStyles.powerText,
        ...(text.optional
          ? [
              powerStyles.powerOptional,
              nextText?.text[0].match(/[A-Za-z]/)
                ? powerStyles.nextNotOptional
                : null,
            ]
          : [null]),
        hover === text.id ? styles.hover : null,
      ]
        .filter((v) => v)
        .join(" ")}
      optional={text.optional}
      text={
        text.optional && index !== 0 ? (
          <>
            <div className={powerStyles.leftParen}>(</div>
            <span
              onMouseEnter={() => {
                setSelfHover(true);
                setHover(text.id);
              }}
              onMouseLeave={() => {
                setSelfHover(false);
                if (hover === text.id) {
                  setHover(null);
                }
              }}
            >
              {text.text}
            </span>
            )
          </>
        ) : (
          <span
            onMouseEnter={() => {
              setSelfHover(true);
              setHover(text.id);
            }}
            onMouseLeave={() => {
              setSelfHover(false);
              if (hover === text.id) {
                setHover(null);
              }
            }}
          >
            {text.text}
          </span>
        )
      }
      name={`power-${text.id}`}
      allowCharacterEdit={false}
    />
  );
}

function PowerDisplay({
  width,
  upconvert: converted,
  powers,
  base,
  hover,
  setHover,
}: {
  width: string;
  upconvert?: boolean;
  powers: Powers<Power[]> & { name?: string };
  base?: Powers<Power[]>;
  hover: string | null;
  setHover(id: string | null): void;
}) {
  const styles = useStyles();
  const characterStyles = useCharacterStyles();

  return (
    <div style={{ width }}>
      {base ? (
        <TextField label="Name" value={powers.name} />
      ) : (
        <FormLabel className={styles.baseLabel}>Base</FormLabel>
      )}
      <div className={characterStyles.listItem}>
        <Typography className={characterStyles.listName}>Hand Size</Typography>
        <Typography className={characterStyles.listBase}>
          {base ? (
            powers.handSize.base
          ) : (
            <TextField value={powers.handSize.base} />
          )}
        </Typography>
        <Checkboxes
          count={powers.handSize.add || 0}
          prefix=""
          base={(powers.handSize.base || 0) + 1}
          disabled={true}
        />
        <ButtonGroup className={characterStyles.listButtons}>
          <IconButton size="small">
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <RemoveIcon fontSize="small" />
          </IconButton>
        </ButtonGroup>
      </div>
      <div className={characterStyles.listItem}>
        <Typography className={characterStyles.listName} component="span">
          Proficient With
        </Typography>
        {powers.proficiencies.map((v) => (
          <>
            <CheckOrLabel
              key={v.name}
              className={styles.profInput}
              optional={v.optional}
              text={
                base?.proficiencies.find((w) => w.name === v.name) ? (
                  <div className={styles.profInput}>{v.name}</div>
                ) : (
                  <TextField
                    value={v.name}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <ButtonGroup size="small">
                            <IconButton title="Optional" size="small">
                              <CheckBoxIcon fontSize="small" />
                            </IconButton>
                            <IconButton title="Remove" size="small">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </ButtonGroup>
                        </InputAdornment>
                      ),
                    }}
                  />
                )
              }
              name={`proficiency-${v}`}
              allowCharacterEdit={false}
            />
            &nbsp;
          </>
        ))}
        <IconButton size="small" className={characterStyles.listButtons}>
          <AddIcon fontSize="small" />
        </IconButton>
      </div>
      {converted ? (
        <div className={styles.convertWarning}>
          <Chip
            style={{ visibility: base ? "hidden" : "visible" }}
            color="secondary"
            label="These powers were converted from a previous version and the roles may not be properly linked"
          />
        </div>
      ) : null}
      {powers.powers?.map((v) => (
        <div className={characterStyles.listItem} key={v.id}>
          {v.texts.map((w, i) => (
            <PowerTextEdit
              hover={hover}
              setHover={setHover}
              key={w.id}
              text={w}
              nextText={v.texts[i + 1]}
              index={i}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PowersEditDialog({
  character,
  onClose,
}: {
  character: Character;
  onClose(): void;
}) {
  const styles = useStyles();
  const width = `${100 / (character.roles.length + 1)}%`;
  const { base, roles, upconvert } = useMemo(
    () => upConvertPowers(character, true),
    [character]
  );
  const [hover, setHover] = useState<string | null>(null);

  return (
    <>
      <AppBar className={styles.header} color="default">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6">Edit Powers</Typography>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <div className={styles.content}>
          <PowerDisplay
            width={width}
            powers={base}
            upconvert={upconvert}
            hover={hover}
            setHover={setHover}
          />
          {roles.map((role) => (
            <PowerDisplay
              width={width}
              powers={role}
              base={base}
              hover={hover}
              setHover={setHover}
            />
          ))}
        </div>
      </DialogContent>
    </>
  );
}
