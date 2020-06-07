import { Route } from "react-router";
import React from "react";
import { Home } from "./Home";
import { Edit } from "./Edit";

export function Characters() {
  return (
    <>
      <Route exact path="/wiki/characters" component={Home} />
      <Route exact path="/wiki/characters/edit" component={Edit} />
    </>
  );
}
