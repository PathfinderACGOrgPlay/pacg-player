import React, { useState, MouseEvent, ChangeEvent } from "react";
import {
  useCharacter,
  useUpdateCharacter,
} from "../../../firestore/wiki/character";
import {
  CircularProgress,
  Container,
  Typography,
  Button,
  ButtonGroup,
  Link,
  TextField,
  Tabs,
  Tab,
} from "@material-ui/core";
import { ErrorDisplay } from "../ErrorDisplay";
import { makeStyles } from "@material-ui/core/styles";
import { Checkboxes } from "./Checkboxes";
import { Powers } from "./Powers";
import { useCharacterStyles } from "./common";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import { useDebounceUpdate } from "../useDebounceUpdate";

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
  descriptionText: {
    width: "calc(100% - 170px)",
    display: "inline-block",
  },
  powersContent: {
    flexGrow: 1,
    flexShrink: 1,
  },
}));

const defaultOrder: { [key: string]: number } = {
  Weapon: 0,
  Spell: 1,
  Armor: 2,
  Item: 3,
  Ally: 4,
  Blessing: 5,
  Strength: 0,
  Dexterity: 1,
  Constitution: 2,
  Intelligence: 3,
  Wisdom: 4,
  Charisma: 5,
};

export function CharacterSheet({
  wikiMode,
  allowCharacterEdit,
  systemId,
  deckId,
  characterId,
}: {
  wikiMode?: boolean;
  allowCharacterEdit?: boolean;
  systemId: string;
  deckId: string;
  characterId: string;
}) {
  const [character, loading, error] = useCharacter(
    systemId,
    deckId,
    characterId
  );
  const characterData = character?.data();
  const characterStyles = useCharacterStyles();
  const containerStyles = useContainerStyles();
  const styles = useStyles();
  const [selectedPowers, setSelectedPowers] = useState(-1);
  const [wikiEdit, setWikiEdit] = useState(false);
  const [updateCharacter, updateError] = useUpdateCharacter(
    systemId,
    deckId,
    characterId
  );

  const descriptionFields = useDebounceUpdate(
    characterData?.description || "",
    (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
    (description) =>
      characterData &&
      updateCharacter({
        ...characterData,
        description,
      })
  );
  const nameFields = useDebounceUpdate(
    characterData?.name || "",
    (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
    (name) =>
      characterData &&
      updateCharacter({
        ...characterData,
        name,
      })
  );
  const imageFields = useDebounceUpdate(
    characterData?.image || "",
    (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
    (image) =>
      characterData &&
      updateCharacter({
        ...characterData,
        image,
      })
  );

  if (characterData?.extraCardsText.FavoredCardType) {
    characterData.favoredCardType =
      characterData?.extraCardsText.FavoredCardType;
  }

  return (
    <Container>
      {wikiMode ? (
        <Link
          className={characterStyles.mainEdit}
          href="#"
          onClick={(e: MouseEvent) => {
            e.preventDefault();
            setWikiEdit(!wikiEdit);
          }}
        >
          {wikiEdit ? <LockOpenIcon /> : <LockIcon />}
        </Link>
      ) : null}
      <ErrorDisplay label="Failed to load character" error={error} />
      <ErrorDisplay label="Failed to update character" error={updateError} />
      {loading ? (
        <CircularProgress />
      ) : (
        <div className={containerStyles.container}>
          <div className={containerStyles.header}>
            <div className={characterStyles.headerHighlight}>
              {wikiEdit ? (
                <TextField label="Name" {...nameFields} fullWidth />
              ) : (
                <Typography>{characterData?.name}</Typography>
              )}
              <Typography>{characterData?.traits.join(" ")}</Typography>
            </div>
            {characterData?.image ? (
              <img
                src={characterData.image}
                className={characterStyles.headerImage}
              />
            ) : null}
            {wikiEdit ? (
              <TextField label="Image" {...imageFields} fullWidth />
            ) : null}
          </div>
          <div className={containerStyles.description}>
            {wikiEdit ? (
              <TextField
                label="Description"
                {...descriptionFields}
                multiline
                fullWidth
                className={styles.descriptionText}
              />
            ) : (
              <div className={styles.descriptionText}>
                {characterData?.description}
              </div>
            )}
            <div className={characterStyles.logoWrap}>
              {/* TODO: Make this part of the system data */}
              <img
                src={require("./PacgLogo.png")}
                className={characterStyles.logo}
              />
              <br />
              {/* TODO: Make this part of the deck data */}
              <img
                src={require("./AlchemistClassDeck.png")}
                className={characterStyles.logo}
              />
            </div>
          </div>
          <div className={containerStyles.skills}>
            <Typography className={characterStyles.listHeader}>
              Skills
            </Typography>
            {(characterData?.skills &&
              Object.keys(characterData.skills)
                .sort(
                  (a, b) =>
                    (characterData.skills[a].order ?? defaultOrder[a] ?? 99) -
                    (characterData.skills[b].order ?? defaultOrder[b] ?? 99)
                )
                .map((v) => (
                  <div key={v} className={characterStyles.listItem}>
                    <Typography className={characterStyles.listName}>
                      {v}
                      {Object.keys(characterData.skills[v].skills)
                        .sort()
                        .map((w) => (
                          <Typography
                            key={`${v}-${w}`}
                            className={characterStyles.skillsExtra}
                          >
                            {w}: +{characterData.skills[v].skills[w]}
                          </Typography>
                        ))}
                    </Typography>
                    <Typography className={characterStyles.skillsBase}>
                      {characterData.skills[v].die}
                    </Typography>
                    <Checkboxes
                      count={characterData.skills[v].feats}
                      prefix="+"
                      base={1}
                      disabled={!allowCharacterEdit}
                    />
                  </div>
                ))) ||
              null}
          </div>
          <div className={containerStyles.powers}>
            <div>
              <Tabs orientation="vertical" value={selectedPowers}>
                <Tab
                  disabled={!allowCharacterEdit && !wikiMode}
                  onClick={() => setSelectedPowers(-1)}
                  value={-1}
                  label="Base"
                />
                {characterData?.roles.map((v, idx) => (
                  <Tab
                    disabled={!allowCharacterEdit && !wikiMode}
                    onClick={() => setSelectedPowers(idx)}
                    key={idx}
                    value={idx}
                    label={v.name}
                  />
                ))}
              </Tabs>
            </div>
            <div className={styles.powersContent}>
              <Typography className={characterStyles.listHeader}>
                Powers
              </Typography>
              <Powers
                powers={
                  selectedPowers === -1
                    ? characterData?.base
                    : characterData?.roles[selectedPowers]
                }
                allowCharacterEdit={allowCharacterEdit}
                wikiMode={wikiMode}
              />
            </div>
          </div>
          <div className={containerStyles.cards}>
            <Typography className={characterStyles.listHeader}>
              Cards List
              <div className={characterStyles.favoredCardType}>
                Favored Card Type: {characterData?.favoredCardType}
              </div>
            </Typography>
            {(characterData?.cardsList &&
              Object.keys(characterData.cardsList)
                .sort(
                  (a, b) =>
                    (characterData.cardsList[a].order ??
                      defaultOrder[a] ??
                      99) -
                    (characterData.cardsList[b].order ?? defaultOrder[b] ?? 99)
                )
                .map((v) => (
                  <div key={v} className={characterStyles.listItem}>
                    <Typography className={characterStyles.listName}>
                      {v}
                    </Typography>
                    <Typography className={characterStyles.listBase}>
                      {characterData.cardsList[v].base || "-"}
                    </Typography>
                    <Checkboxes
                      count={characterData.cardsList[v].add}
                      prefix=""
                      base={characterData.cardsList[v].base + 1}
                      disabled={!allowCharacterEdit}
                    />
                  </div>
                ))) ||
              null}
          </div>
        </div>
      )}
    </Container>
  );
}
