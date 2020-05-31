import React from "react";
import { Route } from "react-router";
import { Home } from "./Home";
import { Character } from "./Character";

export function Characters() {
  return (
    <>
      <Route exact path="/characters" component={Home} />
      <Route path="/characters/:id" component={Character} />
    </>
  );
}
