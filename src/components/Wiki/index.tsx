import React from "react";
import { Route } from "react-router";
import { Home } from "./Home";
import { Characters } from "./Characters";

export function Wiki() {
  return (
    <>
      <Route path="/wiki/home" component={Home} />
      <Route path="/wiki/characters" component={Characters} />
    </>
  );
}
