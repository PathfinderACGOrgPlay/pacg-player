import React from "react";
import {
  AppBar,
  CircularProgress,
  Container,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import { Redirect, Route, RouteComponentProps } from "react-router";
import { Table as TableType, useTable } from "../../firestore/tables";
import { Link as RouterLink } from "react-router-dom";
import { useTabsWithRouter } from "../Characters/Character";
import { User } from "firebase";
import { useUser } from "../../firebase";
import { Chronicles } from "./Chronicles";
import { Players } from "./Players";
import { Settings } from "./Settings";

const tabs = [
  {
    to: "/tables/:id/chronicles",
    label: "Chronicle Sheets",
    isVisible: () => true,
  },
  {
    to: "/tables/:id/players",
    label: "Player Information",
    isVisible(user: User, table: TableType | undefined) {
      return table?.managers.indexOf(user.uid) !== -1;
    },
  },
  {
    to: "/tables/:id/settings",
    label: "Settings",
    isVisible(user: User, table: TableType | undefined) {
      return table?.managers.indexOf(user.uid) !== -1;
    },
  },
];

export function Table({
  match: {
    params: { id },
  },
}: RouteComponentProps<{ id: string }>) {
  const [table, loading, error] = useTable(id);
  const user = useUser();
  const data = table?.data();
  const tabValue = useTabsWithRouter(
    tabs.map((v) => v.to),
    "/tables/:id"
  );

  return (
    <Container>
      {error ? <div>Error While Loading Table: {error.message}</div> : null}
      {loading ? <CircularProgress /> : null}
      <Typography variant="h3" component="h2">
        {data?.name}
      </Typography>
      <AppBar position="static" color="default">
        <Tabs value={tabValue}>
          {tabs.map((v, i) =>
            v.isVisible(user, data) ? (
              <Tab
                key={v.to}
                component={RouterLink}
                to={v.to.replace(":id", id)}
                value={v.to}
                label={v.label}
              />
            ) : null
          )}
        </Tabs>
      </AppBar>
      <Route exact path="/tables/:id">
        <Redirect to={`/tables/${id}/chronicles`} />
      </Route>
      <Route
        path="/tables/:id/chronicles/:characterId?"
        component={Chronicles}
      />
      <Route path="/tables/:id/players" component={Players} />
      <Route path="/tables/:id/settings" component={Settings} />
    </Container>
  );
}
