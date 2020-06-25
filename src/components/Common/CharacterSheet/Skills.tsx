import React, { useState, MouseEvent, ChangeEvent } from "react";
import {
  CardListRow,
  Character,
  Skill,
  useCharacter,
  useUpdateCharacter,
} from "../../../firestore/wiki/character";
import {
  CircularProgress,
  Container,
  Typography,
  Link,
  Tabs,
  Tab,
  ButtonGroup,
  IconButton,
} from "@material-ui/core";
import { ErrorDisplay } from "../ErrorDisplay";
import { makeStyles } from "@material-ui/core/styles";
import { Checkboxes } from "./Checkboxes";
import { Powers } from "./Powers";
import { useCharacterStyles } from "./common";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import { useDebounceUpdate } from "../useDebounceUpdate";
import { useCardSystem } from "../../../firestore/wiki/card-systems";
import { useDeck } from "../../../firestore/wiki/deck";
import { UploadField } from "../UploadField";
import { CardsList } from "./CardsList";
import { WikiEditTextField } from "./WikiEditTextField";
import { WikiEditAutoInsertDropdown } from "./WikiEditAutoInsertDropdown";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import DeleteIcon from "@material-ui/icons/Delete";

const useContainerStyles = makeStyles((theme) => ({
  container: {
    display: "grid",
    gridTemplateColumns: "auto auto auto",
    gridTemplateRows: "auto auto auto",
    gap: "1em 1em",
    maxWidth: "100%",
  },
  header: {
    gridColumnStart: 1,
    gridColumnEnd: 2,
    gridRowStart: 1,
    gridRowEnd: 3,
    textAlign: "center",
  },
  description: {
    gridColumnStart: 2,
    gridColumnEnd: 4,
    gridRowStart: 1,
    gridRowEnd: 2,
  },
  skills: {
    whiteSpace: "nowrap",
    display: "flex",
    flexDirection: "column",
    width: "min-content",
    gridColumnStart: 2,
    gridColumnEnd: 3,
    gridRowStart: 2,
    gridRowEnd: 3,
  },
  powers: {
    gridColumnStart: 1,
    gridColumnEnd: 4,
    gridRowStart: 3,
    gridRowEnd: 4,
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },
  cards: {
    whiteSpace: "nowrap",
    gridColumnStart: 3,
    gridColumnEnd: 4,
    gridRowStart: 2,
    gridRowEnd: 3,
    width: "100%",
  },
}));

const useStyles = makeStyles((theme) => ({
  die: {
    ".MuiFormControl-root&": {
      width: "2em",
    },
  },
  subSkillLabel: {
    display: "inline-block",
  },
  plusEdit: {
    marginTop: theme.spacing(0.5),
  },
}));

const defaultOrder: { [key: string]: number } = {
  Strength: 0,
  Dexterity: 1,
  Constitution: 2,
  Intelligence: 3,
  Wisdom: 4,
  Charisma: 5,
};

