import { makeStyles } from "@material-ui/core/styles";
import {
  Character,
  makeId,
  Power,
  Powers,
  PowerText,
  upConvertPowers,
} from "../../../../firestore/wiki/character";
import React, { useMemo, useState } from "react";
import {
  DialogContent,
  IconButton,
  Typography,
  AppBar,
  Toolbar,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { PowerDisplay } from "./PowerDisplay";

const useStyles = makeStyles((theme) => ({
  content: {
    display: "flex",
    flexDirection: "row",
  },
  header: {
    position: "relative",
  },
}));

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

function updateText<T extends Powers<Power[]>>(
  roleOrBase: T,
  powerId: string,
  text: PowerText
): T {
  return {
    ...roleOrBase,
    powers: roleOrBase.powers.map((v) => {
      if (v.id === powerId) {
        return {
          ...v,
          texts: v.texts.map((v) => {
            if (v.id === text.id) {
              return text;
            } else {
              return v;
            }
          }),
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
            reorder={(powerId, from, to) => {
              updateCharacter({
                ...character,
                base: reorderPowers(base, powerId, from, to),
                roles: roles.map((v) => reorderPowers(v, powerId, from, to)),
              });
            }}
            addText={(powerId) => {
              const id = makeId();
              updateCharacter({
                ...character,
                base: addText(base, powerId, false, id),
                roles: roles.map((v) => addText(v, powerId, true, id)),
              });
            }}
            updateText={(powerId, text) => {
              updateCharacter({
                ...character,
                base: updateText(base, powerId, text),
                roles: roles.map((v) => updateText(v, powerId, text)),
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
              addText={(powerId) => {
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
              updateText={(powerId, text) => {
                updateCharacter({
                  ...character,
                  base,
                  roles: roles.map((v) => {
                    if (v === role) {
                      return updateText(role, powerId, text);
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
