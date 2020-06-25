import React, { ChangeEvent } from "react";
import { CardListRow, Character } from "../../../firestore/wiki/character";
import { Typography, ButtonGroup, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Checkboxes } from "./Checkboxes";
import { useCharacterStyles } from "./common";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import DeleteIcon from "@material-ui/icons/Delete";
import { useDebounceUpdate } from "../useDebounceUpdate";
import { WikiEditTextField } from "./WikiEditTextField";

const useStyles = makeStyles((theme) => ({
  favoredCardType: {
    float: "right",

    "& > p": {
      display: "inline-block",
    },

    "& > div": {
      width: theme.spacing(10),
    },
  },
}));

const defaultOrder: { [key: string]: number } = {
  Weapon: 0,
  Spell: 1,
  Armor: 2,
  Item: 3,
  Ally: 4,
  Blessing: 5,
};

function CardsLine({
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
  row: CardListRow;
  update(row: CardListRow): void;
  updateName(name: string): void;
  remove(): void;
  allowCharacterEdit: boolean | undefined;
}) {
  const characterStyles = useCharacterStyles();
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
      />
      <WikiEditTextField
        className={characterStyles.listBase}
        wikiEdit={wikiEdit}
        text={row.base || "-"}
        number
        {...useDebounceUpdate(
          row.base || 0,
          (e: ChangeEvent<HTMLInputElement>) => {
            const result = parseInt(e.currentTarget.value, 10);
            if (isNaN(result)) {
              return e.currentTarget.value;
            }
            return result;
          },
          (base) => {
            if (typeof base === "number") {
              update({ ...row, base });
            }
          }
        )}
        fullWidth
      />
      <Checkboxes
        count={row.add}
        prefix=""
        base={row.base + 1}
        disabled={!allowCharacterEdit}
      />
      {wikiEdit ? (
        <>
          <ButtonGroup className={characterStyles.listButtons}>
            <IconButton
              size="small"
              onClick={() => update({ ...row, add: row.add + 1 })}
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => update({ ...row, add: Math.max(row.add - 1, 0) })}
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

export function CardsList({
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
  const styles = useStyles();

  if (characterData?.extraCardsText.FavoredCardType) {
    characterData.favoredCardType =
      characterData?.extraCardsText.FavoredCardType;
  }

  return (
    <>
      <Typography className={characterStyles.listHeader}>
        Cards List
        <div className={styles.favoredCardType}>
          Favored Card Type:{" "}
          <WikiEditTextField
            wikiEdit={wikiEdit}
            size="small"
            {...useDebounceUpdate(
              characterData?.favoredCardType || "",
              (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
              (favoredCardType) => {
                if (characterData) {
                  const update = {
                    ...characterData,
                    favoredCardType,
                  };
                  if (update.extraCardsText.FavoredCardType) {
                    const { FavoredCardType, ...rest } = update.extraCardsText;
                    update.extraCardsText = rest;
                  }
                  updateCharacter(update);
                }
              }
            )}
          />
        </div>
      </Typography>
      {(characterData?.cardsList &&
        Object.keys(characterData.cardsList)
          .sort(
            (a, b) =>
              (characterData.cardsList[a].order ?? defaultOrder[a] ?? 99) -
              (characterData.cardsList[b].order ?? defaultOrder[b] ?? 99)
          )
          .map((v) => (
            <CardsLine
              key={v}
              row={characterData.cardsList[v]}
              allowCharacterEdit={allowCharacterEdit}
              name={v}
              wikiEdit={wikiEdit}
              update={(row) => {
                if (characterData) {
                  updateCharacter({
                    ...characterData,
                    cardsList: {
                      ...characterData.cardsList,
                      [v]: row,
                    },
                  });
                }
              }}
              updateName={(name) => {
                if (characterData && name) {
                  const update = {
                    ...characterData,
                    cardsList: { ...characterData.cardsList },
                  };
                  delete update.cardsList[v];
                  update.cardsList[name] = {
                    order: defaultOrder[v] || 99,
                    ...characterData.cardsList[v],
                  };
                  updateCharacter(update);
                }
              }}
              remove={() => {
                if (characterData) {
                  const update = {
                    ...characterData,
                    cardsList: { ...characterData.cardsList },
                  };
                  delete update.cardsList[v];
                  updateCharacter(update);
                }
              }}
            />
          ))) ||
        null}
      {wikiEdit ? (
        <IconButton
          onClick={() => {
            if (characterData) {
              updateCharacter({
                ...characterData,
                cardsList: {
                  ...characterData.cardsList,
                  "Card Type": {
                    add: 0,
                    base: 0,
                    order: Object.keys(characterData.cardsList).length,
                  },
                },
              });
            }
          }}
        >
          <AddIcon />
        </IconButton>
      ) : null}
    </>
  );
}
