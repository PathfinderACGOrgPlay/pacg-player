import { makeStyles } from "@material-ui/core/styles";

export const usePowerStyles = makeStyles((theme) => ({
  powerText: {
    marginLeft: 3,
    marginRight: 0,
    display: "inline !important",
    position: "relative",

    "& .MuiFormControlLabel-label": {
      color: theme.palette.text.primary,
    },

    "& .MuiIconButton-root": {
      padding: 0,
    },
  },
  powerOptional: {
    marginLeft: 8,
  },
  nextNotOptional: {
    marginRight: 5,
  },
  leftParen: {
    display: "inline-block",
    marginLeft: -27,
    marginRight: 21,
  },
}));
