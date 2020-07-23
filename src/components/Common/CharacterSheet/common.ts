import { makeStyles } from "@material-ui/core/styles";

export const useCharacterStyles = makeStyles((theme) => ({
  headerHighlight: {
    textAlign: "left",
    backgroundColor: theme.palette.background.paper,
    whiteSpace: "nowrap",
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  headerImage: {
    maxWidth: "80%",
  },
  logo: {
    width: 170,
  },
  logoWrap: {
    float: "right",
  },
  characterTable: {
    "& td": {
      border: 0,
    },
  },
  listName: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    width: "10em",
    display: "inline-block",

    ".MuiTextField-root&": {
      marginRight: theme.spacing(1),
    },

    ".FieldWrapper&": {
      paddingRight: theme.spacing(1),
    },
  },
  listBase: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    display: "inline-block",
    marginRight: theme.spacing(3),
    width: 9,
  },
  skillsBase: {
    display: "inline-block",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    marginRight: theme.spacing(3),
    width: 28,
  },
  listHeader: {
    backgroundColor: theme.palette.background.paper,
    paddingLeft: 5,
    paddingRight: 5,
  },
  listItem: {
    paddingLeft: 5,
    paddingRight: 5,
    borderBottomColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",

    "& > *": {
      verticalAlign: "top",
    },
  },
  listButtons: {
    marginTop: theme.spacing(1),
  },
  listSeparator: {
    display: "inline-block",
    marginTop: theme.spacing(1.25),
    marginRight: theme.spacing(1),
  },
  skillsExtra: {
    paddingLeft: theme.spacing(3),
    display: "block",
  },
  mainEdit: {
    float: "right",
  },
}));
