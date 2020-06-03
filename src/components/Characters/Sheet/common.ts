import { PlayerCharacter } from "../../../firestore/characters";
import characters from "../../../oldData/characters.json";
import { makeStyles } from "@material-ui/core/styles";

export const roleResetValues: Partial<PlayerCharacter> = {
  roleHandSize: [],
  roleProficiencies: {},
  rolePowers: [],
};

export const resetValues: Partial<PlayerCharacter> = {
  Strength: [],
  Dexterity: [],
  Constitution: [],
  Intelligence: [],
  Wisdom: [],
  Charisma: [],
  handSize: [],
  proficiencies: {},
  powers: [],
  role: 2,
  deckList: {},
  ...roleResetValues,
};

export type CharacterType = typeof characters.Agna["Ranger Class Deck"];

export const useCommonStyles = makeStyles((theme) => ({
  fill: {
    width: "100%",
  },
  center: {
    textAlign: "center",
  },
  columns: {
    display: "flex",

    "& label:last-child": {
      marginRight: "0 !important",
    },
  },
  column1: {
    padding: "9px",
    width: "105px",
    fontWeight: 600,
  },
  column2: {
    padding: "9px",
    width: "44px",
  },
  column: {
    padding: "9px",
  },
}));
