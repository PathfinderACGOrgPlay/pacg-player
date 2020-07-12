import { Dialog, IconButton, Typography, Chip, Slide } from "@material-ui/core";
import { Checkboxes } from "../Checkboxes";
import React, { useState } from "react";
import { useCharacterStyles } from "../common";
import type {
  Character,
  Power,
  Powers as PowersType,
} from "../../../../firestore/wiki/character";
import { makeStyles } from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";
import { PowersEditDialog } from "./PowersEditDialog";
import { CheckOrLabel } from "../CheckOrLabel";
import { TransitionProps } from "@material-ui/core/transitions";
import { usePowerStyles } from "./usePowerStyles";
import { PlayerCharacter } from "../../../../firestore/characters";

export const useStyles = makeStyles((theme) => ({
  leftParen: {
    display: "inline-block",
    marginLeft: -27,
    marginRight: 21,
  },
  editIcon: {
    position: "absolute",
    right: -48,
    top: -12,
  },
  convertWarning: {
    textAlign: "center",
  },
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function Powers({
  powers,
  allowCharacterEdit,
  wikiMode,
  characterRaw,
  converted,
  updateCharacter,
  playerCharacterData,
  updatePlayerCharacterData,
}: {
  powers: PowersType<Power[]> | undefined;
  allowCharacterEdit: boolean | undefined;
  wikiMode: boolean | undefined;
  characterRaw: Character | undefined;
  converted: boolean;
  updateCharacter(character: Character): void;
  playerCharacterData?: PlayerCharacter;
  updatePlayerCharacterData?(val: PlayerCharacter): void;
}) {
  const characterStyles = useCharacterStyles();
  const styles = useStyles();
  const powerStyles = usePowerStyles();
  const [editModal, setEditModal] = useState(false);

  return (
    <>
      {converted ? (
        <div className={styles.convertWarning}>
          <Chip
            color="secondary"
            label="These powers were converted from a previous version and the roles may not be properly linked"
          />
        </div>
      ) : null}
      {wikiMode ? (
        <>
          <Dialog
            fullScreen
            open={editModal}
            onClose={() => setEditModal(false)}
            TransitionComponent={Transition}
          >
            {editModal && characterRaw ? (
              <PowersEditDialog
                onClose={() => setEditModal(false)}
                character={characterRaw}
                updateCharacter={updateCharacter}
              />
            ) : null}
          </Dialog>
          <IconButton
            className={styles.editIcon}
            onClick={() => setEditModal(true)}
          >
            <EditIcon />
          </IconButton>
        </>
      ) : null}
      <div className={characterStyles.listItem}>
        <Typography className={characterStyles.listName}>Hand Size</Typography>
        <Typography className={characterStyles.listBase}>
          {powers?.handSize.base}
        </Typography>
        <Checkboxes
          count={powers?.handSize.add || 0}
          prefix=""
          namePrefix="handSize"
          base={(powers?.handSize.base || 0) + 1}
          disabled={!allowCharacterEdit}
          playerValue={playerCharacterData?.handSize}
          updatePlayerValue={
            playerCharacterData &&
            updatePlayerCharacterData &&
            ((handSize) =>
              updatePlayerCharacterData({
                ...playerCharacterData,
                handSize,
              }))
          }
        />
      </div>
      <div className={characterStyles.listItem}>
        <Typography className={characterStyles.listName} component="span">
          Proficient With
        </Typography>
        {powers?.proficiencies?.map((v) => (
          <CheckOrLabel
            key={v.name}
            optional={v.optional}
            text={v.name}
            name={`proficiency-${v}`}
            allowCharacterEdit={allowCharacterEdit}
          />
        ))}
      </div>
      {powers?.powers.map((v) => (
        <div className={characterStyles.listItem} key={v.id}>
          {v.texts.map((w, i) => (
            <CheckOrLabel
              className={`${powerStyles.powerText} ${
                w.optional ? powerStyles.powerOptional : ""
              } ${
                v.texts[i + 1]?.text[0]?.match(/[A-Za-z]/)
                  ? powerStyles.nextNotOptional
                  : ""
              }`}
              key={w.id}
              optional={w.optional}
              text={
                w.optional && i !== 0 ? (
                  <>
                    <div className={powerStyles.leftParen}>(</div>
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
