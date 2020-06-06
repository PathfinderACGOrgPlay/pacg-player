import React, { ReactNode } from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { useRouteMatch } from "react-router";
import { useAccountCharacter } from "../../firestore/characters";
import { useUsers } from "../../firebase";

const hideClasses = [
  "MuiToolbar-root",
  "MuiAppBar-root",
  "chroniclePrintHide",
  "MuiTypography-h3",
  "MuiInputAdornment-root",
];

const useStyles = makeStyles((theme) => ({
  printShow: {
    display: "none",
  },
  displayField: {
    width: "100%",
    borderBottom: "1px solid black",
    minHeight: "2px",
  },
  displayDescription: {
    width: "100%",
    textAlign: "center",
    fontWeight: "bold",
    fontStyle: "italic",
  },
  header: {
    marginTop: 6,
  },
  "@media print": {
    printShow: {
      display: "block",
    },
    container: {
      "& .displayDescription": {
        color: "lightgrey !important",
      },
      [hideClasses.map((v) => `& .${v}`).join(", ")]: {
        display: "none",
      },
      "& *": {
        color: "black !important",
        fontSize: "0.8rem",
        backgroundColor: "transparent",
      },
      "& .MuiGrid-item": {
        borderBottom: "1px solid black",
      },
      "& .MuiGrid-item.noBorder": {
        borderBottom: "none",
      },
      "& .MuiContainer-root.MuiContainer-maxWidthLg": {
        padding: 0,
        width: "auto",
        maxWidth: "100%",
      },
      "& .MuiInputLabel-shrink, & .MuiInputLabel-formControl": {
        transform: "none",
      },
      "& .MuiInputLabel-animated, & .MuiInput-formControl": {
        position: "relative",
        display: "inline-block",
      },
      "& .MuiTextField-root": {
        flexDirection: "row",
        height: 0,
      },
      "& label.MuiFormLabel-root": {
        paddingRight: theme.spacing(1),
        paddingTop: 2,
        whiteSpace: "noWrap",
      },
      "& label.MuiFormLabel-root:after": {
        content: '":"',
      },
      "& .MuiInput-underline:after, & .MuiInput-underline:before, & .MuiPaper-root": {
        borderWidth: 0,
        content: '""',
      },
      "& .MuiCardContent-root, & .MuiFormControlLabel-labelPlacementStart, & .MuiInputBase-root, & .MuiInput-input, & .MuiGrid-container": {
        padding: "0 !important",
        margin: "0 !important",
      },
      "& .printBorders": {
        borderRadius: 0,
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
        paddingLeft: 1,
        paddingRight: 1,
      },
      "& .MuiInput-multiline": {
        width: "100%",
      },
      "& .MuiPaper-root": {
        boxShadow: "none",
      },
      "& .MuiCheckbox-root": {
        paddingTop: 0,
        paddingBottom: 0,
      },
      "& .firstRow": {
        backgroundColor: "lightgrey",
      },
    },
  },
}));

export function ChroniclePrintProvider({ children }: { children: ReactNode }) {
  const styles = useStyles() as any;
  const charactersRoute = useRouteMatch<{ id: string }>(
    "/characters/:id/chronicles"
  );
  const charactersRoute2 = useRouteMatch<{ tableId: string; id: string }>(
    "/tables/:tableId/players/:id/chronicles"
  );
  const tablesRoute = useRouteMatch<{ tableId: string; id: string }>(
    "/tables/:tableId/chronicles/:id"
  );
  const route = charactersRoute || charactersRoute2 || tablesRoute;
  const id = route?.params.id;
  const [character] = useAccountCharacter(id as string);
  const data = character?.data();
  const [users] = useUsers();
  const userData = users?.docs.find((v) => v.data().uid === data?.uid)?.data();

  return (
    <div className={route ? styles.container : null}>
      <div className={styles.printShow}>
        <Grid container>
          <Grid item xs={5} className="noBorder">
            <img src={require("./PACSLogo.png")} />
          </Grid>
          <Grid item xs={7} className={`noBorder ${styles.header}`}>
            <Grid container>
              <Grid item xs={5} className="noBorder">
                <div className={styles.displayField}>
                  {userData?.displayName || userData?.email || <>&nbsp;</>}
                </div>
                <div
                  className={`${styles.displayDescription} displayDescription`}
                >
                  Player Name
                </div>
              </Grid>
              <Grid item xs={2} className="noBorder">
                <div
                  className={`${styles.displayDescription} displayDescription`}
                >
                  A.K.A
                </div>
              </Grid>
              <Grid item xs={5} className="noBorder">
                <div className={styles.displayField}>
                  {data?.character || <>&nbsp;</>}
                </div>
                <div
                  className={`${styles.displayDescription} displayDescription`}
                >
                  Character Name
                </div>
              </Grid>
              <Grid item xs={5} className="noBorder">
                <div className={styles.displayField}>
                  {data?.orgPlayId || <>&nbsp;</>}
                </div>
                <div
                  className={`${styles.displayDescription} displayDescription`}
                >
                  Organized Play Id
                </div>
              </Grid>
              <Grid item xs={2} className="noBorder" />
              <Grid item xs={5} className="noBorder">
                <div className={styles.displayField}>
                  {data?.characterDeck || <>&nbsp;</>}
                </div>
                <div
                  className={`${styles.displayDescription} displayDescription`}
                >
                  Character Product
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <div className={styles.displayField} />
      </div>
      {children}
    </div>
  );
}
