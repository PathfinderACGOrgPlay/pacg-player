import React, { ChangeEvent } from "react";
import {
  AppBar,
  Container,
  Grid,
  makeStyles,
  Tab,
  Tabs,
  TextField,
} from "@material-ui/core";
import { Redirect, Route, RouteComponentProps } from "react-router";
import {
  PlayerCharacter,
  useAccountCharacter,
  useUpdateAccountCharacter,
} from "../../firestore/characters";
import { useUser } from "../../firebase";
import { Link as RouterLink } from "react-router-dom";
import { useRouteMatch } from "react-router-dom";
import { Sheet } from "./Sheet";
import { Cards } from "./Cards";
import { Substitutions } from "./Substitutions";

const useStyles = makeStyles((theme) => ({
  fill: {
    width: "100%",
  },
}));

export const useTabsWithRouter = (
  routes: string | string[],
  defaultRoute: string
): string => {
  const match = useRouteMatch(routes);

  return match?.path ?? defaultRoute;
};

const tabs = [
  { to: "/characters/:id/sheet", label: "Character Sheet" },
  { to: "/characters/:id/cards", label: "Cards" },
  { to: "/characters/:id/substitutions", label: "Substitutions" },
];

export function Character({
  match: {
    params: { id },
  },
}: RouteComponentProps<{ id: string }>) {
  const tabValue = useTabsWithRouter(
    tabs.map((v) => v.to),
    "/characters/:id"
  );
  const [character, loading, error] = useAccountCharacter(id);
  const [updateAccountCharacter, updateError] = useUpdateAccountCharacter(id);
  const user = useUser();
  const classes = useStyles();

  const data = character?.data();

  function update(values: Partial<PlayerCharacter>) {
    if (data) {
      updateAccountCharacter({
        ...data,
        ...values,
      });
    }
  }

  const readOnly = user?.uid !== data?.uid;

  function commonProps(key: keyof PlayerCharacter) {
    return {
      className: classes.fill,
      defaultValue: readOnly ? data?.[key] || "" : undefined,
      value: readOnly ? undefined : data?.[key] || "",
      onChange: (e: ChangeEvent<HTMLInputElement>) =>
        update({ [key]: e.currentTarget.value }),
      InputProps: {
        readOnly,
      },
    };
  }

  return (
    <Container>
      {updateError ? <div>{updateError}</div> : null}
      {error ? <div>Failed to read decks: {error.message}</div> : null}
      <form noValidate autoComplete="off">
        {loading ? null : (
          <Grid container spacing={3}>
            <Grid item lg={4}>
              <TextField
                id="deck-id"
                label="Deck Id"
                helperText="This is the id of your character, you may need it for troubleshooting"
                defaultValue={character?.id}
                className={classes.fill}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item lg={4}>
              <TextField
                id="org-play-id"
                label="Organized Play Id"
                placeholder="#####-####"
                helperText="This is the full account-character id number from paizo"
                {...commonProps("orgPlayId")}
              />
            </Grid>
            <Grid item lg={4}>
              <TextField
                id="name"
                label="Name"
                helperText="This is just a description for you to help find this deck later"
                {...commonProps("name")}
              />
            </Grid>
          </Grid>
        )}
        <AppBar position="static" color="default">
          <Tabs value={tabValue}>
            {tabs.map((v, i) => (
              <Tab
                key={v.to}
                component={RouterLink}
                to={v.to.replace(":id", id)}
                value={v.to}
                label={v.label}
              />
            ))}
          </Tabs>
        </AppBar>
        <Route exact path="/characters/:id">
          <Redirect to={`/characters/${id}/sheet`} />
        </Route>
        <Route path="/characters/:id/sheet" component={Sheet} />
        <Route path="/characters/:id/cards" component={Cards} />
        <Route path="/characters/:id/substitutions" component={Substitutions} />
      </form>
    </Container>
  );
}
