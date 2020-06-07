import characters from "../../../oldData/characters.json";
import { Typography } from "@material-ui/core";
import { Checkboxes } from "./Checkboxes";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { CharacterType, useCommonStyles } from "./common";
import { PlayerCharacter } from "../../../firestore/characters";
import { useCharacter } from "../../../firestore/wiki/character";
import { ErrorDisplay } from "../../Common/ErrorDisplay";

const useStyles = makeStyles((theme) => ({
  subskill: {
    marginLeft: theme.spacing(3),
  },
}));

export function Skills({
  data,
  disabled,
  update,
}: {
  data: PlayerCharacter;
  disabled: boolean;
  update(data: Partial<PlayerCharacter>): void;
}) {
  const styles = useStyles();
  const commonStyles = useCommonStyles();
  const [characterRecord, , charError] = useCharacter(
    data.systemId || "",
    data.deckId || "",
    data.characterId || ""
  );
  const character = characterRecord?.data();

  if (!character) {
    return <ErrorDisplay label="Failed to load character" error={charError} />;
  }

  return (
    <>
      <Typography className={commonStyles.center}>Skills</Typography>
      {(Object.keys(character.skills) as (keyof CharacterType["skills"])[]).map(
        (v) => (
          <>
            <div key={v} className={commonStyles.columns}>
              <Typography className={commonStyles.column1}>{v}</Typography>
              <Typography className={commonStyles.column2}>
                {character.skills[v].die}
              </Typography>
              <Checkboxes
                count={character.skills[v].feats}
                values={data![v] || []}
                update={(idx, checked) => {
                  const next = [...(data![v] || [])];
                  next[idx] = checked;
                  update({ [v]: next });
                }}
                prefix="+"
                base={1}
                disabled={disabled}
              />
            </div>
            {Object.keys(character.skills[v].skills)
              .sort()
              .map((w) => (
                <div className={styles.subskill} key={w}>
                  {w}: {v} +{(character.skills[v].skills as any)[w]}
                </div>
              ))}
          </>
        )
      )}
    </>
  );
}
