import React from "react";
import { Route } from "react-router";
import { Home } from "./Home";
import { Characters } from "./Characters";
import { Cards } from "./Cards";

export function Wiki() {
  return (
    <>
      <Route path="/wiki/home" component={Home} />
      <Route path="/wiki/characters" component={Characters} />
      <Route path="/wiki/cards" component={Cards} />
    </>
  );
}
