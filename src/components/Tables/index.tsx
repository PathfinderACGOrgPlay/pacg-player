import React from "react";
import { Route } from "react-router";
import { Home } from "./Home";
import { Table } from "./Table";

export function Tables() {
  return (
    <>
      <Route exact path="/tables" component={Home} />
      <Route path="/tables/:id" component={Table} />
    </>
  );
}
