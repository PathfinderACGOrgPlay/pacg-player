import type {
  Power,
  Powers,
  PowerText,
} from "../../../../../firestore/wiki/character";
import { useCharacterStyles } from "../../common";
import { useDrop } from "react-dnd";
import { PowerTextEdit } from "./PowerTextEdit";
import {
  ButtonGroup,
  Chip,
  FormLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { Checkboxes } from "../../Checkboxes";
import RemoveIcon from "@material-ui/icons/Remove";
import { CheckOrLabel } from "../../CheckOrLabel";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import DeleteIcon from "@material-ui/icons/Delete";
import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  baseLabel: {
    marginTop: theme.spacing(3),
    display: "block",
  },
  profInput: {
    width: "200px !important",
  },
  convertWarning: {
    textAlign: "center",
  },
}));

function PowerList({
  power,
  hover,
  setHover,
  reorder,
  addText,
  updateText,
  removeText,
}: {
  power: Power;
  hover: string | null;
  setHover(id: string | null): void;
  reorder(powerId: string, from: string, to: string): void;
  updateText(powerId: string, text: PowerText): void;
  removeText(powerId: string, textId: string): void;
  addText(powerId: string): void;
}) {
  const characterStyles = useCharacterStyles();
  const [, drop] = useDrop({ accept: power.id });

  return (
    <div ref={drop} className={characterStyles.listItem}>
      {power.texts.map((w, i) => (
        <PowerTextEdit
          powerId={power.id}
          hover={hover}
          setHover={setHover}
          key={w.id}
          text={w}
          nextText={power.texts[i + 1]}
          index={i}
          onChange={(text) => updateText(power.id, text)}
          onDelete={(textId) => removeText(power.id, textId)}
          reorder={(from, to) => reorder(power.id, from, to)}
        />
      ))}
      <IconButton size="small">
        <AddIcon
          fontSize="small"
          fontSizeAdjust={-1}
          onClick={() => addText(power.id)}
        />
      </IconButton>
    </div>
  );
}

export function PowerDisplay({
  width,
  upconvert: converted,
  powers,
  base,
  hover,
  setHover,
  reorder,
  addText,
  updateText,
  removeText,
}: {
  width: string;
  upconvert?: boolean;
  powers: Powers<Power[]> & { name?: string };
  base?: Powers<Power[]>;
  hover: string | null;
  setHover(id: string | null): void;
  reorder(powerId: string, from: string, to: string): void;
  addText(powerId: string): void;
  updateText(powerId: string, text: PowerText): void;
  removeText(powerId: string, textId: string): void;
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
          namePrefix="handSize"
          prefix=""
          base={(powers.handSize.base || 0) + 1}
          disabled={true}
          playerValue={undefined}
          updatePlayerValue={undefined}
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
        {powers.proficiencies?.map((v) => (
          <>
            <CheckOrLabel
              key={v.name}
              className={styles.profInput}
              optional={v.optional}
              text={
                base?.proficiencies?.find((w) => w.name === v.name) ? (
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
        <PowerList
          power={v}
          hover={hover}
          setHover={setHover}
          reorder={reorder}
          addText={addText}
          removeText={removeText}
          updateText={updateText}
        />
      ))}
    </div>
  );
}
