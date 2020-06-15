import { Route } from "react-router";
import React from "react";
import { Home } from "./Home";
import { Edit } from "./Edit";
import { Deck } from "./Deck";
import { CardEdit } from "./CardEdit";

export function Cards() {
  return (
    <>
      <Route exact path="/wiki/cards" component={Home} />
      <Route exact path="/wiki/cards/:systemId/:deckId" component={Deck} />
      <Route
        exact
        path="/wiki/cards/:systemId/:deckId/:cardId/edit"
        component={CardEdit}
      />
      <Route exact path="/wiki/cards/edit" component={Edit} />
    </>
  );
}
