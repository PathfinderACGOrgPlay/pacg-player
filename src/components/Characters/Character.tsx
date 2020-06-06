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
import { Settings } from "./Settings";
import { Chronicles } from "./Chronicles";
import { CharacterSheet } from "./Sheet/CharacterSheet";

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

export function Character({
  match: {
    params: { id },
  },
}: RouteComponentProps<{ id: string }>) {
  return <CharacterDisplay id={id} baseRoute="/characters" />;
}

export function CharacterDisplay({
  id,
  baseRoute,
}: {
  id: string;
  baseRoute: string;
}) {
  const tabs = [
    { to: `${baseRoute}/${id}/sheet`, label: "Character Sheet" },
    { to: `${baseRoute}/${id}/cards`, label: "Cards" },
    { to: `${baseRoute}/${id}/substitutions`, label: "Substitutions" },
    { to: `${baseRoute}/${id}/chronicles`, label: "Chronicle Sheets" },
    { to: `${baseRoute}/${id}/settings`, label: "Settings" },
  ];

  const tabValue = useTabsWithRouter(
    tabs.map((v) => v.to),
    baseRoute
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

  function commonProps(key: keyof PlayerCharacter, className?: string) {
    return {
      className: [classes.fill, className].filter((v) => v).join(" "),
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
        <br className="chroniclePrintHide" />
        {loading ? null : (
          <Grid container spacing={3} className="chroniclePrintHide">
            <Grid item xs={6}>
              <TextField
                id="org-play-id"
                label="Organized Play Id"
                placeholder="#####-####"
                helperText={
                  <>
                    This is the full account-character id number from paizo,
                    your gm will use this to find your character.
                    <br />
                    If you don't have one give your gm your deck id from the
                    settings page.
                  </>
                }
                {...commonProps("orgPlayId")}
              />
            </Grid>
            <Grid item xs={6}>
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
                to={v.to}
                value={v.to}
                label={v.label}
              />
            ))}
          </Tabs>
        </AppBar>
        <Route exact path={`${baseRoute}/:id`}>
          <Redirect to={`${baseRoute}/${id}/sheet`} />
        </Route>
        <Route path={`${baseRoute}/:id/sheet`} component={Sheet} />
        <Route path={`${baseRoute}/:id/cards`} component={Cards} />
        <Route
          path={`${baseRoute}/:id/substitutions`}
          component={Substitutions}
        />
        <Route path={`${baseRoute}/:id/chronicles`} component={Chronicles} />
        <Route path={`${baseRoute}/:id/settings`} component={Settings} />
      </form>
    </Container>
  );
}
