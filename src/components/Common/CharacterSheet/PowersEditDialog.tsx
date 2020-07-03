import { makeStyles } from "@material-ui/core/styles";
import {
  Character,
  makeId,
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
import { DragPreviewImage, useDrag, useDrop } from "react-dnd";

const transparentPixel =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=";
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
  noHover: {
    cursor: "pointer",
  },
  hover: {
    cursor: "pointer",
    backgroundColor: "rgba(0,255,0,0.25)",
  },
  hoverFromBase: {
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  dragging: {
    opacity: 0.4,
  },
}));

interface Item {
  type: string;
  id: string;
  originalIndex: string;
}

function PowerTextEdit({
  powerId,
  text,
  nextText,
  index,
  hover,
  setHover,
  reorder,
}: {
  powerId: string;
  text: PowerText;
  nextText: PowerText | undefined;
  index: number;
  hover: string | null;
  setHover(id: string | null): void;
  reorder(from: string, to: string): void;
}) {
  const powerStyles = usePowerStyles();
  const styles = useTextStyles();
  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: powerId, id: text.id, originalIndex: index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const [data] = useState({ lastMoveId: "" });

  const [, drop] = useDrop({
    accept: powerId,
    canDrop: () => false,
    hover({ id: draggedId }: Item) {
      if (draggedId !== text.id && draggedId !== data.lastMoveId) {
        data.lastMoveId = draggedId;
        reorder(draggedId, text.id);
        setTimeout(() => {
          data.lastMoveId = "";
        }, 2000);
      }
    },
  });

  const hoverClass = [
    hover === text.id
      ? text.fromBase
        ? styles.hoverFromBase
        : styles.hover
      : text.fromBase
      ? ""
      : styles.noHover,
    isDragging ? styles.dragging : "",
  ]
    .filter((v) => v)
    .join(" ");

  function onMouseEnter() {
    setHover(text.id);
  }

  function onMouseLeave() {
    if (hover === text.id) {
      setHover(null);
    }
  }

  function ref(node: HTMLElement) {
    text.fromBase ? drop(node) : drag(drop(node));
  }

  return (
    <CheckOrLabel
      className={[
        powerStyles.powerText,
        ...(text.optional
          ? [
              powerStyles.powerOptional,
              nextText?.text[0]?.match(/[A-Za-z]/)
                ? powerStyles.nextNotOptional
                : null,
            ]
          : [null]),
      ]
        .filter((v) => v)
        .join(" ")}
      optional={text.optional}
      text={
        text.optional && index !== 0 ? (
          <>
            <div className={powerStyles.leftParen}>(</div>
            <span
              className={hoverClass}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              ref={ref}
            >
              <DragPreviewImage connect={preview} src={transparentPixel} />
              {text.text}
            </span>
            )
          </>
        ) : (
          <span
            className={hoverClass}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            ref={ref}
          >
            <DragPreviewImage connect={preview} src={transparentPixel} />
            {text.text}
          </span>
        )
      }
      name={`power-${text.id}`}
      allowCharacterEdit={false}
    />
  );
}

function PowerList({
  power,
  hover,
  setHover,
  reorder,
  addText,
}: {
  power: Power;
  hover: string | null;
  setHover(id: string | null): void;
  reorder(powerId: string, from: string, to: string): void;
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

function PowerDisplay({
  width,
  upconvert: converted,
  powers,
  base,
  hover,
  setHover,
  reorder,
  addText,
}: {
  width: string;
  upconvert?: boolean;
  powers: Powers<Power[]> & { name?: string };
  base?: Powers<Power[]>;
  hover: string | null;
  setHover(id: string | null): void;
  reorder(powerId: string, from: string, to: string): void;
  addText(powerId: string): void;
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
        />
      ))}
    </div>
  );
}

function reorderPowers<T extends Powers<Power[]>>(
  roleOrBase: T,
  powerId: string,
  from: string,
  to: string
): T {
  return {
    ...roleOrBase,
    powers: roleOrBase.powers.map((v) => {
      const result = [...v.texts];
      const moved = result.splice(
        v.texts.findIndex((w) => w.id === from),
        1
      );
      result.splice(
        v.texts.findIndex((w) => w.id === to),
        0,
        moved[0]
      );
      if (v.id === powerId) {
        return {
          ...v,
          texts: result,
        };
      } else {
        return v;
      }
    }),
  };
}

function addText<T extends Powers<Power[]>>(
  roleOrBase: T,
  powerId: string,
  fromBase: boolean,
  id: string
): T {
  return {
    ...roleOrBase,
    powers: roleOrBase.powers.map((v) => {
      if (v.id === powerId) {
        return {
          ...v,
          texts: [
            ...v.texts,
            {
              optional: false,
              text: "New Text",
              fromBase,
              id,
            },
          ],
        };
      } else {
        return v;
      }
    }),
  };
}

export function PowersEditDialog({
  character,
  onClose,
  updateCharacter,
}: {
  character: Character;
  onClose(): void;
  updateCharacter(character: Character): void;
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
            reorder={(powerId: string, from: string, to: string) => {
              updateCharacter({
                ...character,
                base: reorderPowers(base, powerId, from, to),
                roles: roles.map((v) => reorderPowers(v, powerId, from, to)),
              });
            }}
            addText={(powerId: string) => {
              const id = makeId();
              updateCharacter({
                ...character,
                base: addText(base, powerId, false, id),
                roles: roles.map((v) => addText(v, powerId, true, id)),
              });
            }}
          />
          {roles.map((role) => (
            <PowerDisplay
              width={width}
              powers={role}
              base={base}
              hover={hover}
              setHover={setHover}
              reorder={(powerId: string, from: string, to: string) => {
                updateCharacter({
                  ...character,
                  base,
                  roles: roles.map((v) => {
                    if (v === role) {
                      return reorderPowers(role, powerId, from, to);
                    } else {
                      return v;
                    }
                  }),
                });
              }}
              addText={(powerId: string) => {
                updateCharacter({
                  ...character,
                  base,
                  roles: roles.map((v) => {
                    if (v === role) {
                      return addText(role, powerId, false, makeId());
                    } else {
                      return v;
                    }
                  }),
                });
              }}
            />
          ))}
        </div>
      </DialogContent>
    </>
  );
}