function SubSkill({
  subSkillName,
  value,
  wikiEdit,
  updateName,
  updateValue,
  remove,
}: {
  subSkillName: string;
  value: number;
  wikiEdit: boolean | undefined;
  updateName(value: string): void;
  updateValue(value: number): void;
  remove(): void;
}) {
  const styles = useStyles();

  return (
    <>
      <WikiEditTextField
        className={styles.subSkillLabel}
        wikiEdit={wikiEdit}
        {...useDebounceUpdate(
          subSkillName || "",
          (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
          updateName
        )}
      />
      <Typography
        className={`${styles.subSkillLabel} ${wikiEdit ? styles.plusEdit : ""}`}
      >
        : +
      </Typography>
      <WikiEditTextField
        className={styles.subSkillLabel}
        wikiEdit={wikiEdit}
        number
        {...useDebounceUpdate(
          value || 0,
          (e: ChangeEvent<HTMLInputElement>) => {
            const result = parseInt(e.currentTarget.value, 10);
            if (isNaN(result)) {
              return e.currentTarget.value;
            }
            return result;
          },
          (value) => {
            if (typeof value === "number") {
              updateValue(value);
            }
          }
        )}
      />
      {wikiEdit ? (
        <IconButton
          size="small"
          onClick={() => remove()}
          className={`${styles.subSkillLabel} ${styles.plusEdit}`}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ) : null}
    </>
  );
}

function SkillsLine({
  name,
  wikiEdit,
  row,
  update,
  updateName,
  remove,
  allowCharacterEdit,
}: {
  name: string;
  wikiEdit: boolean | undefined;
  row: Skill;
  update(row: Skill): void;
  updateName(name: string): void;
  remove(): void;
  allowCharacterEdit: boolean | undefined;
}) {
  const characterStyles = useCharacterStyles();
  const styles = useStyles();
  return (
    <div className={characterStyles.listItem}>
      <WikiEditTextField
        className={characterStyles.listName}
        wikiEdit={wikiEdit}
        {...useDebounceUpdate(
          name || "",
          (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
          (name) => updateName(name)
        )}
        fullWidth
      >
        {Object.keys(row.skills)
          .sort()
          .map((w, i) => (
            <Typography
              key={`${name}-${i}`}
              className={characterStyles.skillsExtra}
            >
              <SubSkill
                wikiEdit={wikiEdit}
                subSkillName={w}
                value={row.skills[w]}
                updateName={(name) => {
                  if (row && name) {
                    const result = {
                      ...row,
                      skills: { ...row.skills },
                    };
                    delete result.skills[w];
                    result.skills[name] = row.skills[w];
                    update(result);
                  }
                }}
                updateValue={(value) => {
                  if (row) {
                    update({
                      ...row,
                      skills: { ...row.skills, [w]: value },
                    });
                  }
                }}
                remove={() => {
                  if (row && name) {
                    const result = {
                      ...row,
                      skills: { ...row.skills },
                    };
                    delete result.skills[w];
                    update(result);
                  }
                }}
              />
            </Typography>
          ))}
        {wikiEdit ? (
          <>{Object.keys(row.skills).length ? null : <br />}<IconButton
            onClick={() => {
              if (row) {
                update({
                  ...row,
                  skills: {
                    ...row.skills,
                    Skill: 0,
                  },
                });
              }
            }}
          >
            <AddIcon />
          </IconButton></>
        ) : null}
      </WikiEditTextField>
      <WikiEditTextField
        className={`${characterStyles.listBase} ${styles.die}`}
        wikiEdit={wikiEdit}
        number
        {...useDebounceUpdate(
          row.die || "",
          (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
          (die) => {
            update({ ...row, die });
          }
        )}
        fullWidth
      />
      <Checkboxes
        count={row.feats}
        prefix=""
        base={row.feats + 1}
        disabled={!allowCharacterEdit}
      />
      {wikiEdit ? (
        <>
          <ButtonGroup className={characterStyles.listButtons}>
            <IconButton
              size="small"
              onClick={() => update({ ...row, feats: row.feats + 1 })}
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() =>
                update({ ...row, feats: Math.max(row.feats - 1, 0) })
              }
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </ButtonGroup>
          <span className={characterStyles.listSeparator}>&nbsp;</span>
          <IconButton
            size="small"
            onClick={() => remove()}
            className={characterStyles.listButtons}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      ) : null}
    </div>
  );
}

export function Skills({
  allowCharacterEdit,
  wikiEdit,
  characterData,
  updateCharacter,
}: {
  allowCharacterEdit: boolean | undefined;
  wikiEdit: boolean;
  characterData: Character | undefined;
  updateCharacter(character: Character): void;
}) {
  const characterStyles = useCharacterStyles();

  return (
    <>
      <Typography className={characterStyles.listHeader}>Skills</Typography>
      {(characterData?.skills &&
        Object.keys(characterData.skills)
          .sort(
            (a, b) =>
              (characterData.skills[a].order ?? defaultOrder[a] ?? 99) -
              (characterData.skills[b].order ?? defaultOrder[b] ?? 99)
          )
          .map((v) => (
            <SkillsLine
              key={v}
              row={characterData.skills[v]}
              allowCharacterEdit={allowCharacterEdit}
              name={v}
              wikiEdit={wikiEdit}
              update={(row) => {
                if (characterData) {
                  updateCharacter({
                    ...characterData,
                    skills: {
                      ...characterData.skills,
                      [v]: row,
                    },
                  });
                }
              }}
              updateName={(name) => {
                if (characterData && name) {
                  const update = {
                    ...characterData,
                    skills: { ...characterData.skills },
                  };
                  delete update.skills[v];
                  update.skills[name] = {
                    order: defaultOrder[v] || 99,
                    ...characterData.skills[v],
                  };
                  updateCharacter(update);
                }
              }}
              remove={() => {
                if (characterData) {
                  const update = {
                    ...characterData,
                    skills: { ...characterData.skills },
                  };
                  delete update.skills[v];
                  updateCharacter(update);
                }
              }}
            />
          ))) ||
        null}
      {wikiEdit ? (
        <div>
          <IconButton
            onClick={() => {
              if (characterData) {
                updateCharacter({
                  ...characterData,
                  skills: {
                    ...characterData.skills,
                    Skill: {
                      die: "",
                      skills: {},
                      feats: 0,
                      order: Object.keys(characterData.skills).length,
                    },
                  },
                });
              }
            }}
          >
            <AddIcon />
          </IconButton>
        </div>
      ) : null}
    </>
  );
}
