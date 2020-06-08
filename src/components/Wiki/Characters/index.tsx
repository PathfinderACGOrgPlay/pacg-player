import { Route } from "react-router";
import React from "react";
import { Home } from "./Home";
import { Edit } from "./Edit";
import { Character } from "./Character";

export function Characters() {
  return (
    <>
      <Route exact path="/wiki/characters" component={Home} />
      <Route
        exact
        path="/wiki/characters/:systemId/:deckId/:id"
        component={Character}
      />
      <Route exact path="/wiki/characters/edit" component={Edit} />
    </>
  );
}
